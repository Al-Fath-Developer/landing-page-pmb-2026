/**
 * @file    src/lib/mieayam/timezone.ts
 * @brief   Timezone utilities to convert between WIB (Asia/Jakarta) and UTC for reports
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

/**
 * Get UTC boundaries for a date range specified in WIB (Asia/Jakarta).
 * Input date format: "YYYY-MM-DD"
 * Returns ISO strings in UTC.
 */
export function getWibDateRangeBoundaries(startDateStr: string, endDateStr: string): { startUtc: string; endUtc: string } {
  // E.g., startDateStr = "2026-08-08", start at 00:00:00 WIB (+07:00)
  const startLocalStr = `${startDateStr}T00:00:00+07:00`;
  const startUtc = new Date(startLocalStr).toISOString();

  // E.g., endDateStr = "2026-08-08", end is before 2026-08-09 00:00:00 WIB (+07:00) (exclusive upper bound)
  // We parse the day after the end date at 00:00:00 WIB
  const endDate = new Date(`${endDateStr}T00:00:00+07:00`);
  endDate.setDate(endDate.getDate() + 1);
  const endUtc = endDate.toISOString();

  return { startUtc, endUtc };
}

/**
 * Convert UTC date string to WIB date string "YYYY-MM-DD"
 */
export function toWibDateString(utcDateStr: string | Date): string {
  const date = typeof utcDateStr === "string" ? new Date(utcDateStr) : utcDateStr;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Format UTC date to Indonesian display format.
 * E.g., "8 Agu 2026"
 */
export function formatWibDate(utcDateStr: string | Date): string {
  const date = typeof utcDateStr === "string" ? new Date(utcDateStr) : utcDateStr;
  
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  
  return formatter.format(date);
}

/**
 * Format UTC date to Indonesian date and time display format.
 * E.g., "8 Agu 2026, 14:32"
 */
export function formatWibDateTime(utcDateStr: string | Date): string {
  const date = typeof utcDateStr === "string" ? new Date(utcDateStr) : utcDateStr;

  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

/**
 * Format UTC date to WIB time display format (HH:MM:SS)
 */
export function formatWibTime(utcDateStr: string | Date): string {
  const date = typeof utcDateStr === "string" ? new Date(utcDateStr) : utcDateStr;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}
