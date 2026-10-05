import { DateKey, dayOfWeek, eachDateKey } from "./dates"

export interface WorkingCalendar {
  /** 0 = Sunday ... 6 = Saturday */
  weeklyOffDays: number[]
  holidays: ReadonlySet<DateKey>
}

export function isWorkingDay(key: DateKey, cal: WorkingCalendar): boolean {
  return !cal.weeklyOffDays.includes(dayOfWeek(key)) && !cal.holidays.has(key)
}

/** Working days (dates) inside an inclusive range. */
export function listWorkingDays(start: DateKey, end: DateKey, cal: WorkingCalendar): DateKey[] {
  return eachDateKey(start, end).filter((d) => isWorkingDay(d, cal))
}

export interface LeaveDaysInput {
  startDate: DateKey
  endDate: DateKey
  isHalfDay?: boolean
  calendar: WorkingCalendar
}

export interface LeaveDaysResult {
  /** Chargeable leave days (0.5 for a half-day). */
  days: number
  /** The working dates the leave actually covers. */
  workingDates: DateKey[]
  skippedWeekendOrHoliday: number
}

/**
 * calculateLeaveDays — the ONE place leave length is computed.
 * Weekends / holidays inside the range are not charged. A half-day request
 * is only valid for a single working date.
 */
export function calculateLeaveDays(input: LeaveDaysInput): LeaveDaysResult {
  const { startDate, endDate, isHalfDay, calendar } = input
  if (endDate < startDate) throw new Error("End date must be on or after start date.")
  const all = eachDateKey(startDate, endDate)
  const workingDates = all.filter((d) => isWorkingDay(d, calendar))

  if (isHalfDay) {
    if (startDate !== endDate) throw new Error("A half-day request must be for a single date.")
    return {
      days: workingDates.length === 1 ? 0.5 : 0,
      workingDates,
      skippedWeekendOrHoliday: all.length - workingDates.length,
    }
  }
  return {
    days: workingDates.length,
    workingDates,
    skippedWeekendOrHoliday: all.length - workingDates.length,
  }
}
