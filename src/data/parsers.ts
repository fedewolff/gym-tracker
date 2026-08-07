import type { Exercise, LegDay, WorkoutTemplate } from "../types";
import { exerciseId, slugify } from "../lib/ids";
import type { ExcelPlanRow, RehabPlanRow } from "./sourceData";

export function parseExcelUpperRows(rows: ExcelPlanRow[]): Exercise[] {
  return rows
    .map((row) => ({
      id: exerciseId(row.exercise),
      name: row.exercise,
      group: "Tren superior",
      block: row.block,
      source: "excel-upper",
      activeInRoutine: true,
      videoUrl: row.videoUrl || undefined,
    }));
}

export function buildRehabExercises(rows: RehabPlanRow[]): Exercise[] {
  return rows.map((row) => ({
    id: exerciseId(row.exercise),
    name: row.exercise,
    group: "Pierna",
    block: row.block,
    source: "leg-rehab",
    activeInRoutine: true,
    videoUrl: row.videoUrl,
    notes: row.notes,
    prescriptionLeft: row.left,
    prescriptionRight: row.right,
    tracksWeight: row.tracksWeight ?? false,
  }));
}

function buildLegTemplate(rows: RehabPlanRow[], legDay: LegDay): WorkoutTemplate {
  const dayRows = rows.filter((row) => row.day === "both" || row.day === legDay);
  return {
    id: `template-leg-${legDay.toLowerCase()}`,
    name: legDay === "A" ? "Pierna" : "Trote",
    type: "leg",
    legDay,
    exercises: dayRows.map((row, index) => ({
      exerciseId: exerciseId(row.exercise),
      order: index + 1,
      block: row.block,
    })),
  };
}

export function buildWorkoutTemplates(rehabRows: RehabPlanRow[], upperRows: ExcelPlanRow[]): WorkoutTemplate[] {
  const legTemplates = (["A", "B"] as const).map((legDay) => buildLegTemplate(rehabRows, legDay));

  const monthLabels = Array.from(new Set(upperRows.map((row) => row.monthLabel)));
  const upperTemplates = monthLabels.flatMap((monthLabel) =>
    ([1, 2] as const).map((day) => {
      const monthId = slugify(monthLabel);
      return {
        id: `template-upper-${monthId}-${day}`,
        name: `Superior ${day}`,
        type: "upper" as const,
        monthId,
        monthLabel,
        upperDay: day,
        exercises: upperRows
          .filter((row) => row.monthLabel === monthLabel && row.day === day)
          .sort((a, b) => a.order - b.order)
          .map((row) => ({
            exerciseId: exerciseId(row.exercise),
            order: row.order,
            block: row.block,
            targetSeries: row.series,
            targetReps: row.reps,
            effortTarget: row.effort,
            weightHint: row.weight,
          })),
      };
    }),
  );

  return [...legTemplates, ...upperTemplates];
}
