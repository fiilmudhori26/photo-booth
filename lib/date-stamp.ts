/** Date formatting helpers — pure functions, no DOM dependency. */

/** Human-readable date, e.g. "09 NOV 2026". */
export function formatStamp(date: Date): string {
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

/** Compact filename-safe timestamp, e.g. "20261109-183045". */
export function fileStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate(),
  )}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}
