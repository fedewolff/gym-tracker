import type { Exercise, WorkoutTemplate } from "../types";
import { REHAB_PLAN_ROWS, UPPER_MONTH_ROWS } from "./sourceData";
import {
  buildRehabExercises,
  buildWorkoutTemplates,
  parseExcelUpperRows,
} from "./parsers";
import { argentinaMonthIndex, argentinaYear } from "../lib/dates";

export const SEED_VERSION = "2026-08-07-v5-leg-ab-run";

export interface SeedData {
  exercises: Exercise[];
  templates: WorkoutTemplate[];
}

function dedupeExercises(exercises: Exercise[]): Exercise[] {
  const byId = new Map<string, Exercise>();
  for (const exercise of exercises) {
    const existing = byId.get(exercise.id);
    if (!existing) {
      byId.set(exercise.id, exercise);
      continue;
    }

    byId.set(exercise.id, {
      ...existing,
      ...exercise,
      source: existing.source === "leg-rehab" ? existing.source : exercise.source,
      activeInRoutine: existing.activeInRoutine || exercise.activeInRoutine,
      videoUrl: existing.videoUrl ?? exercise.videoUrl,
      notes: [existing.notes, exercise.notes].filter(Boolean).join(" | ") || undefined,
    });
  }
  return Array.from(byId.values());
}

export function buildSeedData(): SeedData {
  const legExercises = buildRehabExercises(REHAB_PLAN_ROWS);
  const upperExercises = parseExcelUpperRows(UPPER_MONTH_ROWS);

  const exercises = dedupeExercises([...legExercises, ...upperExercises]);
  const templates = buildWorkoutTemplates(REHAB_PLAN_ROWS, UPPER_MONTH_ROWS);

  return {
    exercises,
    templates,
  };
}

export function getAvailableMonths(templates: WorkoutTemplate[]): Array<{ id: string; label: string }> {
  const seen = new Map<string, string>();
  for (const template of templates) {
    if (template.monthId && template.monthLabel) seen.set(template.monthId, template.monthLabel);
  }
  return Array.from(seen, ([id, label]) => ({ id, label }));
}

export function getDefaultMonthId(templates: WorkoutTemplate[], now = new Date()): string {
  const months = getAvailableMonths(templates);
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const currentLabel = `${monthNames[argentinaMonthIndex(now)]} ${argentinaYear(now)}`;
  return months.find((month) => month.label === currentLabel)?.id ?? months[months.length - 1]?.id ?? "";
}
