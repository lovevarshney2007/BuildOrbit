import { Role } from "@prisma/client"

/**
 * Central RBAC matrix. Server actions / route handlers MUST call `can()`;
 * the UI only mirrors it to hide controls.
 */
export type Permission =
  | "leave:apply"
  | "leave:review"
  | "leave:view-all"
  | "leave:configure"
  | "leave:document:view"
  | "attendance:mark"
  | "attendance:view-all"
  | "attendance:view-team"
  | "site:manage"
  | "site:view"
  | "site:assign"
  | "team:manage"
  | "payroll:manage"
  | "payroll:view-all"
  | "policy:configure"
  | "audit:view"

const MATRIX: Record<Permission, Role[]> = {
  "leave:apply": ["HR", "LEAD", "ENGINEER"],
  "leave:review": ["SUPER_ADMIN", "ADMIN", "HR"],
  "leave:view-all": ["SUPER_ADMIN", "ADMIN", "HR"],
  "leave:configure": ["SUPER_ADMIN", "ADMIN", "HR"],
  // Owners can always see their own documents (checked separately); LEAD is intentionally absent.
  "leave:document:view": ["SUPER_ADMIN", "ADMIN", "HR"],
  "attendance:mark": ["HR", "LEAD", "ENGINEER", "ADMIN", "SUPER_ADMIN"],
  "attendance:view-all": ["SUPER_ADMIN", "ADMIN", "HR"],
  "attendance:view-team": ["LEAD"],
  "site:manage": ["SUPER_ADMIN", "ADMIN"],
  "site:view": ["SUPER_ADMIN", "ADMIN", "HR", "LEAD"],
  "site:assign": ["SUPER_ADMIN", "ADMIN", "HR"],
  "team:manage": ["SUPER_ADMIN", "ADMIN", "HR"],
  "payroll:manage": ["SUPER_ADMIN", "ADMIN", "HR"],
  "payroll:view-all": ["SUPER_ADMIN", "ADMIN", "HR"],
  "policy:configure": ["SUPER_ADMIN", "ADMIN"],
  "audit:view": ["SUPER_ADMIN", "ADMIN"],
}

export function can(role: Role, permission: Permission): boolean {
  return MATRIX[permission].includes(role)
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export function assertCan(role: Role, permission: Permission): void {
  if (!can(role, permission)) throw new ForbiddenError()
}

export interface Actor {
  userId: string
  role: Role
}

/** Medical/supporting document access: the owner, or a role explicitly granted. Never LEAD. */
export function canAccessLeaveDocument(actor: Actor, ownerUserId: string): boolean {
  if (actor.userId === ownerUserId) return true
  return can(actor.role, "leave:document:view")
}
