import { describe, expect, it } from "vitest";
import { dateFromIso, isoFromDate, shiftDate, todayIso } from "./dates";

describe("date helpers", () => {
  it("formats local calendar dates without UTC conversion", () => {
    const lateLocalDate = new Date(2026, 5, 22, 23, 45);

    expect(todayIso(lateLocalDate)).toBe("2026-06-22");
  });

  it("shifts iso dates by local calendar days", () => {
    expect(isoFromDate(shiftDate(dateFromIso("2026-06-01"), -1))).toBe("2026-05-31");
    expect(isoFromDate(shiftDate(dateFromIso("2026-06-30"), 1))).toBe("2026-07-01");
  });
});
