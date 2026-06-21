import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Download,
  Dumbbell,
  ExternalLink,
  LineChart as LineChartIcon,
  Play,
  RotateCcw,
  Search,
  Settings,
  Upload,
} from "lucide-react";
import { getAvailableMonths, getDefaultMonthId } from "./data/seed";
import { db, ensureSeeded, exportBackup, importBackup } from "./lib/db";
import { uid } from "./lib/ids";
import { buildMobilityHeatmap, isMobilitySession, MOBILITY_BLOCKS, MOBILITY_SLOT_LABELS, MOBILITY_TEMPLATE_ID } from "./lib/mobility";
import { getLatestAnySet, getLatestSetsByNumber } from "./lib/progress";
import { buildTrainingHeatmap, TRAINING_TYPE_LABELS, resolveTrainingType } from "./lib/trainingBalance";
import {
  HEATMAP_UNCHECK_TEMPLATE_ID,
  QUICK_SESSION_TEMPLATE_ID,
  isManualUncheckSession,
  isQuickSession,
} from "./lib/trainingCalendar";
import { extractWeightNumber } from "./lib/weights";
import type { BackupPayload, Exercise, MobilitySlot, SetEntry, TrainingType, WorkoutSession, WorkoutTemplate, WorkoutTemplateExercise } from "./types";

type View = "train" | "progress" | "exercises" | "settings";
type WorkoutKind = "leg" | "upper" | "mobility";

interface AppData {
  exercises: Exercise[];
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  setEntries: SetEntry[];
}

interface DraftSet {
  setNumber: number;
  weightText: string;
  reps: string;
  effort: string;
}

type WorkoutDraft = Record<string, DraftSet[]>;

