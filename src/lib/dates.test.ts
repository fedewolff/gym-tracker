import { describe, expect, it } from "vitest";
import { argentinaTimestamp, dateFromIso, isoFromDate, shiftDate, todayIso } from "./dates";

describe("date helpers", () => {
  it("formats Argentina calendar dates without UTC conversion", () => {
    const lateArgentinaDate = new Date("2026-06-23T02:45:00.000Z");

    expect(todayIso(lateArgentinaDate)).toBe("2026-06-22");
  });

  it("writes timestamps with Argentina offset", () => {
    const date = new Date("2026-06-22T16:17:40.000Z");

    expect(argentinaTimestamp(date)).toBe("2026-06-22T13:17:40-03:00");
  });

  it("shifts iso dates by local calendar days", () => {
    expect(isoFromDate(shiftDate(dateFromIso("2026-06-01"), -1))).toBe("2026-05-31");
    expect(isoFromDate(shiftDate(dateFromIso("2026-06-30"), 1))).toBe("2026-07-01");
  });
});
