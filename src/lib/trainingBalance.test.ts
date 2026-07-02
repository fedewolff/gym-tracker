import { describe, expect, it } from "vitest";
import type { WorkoutSession, WorkoutTemplate } from "../types";
import {
  buildTrainingHeatmap,
  buildRollingTrainingBalance,
  countTrainingDaysByType,
  resolveTrainingType,
} from "./trainingBalance";

const templates: WorkoutTemplate[] = [
  { id: "leg-template", name: "Pierna", type: "leg", exercises: [] },
  { id: "upper-template", name: "Superior", type: "upper", exercises: [] },
];

describe("training balance", () => {
  it("resolves explicit and legacy training types", () => {
    expect(
      resolveTrainingType(
        { id: "s1", templateId: "x", date: "2026-06-17", createdAt: "2026-06-17T12:00:00.000Z", trainingType: "upper" },
        templates,
      ),
    ).toBe("upper");
    expect(
      resolveTrainingType(
        { id: "s2", templateId: "leg-template", date: "2026-06-17", createdAt: "2026-06-17T12:00:00.000Z", kind: "workout" },
        templates,
      ),
    ).toBe("leg");
    expect(
      resolveTrainingType(
        { id: "s3", templateId: "template-quick-training", date: "2026-06-17", createdAt: "2026-06-17T12:00:00.000Z", kind: "quick" },
        templates,
      ),
    ).toBe("aerobic");
  });

  it("keeps sessions from reseeded plans classified after their template is gone", () => {
    expect(
      resolveTrainingType(
        { id: "s4", templateId: "template-leg-fixed", date: "2026-06-17", createdAt: "2026-06-17T12:00:00.000Z", kind: "workout" },
        templates,
      ),
    ).toBe("leg");
    expect(
      resolveTrainingType(
        { id: "s5", templateId: "template-upper-abril-2026-1", date: "2026-06-17", createdAt: "2026-06-17T12:00:00.000Z", kind: "workout" },
        templates,
      ),
    ).toBe("upper");
  });

  it("counts unique days by type inside a window", () => {
    const sessions: WorkoutSession[] = [
      { id: "s1", templateId: "leg-template", date: "2026-06-10", createdAt: "2026-06-10T12:00:00.000Z", kind: "workout" },
      { id: "s2", templateId: "leg-template", date: "2026-06-10", createdAt: "2026-06-10T13:00:00.000Z", kind: "workout" },
      { id: "s3", templateId: "upper-template", date: "2026-06-11", createdAt: "2026-06-11T12:00:00.000Z", kind: "workout" },
      { id: "s4", templateId: "template-quick-training", date: "2026-06-11", createdAt: "2026-06-11T13:00:00.000Z", kind: "quick" },
      { id: "s5", templateId: "upper-template", date: "2026-05-20", createdAt: "2026-05-20T12:00:00.000Z", kind: "workout" },
    ];

    expect(countTrainingDaysByType(sessions, templates, "2026-06-04", "2026-06-17")).toEqual({
      leg: 1,
      upper: 1,
      aerobic: 1,
    });
  });

  it("builds rolling 14-day points by window end date", () => {
    const sessions: WorkoutSession[] = [
      { id: "s1", templateId: "leg-template", date: "2026-06-04", createdAt: "2026-06-04T12:00:00.000Z", kind: "workout" },
      { id: "s2", templateId: "upper-template", date: "2026-06-03", createdAt: "2026-06-03T12:00:00.000Z", kind: "workout" },
      { id: "s3", templateId: "template-quick-training", date: "2026-06-17", createdAt: "2026-06-17T12:00:00.000Z", kind: "quick" },
    ];

    const points = buildRollingTrainingBalance(sessions, templates, "2026-06-17", 2, 14);

    expect(points.map((point) => point.date)).toEqual(["2026-06-16", "2026-06-17"]);
    expect(points[0]).toMatchObject({ leg: 1, upper: 1, aerobic: 0 });
    expect(points[1]).toMatchObject({ leg: 1, upper: 0, aerobic: 1 });
    expect(points[1].legWeeklyAverage).toBeCloseTo(0.5);
  });

  it("can build longer historical rolling series", () => {
    const points = buildRollingTrainingBalance([], templates, "2026-06-17", 90, 14);

    expect(points).toHaveLength(90);
    expect(points[0].date).toBe("2026-03-20");
    expect(points[89].date).toBe("2026-06-17");
  });

  it("builds a 14-day heatmap with intensity from recorded sets", () => {
    const sessions: WorkoutSession[] = [
      { id: "s1", templateId: "leg-template", date: "2026-06-10", createdAt: "2026-06-10T12:00:00.000Z", kind: "workout" },
      { id: "s2", templateId: "upper-template", date: "2026-06-17", createdAt: "2026-06-17T12:00:00.000Z", kind: "workout" },
      { id: "s3", templateId: "template-quick-training", date: "2026-06-17", createdAt: "2026-06-17T13:00:00.000Z", kind: "quick" },
    ];

    const heatmap = buildTrainingHeatmap(
      sessions,
      templates,
      [
        { id: "e1", sessionId: "s1", exerciseId: "x", date: "2026-06-10", setNumber: 1, weightText: "10", reps: "8" },
        { id: "e2", sessionId: "s1", exerciseId: "x", date: "2026-06-10", setNumber: 2, weightText: "10", reps: "8" },
        { id: "e3", sessionId: "s2", exerciseId: "y", date: "2026-06-17", setNumber: 1, weightText: "20", reps: "8" },
      ],
      "2026-06-17",
    );

    expect(heatmap.days).toHaveLength(14);
    expect(heatmap.days[0].date).toBe("2026-06-04");
    expect(heatmap.days[13].date).toBe("2026-06-17");
    expect(heatmap.rows.find((row) => row.type === "leg")?.totalDays).toBe(1);
    expect(heatmap.rows.find((row) => row.type === "upper")?.totalDays).toBe(1);
    expect(heatmap.rows.find((row) => row.type === "aerobic")?.totalDays).toBe(1);
    expect(heatmap.rows.find((row) => row.type === "leg")?.cells.find((cell) => cell.date === "2026-06-10")?.intensity).toBe(2);
    expect(heatmap.summary.totalTrainingDays).toBe(3);
  });

  it("lets manual uncheck overrides hide a saved workout from balance", () => {
    const sessions: WorkoutSession[] = [
      { id: "s1", templateId: "leg-template", date: "2026-06-17", createdAt: "2026-06-17T12:00:00.000Z", kind: "workout" },
      {
        id: "s2",
        templateId: "template-heatmap-uncheck",
        date: "2026-06-17",
        createdAt: "2026-06-17T13:00:00.000Z",
        kind: "manual-uncheck",
        trainingType: "leg",
      },
    ];

    const heatmap = buildTrainingHeatmap(
      sessions,
      templates,
      [{ id: "e1", sessionId: "s1", exerciseId: "x", date: "2026-06-17", setNumber: 1, weightText: "10", reps: "8" }],
      "2026-06-17",
    );

    expect(countTrainingDaysByType(sessions, templates, "2026-06-04", "2026-06-17").leg).toBe(0);
    expect(heatmap.rows.find((row) => row.type === "leg")?.totalDays).toBe(0);
    expect(heatmap.rows.find((row) => row.type === "leg")?.cells.find((cell) => cell.date === "2026-06-17")?.trained).toBe(false);
  });

  it("does not count mobility sessions as aerobic training", () => {
    const sessions: WorkoutSession[] = [
      { id: "m1", templateId: "template-mobility", date: "2026-06-17", createdAt: "2026-06-17T10:00:00.000Z", kind: "mobility", mobilitySlot: "morning" },
    ];

    const heatmap = buildTrainingHeatmap(sessions, templates, [], "2026-06-17");

    expect(countTrainingDaysByType(sessions, templates, "2026-06-04", "2026-06-17")).toEqual({
      leg: 0,
      upper: 0,
      aerobic: 0,
    });
    expect(heatmap.summary.totalTrainingDays).toBe(0);
  });
});
