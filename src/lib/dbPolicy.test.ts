import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("db seed policy", () => {
  it("does not clear user-entered sessions or sets when refreshing seed data", () => {
    const source = readFileSync(fileURLToPath(new URL("./db.ts", import.meta.url)), "utf8");
    const ensureSeededBody = source.slice(source.indexOf("export async function ensureSeeded"), source.indexOf("export async function exportBackup"));

    expect(ensureSeededBody).not.toContain("db.sessions.clear()");
    expect(ensureSeededBody).not.toContain("db.setEntries.clear()");
  });

  it("refreshes current seed data after importing a backup", () => {
    const source = readFileSync(fileURLToPath(new URL("./db.ts", import.meta.url)), "utf8");
    const importBackupBody = source.slice(source.indexOf("export async function importBackup"), source.length);

    expect(importBackupBody).toContain("await ensureSeeded()");
    expect(importBackupBody).toContain('record.key !== "seedVersion"');
  });
});
