import { describe, expect, it } from "vitest";
import { getAvailableMonths, getDefaultMonthId, buildSeedData } from "./seed";
import { buildRehabExercises, buildWorkoutTemplates, parseExcelUpperRows } from "./parsers";
import { REHAB_PLAN_ROWS, UPPER_MONTH_ROWS } from "./sourceData";
import { exerciseId } from "../lib/ids";

const EXPECTED_UPPER_COUNTS = {
  "Mayo 2026": { 1: 8, 2: 8 },
  "Junio 2026": { 1: 9, 2: 9 },
  "Julio 2026": { 1: 8, 2: 8 },
  "Agosto 2026": { 1: 8, 2: 8 },
} as const;

const WEIGHTED_EXERCISES = [
  "Step-up al cajón con barra",
  "Búlgara con barra sobre la cabeza",
  "Cuádriceps izquierdo con BFR",
  "Isquios en camilla",
];

describe("data seed", () => {
  it("builds the rehab plan with every sheet field preserved", () => {
    const exercises = buildRehabExercises(REHAB_PLAN_ROWS);

    expect(exercises).toHaveLength(29);
    expect(exercises.every((exercise) => exercise.group === "Pierna" && exercise.source === "leg-rehab")).toBe(true);

    const balance = exercises.find((exercise) => exercise.name === "Equilibrio en la pared");
    expect(balance).toMatchObject({
      block: "2. Día de pierna",
      prescriptionLeft: "10 reps",
      prescriptionRight: "-",
      tracksWeight: false,
    });
    expect(balance?.notes).toContain("No inclinar el tronco");

    const hamstrings = exercises.find((exercise) => exercise.name === "Isquios en camilla");
    expect(hamstrings).toMatchObject({ prescriptionLeft: "3x6", prescriptionRight: "2x6", tracksWeight: true });
  });

  it("marks weight tracking only on the loaded barbell and machine exercises", () => {
    const exercises = buildRehabExercises(REHAB_PLAN_ROWS);
    const weighted = exercises.filter((exercise) => exercise.tracksWeight).map((exercise) => exercise.name);

    expect(weighted.sort()).toEqual([...WEIGHTED_EXERCISES].sort());
  });

  it("splits the rehab plan into leg day A (pierna) and B (trote) with shared warmup and stretching", () => {
    const templates = buildWorkoutTemplates(REHAB_PLAN_ROWS, UPPER_MONTH_ROWS);
    const legA = templates.find((template) => template.type === "leg" && template.legDay === "A");
    const legB = templates.find((template) => template.type === "leg" && template.legDay === "B");

    expect(legA).toMatchObject({ id: "template-leg-a", name: "Pierna" });
    expect(legB).toMatchObject({ id: "template-leg-b", name: "Trote" });
    expect(legA?.exercises).toHaveLength(26);
    expect(legB?.exercises).toHaveLength(11);

    const blocksA = Array.from(new Set(legA?.exercises.map((item) => item.block)));
    const blocksB = Array.from(new Set(legB?.exercises.map((item) => item.block)));
    expect(blocksA).toEqual(["1. Entrada en calor", "2. Día de pierna", "3. Elongación"]);
    expect(blocksB).toEqual(["1. Entrada en calor", "2. Trote", "3. Elongación"]);

    expect(legA?.exercises.map((item) => item.order)).toEqual(Array.from({ length: 26 }, (_, index) => index + 1));
    expect(legB?.exercises.map((item) => item.order)).toEqual(Array.from({ length: 11 }, (_, index) => index + 1));
  });

  it("loads all real upper-body months with Superior 1 and Superior 2", () => {
    const templates = buildWorkoutTemplates(REHAB_PLAN_ROWS, UPPER_MONTH_ROWS);
    const months = getAvailableMonths(templates);

    expect(months.map((month) => month.label)).toEqual(["Mayo 2026", "Junio 2026", "Julio 2026", "Agosto 2026"]);
    for (const month of months) {
      const expected = EXPECTED_UPPER_COUNTS[month.label as keyof typeof EXPECTED_UPPER_COUNTS];
      expect(templates.find((template) => template.monthId === month.id && template.upperDay === 1)?.exercises.length).toBe(expected[1]);
      expect(templates.find((template) => template.monthId === month.id && template.upperDay === 2)?.exercises.length).toBe(expected[2]);
    }
    expect(templates.filter((template) => template.type === "leg")).toHaveLength(2);
  });

  it("normalizes reps that Excel stored as dates", () => {
    expect(UPPER_MONTH_ROWS.find((row) => row.exercise === "Russian Twist")?.reps).toBe("10/10");
    expect(UPPER_MONTH_ROWS.find((row) => row.exercise === "Press inclinado con barra")?.reps).toBe("7/10");
    expect(UPPER_MONTH_ROWS.find((row) => row.exercise === "Plancha lateral c/ remo")?.reps).toBe("8/8");
  });

  it("does not include the previous tendon plan exercises", () => {
    const seed = buildSeedData();
    const names = seed.exercises.map((exercise) => exercise.name);

    expect(names).not.toContain("Sentadilla con cinto ruso isométrico");
    expect(names).not.toContain("Bulgara front");
    expect(names).not.toContain("Peso muerto c/rotación");
    expect(seed.exercises.every((exercise) => exercise.source === "leg-rehab" || exercise.source === "excel-upper")).toBe(true);
  });

  it("chooses the calendar month when available, then falls back to latest", () => {
    const seed = buildSeedData();

    expect(getDefaultMonthId(seed.templates, new Date("2026-06-17T12:00:00"))).toBe("junio-2026");
    expect(getDefaultMonthId(seed.templates, new Date("2026-12-01T12:00:00"))).toBe("agosto-2026");
  });

  it("keeps monthly prescriptions on template rows instead of global exercises", () => {
    const templates = buildWorkoutTemplates(REHAB_PLAN_ROWS, UPPER_MONTH_ROWS);
    const augustPress = templates
      .find((template) => template.monthId === "agosto-2026" && template.upperDay === 1)
      ?.exercises.find((item) => item.weightHint === "25/27,5/30");

    expect(parseExcelUpperRows(UPPER_MONTH_ROWS).length).toBe(66);
    expect(augustPress).toMatchObject({ targetReps: "6-4-4-2", targetSeries: 4 });
  });

  it("preserves every Excel row prescription in its monthly template", () => {
    const templates = buildWorkoutTemplates(REHAB_PLAN_ROWS, UPPER_MONTH_ROWS);

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