const TABS: Array<{ id: View; label: string; icon: typeof Dumbbell }> = [
  { id: "train", label: "Entrenar", icon: Dumbbell },
  { id: "progress", label: "Progreso", icon: LineChartIcon },
  { id: "exercises", label: "Ejercicios", icon: Search },
  { id: "settings", label: "Ajustes", icon: Settings },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function mergeClass(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function seriesLabel(count?: number): string {
  const value = count ?? 1;
  return `${value}x`;
}

function exerciseProgressKey(item: WorkoutTemplateExercise): string {
  return `${item.order}:${item.exerciseId}`;
}

export default function App() {
  const [view, setView] = useState<View>("train");
  const [workoutKind, setWorkoutKind] = useState<WorkoutKind>("leg");
  const [selectedMonthId, setSelectedMonthId] = useState("");
  const [selectedUpperDay, setSelectedUpperDay] = useState<1 | 2>(1);
  const [data, setData] = useState<AppData>({ exercises: [], templates: [], sessions: [], setEntries: [] });
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState("");

  const loadData = useCallback(async () => {
    const [exercises, templates, sessions, setEntries] = await Promise.all([
      db.exercises.toArray(),
      db.templates.toArray(),
      db.sessions.toArray(),
      db.setEntries.toArray(),
    ]);
    const sortedExercises = exercises.sort((a, b) => a.name.localeCompare(b.name, "es"));
    const sortedTemplates = templates.sort((a, b) => a.id.localeCompare(b.id));

    setData({
      exercises: sortedExercises,
      templates: sortedTemplates,
      sessions: sessions.sort((a, b) => b.date.localeCompare(a.date)),
      setEntries,
    });
    setSelectedMonthId((current) => current || getDefaultMonthId(sortedTemplates));
  }, []);

  useEffect(() => {
    ensureSeeded()
      .then(loadData)
      .then(() => setIsReady(true))
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "No se pudo inicializar la app");
        setIsReady(true);
      });
  }, [loadData]);

  const exerciseById = useMemo(() => new Map(data.exercises.map((exercise) => [exercise.id, exercise])), [data.exercises]);
  const months = useMemo(() => getAvailableMonths(data.templates), [data.templates]);
  const legTemplate = data.templates.find((template) => template.type === "leg");
  const upperTemplate = data.templates.find(
    (template) => template.type === "upper" && template.monthId === selectedMonthId && template.upperDay === selectedUpperDay,
  );
  const selectedTemplate = workoutKind === "leg" ? legTemplate : upperTemplate;

  const saveWorkout = async (template: WorkoutTemplate, date: string, painLevel: number | undefined, draft: WorkoutDraft) => {
    const sessionId = uid("session");
    const session: WorkoutSession = {
      id: sessionId,
      templateId: template.id,
      date,
      kind: "workout",
      trainingType: template.type,
      painLevel,
      createdAt: new Date().toISOString(),
    };

    const entries: SetEntry[] = Object.entries(draft).flatMap(([exerciseId, sets]) =>
      sets
        .filter((set) => set.weightText.trim() || set.reps.trim() || set.effort.trim())
        .map((set) => ({
          id: uid("set"),
          sessionId,
          exerciseId,
          date,
          setNumber: set.setNumber,
          weightText: set.weightText.trim(),
          weightNumber: extractWeightNumber(set.weightText),
          reps: set.reps.trim(),
          effort: set.effort.trim() || undefined,
        })),
    );

    await db.transaction("rw", db.sessions, db.setEntries, async () => {
      await db.sessions.put(session);
      if (entries.length) await db.setEntries.bulkPut(entries);
    });
    await loadData();
    setStatus("Entrenamiento guardado");
  };

  const toggleHeatmapTraining = async (date: string, trainingType: TrainingType) => {
    const matchingSessions = data.sessions.filter(
      (session) => !isMobilitySession(session) && session.date === date && resolveTrainingType(session, data.templates) === trainingType,
    );
    const uncheckSessions = matchingSessions.filter(isManualUncheckSession);
    const quickSessions = matchingSessions.filter((session) => isQuickSession(session) && !isManualUncheckSession(session));
    const workoutSessions = matchingSessions.filter((session) => !isQuickSession(session) && !isManualUncheckSession(session));
    const uncheckIds = uncheckSessions.map((session) => session.id);
    const quickIds = quickSessions.map((session) => session.id);
    let actionLabel = "marcado";

    await db.transaction("rw", db.sessions, db.setEntries, async () => {
      if (uncheckIds.length) {
        await db.sessions.bulkDelete(uncheckIds);
        if (!quickSessions.length && !workoutSessions.length) {
          await db.sessions.put({
            id: uid("session"),
            templateId: QUICK_SESSION_TEMPLATE_ID,
            date,
            kind: "quick",
            trainingType,
            createdAt: new Date().toISOString(),
          });
        }
        return;
      }

      if (quickIds.length) {
        actionLabel = "desmarcado";
        await db.sessions.bulkDelete(quickIds);
        await db.setEntries.where("sessionId").anyOf(quickIds).delete();
      }

      if (workoutSessions.length) {
        actionLabel = "desmarcado";
        await db.sessions.put({
          id: uid("session"),
          templateId: HEATMAP_UNCHECK_TEMPLATE_ID,
          date,
          kind: "manual-uncheck",
          trainingType,
          createdAt: new Date().toISOString(),
        });
        return;
      }

      if (!quickIds.length) {
        await db.sessions.put({
          id: uid("session"),
          templateId: QUICK_SESSION_TEMPLATE_ID,
          date,
          kind: "quick",
          trainingType,
          createdAt: new Date().toISOString(),
        });
      }
    });

    await loadData();
    setStatus(`${TRAINING_TYPE_LABELS[trainingType]} ${actionLabel}`);
  };

  const toggleMobility = async (date: string, mobilitySlot: MobilitySlot) => {
    const matchingSessions = data.sessions.filter((session) => isMobilitySession(session) && session.date === date && session.mobilitySlot === mobilitySlot);
    const matchingIds = matchingSessions.map((session) => session.id);
    let actionLabel = "marcada";

    await db.transaction("rw", db.sessions, async () => {
      if (matchingIds.length) {
        actionLabel = "desmarcada";
        await db.sessions.bulkDelete(matchingIds);
        return;
      }

      await db.sessions.put({
        id: uid("session"),
        templateId: MOBILITY_TEMPLATE_ID,
        date,
        kind: "mobility",
        mobilitySlot,
        createdAt: new Date().toISOString(),
      });
    });

    await loadData();
    setStatus(`${MOBILITY_SLOT_LABELS[mobilitySlot]} ${actionLabel}`);
  };

  if (!isReady) {
    return (
      <main className="loading">
        <Dumbbell size={28} />
        <span>Cargando</span>
      </main>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <span className="app-kicker">Gym Fede</span>
          <h1>{view === "train" ? "Entrenar" : TABS.find((tab) => tab.id === view)?.label}</h1>
        </div>
        <div className="sync-pill">Local</div>
      </header>

      {status ? (
        <div className="status" role="status">
          <Check size={16} />
          {status}
        </div>
      ) : null}

      <main className="screen">
        {view === "train" && workoutKind === "mobility" ? (
          <MobilityView
            workoutKind={workoutKind}
            setWorkoutKind={setWorkoutKind}
            sessions={data.sessions}
            onToggleMobility={toggleMobility}
          />
        ) : null}
        {view === "train" && workoutKind !== "mobility" && selectedTemplate ? (
          <TrainView
            template={selectedTemplate}
            workoutKind={workoutKind}
            setWorkoutKind={setWorkoutKind}
            months={months}
            selectedMonthId={selectedMonthId}
            setSelectedMonthId={setSelectedMonthId}
            selectedUpperDay={selectedUpperDay}
            setSelectedUpperDay={setSelectedUpperDay}
            exerciseById={exerciseById}
            sessions={data.sessions}
            setEntries={data.setEntries}
            onSave={saveWorkout}
          />
        ) : null}
        {view === "progress" ? (
          <ProgressView
            templates={data.templates}
            sessions={data.sessions}
            setEntries={data.setEntries}
            onToggleTraining={toggleHeatmapTraining}
            onToggleMobility={toggleMobility}
          />
        ) : null}
        {view === "exercises" ? <ExercisesView exercises={data.exercises} sessions={data.sessions} setEntries={data.setEntries} /> : null}
        {view === "settings" ? <SettingsView reload={loadData} setStatus={setStatus} /> : null}
      </main>

      <nav className="tabbar" aria-label="Principal">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} type="button" className={mergeClass("tab", view === tab.id && "tab-active")} onClick={() => setView(tab.id)}>
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function TrainView({
  template,
  workoutKind,
  setWorkoutKind,
  months,
  selectedMonthId,
  setSelectedMonthId,
  selectedUpperDay,
  setSelectedUpperDay,
  exerciseById,
  sessions,
  setEntries,
  onSave,
}: {
  template: WorkoutTemplate;
  workoutKind: WorkoutKind;
  setWorkoutKind: (kind: WorkoutKind) => void;
  months: Array<{ id: string; label: string }>;
  selectedMonthId: string;
  setSelectedMonthId: (monthId: string) => void;
  selectedUpperDay: 1 | 2;
  setSelectedUpperDay: (day: 1 | 2) => void;
  exerciseById: Map<string, Exercise>;
  sessions: WorkoutSession[];
  setEntries: SetEntry[];
  onSave: (template: WorkoutTemplate, date: string, painLevel: number | undefined, draft: WorkoutDraft) => Promise<void>;
}) {
  const [date, setDate] = useState(todayIso);
  const [painLevel, setPainLevel] = useState("0");
  const [draft, setDraft] = useState<WorkoutDraft>({});
  const [completedExerciseKeys, setCompletedExerciseKeys] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const nextDraft: WorkoutDraft = {};
    for (const item of template.exercises) {
      const exercise = exerciseById.get(item.exerciseId);
      if (!exercise) continue;
      const series = item.targetSeries ?? exercise.targetSeries ?? 1;
      const latestBySet = getLatestSetsByNumber(exercise.id, sessions, setEntries);
      const fallback = getLatestAnySet(exercise.id, sessions, setEntries);

      nextDraft[exercise.id] = Array.from({ length: series }, (_, index) => {
        const setNumber = index + 1;
        const latest = latestBySet.get(setNumber) ?? fallback;
        return {
          setNumber,
          weightText: latest?.weightText ?? item.weightHint ?? "",
          reps: latest?.reps ?? item.targetReps ?? exercise.targetReps ?? "",
          effort: latest?.effort ?? item.effortTarget ?? "",
        };
      });
    }
    setDraft(nextDraft);
  }, [exerciseById, sessions, setEntries, template]);

  useEffect(() => {
    setCompletedExerciseKeys(new Set());
  }, [date, template.id]);

  const updateSet = (exerciseId: string, setNumber: number, patch: Partial<DraftSet>) => {
    setDraft((current) => ({
      ...current,
      [exerciseId]: current[exerciseId].map((set) => (set.setNumber === setNumber ? { ...set, ...patch } : set)),
    }));
  };

  const resetToLatest = (exercise: Exercise, item: WorkoutTemplateExercise) => {
    const series = item.targetSeries ?? exercise.targetSeries ?? 1;
    const latestBySet = getLatestSetsByNumber(exercise.id, sessions, setEntries);
    const fallback = getLatestAnySet(exercise.id, sessions, setEntries);
    setDraft((current) => ({
      ...current,
      [exercise.id]: Array.from({ length: series }, (_, index) => {
        const setNumber = index + 1;
        const latest = latestBySet.get(setNumber) ?? fallback;
        return {
          setNumber,
          weightText: latest?.weightText ?? item.weightHint ?? "",
          reps: latest?.reps ?? item.targetReps ?? exercise.targetReps ?? "",
          effort: latest?.effort ?? item.effortTarget ?? "",
        };
      }),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(template, date, Number(painLevel), draft);
    setCompletedExerciseKeys(new Set(template.exercises.map(exerciseProgressKey)));
    setIsSaving(false);
  };

  const toggleExerciseComplete = (item: WorkoutTemplateExercise) => {
    const key = exerciseProgressKey(item);
    setCompletedExerciseKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const totalExercises = template.exercises.length;
  const completedExercises = completedExerciseKeys.size;
  const remainingExercises = Math.max(0, totalExercises - completedExercises);
  const progressPercent = totalExercises ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return (
    <section className="flow">
      <div className="train-controls">
        <div className="segmented" aria-label="Tipo de rutina">
          <button type="button" className={workoutKind === "leg" ? "selected" : ""} onClick={() => setWorkoutKind("leg")}>
            Pierna
          </button>
          <button type="button" className={workoutKind === "upper" ? "selected" : ""} onClick={() => setWorkoutKind("upper")}>
            Superior
          </button>
          <button type="button" className={workoutKind === "mobility" ? "selected" : ""} onClick={() => setWorkoutKind("mobility")}>
            Movilidad
          </button>
        </div>

        <div className="control-row">
          <label>
            Fecha
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>
            Dolor
            <input type="number" min="0" max="10" value={painLevel} onChange={(event) => setPainLevel(event.target.value)} />
          </label>
        </div>

        {workoutKind === "upper" ? (
          <div className="control-row">
            <label>
              Mes
              <select value={selectedMonthId} onChange={(event) => setSelectedMonthId(event.target.value)}>
                {months.map((month) => (
                  <option key={month.id} value={month.id}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Día
              <select value={selectedUpperDay} onChange={(event) => setSelectedUpperDay(Number(event.target.value) as 1 | 2)}>
                <option value={1}>Superior 1</option>
                <option value={2}>Superior 2</option>
              </select>
            </label>
          </div>
        ) : null}
      </div>

      {Number(painLevel) > 3 ? <div className="pain-warning">Dolor mayor a 3 registrado</div> : null}

      <div className="routine-title">
        <span>{template.monthLabel ?? "Plan tendón"}</span>
        <h2>{template.name}</h2>
      </div>

      <div className="day-progress" data-testid="day-progress">
        <div>
          <span>{completedExercises} de {totalExercises}</span>
          <strong>{remainingExercises ? `${remainingExercises} quedan` : "Completo"}</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="exercise-list">
        {template.exercises.map((item) => {
          const exercise = exerciseById.get(item.exerciseId);
          if (!exercise) return null;
          const sets = draft[exercise.id] ?? [];
          const isComplete = completedExerciseKeys.has(exerciseProgressKey(item));
          return (
            <article className={mergeClass("exercise-row", isComplete && "exercise-row-complete")} key={`${template.id}-${item.order}-${exercise.id}`}>
              <div className="exercise-summary">
                <div>
                  <span>{item.block}</span>
                  <h3>{exercise.name}</h3>
                  <p>
                    {seriesLabel(item.targetSeries ?? exercise.targetSeries)} {item.targetReps ?? exercise.targetReps ?? ""}{" "}
                    {exercise.tempo ? `· ${exercise.tempo}` : ""}
                  </p>
                </div>
                <div className="exercise-actions">
                  <button
                    type="button"
                    className={mergeClass("complete-button", isComplete && "complete-button-active")}
                    onClick={() => toggleExerciseComplete(item)}
                    title={isComplete ? "Marcar pendiente" : "Marcar hecho"}
                    aria-label={`${exercise.name} hecho`}
                    aria-pressed={isComplete}
                  >
                    <Check size={17} />
                  </button>
                  {exercise.videoUrl ? (
                    <a href={exercise.videoUrl} target="_blank" rel="noreferrer" title="Video">
                      <Play size={17} />
                    </a>
                  ) : null}
                  <button type="button" onClick={() => resetToLatest(exercise, item)} title="Restaurar último registro">
                    <RotateCcw size={17} />
                  </button>
                </div>
              </div>

              <div className="sets">
                {sets.map((set) => (
                  <div className="set-line" key={set.setNumber}>
                    <span>{set.setNumber}</span>
                    <input
                      aria-label={`${exercise.name} serie ${set.setNumber} peso`}
                      value={set.weightText}
                      onChange={(event) => updateSet(exercise.id, set.setNumber, { weightText: event.target.value })}
                      placeholder="kg"
                    />
                    <input
                      aria-label={`${exercise.name} serie ${set.setNumber} reps`}
                      value={set.reps}
                      onChange={(event) => updateSet(exercise.id, set.setNumber, { reps: event.target.value })}
                      placeholder="reps"
                    />
                    <input
                      aria-label={`${exercise.name} serie ${set.setNumber} esfuerzo`}
                      value={set.effort}
                      onChange={(event) => updateSet(exercise.id, set.setNumber, { effort: event.target.value })}
                      placeholder="RPE"
                    />
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className="save-strip">
        <button type="button" onClick={handleSave} disabled={isSaving} data-testid="save-workout">
          {isSaving ? "Guardando" : "Guardar"}
        </button>
      </div>
    </section>
  );
}

function MobilityView({
  workoutKind,
  setWorkoutKind,
  sessions,
  onToggleMobility,
}: {
  workoutKind: WorkoutKind;
  setWorkoutKind: (kind: WorkoutKind) => void;
  sessions: WorkoutSession[];
  onToggleMobility: (date: string, mobilitySlot: MobilitySlot) => Promise<void>;
}) {
  const [date, setDate] = useState(todayIso);
  const completedSlots = useMemo(
    () => new Set(sessions.filter((session) => isMobilitySession(session) && session.date === date).map((session) => session.mobilitySlot).filter(Boolean)),
    [date, sessions],
  );
  const completedCount = completedSlots.size;
  const progressPercent = Math.round((completedCount / MOBILITY_BLOCKS.length) * 100);

  return (
    <section className="flow">
      <div className="train-controls">
        <div className="segmented" aria-label="Tipo de rutina">
          <button type="button" className={workoutKind === "leg" ? "selected" : ""} onClick={() => setWorkoutKind("leg")}>
            Pierna
          </button>
          <button type="button" className={workoutKind === "upper" ? "selected" : ""} onClick={() => setWorkoutKind("upper")}>
            Superior
          </button>
          <button type="button" className={workoutKind === "mobility" ? "selected" : ""} onClick={() => setWorkoutKind("mobility")}>
            Movilidad
          </button>
        </div>

        <label>
          Fecha
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>

      <div className="routine-title">
        <span>Trabajo sentado</span>
        <h2>Movilidad diaria</h2>
      </div>

      <div className="day-progress" data-testid="mobility-progress">
        <div>
          <span>{completedCount} de {MOBILITY_BLOCKS.length}</span>
          <strong>{completedCount === MOBILITY_BLOCKS.length ? "Completo" : `${MOBILITY_BLOCKS.length - completedCount} quedan`}</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="mobility-list">
        {MOBILITY_BLOCKS.map((block) => {
          const isComplete = completedSlots.has(block.slot);
          return (
            <article className={mergeClass("exercise-row", "mobility-row", isComplete && "exercise-row-complete")} key={block.slot}>
              <div className="exercise-summary">
                <div>
                  <span>{block.duration}</span>
                  <h3>{block.label}</h3>
                  <p>{block.objective}</p>
                </div>
                <button
                  type="button"
                  className={mergeClass("mobility-check", isComplete && "complete-button-active")}
                  onClick={() => onToggleMobility(date, block.slot)}
                  aria-label={`${block.label} movilidad ${isComplete ? "hecha" : "pendiente"}`}
                  aria-pressed={isComplete}
                >
                  <Check size={17} />
                </button>
              </div>
              <ol className="mobility-exercises">
                {block.exercises.map((exercise) => (
                  <li key={exercise}>{exercise}</li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProgressView({
  templates,
  sessions,
  setEntries,
  onToggleTraining,
  onToggleMobility,
}: {
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  setEntries: SetEntry[];
  onToggleTraining: (date: string, trainingType: TrainingType) => Promise<void>;
  onToggleMobility: (date: string, mobilitySlot: MobilitySlot) => Promise<void>;
}) {
  const [calendarAnchorDate] = useState(todayIso);
  const heatmapScrollerRef = useRef<HTMLDivElement>(null);
  const mobilityScrollerRef = useRef<HTMLDivElement>(null);
  const didPositionHeatmap = useRef(false);
  const didPositionMobility = useRef(false);
  const heatmap = useMemo(() => buildTrainingHeatmap(sessions, templates, setEntries, calendarAnchorDate), [calendarAnchorDate, sessions, setEntries, templates]);
  const mobilityHeatmap = useMemo(() => buildMobilityHeatmap(sessions, calendarAnchorDate), [calendarAnchorDate, sessions]);

  useLayoutEffect(() => {
    const scroller = heatmapScrollerRef.current;
    if (!scroller || didPositionHeatmap.current) return;

    scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
    const frame = window.requestAnimationFrame(() => {
      scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
      didPositionHeatmap.current = true;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [heatmap.days.length]);

  useLayoutEffect(() => {
    const scroller = mobilityScrollerRef.current;
    if (!scroller || didPositionMobility.current) return;

    scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
    const frame = window.requestAnimationFrame(() => {
      scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
      didPositionMobility.current = true;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mobilityHeatmap.days.length]);

  return (
    <section className="flow">
      <article className="chart-panel" data-testid="training-balance-chart">
        <div className="chart-head">
          <div>
            <span>Balance</span>
            <h2>Últimos 14 días</h2>
          </div>
          <strong>{heatmap.summary.totalTrainingDays}</strong>
        </div>

        <div className="heatmap-summary" data-testid="training-balance-summary">
          <div>
            <span>Total</span>
            <strong>{heatmap.summary.totalTrainingDays}</strong>
            <small>checks</small>
          </div>
          <div>
            <span>Más entrenado</span>
            <strong>{heatmap.summary.mostTrained}</strong>
            <small>grupo</small>
          </div>
          <div>
            <span>Menos entrenado</span>
            <strong>{heatmap.summary.leastTrained}</strong>
            <small>grupo</small>
          </div>
          <div>
            <span>Desbalance</span>
            <strong>{heatmap.summary.imbalance}</strong>
            <small>14 días</small>
          </div>
        </div>

        <div ref={heatmapScrollerRef} className="heatmap-scroller" data-testid="training-heatmap" aria-label="Heatmap de entrenamientos últimos 14 días">
          <div className="heatmap-grid">
            <div className="heatmap-label heatmap-head">Grupo</div>
            {heatmap.days.map((day) => (
              <div className="heatmap-day-head" key={day.date}>
                <span>{day.weekday}</span>
                <strong>{day.label}</strong>
              </div>
            ))}
            <div className="heatmap-total-head">Últimos 14 días</div>

            {heatmap.rows.map((row) => (
              <Fragment key={row.type}>
                <div className="heatmap-label">{row.label}</div>
                {row.cells.map((cell) => (
                  <button
                    type="button"
                    key={`${row.type}-${cell.date}`}
                    className={`heatmap-cell heatmap-level-${cell.level}`}
                    onClick={() => onToggleTraining(cell.date, row.type)}
                    title={`${row.label} ${cell.date}${cell.trained ? ` · intensidad ${cell.intensity}` : ""}`}
                    aria-label={`${row.label} ${cell.date}${cell.trained ? " entrenado" : " descanso"}`}
                  >
                    {cell.trained ? <Check size={13} strokeWidth={3} /> : null}
                  </button>
                ))}
                <div className="heatmap-total">{row.totalDays}</div>
              </Fragment>
            ))}
          </div>
        </div>
      </article>

      <article className="chart-panel" data-testid="mobility-balance-chart">
        <div className="chart-head">
          <div>
            <span>Movilidad</span>
            <h2>Últimos 14 días</h2>
          </div>
          <strong>{mobilityHeatmap.summary.totalBlocks}</strong>
        </div>

        <div className="heatmap-summary" data-testid="mobility-balance-summary">
          <div>
            <span>Total</span>
            <strong>{mobilityHeatmap.summary.totalBlocks}</strong>
            <small>bloques</small>
          </div>
          <div>
            <span>Más cumplido</span>
            <strong>{mobilityHeatmap.summary.mostDone}</strong>
            <small>bloque</small>
          </div>
          <div>
            <span>Menos cumplido</span>
            <strong>{mobilityHeatmap.summary.leastDone}</strong>
            <small>bloque</small>
          </div>
          <div>
            <span>Desbalance</span>
            <strong>{mobilityHeatmap.summary.imbalance}</strong>
            <small>14 días</small>
          </div>
        </div>

        <div ref={mobilityScrollerRef} className="heatmap-scroller" data-testid="mobility-heatmap" aria-label="Heatmap de movilidad últimos 14 días">
          <div className="heatmap-grid">
            <div className="heatmap-label heatmap-head">Bloque</div>
            {mobilityHeatmap.days.map((day) => (
              <div className="heatmap-day-head" key={day.date}>
                <span>{day.weekday}</span>
                <strong>{day.label}</strong>
              </div>
            ))}
            <div className="heatmap-total-head">Últimos 14 días</div>

            {mobilityHeatmap.rows.map((row) => (
              <Fragment key={row.slot}>
                <div className="heatmap-label">{row.label}</div>
                {row.cells.map((cell) => (
                  <button
                    type="button"
                    key={`${row.slot}-${cell.date}`}
                    className={`heatmap-cell ${cell.completed ? "heatmap-level-4" : "heatmap-level-0"}`}
                    onClick={() => onToggleMobility(cell.date, row.slot)}
                    title={`${row.label} ${cell.date}`}
                    aria-label={`${row.label} ${cell.date} ${cell.completed ? "hecha" : "pendiente"}`}
                  >
                    {cell.completed ? <Check size={13} strokeWidth={3} /> : null}
                  </button>
                ))}
                <div className="heatmap-total">{row.totalDays}</div>
              </Fragment>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

function ExercisesView({
  exercises,
  sessions,
  setEntries,
}: {
  exercises: Exercise[];
  sessions: WorkoutSession[];
  setEntries: SetEntry[];
}) {
  const [query, setQuery] = useState("");
  const filtered = exercises.filter((exercise) => `${exercise.name} ${exercise.group}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="flow">
      <label className="search-field">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ejercicio" />
      </label>

      <div className="library">
        {filtered.map((exercise) => {
          const latest = getLatestAnySet(exercise.id, sessions, setEntries);
          return (
            <article key={exercise.id} className="library-row">
              <div>
                <span>{exercise.group}</span>
                <h3>{exercise.name}</h3>
                <p>{latest ? `${latest.weightText || "-"} · ${latest.reps || "-"} reps · ${latest.date}` : "Sin registros"}</p>
              </div>
              {exercise.videoUrl ? (
                <a href={exercise.videoUrl} target="_blank" rel="noreferrer" title="Video">
                  <ExternalLink size={17} />
                </a>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SettingsView({ reload, setStatus }: { reload: () => Promise<void>; setStatus: (status: string) => void }) {
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    const payload = await exportBackup();
    downloadJson(`gym-tracker-backup-${todayIso()}.json`, payload);
    setStatus("Backup exportado");
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    setIsImporting(true);
    try {
      const payload = JSON.parse(await file.text()) as BackupPayload;
      await importBackup(payload);
      await reload();
      setStatus("Backup importado");
    } catch {
      setStatus("No se pudo importar el backup");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <section className="flow">
      <article className="settings-card">
        <h2>Datos locales</h2>
        <p>Los entrenamientos viven en este dispositivo. Exportá un backup cada tanto para cubrirte si iOS limpia almacenamiento.</p>
      </article>

      <div className="settings-actions">
        <button type="button" onClick={handleExport}>
          <Download size={18} />
          Exportar backup
        </button>
        <label>
          <Upload size={18} />
          {isImporting ? "Importando" : "Importar backup"}
          <input type="file" accept="application/json" onChange={(event) => handleImport(event.target.files?.[0])} />
        </label>
      </div>

      <article className="settings-card">
        <h2>PWA</h2>
        <p>Publicada en GitHub Pages, la app no depende de que la Mac siga encendida. Instalala desde Safari para usarla como app.</p>
      </article>
    </section>
  );
}
