import type { WorkoutSession } from "../types";

export const QUICK_SESSION_TEMPLATE_ID = "template-quick-training";
export const HEATMAP_UNCHECK_TEMPLATE_ID = "template-heatmap-uncheck";
export const MAX_DAILY_TRAINING_COUNT = 2;

export interface TrainingDay {
  date: string;
  dayLabel: string;
  count: number;
}

export interface TrainingWindow {
  id: string;
  label: string;
  days: TrainingDay[];
}

export function isQuickSession(session: WorkoutSession): boolean {
  return session.kind === "quick" || session.templateId === QUICK_SESSION_TEMPLATE_ID;
}

export function isManualUncheckSession(session: WorkoutSession): boolean {
  return session.kind === "manual-uncheck" || session.templateId === HEATMAP_UNCHECK_TEMPLATE_ID;
}

export function countTrainingsByDate(sessions: WorkoutSession[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    if (isManualUncheckSession(session)) continue;
    counts.set(session.date, Math.min(MAX_DAILY_TRAINING_COUNT, (counts.get(session.date) ?? 0) + 1));
  }
  return counts;
}

export function buildTrainingDays(sessions: WorkoutSession[], anchorDate: string, dayCount = 30, offsetDays = 0): TrainingDay[] {
  const counts = countTrainingsByDate(sessions);
  const anchor = new Date(`${anchorDate}T12:00:00`);
  anchor.setDate(anchor.getDate() - offsetDays);

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() - (dayCount - 1 - index));
    const iso = date.toISOString().slice(0, 10);

    return {
      date: iso,
      dayLabel: String(date.getDate()),
      count: counts.get(iso) ?? 0,
    };
  });
}

export function buildTrainingWindows(sessions: WorkoutSession[], anchorDate: string, windowCount = 6, daysPerWindow = 30): TrainingWindow[] {
  return Array.from({ length: windowCount }, (_, index) => {
    const windowIndexFromCurrent = windowCount - 1 - index;
    const offsetDays = windowIndexFromCurrent * daysPerWindow;
    const label = offsetDays === 0 ? "Últimos 30" : `${offsetDays}-${offsetDays + daysPerWindow - 1} días atrás`;

    return {
      id: `window-${offsetDays}`,
      label,
      days: buildTrainingDays(sessions, anchorDate, daysPerWindow, offsetDays),
    };
  });
}

export function getNextQuickSessionCount(normalCount: number, quickCount: number): number {
  if (normalCount >= MAX_DAILY_TRAINING_COUNT) return 0;

  const currentVisibleCount = Math.min(MAX_DAILY_TRAINING_COUNT, normalCount + quickCount);
  const nextVisibleCount = (currentVisibleCount + 1) % (MAX_DAILY_TRAINING_COUNT + 1);
  return Math.max(0, Math.max(normalCount, nextVisibleCount) - normalCount);
}
