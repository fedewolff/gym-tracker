import { describe, expect, it } from "vitest";
import type { WorkoutSession, WorkoutTemplate } from "../types";
import {
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
});
