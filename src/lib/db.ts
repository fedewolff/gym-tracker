import Dexie, { type Table } from "dexie";
import type { BackupPayload, Exercise, MetaRecord, SetEntry, WorkoutSession, WorkoutTemplate } from "../types";
import { buildSeedData, SEED_VERSION } from "../data/seed";

export class GymDatabase extends Dexie {
  exercises!: Table<Exercise, string>;
  templates!: Table<WorkoutTemplate, string>;
  sessions!: Table<WorkoutSession, string>;
  setEntries!: Table<SetEntry, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super("gym-fede-db");
    this.version(1).stores({
      exercises: "id, name, group, source, activeInRoutine",
      templates: "id, dayIndex, type",
      sessions: "id, date, templateId",
      setEntries: "id, sessionId, exerciseId, date",
      meta: "key",
    });
    this.version(2).stores({
      exercises: "id, name, group, source, activeInRoutine",
      templates: "id, type, monthId, upperDay",
      sessions: "id, date, templateId",
      setEntries: "id, sessionId, exerciseId, date",
      meta: "key",
    });
  }
}

export const db = new GymDatabase();

export async function ensureSeeded(): Promise<void> {
  const seedMeta = await db.meta.get("seedVersion");
  if (seedMeta?.value === SEED_VERSION) return;

  const seed = buildSeedData();

  await db.transaction("rw", db.exercises, db.templates, db.sessions, db.setEntries, db.meta, async () => {
    await db.exercises.clear();
    await db.templates.clear();
    await db.sessions.clear();
    await db.setEntries.clear();
    await db.meta.clear();
    await db.exercises.bulkPut(seed.exercises);
    await db.templates.bulkPut(seed.templates);
    await db.meta.put({ key: "seedVersion", value: SEED_VERSION });
  });
}

export async function exportBackup(): Promise<BackupPayload> {
  const [exercises, templates, sessions, setEntries, meta] = await Promise.all([
    db.exercises.toArray(),
    db.templates.toArray(),
    db.sessions.toArray(),
    db.setEntries.toArray(),
    db.meta.toArray(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises,
    templates,
    sessions,
    setEntries,
    meta,
  };
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  if (!Array.isArray(payload.exercises) || !Array.isArray(payload.templates)) {
    throw new Error("Backup invalido");
  }

  await db.transaction("rw", db.exercises, db.templates, db.sessions, db.setEntries, db.meta, async () => {
    await db.exercises.clear();
    await db.templates.clear();
    await db.sessions.clear();
    await db.setEntries.clear();
    await db.meta.clear();
    await db.exercises.bulkPut(payload.exercises);
    await db.templates.bulkPut(payload.templates);
    await db.sessions.bulkPut(payload.sessions ?? []);
    await db.setEntries.bulkPut(payload.setEntries ?? []);
    await db.meta.bulkPut(payload.meta ?? [{ key: "seedVersion", value: SEED_VERSION }]);
  });
}
