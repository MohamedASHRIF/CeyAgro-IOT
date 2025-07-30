
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Converts a date to Sri Lankan time (Asia/Colombo, UTC+05:30).
 * @param utcDate - The input date as a string or Date object (assumed to be UTC unless isSriLankaTime is true).
 * @param isSriLankaTime - If true, treats the input as already in Sri Lankan time (stored as UTC).
 * @param formatString - The output format (default: "YYYY-MM-DD HH:mm:ss").
 * @returns A formatted string in Sri Lankan time, or "Invalid Date" if the input is invalid.
 */
export function toSriLankaTime(
  utcDate: string | Date,
  isSriLankaTime = false,
  formatString = "YYYY-MM-DD HH:mm:ss" // Correct format string
): string {
  try {
    const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
    if (isNaN(date.getTime())) return "Invalid Date";

    if (isSriLankaTime) {
      return dayjs(date)
        .tz("Asia/Colombo", true) // Parse as UTC and convert to Asia/Colombo
        .format(formatString);
    }

    return dayjs(date)
      .tz("Asia/Colombo")
      .format(formatString);
  } catch (err) {
    console.error("Error converting to Sri Lanka time:", err);
    return "Invalid Date";
  }
}

/**
 * Parses a MongoDB date string (assumed to be in Sri Lankan time but marked as UTC)
 * and returns a Dayjs object in Asia/Colombo timezone.
 * @param dateString - The date string from MongoDB (e.g., "2025-07-26T20:46:00Z").
 * @returns A Dayjs object in Asia/Colombo timezone.
 */
export function parseColomboDate(dateString: string) {
  // Parse as UTC, then convert to Asia/Colombo
  return dayjs.utc(dateString).tz("Asia/Colombo");
}

/**
 * Formats a MongoDB date string as Sri Lankan time (Asia/Colombo).
 * @param dateString - The date string from MongoDB.
 * @param formatStr - The output format (default: 'YYYY-MM-DD HH:mm:ss').
 * @returns A formatted string in Sri Lankan time.
 */
export function formatColomboDate(
  dateString: string,
  formatStr = "YYYY-MM-DD HH:mm:ss" // Correct format string
): string {
  return parseColomboDate(dateString).format(formatStr);
}

/**
 * Safely formats a date as an Asia/Colombo ISO string for API queries.
 * Returns null if the input is invalid.
 * @param input - The input date as a string, Date, or null/undefined.
 * @returns A valid ISO 8601 string in Asia/Colombo timezone (e.g., "2025-07-26T20:46:00+05:30"), or null if invalid.
 */
export function safeColomboISOString(
  input: string | Date | undefined | null
): string | null {
  if (!input) return null;
  const d = dayjs(input).tz("Asia/Colombo");
  if (!d.isValid()) return null;
  return d.toISOString(); // Outputs e.g., "2025-07-26T20:46:00+05:30"
}
