import type { SetEntry, TrainingType, WorkoutSession, WorkoutTemplate } from "../types";
import { isMobilitySession } from "./mobility";
import { isManualUncheckSession, isQuickSession } from "./trainingCalendar";

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
const WEEKDAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

export interface TrainingHeatmapDay {
  date: string;
  label: string;
  weekday: string;
}

export interface TrainingHeatmapCell {
  date: string;
  trained: boolean;
  intensity: number;
  level: number;
}

export interface TrainingHeatmapRow {
  type: TrainingType;
  label: string;
  cells: TrainingHeatmapCell[];
  totalDays: number;
}

export interface TrainingHeatmapSummary {
  totalTrainingDays: number;
  mostTrained: string;
  leastTrained: string;
  imbalance: string;
}

export interface TrainingHeatmap {
  days: TrainingHeatmapDay[];
  rows: TrainingHeatmapRow[];
  summary: TrainingHeatmapSummary;
}

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
  if (isMobilitySession(session)) return "aerobic";
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
  const uncheckedDaysByType: Record<TrainingType, Set<string>> = {
    leg: new Set(),
    upper: new Set(),
    aerobic: new Set(),
  };

  for (const session of sessions) {
    if (session.date < start || session.date > end) continue;
    if (isMobilitySession(session)) continue;
    const type = resolveTrainingType(session, templates);
    if (isManualUncheckSession(session)) {
      uncheckedDaysByType[type].add(session.date);
      continue;
    }
    daysByType[type].add(session.date);
  }

  for (const type of TRAINING_TYPES) {
    for (const date of uncheckedDaysByType[type]) {
      daysByType[type].delete(date);
    }
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

export function buildTrainingHeatmap(
  sessions: WorkoutSession[],
  templates: WorkoutTemplate[],
  setEntries: SetEntry[],
  anchorDate: string,
  windowDays = 14,
): TrainingHeatmap {
  const anchor = dateFromIso(anchorDate);
  const days = Array.from({ length: windowDays }, (_, index) => {
    const date = shiftDate(anchor, index - windowDays + 1);
    return {
      date: isoFromDate(date),
      label: formatPointLabel(date),
      weekday: WEEKDAY_LABELS[date.getDay()],
    };
  });
  const daySet = new Set(days.map((day) => day.date));
  const entryCountBySession = new Map<string, number>();
  for (const entry of setEntries) {
    entryCountBySession.set(entry.sessionId, (entryCountBySession.get(entry.sessionId) ?? 0) + 1);
  }

  const intensityByTypeAndDate = new Map<string, number>();
  const uncheckedKeys = new Set<string>();
  for (const session of sessions) {
    if (!daySet.has(session.date)) continue;
    if (isMobilitySession(session)) continue;
    const type = resolveTrainingType(session, templates);
    const key = `${type}:${session.date}`;
    if (isManualUncheckSession(session)) {
      uncheckedKeys.add(key);
      continue;
    }
    const intensity = Math.max(1, entryCountBySession.get(session.id) ?? 0);
    intensityByTypeAndDate.set(key, (intensityByTypeAndDate.get(key) ?? 0) + intensity);
  }

  for (const key of uncheckedKeys) {
    intensityByTypeAndDate.delete(key);
  }

  const maxIntensity = Math.max(1, ...intensityByTypeAndDate.values());
  const rows = TRAINING_TYPES.map((type) => {
    const cells = days.map((day) => {
      const intensity = intensityByTypeAndDate.get(`${type}:${day.date}`) ?? 0;
      return {
        date: day.date,
        trained: intensity > 0,
        intensity,
        level: intensity === 0 ? 0 : Math.max(1, Math.ceil((intensity / maxIntensity) * 4)),
      };
    });

    return {
      type,
      label: TRAINING_TYPE_LABELS[type],
      cells,
      totalDays: cells.filter((cell) => cell.trained).length,
    };
  });

  const totals = rows.map((row) => row.totalDays);
  const maxTotal = Math.max(...totals);
  const minTotal = Math.min(...totals);
  const mostTrainedRows = rows.filter((row) => row.totalDays === maxTotal);
  const leastTrainedRows = rows.filter((row) => row.totalDays === minTotal);

  return {
    days,
    rows,
    summary: {
      totalTrainingDays: totals.reduce((sum, count) => sum + count, 0),
      mostTrained: mostTrainedRows.map((row) => row.label).join(", "),
      leastTrained: leastTrainedRows.map((row) => row.label).join(", "),
      imbalance: maxTotal - minTotal >= 2 ? `${maxTotal - minTotal} días de diferencia` : "Balanceado",
    },
  };
}

export function hasTrainingType(value: string): value is TrainingType {
  return TRAINING_TYPES.includes(value as TrainingType);
}
