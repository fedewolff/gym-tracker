import type { MobilitySlot, WorkoutSession } from "../types";

export const MOBILITY_TEMPLATE_ID = "template-mobility";

export const MOBILITY_SLOT_LABELS: Record<MobilitySlot, string> = {
  morning: "Mañana",
  midday: "Mediodía",
  siesta: "Pre entrenar",
  night: "Noche",
};

export const MOBILITY_SLOTS: MobilitySlot[] = ["morning", "midday", "siesta", "night"];

export interface MobilityBlock {
  slot: MobilitySlot;
  label: string;
  duration: string;
  objective: string;
  exercises: string[];
}

export const MOBILITY_BLOCKS: MobilityBlock[] = [
  {
    slot: "morning",
    label: MOBILITY_SLOT_LABELS.morning,
    duration: "8 a 10 min",
    objective: "Abrir cadera, despertar cuádriceps y empezar el día sin rodilla apagada.",
    exercises: [
      "90/90 switches de cadera · 1x6 por lado, lento, con manos apoyadas si hace falta",
      "Adductor rockback · 1x8 por lado, abrir cadera/aductores sin forzar rodilla",
      "Movilidad de tobillo contra pared · 1x10 por lado, talón siempre apoyado",
      "Contracción de cuádriceps con pierna estirada · 2x10, apretar 3s",
      "Elevación de pierna recta · 2x8 por pierna, cuádriceps activo y rodilla bloqueada",
      "TKE con banda liviana · 2x15 por pierna, apretar 1-2s al final",
      "Balance a una pierna · 2x20s por pierna, rodilla apenas flexionada y alineada",
    ],
  },
  {
    slot: "midday",
    label: MOBILITY_SLOT_LABELS.midday,
    duration: "4 a 6 min",
    objective: "Cortar las horas de computadora y evitar que rodilla/cadera se apaguen.",
    exercises: [
      "Caminar · 2 min",
      "Apertura de cadera parado · 1x6 por lado",
      "TKE liviano o contracción de cuádriceps de pie · 1-2x15 por pierna",
      "Balance a una pierna · 1x20s por pierna",
    ],
  },
  {
    slot: "siesta",
    label: MOBILITY_SLOT_LABELS.siesta,
    duration: "10 a 12 min",
    objective: "Llegar al entrenamiento con cuádriceps prendido y cadera disponible.",
    exercises: [
      "90/90 switches o apertura de cadera parado · 1x6 por lado",
      "Adductor rockback · 1x6 por lado",
      "Cinto ruso / Spanish squat isométrico · 3x20-30s, esfuerzo 6-7/10, no al fallo",
      "TKE con banda o polea · 2x15 por pierna, apretar fuerte arriba",
      "Extensión de rodilla con banda/polea · 2x10-12 por pierna, liviano-moderado y controlado",
      "Balance a una pierna · 2x20s",
      "Progresivos suaves si vas a correr/fútbol · 2x20m al 50-60%",
    ],
  },
  {
    slot: "night",
    label: MOBILITY_SLOT_LABELS.night,
    duration: "4 a 6 min",
    objective: "Descargar, bajar rigidez y llegar mejor al día siguiente.",
    exercises: [
      "Flexo-extensión sentado · 1x15-20",
      "90/90 estático suave · 30s por lado",
      "Figura 4 acostado · 30-45s por lado",
      "Piernas elevadas con rodillas flexionadas · 2 min",
    ],
  },
];

const WEEKDAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

export interface MobilityHeatmapDay {
  date: string;
  label: string;
  weekday: string;
}

export interface MobilityHeatmapCell {
  date: string;
  completed: boolean;
}

export interface MobilityHeatmapRow {
  slot: MobilitySlot;
  label: string;
  cells: MobilityHeatmapCell[];
  totalDays: number;
}

export interface MobilityHeatmap {
  days: MobilityHeatmapDay[];
  rows: MobilityHeatmapRow[];
  summary: {
    totalBlocks: number;
    mostDone: string;
    leastDone: string;
    imbalance: string;
  };
}

function dateFromIso(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

function isoFromDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDate(date: Date, deltaDays: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + deltaDays);
  return next;
}

function formatPointLabel(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

export function isMobilitySession(session: WorkoutSession): boolean {
  return session.kind === "mobility" || session.templateId === MOBILITY_TEMPLATE_ID;
}

export function buildMobilityHeatmap(
  sessions: WorkoutSession[],
  anchorDate: string,
  windowDays = 14,
): MobilityHeatmap {
  const anchor = dateFromIso(anchorDate);
  const days = Array.from({ length: windowDays }, (_, index) => {
    const date = shiftDate(anchor, index - windowDays + 1);
    return {
      date: isoFromDate(date),
      label: formatPointLabel(date),
      weekday: WEEKDAY_LABELS[date.getDay()],
    };
  });
  const daySet = new Set(days.map((day) => day.date));
  const completed = new Set<string>();

  for (const session of sessions) {
    if (!isMobilitySession(session) || !session.mobilitySlot || !daySet.has(session.date)) continue;
    completed.add(`${session.mobilitySlot}:${session.date}`);
  }

  const rows = MOBILITY_SLOTS.map((slot) => {
    const cells = days.map((day) => ({
      date: day.date,
      completed: completed.has(`${slot}:${day.date}`),
    }));

    return {
      slot,
      label: MOBILITY_SLOT_LABELS[slot],
      cells,
      totalDays: cells.filter((cell) => cell.completed).length,
    };
  });

  const totals = rows.map((row) => row.totalDays);
  const maxTotal = Math.max(...totals);
  const minTotal = Math.min(...totals);

  return {
    days,
    rows,
    summary: {
      totalBlocks: totals.reduce((sum, count) => sum + count, 0),
      mostDone: rows.filter((row) => row.totalDays === maxTotal).map((row) => row.label).join(", "),
      leastDone: rows.filter((row) => row.totalDays === minTotal).map((row) => row.label).join(", "),
      imbalance: maxTotal - minTotal >= 2 ? `${maxTotal - minTotal} días de diferencia` : "Balanceado",
    },
  };
}
