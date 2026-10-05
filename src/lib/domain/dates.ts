/**
 * Date-only helpers.
 *
 * All leave / attendance / payroll logic works on calendar dates ("YYYY-MM-DD"),
 * never on local-time instants. Prisma `@db.Date` columns are read/written as
 * UTC-midnight `Date` objects, so every conversion here uses UTC getters/setters.
 * This avoids the classic off-by-one-day bug in timezones east/west of UTC.
 */

export type DateKey = string // "YYYY-MM-DD"

const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isValidDateKey(value: string): boolean {
  const m = DATE_KEY_RE.exec(value)
  if (!m) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const dt = new Date(Date.UTC(y, mo - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d
}

export function dateKeyToDate(key: DateKey): Date {
  if (!isValidDateKey(key)) throw new Error(`Invalid date: ${key}`)
  const [y, m, d] = key.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function dateToDateKey(date: Date): DateKey {
  return date.toISOString().slice(0, 10)
}

/** 0 = Sunday ... 6 = Saturday, for a calendar date. */
export function dayOfWeek(key: DateKey): number {
  return dateKeyToDate(key).getUTCDay()
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = dateKeyToDate(key)
  d.setUTCDate(d.getUTCDate() + days)
  return dateToDateKey(d)
}

/** Inclusive list of every calendar date between start and end. */
export function eachDateKey(start: DateKey, end: DateKey): DateKey[] {
  const out: DateKey[] = []
  if (start > end) return out
  let cursor = start
  // hard safety cap (≈ 10 years) so a bad range can never loop forever
  for (let i = 0; i < 3660 && cursor <= end; i++) {
    out.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return out
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function monthRange(year: number, month: number): { start: DateKey; end: DateKey } {
  const mm = String(month).padStart(2, "0")
  return {
    start: `${year}-${mm}-01`,
    end: `${year}-${mm}-${String(daysInMonth(year, month)).padStart(2, "0")}`,
  }
}

/** Today's calendar date in the given IANA timezone (organisation timezone). */
export function todayKey(timezone: string, now: Date = new Date()): DateKey {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)!.value
  return `${get("year")}-${get("month")}-${get("day")}`
}

export function yearOf(key: DateKey): number {
  return Number(key.slice(0, 4))
}

export function monthOf(key: DateKey): number {
  return Number(key.slice(5, 7))
}
