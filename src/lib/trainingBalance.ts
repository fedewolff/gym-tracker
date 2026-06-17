import type { TrainingType, WorkoutSession, WorkoutTemplate } from "../types";
import { isQuickSession } from "./trainingCalendar";

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  leg: "Pierna",
  upper: "Superior",
  aerobic: "Aeróbico",
};

export interface TrainingBalancePoint {
  date: string;
  label: string;
  leg: number;
  upper: number;
  aerobic: number;
  legWeeklyAverage: number;
  upperWeeklyAverage: number;
  aerobicWeeklyAverage: number;
}

const TRAINING_TYPES: TrainingType[] = ["leg", "upper", "aerobic"];

function dateFromIso(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

function formatPointLabel(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function shiftDate(date: Date, deltaDays: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + deltaDays);
  return next;
}

function isoFromDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function resolveTrainingType(
  session: WorkoutSession,
  templates: WorkoutTemplate[],
): TrainingType {
  if (session.trainingType) return session.trainingType;
  if (isQuickSession(session)) return "aerobic";

  const template = templates.find((candidate) => candidate.id === session.templateId);
  if (template?.type === "leg" || template?.type === "upper") return template.type;

  return "aerobic";
}

export function countTrainingDaysByType(
  sessions: WorkoutSession[],
  templates: WorkoutTemplate[],
  startDate: string,
  endDate: string,
): Record<TrainingType, number> {
  const start = startDate;
  const end = endDate;
  const daysByType: Record<TrainingType, Set<string>> = {
    leg: new Set(),
    upper: new Set(),
    aerobic: new Set(),
  };

  for (const session of sessions) {
    if (session.date < start || session.date > end) continue;
    daysByType[resolveTrainingType(session, templates)].add(session.date);
  }

  return {
    leg: daysByType.leg.size,
    upper: daysByType.upper.size,
    aerobic: daysByType.aerobic.size,
  };
}

export function buildRollingTrainingBalance(
  sessions: WorkoutSession[],
  templates: WorkoutTemplate[],
  anchorDate: string,
  pointCount = 180,
  windowDays = 14,
): TrainingBalancePoint[] {
  const anchor = dateFromIso(anchorDate);
  const weekCount = windowDays / 7;

  return Array.from({ length: pointCount }, (_, index) => {
    const end = shiftDate(anchor, index - pointCount + 1);
    const start = shiftDate(end, -(windowDays - 1));
    const counts = countTrainingDaysByType(sessions, templates, isoFromDate(start), isoFromDate(end));

    return {
      date: isoFromDate(end),
      label: formatPointLabel(end),
      leg: counts.leg,
      upper: counts.upper,
      aerobic: counts.aerobic,
      legWeeklyAverage: counts.leg / weekCount,
      upperWeeklyAverage: counts.upper / weekCount,
      aerobicWeeklyAverage: counts.aerobic / weekCount,
    };
  });
}

export function hasTrainingType(value: string): value is TrainingType {
  return TRAINING_TYPES.includes(value as TrainingType);
}
