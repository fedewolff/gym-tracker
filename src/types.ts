export type ExerciseSource = "pdf-current" | "excel-upper";
export type WorkoutType = "leg" | "upper";
export type TrainingType = WorkoutType | "aerobic";
export type MobilitySlot = "morning" | "midday" | "siesta" | "night";

export interface Exercise {
  id: string;
  name: string;
  group: string;
  block: string;
  source: ExerciseSource;
  activeInRoutine: boolean;
  videoUrl?: string;
  notes?: string;
  targetSeries?: number;
  targetReps?: string;
  tempo?: string;
  effortTarget?: string;
}

export interface WorkoutTemplateExercise {
  exerciseId: string;
  order: number;
  block: string;
  targetSeries?: number;
  targetReps?: string;
  effortTarget?: string;
  weightHint?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: WorkoutType;
  monthId?: string;
  monthLabel?: string;
  upperDay?: 1 | 2;
  exercises: WorkoutTemplateExercise[];
}

export interface WorkoutSession {
  id: string;
  templateId: string;
  date: string;
  kind?: "workout" | "quick" | "manual-uncheck" | "mobility";
  trainingType?: TrainingType;
  mobilitySlot?: MobilitySlot;
  painLevel?: number;
  notes?: string;
  createdAt: string;
}

export interface SetEntry {
  id: string;
  sessionId: string;
  exerciseId: string;
  date: string;
  setNumber: number;
  weightText: string;
  weightNumber?: number;
  reps: string;
  effort?: string;
}

export interface MetaRecord {
  key: string;
  value: string;
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  exercises: Exercise[];
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  setEntries: SetEntry[];
  meta: MetaRecord[];
}
