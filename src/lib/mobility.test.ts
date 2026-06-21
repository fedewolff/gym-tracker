import { describe, expect, it } from "vitest";
import type { WorkoutSession } from "../types";
import { buildMobilityHeatmap, MOBILITY_SLOTS } from "./mobility";

describe("mobility helpers", () => {
  it("builds a 14-day mobility heatmap ending at the anchor date", () => {
    const heatmap = buildMobilityHeatmap([], "2026-06-17");

    expect(heatmap.days).toHaveLength(14);
    expect(heatmap.days[0].date).toBe("2026-06-04");
    expect(heatmap.days[13].date).toBe("2026-06-17");
    expect(heatmap.rows.map((row) => row.slot)).toEqual(MOBILITY_SLOTS);
    expect(heatmap.rows.map((row) => row.label)).toEqual(["Mañana", "Mediodía", "Pre entrenar", "Noche"]);
  });

  it("counts completed mobility blocks by slot", () => {
    const sessions: WorkoutSession[] = [
      { id: "m1", templateId: "template-mobility", date: "2026-06-17", kind: "mobility", mobilitySlot: "morning", createdAt: "2026-06-17T10:00:00.000Z" },
      { id: "m2", templateId: "template-mobility", date: "2026-06-17", kind: "mobility", mobilitySlot: "night", createdAt: "2026-06-17T22:00:00.000Z" },
      { id: "m3", templateId: "template-mobility", date: "2026-05-30", kind: "mobility", mobilitySlot: "midday", createdAt: "2026-05-30T12:00:00.000Z" },
    ];

    const heatmap = buildMobilityHeatmap(sessions, "2026-06-17");

    expect(heatmap.summary.totalBlocks).toBe(2);
    expect(heatmap.rows.find((row) => row.slot === "morning")?.totalDays).toBe(1);
    expect(heatmap.rows.find((row) => row.slot === "midday")?.totalDays).toBe(0);
    expect(heatmap.rows.find((row) => row.slot === "night")?.cells.find((cell) => cell.date === "2026-06-17")?.completed).toBe(true);
  });
});
