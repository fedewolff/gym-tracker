import type { SetEntry, WorkoutSession } from "../types";
import { dateFromIso } from "./dates";

export interface LatestSet {
  setNumber: number;
  weightText: string;
  weightNumber?: number;
  reps: string;
  effort?: string;
  date: string;
}

export interface ProgressPoint {
  date: string;
  bestWeight: number;
  weightLabel: string;
  repsLabel: string;
  sessionId: string;
}

function sessionTime(session: WorkoutSession): number {
  return dateFromIso(session.date).getTime();
}

export function getLatestSetsByNumber(
  exerciseId: string,
  sessions: WorkoutSession[],
  entries: SetEntry[],
): Map<number, LatestSet> {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const relevant = entries
    .filter((entry) => entry.exerciseId === exerciseId)
    .filter((entry) => sessionById.has(entry.sessionId))
    .sort((a, b) => {
      const sessionA = sessionById.get(a.sessionId)!;
      const sessionB = sessionById.get(b.sessionId)!;
      const dateDelta = sessionTime(sessionB) - sessionTime(sessionA);
      if (dateDelta !== 0) return dateDelta;
      return b.setNumber - a.setNumber;
    });

  const latest = new Map<number, LatestSet>();
  for (const entry of relevant) {
    if (latest.has(entry.setNumber)) continue;
    latest.set(entry.setNumber, {
      setNumber: entry.setNumber,
      weightText: entry.weightText,
      weightNumber: entry.weightNumber,
      reps: entry.reps,
      effort: entry.effort,
      date: entry.date,
    });
  }

  return latest;
}

export function getLatestAnySet(
  exerciseId: string,
  sessions: WorkoutSession[],
  entries: SetEntry[],
): LatestSet | undefined {
  const latest = getLatestSetsByNumber(exerciseId, sessions, entries);
  return Array.from(latest.values()).sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function calculateProgressPoints(
  exerciseId: string,
  sessions: WorkoutSession[],
  entries: SetEntry[],
): ProgressPoint[] {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const pointsBySession = new Map<string, ProgressPoint>();

  for (const entry of entries) {
    if (entry.exerciseId !== exerciseId || entry.weightNumber === undefined) continue;
    const session = sessionById.get(entry.sessionId);
    if (!session) continue;

    const current = pointsBySession.get(entry.sessionId);
    if (!current || entry.weightNumber > current.bestWeight) {
      pointsBySession.set(entry.sessionId, {
        date: session.date,
        bestWeight: entry.weightNumber,
        weightLabel: entry.weightText,
        repsLabel: entry.reps,
        sessionId: entry.sessionId,
      });
    }
  }

  return Array.from(pointsBySession.values()).sort((a, b) => a.date.localeCompare(b.date));
}
