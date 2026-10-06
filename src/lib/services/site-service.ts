/**
 * Site / team / assignment service + `resolveEmployeeSite`.
 *
 * Precedence (documented in docs/DECISIONS.md):
 *   1. Active INDIVIDUAL assignment effective on the date
 *   2. Active TEAM assignment effective on the date
 *   3. none  -> attendance cannot be geo-validated (rejected unless the organisation
 *      policy `requireSiteAssignment` is switched off).
 */
import type { Employee, EmployeeSiteAssignment, PrismaClient, Site, TeamSiteAssignment } from "@prisma/client"
import { DateKey, dateKeyToDate } from "@/lib/domain/dates"
import { LeaveError } from "@/lib/domain/leave-policy"
import { Actor, assertCan } from "@/lib/domain/permissions"
import { SiteInput, siteSchema, siteAssignmentSchema, teamSchema } from "@/lib/validation/schemas"
import { Db, writeAudit } from "./audit"

export type SiteResolution =
  | { source: "EMPLOYEE"; site: Site; assignment: EmployeeSiteAssignment }
  | { source: "TEAM"; site: Site; assignment: TeamSiteAssignment }

export async function resolveEmployeeSite(
  db: Db,
  employee: Pick<Employee, "id" | "teamId">,
  date: DateKey,
): Promise<SiteResolution | null> {
  const day = dateKeyToDate(date)
  const window = {
    isActive: true,
    effectiveFrom: { lte: day },
    OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: day } }],
  }
  const individual = await db.employeeSiteAssignment.findFirst({
    where: { employeeId: employee.id, ...window },
    orderBy: { effectiveFrom: "desc" },
    include: { site: true },
  })
  if (individual) return { source: "EMPLOYEE", site: individual.site, assignment: individual }

  if (employee.teamId) {
    const team = await db.team.findUnique({ where: { id: employee.teamId }, select: { isActive: true } })
    if (team?.isActive) {
      const t = await db.teamSiteAssignment.findFirst({
        where: { teamId: employee.teamId, ...window },
        orderBy: { effectiveFrom: "desc" },
        include: { site: true },
      })
      if (t) return { source: "TEAM", site: t.site, assignment: t }
    }
  }
  return null
}

/**
 * Batch version of {@link resolveEmployeeSite} for dashboards / reports (2 queries instead of N).
 * Same precedence: individual assignment first, then team assignment.
 */
export async function resolveSitesForEmployees(
  db: Db,
  employees: Pick<Employee, "id" | "teamId">[],
  date: DateKey,
): Promise<Map<string, SiteResolution>> {
  const day = dateKeyToDate(date)
  const window = {
    isActive: true,
    effectiveFrom: { lte: day },
    OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: day } }],
  }
  const teamIds = [...new Set(employees.map((e) => e.teamId).filter((t): t is string => !!t))]
  const [individuals, teams, activeTeams] = await Promise.all([
    db.employeeSiteAssignment.findMany({
      where: { employeeId: { in: employees.map((e) => e.id) }, ...window },
      orderBy: { effectiveFrom: "desc" },
      include: { site: true },
    }),
    db.teamSiteAssignment.findMany({
      where: { teamId: { in: teamIds }, ...window },
      orderBy: { effectiveFrom: "desc" },
      include: { site: true },
    }),
    db.team.findMany({ where: { id: { in: teamIds }, isActive: true }, select: { id: true } }),
  ])
  const activeTeamIds = new Set(activeTeams.map((t) => t.id))
  const out = new Map<string, SiteResolution>()
  for (const emp of employees) {
    const ind = individuals.find((a) => a.employeeId === emp.id) // already ordered newest first
    if (ind) {
      out.set(emp.id, { source: "EMPLOYEE", site: ind.site, assignment: ind })
      continue
    }
    if (emp.teamId && activeTeamIds.has(emp.teamId)) {
      const t = teams.find((a) => a.teamId === emp.teamId)
      if (t) out.set(emp.id, { source: "TEAM", site: t.site, assignment: t })
    }
  }
  return out
}

