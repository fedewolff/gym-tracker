import { describe, expect, it } from "vitest";
import { getAvailableMonths, getDefaultMonthId, buildSeedData } from "./seed";
import { buildCurrentLegExercises, buildWorkoutTemplates, parseExcelUpperRows, parsePdfPlan } from "./parsers";
import { PDF_PLAN_TEXT, UPPER_MONTH_ROWS } from "./sourceData";
import { exerciseId } from "../lib/ids";

const EXPECTED_UPPER_COUNTS = {
  "Mayo 2026": { 1: 8, 2: 8 },
  "Junio 2026": { 1: 9, 2: 9 },
  "Julio 2026": { 1: 8, 2: 8 },
  "Agosto 2026": { 1: 8, 2: 8 },
} as const;

describe("data seed", () => {
  it("parses the PDF as the only fixed leg plan with videos", () => {
    const exercises = parsePdfPlan(PDF_PLAN_TEXT);

    expect(exercises.map((exercise) => exercise.name)).toEqual([
      "Sentadilla con cinto ruso isométrico",
      "Sentadilla con barra",
      "Extensores de rodilla unilateral",
      "Prensa",
      "Bulgara front",
      "Peso muerto c/rotación",
    ]);
    expect(exercises.find((exercise) => exercise.name === "Sentadilla con barra")).toMatchObject({
      series: 4,
      reps: "6",
      videoUrl: "https://youtu.be/8tCHW2IJ5UY",
      effortTarget: "7-8",
    });
    expect(exercises.every((exercise) => exercise.videoUrl?.startsWith("http"))).toBe(true);
  });

  it("loads all real upper-body months with Superior 1 and Superior 2", () => {
    const legExercises = buildCurrentLegExercises(PDF_PLAN_TEXT);
    const templates = buildWorkoutTemplates(legExercises, UPPER_MONTH_ROWS);
    const months = getAvailableMonths(templates);

    expect(months.map((month) => month.label)).toEqual(["Mayo 2026", "Junio 2026", "Julio 2026", "Agosto 2026"]);
    for (const month of months) {
      const expected = EXPECTED_UPPER_COUNTS[month.label as keyof typeof EXPECTED_UPPER_COUNTS];
      expect(templates.find((template) => template.monthId === month.id && template.upperDay === 1)?.exercises.length).toBe(expected[1]);
      expect(templates.find((template) => template.monthId === month.id && template.upperDay === 2)?.exercises.length).toBe(expected[2]);
    }
    expect(templates.filter((template) => template.type === "leg")).toHaveLength(1);
  });

  it("normalizes reps that Excel stored as dates", () => {
    expect(UPPER_MONTH_ROWS.find((row) => row.exercise === "Russian Twist")?.reps).toBe("10/10");
    expect(UPPER_MONTH_ROWS.find((row) => row.exercise === "Press inclinado con barra")?.reps).toBe("7/10");
    expect(UPPER_MONTH_ROWS.find((row) => row.exercise === "Plancha lateral c/ remo")?.reps).toBe("8/8");
  });

  it("does not include CSV legacy exercises or lower-body Excel rows", () => {
    const seed = buildSeedData();
    const names = seed.exercises.map((exercise) => exercise.name);

    expect(names).not.toContain("Hack 45 vertical u horizontal");
    expect(names).not.toContain("Sentadilla al cajon con barra");
    expect(seed.exercises.every((exercise) => exercise.source === "pdf-current" || exercise.source === "excel-upper")).toBe(true);
  });

  it("chooses the calendar month when available, then falls back to latest", () => {
    const seed = buildSeedData();

    expect(getDefaultMonthId(seed.templates, new Date("2026-06-17T12:00:00"))).toBe("junio-2026");
    expect(getDefaultMonthId(seed.templates, new Date("2026-12-01T12:00:00"))).toBe("agosto-2026");
  });

  it("keeps monthly prescriptions on template rows instead of global exercises", () => {
    const legExercises = buildCurrentLegExercises(PDF_PLAN_TEXT);
    const templates = buildWorkoutTemplates(legExercises, UPPER_MONTH_ROWS);
    const augustPress = templates
      .find((template) => template.monthId === "agosto-2026" && template.upperDay === 1)
      ?.exercises.find((item) => item.weightHint === "25/27,5/30");

    expect(parseExcelUpperRows(UPPER_MONTH_ROWS).length).toBe(66);
    expect(augustPress).toMatchObject({ targetReps: "6-4-4-2", targetSeries: 4 });
  });

  it("preserves every Excel row prescription in its monthly template", () => {
    const legExercises = buildCurrentLegExercises(PDF_PLAN_TEXT);
    const templates = buildWorkoutTemplates(legExercises, UPPER_MONTH_ROWS);

    for (const row of UPPER_MONTH_ROWS) {
      const template = templates.find(
        (candidate) => candidate.monthLabel === row.monthLabel && candidate.upperDay === row.day,
      );
      const item = template?.exercises.find(
        (candidate) => candidate.exerciseId === exerciseId(row.exercise) && candidate.order === row.order,
      );

      expect(item, `${row.monthLabel} Superior ${row.day} #${row.order} ${row.exercise}`).toMatchObject({
        block: row.block,
        targetSeries: row.series,
        targetReps: row.reps,
        weightHint: row.weight,
      });
      expect(item?.effortTarget ?? "").toBe(row.effort ?? "");
    }
  });
});
