function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function isoFromDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayIso(date = new Date()): string {
  return isoFromDate(date);
}

export function dateFromIso(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function shiftDate(date: Date, deltaDays: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + deltaDays);
  return next;
}

export function formatDayMonth(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}