function firstIssue(err: { issues: { message: string }[] }): string {
  return err.issues[0]?.message ?? "Invalid input"
}

// ---------------------------------------------------------------------------
// Sites
// ---------------------------------------------------------------------------

export async function createSite(db: PrismaClient, actor: Actor, raw: unknown): Promise<Site> {
  assertCan(actor.role, "site:manage")
  const parsed = siteSchema.safeParse(raw)
  if (!parsed.success) throw new LeaveError("VALIDATION", firstIssue(parsed.error))
  const dup = await db.site.findUnique({ where: { code: parsed.data.code } })
  if (dup) throw new LeaveError("VALIDATION", `Site code ${parsed.data.code} already exists.`, "code")
  return db.$transaction(async (tx) => {
    const site = await tx.site.create({ data: parsed.data satisfies SiteInput })
    await writeAudit(tx, { actorId: actor.userId, action: "SITE_CREATED", entityType: "Site", entityId: site.id })
    return site
  })
}

export async function updateSite(db: PrismaClient, actor: Actor, id: string, raw: unknown): Promise<Site> {
  assertCan(actor.role, "site:manage")
  const parsed = siteSchema.safeParse(raw)
  if (!parsed.success) throw new LeaveError("VALIDATION", firstIssue(parsed.error))
  const dup = await db.site.findFirst({ where: { code: parsed.data.code, NOT: { id } } })
  if (dup) throw new LeaveError("VALIDATION", `Site code ${parsed.data.code} already exists.`, "code")
  return db.$transaction(async (tx) => {
    const site = await tx.site.update({ where: { id }, data: parsed.data })
    await writeAudit(tx, { actorId: actor.userId, action: "SITE_UPDATED", entityType: "Site", entityId: site.id })
    return site
  })
}

export async function deleteSite(db: PrismaClient, actor: Actor, id: string): Promise<void> {
  assertCan(actor.role, "site:manage")
  return db.$transaction(async (tx) => {
    await tx.site.delete({ where: { id } })
    await writeAudit(tx, { actorId: actor.userId, action: "SITE_DELETED", entityType: "Site", entityId: id })
  })
}

// ---------------------------------------------------------------------------
// Assignments
// ---------------------------------------------------------------------------

function overlapWhere(from: DateKey, until: DateKey | null | undefined) {
  return {
    isActive: true,
    effectiveFrom: until ? { lte: dateKeyToDate(until) } : undefined,
    OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: dateKeyToDate(from) } }],
  }
}

export async function assignEmployeeToSite(db: PrismaClient, actor: Actor, raw: unknown) {
  assertCan(actor.role, "site:assign")
  const parsed = siteAssignmentSchema.safeParse(raw)
  if (!parsed.success) throw new LeaveError("VALIDATION", firstIssue(parsed.error))
  const { siteId, targetId: employeeId, effectiveFrom, effectiveUntil } = parsed.data
  const [site, employee] = await Promise.all([
    db.site.findUnique({ where: { id: siteId } }),
    db.employee.findUnique({ where: { id: employeeId } }),
  ])
  if (!site || !site.isActive) throw new LeaveError("VALIDATION", "Site not found or inactive.", "siteId")
  if (!employee) throw new LeaveError("VALIDATION", "Employee not found.", "targetId")
  const clash = await db.employeeSiteAssignment.findFirst({ where: { employeeId, ...overlapWhere(effectiveFrom, effectiveUntil) } })
  if (clash) {
    throw new LeaveError("VALIDATION", "This employee already has an active site assignment overlapping these dates. End it first.", "effectiveFrom")
  }
  return db.$transaction(async (tx) => {
    const a = await tx.employeeSiteAssignment.create({
      data: {
        employeeId, siteId, createdById: actor.userId,
        effectiveFrom: dateKeyToDate(effectiveFrom),
        effectiveUntil: effectiveUntil ? dateKeyToDate(effectiveUntil) : null,
      },
    })
    await writeAudit(tx, { actorId: actor.userId, action: "SITE_ASSIGNED_EMPLOYEE", entityType: "EmployeeSiteAssignment", entityId: a.id, metadata: { employeeId, siteId } })
    return a
  })
}

