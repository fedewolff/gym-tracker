import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Database,
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
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAvailableMonths, getDefaultMonthId } from "./data/seed";
import { db, ensureSeeded, exportBackup, importBackup } from "./lib/db";
import { uid } from "./lib/ids";
import { calculateProgressPoints, getLatestAnySet, getLatestSetsByNumber } from "./lib/progress";
import { extractWeightNumber, formatWeight } from "./lib/weights";
import type { BackupPayload, Exercise, SetEntry, WorkoutSession, WorkoutTemplate, WorkoutTemplateExercise } from "./types";

type View = "train" | "progress" | "exercises" | "settings";
type WorkoutKind = "leg" | "upper";

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

export default function App() {
  const [view, setView] = useState<View>("train");
  const [workoutKind, setWorkoutKind] = useState<WorkoutKind>("leg");
  const [selectedMonthId, setSelectedMonthId] = useState("");
  const [selectedUpperDay, setSelectedUpperDay] = useState<1 | 2>(1);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
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
    setSelectedExerciseId((current) => current || sortedExercises[0]?.id || "");
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
  const selectedExercise = exerciseById.get(selectedExerciseId) ?? data.exercises[0];

  const saveWorkout = async (template: WorkoutTemplate, date: string, painLevel: number | undefined, draft: WorkoutDraft, notes: string) => {
    const sessionId = uid("session");
    const session: WorkoutSession = {
      id: sessionId,
      templateId: template.id,
      date,
      painLevel,
      notes,
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
        {view === "train" && selectedTemplate ? (
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
        {view === "progress" && selectedExercise ? (
          <ProgressView
            exercises={data.exercises}
            selectedExercise={selectedExercise}
            selectedExerciseId={selectedExerciseId}
            setSelectedExerciseId={setSelectedExerciseId}
            sessions={data.sessions}
            setEntries={data.setEntries}
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
  onSave: (template: WorkoutTemplate, date: string, painLevel: number | undefined, draft: WorkoutDraft, notes: string) => Promise<void>;
}) {
  const [date, setDate] = useState(todayIso);
  const [painLevel, setPainLevel] = useState("0");
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState<WorkoutDraft>({});
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
    await onSave(template, date, Number(painLevel), draft, notes);
    setIsSaving(false);
  };

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

      <div className="exercise-list">
        {template.exercises.map((item) => {
          const exercise = exerciseById.get(item.exerciseId);
          if (!exercise) return null;
          const sets = draft[exercise.id] ?? [];
          return (
            <article className="exercise-row" key={`${template.id}-${exercise.id}`}>
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
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas" rows={2} />
        <button type="button" onClick={handleSave} disabled={isSaving} data-testid="save-workout">
          {isSaving ? "Guardando" : "Guardar"}
        </button>
      </div>
    </section>
  );
}

function ProgressView({
  exercises,
  selectedExercise,
  selectedExerciseId,
  setSelectedExerciseId,
  sessions,
  setEntries,
}: {
  exercises: Exercise[];
  selectedExercise: Exercise;
  selectedExerciseId: string;
  setSelectedExerciseId: (id: string) => void;
  sessions: WorkoutSession[];
  setEntries: SetEntry[];
}) {
  const points = useMemo(() => calculateProgressPoints(selectedExercise.id, sessions, setEntries), [selectedExercise.id, sessions, setEntries]);
  const latest = points[points.length - 1];

  return (
    <section className="flow">
      <label className="select-field">
        Ejercicio
        <span>
          <select value={selectedExerciseId} onChange={(event) => setSelectedExerciseId(event.target.value)}>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </span>
      </label>

      <article className="chart-panel" data-testid="progress-chart">
        <div className="chart-head">
          <div>
            <span>{selectedExercise.group}</span>
            <h2>{selectedExercise.name}</h2>
          </div>
          <strong data-testid="progress-metric">{latest ? formatWeight(latest.bestWeight) : "-"}</strong>
        </div>

        {points.length ? (
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={16} />
                <YAxis tick={{ fontSize: 11 }} width={36} domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0].payload as (typeof points)[number];
                    return (
                      <div className="tooltip">
                        <b>{point.date}</b>
                        <span>{point.weightLabel}</span>
                        <span>{point.repsLabel} reps</span>
                      </div>
                    );
                  }}
                />
                <Line dataKey="bestWeight" type="monotone" stroke="#111827" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty">Sin registros numéricos todavía</div>
        )}
      </article>

      <div className="history">
        {points.slice().reverse().map((point) => (
          <div key={point.sessionId}>
            <span>{point.date}</span>
            <b>{point.weightLabel}</b>
            <small>{point.repsLabel} reps</small>
          </div>
        ))}
      </div>
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
