/**
 * Geo-fenced attendance service. The backend is authoritative:
 *  - employee identity comes from the authenticated session (never from the request body)
 *  - the site is resolved server-side from active assignments
 *  - distance and "inside geofence" are computed server-side from raw GPS only
 */
import type { Attendance, Employee, PrismaClient, OrganizationPolicy, Site } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { DateKey, dateKeyToDate, todayKey } from "@/lib/domain/dates"
import {
  POOR_ACCURACY_MESSAGE, calculateDistance, checkGpsAccuracy, isWithinGeofence,
} from "@/lib/domain/geo"
import { Actor, can } from "@/lib/domain/permissions"
import { gpsReadingSchema } from "@/lib/validation/schemas"
import { Db, writeAudit } from "./audit"
import { getOrganizationPolicy } from "./org-policy"
import { SiteResolution, resolveEmployeeSite } from "./site-service"

export type AttendanceErrorCode =
  | "FORBIDDEN"
  | "NO_EMPLOYEE"
  | "INVALID_LOCATION"
  | "LOCATION_ACCURACY"
  | "NO_ASSIGNMENT"
  | "SITE_INACTIVE"
  | "OUTSIDE_GEOFENCE"
  | "DUPLICATE"
  | "ON_LEAVE"
  | "ALREADY_RECORDED"
  | "NO_CHECKIN"
  | "ALREADY_CHECKED_OUT"
  | "INVALID_TIME"

export class AttendanceError extends Error {
  constructor(public readonly code: AttendanceErrorCode, message: string) {
    super(message)
    this.name = "AttendanceError"
  }
}

export interface GpsInput {
  latitude: number
  longitude: number
  accuracy: number
}

function parseReading(raw: unknown): GpsInput {
  const parsed = gpsReadingSchema.safeParse(raw)
  if (!parsed.success) {
    throw new AttendanceError("INVALID_LOCATION", "Invalid location received from your device. Please try again.")
  }
  return parsed.data
}

function assertAccuracy(accuracy: number, policy: OrganizationPolicy) {
  const check = checkGpsAccuracy(accuracy, policy.gpsMaxAccuracyMeters)
  if (!check.ok) throw new AttendanceError("LOCATION_ACCURACY", POOR_ACCURACY_MESSAGE)
}

async function loadEmployee(db: Db, actor: Actor): Promise<Employee> {
  if (!can(actor.role, "attendance:mark")) throw new AttendanceError("FORBIDDEN", "You cannot mark attendance.")
  const employee = await db.employee.findUnique({ where: { userId: actor.userId } })
  if (!employee || employee.status !== "ACTIVE") {
    throw new AttendanceError("NO_EMPLOYEE", "An active employee profile is required to mark attendance. Please contact HR.")
  }
  return employee
}

export interface EligibilityResult {
  existing: Attendance | null
  resolution: SiteResolution | null
}

/**
 * validateAttendanceEligibility — everything that can block a check-in other than the GPS reading itself:
 * approved leave, duplicate/contradictory records, and site assignment availability.
 */
export async function validateAttendanceEligibility(
  db: Db,
  args: { employee: Employee; date: DateKey; policy: OrganizationPolicy },
): Promise<EligibilityResult> {
  const { employee, date, policy } = args
  const day = dateKeyToDate(date)

  const existing = await db.attendance.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date: day } },
  })
  if (existing?.checkIn) {
    throw new AttendanceError("DUPLICATE", "Attendance is already marked for today.")
  }
  if (existing?.status === "ON_LEAVE") {
    throw new AttendanceError("ON_LEAVE", "You are on approved leave today. Attendance cannot be marked.")
  }
  if (existing && existing.status !== "HALF_DAY") {
    throw new AttendanceError("ALREADY_RECORDED", "Today's attendance has already been recorded by HR. Contact HR to change it.")
  }

  // approved FULL-day leave without a generated row (e.g. approved before attendance sync existed)
  const fullDayLeave = await db.leaveRequest.findFirst({
    where: {
      requesterId: employee.userId,
      status: "APPROVED",
      isHalfDay: false,
      startDate: { lte: day },
      endDate: { gte: day },
    },
    select: { id: true },
  })
  if (fullDayLeave) {
    throw new AttendanceError("ON_LEAVE", "You are on approved leave today. Attendance cannot be marked.")
  }

  const resolution = await resolveEmployeeSite(db, employee, date)
  if (!resolution && policy.requireSiteAssignment) {
    throw new AttendanceError(
      "NO_ASSIGNMENT",
      "You are not assigned to a work site. Please contact HR to assign you to a site or team.",
    )
  }
  return { existing, resolution }
}

