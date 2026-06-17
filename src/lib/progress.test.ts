import { describe, expect, it } from "vitest";
import type { SetEntry, WorkoutSession } from "../types";
import { calculateProgressPoints, getLatestSetsByNumber } from "./progress";
import { buildTrainingDays, buildTrainingWindows, getNextQuickSessionCount } from "./trainingCalendar";

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

  it("caps training calendar colors at two sessions per day", () => {
    const days = buildTrainingDays(
      [
        ...sessions,
        { id: "s3", templateId: "run", date: "2026-06-08", createdAt: "2026-06-08T18:00:00.000Z", kind: "quick" },
        { id: "s4", templateId: "run", date: "2026-06-08", createdAt: "2026-06-08T19:00:00.000Z", kind: "quick" },
      ],
      "2026-06-08",
      8,
    );

    expect(days.find((day) => day.date === "2026-06-01")?.count).toBe(1);
    expect(days.find((day) => day.date === "2026-06-08")?.count).toBe(2);
  });

  it("builds scrollable 30-day training windows", () => {
    const windows = buildTrainingWindows(sessions, "2026-06-17", 2);

    expect(windows).toHaveLength(2);
    expect(windows[0]).toMatchObject({ id: "window-30", label: "30-59 días atrás" });
    expect(windows[0].days).toHaveLength(30);
    expect(windows[0].days[0].date).toBe("2026-04-19");
    expect(windows[0].days[29].date).toBe("2026-05-18");
    expect(windows[1]).toMatchObject({ id: "window-0", label: "Últimos 30" });
    expect(windows[1].days[0].date).toBe("2026-05-19");
    expect(windows[1].days[29].date).toBe("2026-06-17");
  });

  it("cycles quick session counts without deleting planned workouts", () => {
    expect(getNextQuickSessionCount(0, 0)).toBe(1);
    expect(getNextQuickSessionCount(0, 1)).toBe(2);
    expect(getNextQuickSessionCount(0, 2)).toBe(0);
    expect(getNextQuickSessionCount(1, 0)).toBe(1);
    expect(getNextQuickSessionCount(1, 1)).toBe(0);
    expect(getNextQuickSessionCount(2, 0)).toBe(0);
  });
});
