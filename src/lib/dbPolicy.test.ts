import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("db seed policy", () => {
  it("does not clear user-entered sessions, sets or checks when refreshing seed data", () => {
    const source = readFileSync(fileURLToPath(new URL("./db.ts", import.meta.url)), "utf8");
    const ensureSeededBody = source.slice(source.indexOf("export async function ensureSeeded"), source.indexOf("export async function exportBackup"));

    expect(ensureSeededBody).not.toContain("db.sessions.clear()");
    expect(ensureSeededBody).not.toContain("db.setEntries.clear()");
    expect(ensureSeededBody).not.toContain("db.exerciseChecks.clear()");
  });

  it("refreshes current seed data after importing a backup", () => {
    const source = readFileSync(fileURLToPath(new URL("./db.ts", import.meta.url)), "utf8");
    const importBackupBody = source.slice(source.indexOf("export async function importBackup"), source.length);

    expect(importBackupBody).toContain("await ensureSeeded()");
    expect(importBackupBody).toContain('record.key !== "seedVersion"');
  });

  it("round-trips exercise checks through export and import, tolerating v1 backups", () => {
    const source = readFileSync(fileURLToPath(new URL("./db.ts", import.meta.url)), "utf8");
    const exportBody = source.slice(source.indexOf("export async function exportBackup"), source.indexOf("export async function importBackup"));
    const importBackupBody = source.slice(source.indexOf("export async function importBackup"), source.length);

    expect(exportBody).toContain("db.exerciseChecks.toArray()");
    expect(exportBody).toContain("exerciseChecks,");
    expect(importBackupBody).toContain("payload.exerciseChecks ?? []");
  });

  it("normalizes stored UTC session timestamps without deleting sessions", () => {
    const source = readFileSync(fileURLToPath(new URL("./db.ts", import.meta.url)), "utf8");
    const normalizeBody = source.slice(source.indexOf("export async function ensureArgentinaTimestamps"), source.indexOf("export async function exportBackup"));
    const importBackupBody = source.slice(source.indexOf("export async function importBackup"), source.length);

    expect(normalizeBody).toContain('createdAt?.endsWith("Z")');
    expect(normalizeBody).toContain("db.sessions.bulkPut");
    expect(normalizeBody).not.toContain("db.sessions.clear()");
    expect(importBackupBody).toContain(".map(normalizeCreatedAt)");
  });
});