export async function assignTeamToSite(db: PrismaClient, actor: Actor, raw: unknown) {
  assertCan(actor.role, "site:assign")
  const parsed = siteAssignmentSchema.safeParse(raw)
  if (!parsed.success) throw new LeaveError("VALIDATION", firstIssue(parsed.error))
  const { siteId, targetId: teamId, effectiveFrom, effectiveUntil } = parsed.data
  const [site, team] = await Promise.all([
    db.site.findUnique({ where: { id: siteId } }),
    db.team.findUnique({ where: { id: teamId } }),
  ])
  if (!site || !site.isActive) throw new LeaveError("VALIDATION", "Site not found or inactive.", "siteId")
  if (!team) throw new LeaveError("VALIDATION", "Team not found.", "targetId")
  const clash = await db.teamSiteAssignment.findFirst({ where: { teamId, ...overlapWhere(effectiveFrom, effectiveUntil) } })
  if (clash) {
    throw new LeaveError("VALIDATION", "This team already has an active site assignment overlapping these dates. End it first.", "effectiveFrom")
  }
  return db.$transaction(async (tx) => {
    const a = await tx.teamSiteAssignment.create({
      data: {
        teamId, siteId, createdById: actor.userId,
        effectiveFrom: dateKeyToDate(effectiveFrom),
        effectiveUntil: effectiveUntil ? dateKeyToDate(effectiveUntil) : null,
      },
    })
    await writeAudit(tx, { actorId: actor.userId, action: "SITE_ASSIGNED_TEAM", entityType: "TeamSiteAssignment", entityId: a.id, metadata: { teamId, siteId } })
    return a
  })
}

export async function endSiteAssignment(
  db: PrismaClient,
  actor: Actor,
  kind: "EMPLOYEE" | "TEAM",
  id: string,
) {
  assertCan(actor.role, "site:assign")
  await db.$transaction(async (tx) => {
    if (kind === "EMPLOYEE") await tx.employeeSiteAssignment.update({ where: { id }, data: { isActive: false } })
    else await tx.teamSiteAssignment.update({ where: { id }, data: { isActive: false } })
    await writeAudit(tx, { actorId: actor.userId, action: "SITE_ASSIGNMENT_ENDED", entityType: kind === "EMPLOYEE" ? "EmployeeSiteAssignment" : "TeamSiteAssignment", entityId: id })
  })
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export async function saveTeam(db: PrismaClient, actor: Actor, id: string | null, raw: unknown) {
  assertCan(actor.role, "team:manage")
  const parsed = teamSchema.safeParse(raw)
  if (!parsed.success) throw new LeaveError("VALIDATION", firstIssue(parsed.error))
  const dup = await db.team.findFirst({ where: { name: parsed.data.name, ...(id ? { NOT: { id } } : {}) } })
  if (dup) throw new LeaveError("VALIDATION", "A team with this name already exists.", "name")
  return db.$transaction(async (tx) => {
    const team = id
      ? await tx.team.update({ where: { id }, data: parsed.data })
      : await tx.team.create({ data: parsed.data })
    await writeAudit(tx, { actorId: actor.userId, action: id ? "TEAM_UPDATED" : "TEAM_CREATED", entityType: "Team", entityId: team.id })
    return team
  })
}

export async function setEmployeeTeam(db: PrismaClient, actor: Actor, employeeId: string, teamId: string | null) {
  assertCan(actor.role, "team:manage")
  await db.$transaction(async (tx) => {
    if (teamId) {
      const team = await tx.team.findUnique({ where: { id: teamId } })
      if (!team) throw new LeaveError("VALIDATION", "Team not found.")
    }
    await tx.employee.update({ where: { id: employeeId }, data: { teamId } })
    await writeAudit(tx, { actorId: actor.userId, action: "EMPLOYEE_TEAM_CHANGED", entityType: "Employee", entityId: employeeId, metadata: { teamId } })
  })
}
