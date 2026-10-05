import { AttendanceStatus } from "@prisma/client"
import { DateKey } from "./dates"
import { LeaveBucket, LeaveClassificationInput, classifyLeave } from "./leave-policy"

export type DerivedAttendanceStatus =
  | "PRESENT"
  | "HALF_DAY"
  | "ABSENT"
  | "PAID_LEAVE"
  | "UNPAID_LEAVE"
  | "MEDICAL_LEAVE"
  | "OTHER_LEAVE"
  | "HOLIDAY"
  | "NOT_MARKED"

export const DERIVED_STATUS_LABEL: Record<DerivedAttendanceStatus, string> = {
  PRESENT: "Present",
  HALF_DAY: "Half Day",
  ABSENT: "Absent",
  PAID_LEAVE: "Paid Leave",
  UNPAID_LEAVE: "Unpaid Leave",
  MEDICAL_LEAVE: "Medical Leave",
  OTHER_LEAVE: "Other Leave",
  HOLIDAY: "Holiday / Off",
  NOT_MARKED: "Not Marked",
}

export const LEAVE_DERIVED: DerivedAttendanceStatus[] = [
  "PAID_LEAVE",
  "UNPAID_LEAVE",
  "MEDICAL_LEAVE",
  "OTHER_LEAVE",
]

export interface AttendanceRecordLike {
  status: AttendanceStatus
  leaveType?: LeaveClassificationInput | null
}

/**
 * deriveAttendanceStatus — single place that turns (record | no record) into
 * the status shown on dashboards and reports. Approved leave is never "Absent".
 */
export function deriveAttendanceStatus(args: {
  record: AttendanceRecordLike | null
  date: DateKey
  today: DateKey
  isWorkingDay: boolean
}): DerivedAttendanceStatus {
  const { record, date, today, isWorkingDay } = args
  if (record) {
    switch (record.status) {
      case "ON_LEAVE": {
        const bucket: LeaveBucket = record.leaveType ? classifyLeave(record.leaveType) : "OTHER_LEAVE"
        return bucket
      }
      case "PRESENT":
        return "PRESENT"
      case "HALF_DAY":
        return "HALF_DAY"
      case "HOLIDAY":
        return "HOLIDAY"
      default:
        return "ABSENT"
    }
  }
  if (!isWorkingDay) return "HOLIDAY"
  return date < today ? "ABSENT" : "NOT_MARKED"
}
