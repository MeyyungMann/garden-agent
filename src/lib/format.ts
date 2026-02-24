/** Convert SCREAMING_SNAKE_CASE enum values to Title Case */
export function formatEnum(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

/** Format a Date to YYYY-MM-DD for <input type="date"> */
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

/** Parse a date input string to a Date, or undefined if empty */
export function parseDateInput(value: string): Date | undefined {
  if (!value) return undefined;
  return new Date(value + "T00:00:00");
}
