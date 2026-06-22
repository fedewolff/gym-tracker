function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export const ARGENTINA_TIME_ZONE = "America/Argentina/Cordoba";
const ARGENTINA_UTC_OFFSET = "-03:00";

function argentinaParts(date: Date): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ARGENTINA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    hour12: false,
  }).formatToParts(date);

  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

export function isoFromDate(date: Date): string {
  const parts = argentinaParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function todayIso(date = new Date()): string {
  return isoFromDate(date);
}

export function dateFromIso(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 15, 0, 0, 0));
}

export function shiftDate(date: Date, deltaDays: number): Date {
  const [year, month, day] = isoFromDate(date).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + deltaDays, 15, 0, 0, 0));
}

export function formatDayMonth(date: Date): string {
  const parts = argentinaParts(date);
  return `${Number(parts.day)}/${Number(parts.month)}`;
}

export function argentinaTimestamp(date = new Date()): string {
  const parts = argentinaParts(date);
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}:${parts.second}${ARGENTINA_UTC_OFFSET}`;
}

export function argentinaMonthIndex(date = new Date()): number {
  return Number(argentinaParts(date).month) - 1;
}

export function argentinaYear(date = new Date()): number {
  return Number(argentinaParts(date).year);
}
