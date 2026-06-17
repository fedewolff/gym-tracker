import type { Exercise, WorkoutTemplate } from "../types";
import { exerciseId, slugify } from "../lib/ids";
import type { ExcelPlanRow } from "./sourceData";

interface ParsedPdfExercise {
  name: string;
  prescription: string;
  series: number;
  reps: string;
  tempo?: string;
  effortTarget?: string;
  videoUrl?: string;
  notes?: string;
}

function clean(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parsePrescription(prescription: string): Pick<ParsedPdfExercise, "series" | "reps" | "tempo"> {
  const seriesMatch = prescription.match(/(\d+)\s*x\s*(\d+)\s*rep(?:\s*(c\/lado))?/i);
  const singleMatch = prescription.match(/(\d+)\s*rep/i);
  const tempoMatch = prescription.match(/\(([^)]+)\)/);

  if (seriesMatch) {
    return {
      series: Number(seriesMatch[1]),
      reps: `${seriesMatch[2]}${seriesMatch[3] ? " c/lado" : ""}`,
      tempo: tempoMatch ? clean(tempoMatch[1]) : undefined,
    };
  }

  return {
    series: 1,
    reps: singleMatch ? singleMatch[1] : "",
    tempo: prescription.includes("manteniendo") ? clean(prescription.replace(/^\d+\s*rep\s*/i, "")) : undefined,
  };
}

export function parsePdfPlan(text: string): ParsedPdfExercise[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const exercises: ParsedPdfExercise[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lowerLine = normalizeSearch(line);
    if (
      !line.includes(":") ||
      lowerLine.startsWith("fede:") ||
      lowerLine.startsWith("programa") ||
      lowerLine.startsWith("pausa") ||
      lowerLine.startsWith("percepcion") ||
      /^https?:\/\//i.test(line)
    ) {
      continue;
    }

    const [rawName, ...rest] = line.split(":");
    const name = clean(rawName);
    const prescription = clean(rest.join(":"));
    const lookahead = lines.slice(index + 1, index + 5);
    const videoUrl = lookahead.find((candidate) => /^https?:\/\//i.test(candidate));
    if (!videoUrl) continue;

    const effortLine = lookahead.find((candidate) => normalizeSearch(candidate).includes("percepcion de esfuerzo"));
    const pauseLine = lookahead.find((candidate) => normalizeSearch(candidate).startsWith("pausa"));
    const parsed = parsePrescription(prescription);

    exercises.push({
      name,
      prescription,
      series: parsed.series,
      reps: parsed.reps,
      tempo: parsed.tempo,
      effortTarget: effortLine?.split(":").slice(1).join(":").trim(),
      videoUrl,
      notes: pauseLine,
    });
  }

  return exercises;
}

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

export function buildCurrentLegExercises(pdfText: string): Exercise[] {
  return parsePdfPlan(pdfText).map((exercise) => ({
    id: exerciseId(exercise.name),
    name: exercise.name,
    group: "Pierna",
    block: "Plan tendón actual",
    source: "pdf-current",
    activeInRoutine: true,
    videoUrl: exercise.videoUrl,
    notes: exercise.notes,
    targetSeries: exercise.series,
    targetReps: exercise.reps,
    tempo: exercise.tempo,
    effortTarget: exercise.effortTarget,
  }));
}

export function buildWorkoutTemplates(legExercises: Exercise[], upperRows: ExcelPlanRow[]): WorkoutTemplate[] {
  const legTemplate: WorkoutTemplate = {
    id: "template-leg-fixed",
    name: "Pierna",
    type: "leg",
    exercises: legExercises.map((exercise, index) => ({
      exerciseId: exercise.id,
      order: index + 1,
      block: exercise.block,
      targetSeries: exercise.targetSeries,
      targetReps: exercise.targetReps,
      effortTarget: exercise.effortTarget,
    })),
  };

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

  return [legTemplate, ...upperTemplates];
}
