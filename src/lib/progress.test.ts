import { describe, expect, it } from "vitest";
import type { SetEntry, WorkoutSession } from "../types";
import { calculateProgressPoints, getLatestSetsByNumber } from "./progress";

const sessions: WorkoutSession[] = [
  { id: "s1", templateId: "t1", date: "2026-06-01", createdAt: "2026-06-01T12:00:00.000Z" },
  { id: "s2", templateId: "t1", date: "2026-06-08", createdAt: "2026-06-08T12:00:00.000Z" },
];

const entries: SetEntry[] = [
  { id: "e1", sessionId: "s1", exerciseId: "press", date: "2026-06-01", setNumber: 1, weightText: "40", weightNumber: 40, reps: "6" },
  { id: "e2", sessionId: "s1", exerciseId: "press", date: "2026-06-01", setNumber: 2, weightText: "45", weightNumber: 45, reps: "6" },
  { id: "e3", sessionId: "s2", exerciseId: "press", date: "2026-06-08", setNumber: 1, weightText: "50", weightNumber: 50, reps: "6" },
  { id: "e4", sessionId: "s2", exerciseId: "press", date: "2026-06-08", setNumber: 2, weightText: "Banda", reps: "12" },
];

describe("progress helpers", () => {
  it("returns latest values by set number", () => {
    const latest = getLatestSetsByNumber("press", sessions, entries);

    expect(latest.get(1)?.weightText).toBe("50");
    expect(latest.get(2)?.weightText).toBe("Banda");
  });

  it("calculates best numeric weight per session for charting", () => {
    const points = calculateProgressPoints("press", sessions, entries);

    expect(points).toEqual([
      { date: "2026-06-01", bestWeight: 45, weightLabel: "45", repsLabel: "6", sessionId: "s1" },
      { date: "2026-06-08", bestWeight: 50, weightLabel: "50", repsLabel: "6", sessionId: "s2" },
    ]);
  });
});
