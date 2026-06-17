import { describe, expect, it } from "vitest";
import { extractWeightNumber } from "./weights";

describe("extractWeightNumber", () => {
  it("extracts the first numeric weight from mixed gym notation", () => {
    expect(extractWeightNumber("20kg cada lado")).toBe(20);
    expect(extractWeightNumber("25/27,5/30")).toBe(25);
    expect(extractWeightNumber("7,5")).toBe(7.5);
    expect(extractWeightNumber("Banda roja")).toBeUndefined();
    expect(extractWeightNumber("-")).toBeUndefined();
  });
});