function evaluateGeofence(site: Site, reading: GpsInput) {
  const distance = calculateDistance(
    { latitude: reading.latitude, longitude: reading.longitude },
    { latitude: site.latitude, longitude: site.longitude },
  )
  return { distance, inside: isWithinGeofence(distance, site.radiusMeters) }
}

export interface CheckInInput extends GpsInput {
  actor: Actor
  now?: Date
}

export async function checkIn(db: PrismaClient, input: CheckInInput): Promise<Attendance> {
  const { actor } = input
  const employee = await loadEmployee(db, actor)
  const reading = parseReading({ latitude: input.latitude, longitude: input.longitude, accuracy: input.accuracy })
  const policy = await getOrganizationPolicy(db)
  assertAccuracy(reading.accuracy, policy)

  const now = input.now ?? new Date()
  const date = todayKey(policy.timezone, now)
  const { existing, resolution } = await validateAttendanceEligibility(db, { employee, date, policy })

  let siteData: Prisma.AttendanceUncheckedUpdateInput = {}
  if (resolution) {
    const { site } = resolution
    if (!site.isActive) {
      throw new AttendanceError("SITE_INACTIVE", "Your assigned site is currently inactive. Please contact HR.")
    }
    const { distance, inside } = evaluateGeofence(site, reading)
    if (!inside) {
      await writeAudit(db, {
        actorId: actor.userId, action: "ATTENDANCE_REJECTED_GEOFENCE", entityType: "Employee", entityId: employee.id,
        metadata: { siteId: site.id, source: resolution.source },
      })
      throw new AttendanceError(
        "OUTSIDE_GEOFENCE",
        `You are ${Math.round(distance)} m from ${site.name}. You must be within ${site.radiusMeters} m of the site to mark attendance.`,
      )
    }
    siteData = {
      siteId: site.id,
      latitude: reading.latitude,
      longitude: reading.longitude,
      accuracyMeters: reading.accuracy,
      distanceFromSite: Math.round(distance * 10) / 10,
      locationVerified: true,
      source: "GEOFENCE",
    }
  } else {
    siteData = { source: "MANUAL", locationVerified: false, notes: "No site assigned — location not verified" }
  }

  try {
    return await db.$transaction(async (tx) => {
      const record = existing
        ? await tx.attendance.update({
            where: { id: existing.id },
            data: { checkIn: now, ...siteData }, // half-day leave row keeps HALF_DAY status + leave link
          })
        : await tx.attendance.create({
            data: {
              ...(siteData as Prisma.AttendanceUncheckedCreateInput),
              employeeId: employee.id,
              date: dateKeyToDate(date),
              status: "PRESENT",
              checkIn: now,
            },
          })
      await writeAudit(tx, {
        actorId: actor.userId, action: "ATTENDANCE_CHECK_IN", entityType: "Attendance", entityId: record.id,
        metadata: { verified: record.locationVerified, siteId: record.siteId },
      })
      return record
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new AttendanceError("DUPLICATE", "Attendance is already marked for today.")
    }
    throw err
  }
}

export interface CheckOutInput {
  actor: Actor
  latitude?: number
  longitude?: number
  accuracy?: number
  now?: Date
}

export async function checkOut(db: PrismaClient, input: CheckOutInput): Promise<Attendance> {
  const { actor } = input
  const employee = await loadEmployee(db, actor)
  const policy = await getOrganizationPolicy(db)
  const now = input.now ?? new Date()
  const today = todayKey(policy.timezone, now)

  const open = await db.attendance.findFirst({
    where: {
      employeeId: employee.id,
      checkIn: { not: null },
      checkOut: null,
      date: { lte: dateKeyToDate(today) },
    },
    orderBy: { date: "desc" },
    include: { site: true },
  })
  if (!open || !open.checkIn) {
    const done = await db.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: dateKeyToDate(today) } },
    })
    if (done?.checkOut) throw new AttendanceError("ALREADY_CHECKED_OUT", "You have already checked out today.")
    throw new AttendanceError("NO_CHECKIN", "You have not checked in today.")
  }
  if (now.getTime() <= open.checkIn.getTime()) {
    throw new AttendanceError("INVALID_TIME", "Check-out time must be after check-in time.")
  }

  let geo: Prisma.AttendanceUncheckedUpdateInput = {}
  if (policy.checkoutRequiresGeofence && open.site) {
    const reading = parseReading({ latitude: input.latitude, longitude: input.longitude, accuracy: input.accuracy })
    assertAccuracy(reading.accuracy, policy)
    const { distance, inside } = evaluateGeofence(open.site, reading)
    if (!inside) {
      throw new AttendanceError(
        "OUTSIDE_GEOFENCE",
        `You are ${Math.round(distance)} m from ${open.site.name}. You must be within ${open.site.radiusMeters} m of the site to check out.`,
      )
    }
    geo = {
      checkOutLatitude: reading.latitude,
      checkOutLongitude: reading.longitude,
      checkOutAccuracyMeters: reading.accuracy,
      checkOutDistanceFromSite: Math.round(distance * 10) / 10,
    }
  }

  const workedMinutes = Math.floor((now.getTime() - open.checkIn.getTime()) / 60000)
  return db.$transaction(async (tx) => {
    // guard against a concurrent double check-out
    const res = await tx.attendance.updateMany({
      where: { id: open.id, checkOut: null },
      data: { checkOut: now, workedMinutes, ...(geo as Prisma.AttendanceUncheckedUpdateManyInput) },
    })
    if (res.count !== 1) throw new AttendanceError("ALREADY_CHECKED_OUT", "You have already checked out today.")
    await writeAudit(tx, {
      actorId: actor.userId, action: "ATTENDANCE_CHECK_OUT", entityType: "Attendance", entityId: open.id,
      metadata: { workedMinutes },
    })
    return tx.attendance.findUniqueOrThrow({ where: { id: open.id } })
  })
}

/** What the attendance screen needs: today's state + the site the employee will be verified against. */
export async function getMyAttendanceContext(db: Db, actor: Actor, now: Date = new Date()) {
  const employee = await db.employee.findUnique({ where: { userId: actor.userId } })
  const policy = await getOrganizationPolicy(db)
  const date = todayKey(policy.timezone, now)
  if (!employee) return { employee: null, policy, date, resolution: null, record: null, onLeave: false }
  const [resolution, record, leave] = await Promise.all([
    resolveEmployeeSite(db, employee, date),
    db.attendance.findUnique({ where: { employeeId_date: { employeeId: employee.id, date: dateKeyToDate(date) } } }),
    db.leaveRequest.findFirst({
      where: {
        requesterId: actor.userId, status: "APPROVED", isHalfDay: false,
        startDate: { lte: dateKeyToDate(date) }, endDate: { gte: dateKeyToDate(date) },
      },
      include: { leaveType: { select: { name: true } } },
    }),
  ])
  return { employee, policy, date, resolution, record, onLeave: !!leave, leaveName: leave?.leaveType.name ?? null }
}
