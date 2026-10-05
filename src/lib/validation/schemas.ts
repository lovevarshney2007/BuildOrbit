/**
 * Shared Zod schemas — imported by BOTH client forms and server services/actions
 * so the same rules run in the browser and (authoritatively) on the server.
 */
import { z } from "zod"
import { isValidDateKey } from "@/lib/domain/dates"
import { MAX_SITE_RADIUS_METERS, MIN_SITE_RADIUS_METERS } from "@/lib/domain/geo"

export const dateKeySchema = z.string().refine(isValidDateKey, "Invalid date provided.")

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))

// ---------------------------------------------------------------------------
// Leave
// ---------------------------------------------------------------------------

export const applyLeaveSchema = z
  .object({
    leaveTypeId: z.string().min(1, "Leave type is required"),
    startDate: dateKeySchema,
    endDate: dateKeySchema,
    isHalfDay: z.boolean().default(false),
    halfDayPeriod: z.enum(["FIRST_HALF", "SECOND_HALF"]).nullable().optional(),
    reason: z.string().trim().min(5, "Reason must be at least 5 characters").max(1000, "Reason is too long"),
    documentType: z
      .enum(["PRESCRIPTION", "MEDICAL_CERTIFICATE", "DOCTOR_NOTE", "HOSPITAL_DOCUMENT", "MEDICAL_REPORT", "OTHER"])
      .default("OTHER"),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "End date must be on or after start date.",
    path: ["endDate"],
  })
  .refine((v) => !v.isHalfDay || v.startDate === v.endDate, {
    message: "A half-day request must be for a single date.",
    path: ["endDate"],
  })

export const leaveTypeSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(80),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{2,12}$/, "Code must be 2-12 letters, digits, - or _")
      .optional()
      .nullable()
      .transform((v) => v || null),
    description: optionalText(300),
    category: z.enum(["GENERAL", "MEDICAL", "OTHER"]).default("GENERAL"),
    daysAllowed: z.coerce.number().int().min(0).max(366),
    isPaid: z.boolean(),
    isActive: z.boolean(),
    tracksBalance: z.boolean().default(true),
    carryForwardAllowed: z.boolean().default(false),
    carryForwardMaxDays: z.coerce.number().min(0).max(366).default(0),
    maxConsecutiveDays: z.coerce.number().int().min(1).max(366).nullable().optional(),
    requiresApproval: z.boolean().default(true),
    allowHalfDay: z.boolean().default(true),
    minServiceDays: z.coerce.number().int().min(0).max(3650).default(0),
    applicableRoles: z.array(z.enum(["SUPER_ADMIN", "ADMIN", "HR", "LEAD", "ENGINEER"])).default([]),
    requiresDocument: z.boolean().default(false),
    documentRequiredAfterDays: z.coerce.number().int().min(0).max(366).nullable().optional(),
    payrollImpact: z.enum(["NONE", "DEDUCTION"]).default("NONE"),
    payrollDeductionPercent: z.coerce.number().min(0).max(100).default(100),
  })
  .refine((v) => v.isPaid || v.payrollImpact === "DEDUCTION", {
    message: "Unpaid leave types must define a payroll deduction.",
    path: ["payrollImpact"],
  })
  .refine((v) => !v.documentRequiredAfterDays || v.requiresDocument, {
    message: "Enable 'requires document' to use a document threshold.",
    path: ["documentRequiredAfterDays"],
  })

export type LeaveTypeInput = z.infer<typeof leaveTypeSchema>

export const holidaySchema = z.object({
  date: dateKeySchema,
  name: z.string().trim().min(2).max(120),
})

export const organizationPolicySchema = z.object({
  timezone: z.string().min(1).refine((tz) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: tz })
      return true
    } catch {
      return false
    }
  }, "Unknown timezone"),
  weeklyOffDays: z.array(z.number().int().min(0).max(6)).max(6),
  payrollDivisorMode: z.enum(["CALENDAR_DAYS", "WORKING_DAYS", "FIXED"]),
  payrollFixedDivisor: z.coerce.number().int().min(1).max(31),
  payrollRounding: z.enum(["NONE", "ROUND", "FLOOR", "CEIL"]),
  gpsMaxAccuracyMeters: z.coerce.number().int().min(5).max(1000),
  requireSiteAssignment: z.boolean(),
  checkoutRequiresGeofence: z.boolean(),
  maxDocumentSizeMb: z.coerce.number().int().min(1).max(25),
})

// ---------------------------------------------------------------------------
// Sites / teams / assignments
// ---------------------------------------------------------------------------

export const siteSchema = z.object({
  name: z.string().trim().min(2, "Site name is required").max(120),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{2,30}$/, "Code must be 2-30 letters, digits, - or _"),
  address: optionalText(300),
  latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
  radiusMeters: z.coerce
    .number()
    .int("Radius must be a whole number of meters")
    .min(MIN_SITE_RADIUS_METERS, `Radius must be at least ${MIN_SITE_RADIUS_METERS} m`)
    .max(MAX_SITE_RADIUS_METERS, `Radius must be at most ${MAX_SITE_RADIUS_METERS} m`),
  isActive: z.boolean().default(true),
  projectName: optionalText(120),
  region: optionalText(80),
})

export type SiteInput = z.infer<typeof siteSchema>

export const teamSchema = z.object({
  name: z.string().trim().min(2, "Team name is required").max(80),
  description: optionalText(300),
  leadId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
})

export const siteAssignmentSchema = z
  .object({
    siteId: z.string().min(1, "Site is required"),
    targetId: z.string().min(1, "Employee / team is required"),
    effectiveFrom: dateKeySchema,
    effectiveUntil: dateKeySchema.nullable().optional(),
  })
  .refine((v) => !v.effectiveUntil || v.effectiveUntil >= v.effectiveFrom, {
    message: "End date must be on or after the start date.",
    path: ["effectiveUntil"],
  })

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

/** Only raw GPS reading — identity, site and distance are always derived server-side. */
export const gpsReadingSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0),
})

export type GpsReading = z.infer<typeof gpsReadingSchema>
