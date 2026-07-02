export type RehabDays = "A" | "B" | "both";

export interface RehabPlanRow {
  block: string;
  days: RehabDays;
  order: number;
  exercise: string;
  left: string;
  right: string;
  notes?: string;
  videoUrl?: string;
  tracksWeight?: boolean;
}

const BLOCK_WARMUP = "1. Entrada en calor + core (todos los días)";
const BLOCK_DAY_A = "2. Rodilla Día A (3x/semana) — Control de extensión";
const BLOCK_DAY_B = "3. Rodilla Día B (2x/semana) — Fuerza pesada";
const BLOCK_STRETCH = "4. Elongación (todos los días, post A y B)";

// Plan Rehabilitación Rodilla — Fede (30/06 → 30/07)
export const REHAB_PLAN_ROWS: RehabPlanRow[] = [
  { block: BLOCK_WARMUP, days: "both", order: 1, exercise: "Bici estática", left: "2-3 min", right: "-", notes: "Activación metabólica suave" },
  { block: BLOCK_WARMUP, days: "both", order: 2, exercise: "Movilidad articular", left: "2x6", right: "-", notes: "Según indicación del médico" },
  { block: BLOCK_WARMUP, days: "both", order: 3, exercise: "Crunch corto (rodillas flexionadas)", left: "10 reps", right: "-", notes: "Abdominales cortitos y dedos de manos cruzadas", videoUrl: "https://www.youtube.com/results?search_query=partial+crunch+form" },
  { block: BLOCK_WARMUP, days: "both", order: 4, exercise: "Retroversión pélvica apretando pelota", left: "10 reps", right: "-", notes: "Envolver y presionar la pelota con la pelvis", videoUrl: "https://www.youtube.com/results?search_query=pelvic+tilt+ball+squeeze" },
  { block: BLOCK_WARMUP, days: "both", order: 5, exercise: "Crunch con piernas extendidas", left: "10 reps", right: "-", notes: "Abdominales cortitos y dedos de manos cruzadas", videoUrl: "https://www.youtube.com/results?search_query=straight+leg+crunch" },
  { block: BLOCK_WARMUP, days: "both", order: 6, exercise: "Abducción bilateral con banda parado", left: "3x6 (ambas piernas)", right: "-", notes: "Banda bajo las rodillas, abrir las dos al mismo tiempo", videoUrl: "https://www.youtube.com/results?search_query=banded+hip+abduction" },
  { block: BLOCK_WARMUP, days: "both", order: 7, exercise: "Presión de rodilla vs pelota en pared (arrodillado, cara externa)", left: "3x6", right: "3x6", notes: "Isométrico: arrodillado con una pierna, empujar con la otra SIN extender", videoUrl: "https://www.youtube.com/results?search_query=isometric+hip+abduction+ball+wall+kneeling" },
  { block: BLOCK_WARMUP, days: "both", order: 8, exercise: "Almeja (clamshell)", left: "3x6", right: "3x6", notes: "Acostado de lado, apertura de glúteo", videoUrl: "https://www.youtube.com/results?search_query=clamshell+exercise" },
  { block: BLOCK_WARMUP, days: "both", order: 9, exercise: "Elevación lateral de pierna en step", left: "3x6", right: "3x6", notes: "Agarrado de baranda, pierna colgando, elevar de costado (parte externa). Recordar bajar cadera, subir cadera y despues subir pierna, bajar pierna y recien ahi bajar cadera.", videoUrl: "https://www.youtube.com/results?search_query=standing+hip+abduction+on+step" },
  { block: BLOCK_WARMUP, days: "both", order: 10, exercise: "Foam roller en TFL", left: "1 min", right: "1 min", notes: "Pasar rodillo por tensor de la fascia lata", videoUrl: "https://www.youtube.com/results?search_query=TFL+foam+rolling" },
  { block: BLOCK_WARMUP, days: "both", order: 11, exercise: "Elongacion fascia lata", left: '3x10"', right: '3x10"' },
  { block: BLOCK_DAY_A, days: "A", order: 1, exercise: "TKE bilateral con banda (posición cristo)", left: "3x6 (ambas piernas)", right: "-", notes: "Banda desde adelante que tira las rodillas a flexión. Resistir: extender y mantener las rodillas perpendiculares al piso sin que se flexionen. Tronco adelante, brazos se elevan al extender", videoUrl: "https://www.youtube.com/results?search_query=double+leg+terminal+knee+extension+resistance+band" },
  { block: BLOCK_DAY_A, days: "A", order: 2, exercise: "TKE unilateral con tronco adelante", left: "3x6", right: "1x6", notes: "Banda detrás de la rodilla tirando desde el frente. Extender la rodilla hacia atrás contra la resistencia. Extender tronco hacia delante cuando extiendo pierna", videoUrl: "https://www.youtube.com/results?search_query=single+leg+terminal+knee+extension+band" },
  { block: BLOCK_DAY_A, days: "A", order: 3, exercise: "Extensión con pelota DETRÁS de la rodilla", left: "3x6", right: "1x6", notes: "Pelota entre pared y parte posterior de la rodilla. Desde estocada, al subir empujar la rodilla hacia atrás", videoUrl: "https://www.youtube.com/results?search_query=terminal+knee+extension+ball+wall" },
  { block: BLOCK_DAY_A, days: "A", order: 4, exercise: "Presión con pelota DELANTE de la rodilla", left: "3x6", right: "1x6", notes: "Igual al anterior pero pelota adelante, empujar hacia la pared. Inclinar tronco sobre pelota.", videoUrl: "https://www.youtube.com/results?search_query=isometric+knee+extension+ball+wall" },
  { block: BLOCK_DAY_A, days: "A", order: 5, exercise: "Presión INTERNA de rodilla vs pelota", left: "3x6", right: "1x6", notes: "De pie (casi sentadilla), presionar con costado interno de la rodilla llevándola atrás. Tronco casi arriba de la pelota", videoUrl: "https://www.youtube.com/results?search_query=isometric+knee+adduction+ball+wall" },
  { block: BLOCK_DAY_A, days: "A", order: 6, exercise: "Presión EXTERNA de rodilla vs pelota", left: "3x6", right: "1x6", notes: "Ídem anterior con la cara externa de la rodilla. Diferencia con el de entrada en calor: acá de pie y con extensión activa", videoUrl: "https://www.youtube.com/results?search_query=isometric+knee+abduction+ball+wall+standing" },
  { block: BLOCK_DAY_B, days: "B", order: 1, exercise: "Camilla de cuádriceps + rotación externa + pelota entre pies", left: "6x12", right: "3x12", notes: "Apretar la pelota SOLO con la rodilla que trabaja. Extensión con rotación externa de tibia/pie apuntando 45gr hacia afuera", videoUrl: "https://www.youtube.com/results?search_query=leg+extension+tibial+external+rotation", tracksWeight: true },
  { block: BLOCK_DAY_B, days: "B", order: 2, exercise: "Sentadilla isométrica 45° en step inclinado + pelota entre rodillas", left: "6x12", right: "3x12", notes: "Torso levemente inclinado, mantener pelota cerrando aductor, apretar con la pierna que trabaja.", videoUrl: "https://www.youtube.com/results?search_query=spanish+squat+ball+squeeze" },
  { block: BLOCK_DAY_B, days: "B", order: 3, exercise: "Sentadilla lateral con pierna elevada en step", left: "6x12", right: "3x12", notes: "De costado, pie sobre la caja apuntando arriba. La pierna elevada estira aductor/isquio, la de abajo hace mini sentadilla. La lesionada va ARRIBA 6 series. La pierna de abajo apunta para afuera, mas de 90 grados contra la caja, no en la misma direccion que yo veo hacia el frente si no que mas rotado hacia afuera", videoUrl: "https://www.youtube.com/results?search_query=cossack+squat" },
  { block: BLOCK_DAY_B, days: "B", order: 4, exercise: "GYM: Camilla de cuádriceps excéntrica con tempos", left: "3x6 uniforme + 2x5 oscilado (con frenos) + 1x4 rápido", right: "3x6 uniforme + 2x5 oscilado (con frenos) + 1x4 rápido", notes: "Con rotación externa. Progresión de velocidad dentro de la sesión", videoUrl: "https://www.youtube.com/results?search_query=eccentric+leg+extension+tendinopathy", tracksWeight: true },
  { block: BLOCK_DAY_B, days: "B", order: 5, exercise: "GYM: Prensa excéntrica (2 arriba / 1 abajo)", left: "3x6 uniforme + 2x5 oscilado + 1x4 rápido", right: "3x6 uniforme + 2x5 oscilado + 1x4 rápido", notes: "Subir con DOS piernas, bajar controlado con UNA (excéntrico)", videoUrl: "https://www.youtube.com/results?search_query=eccentric+leg+press+two+up+one+down", tracksWeight: true },
  { block: BLOCK_STRETCH, days: "both", order: 1, exercise: "Gemelos", left: "3x10 seg", right: "3x10 seg", videoUrl: "https://www.youtube.com/results?search_query=standing+calf+stretch+wall" },
  { block: BLOCK_STRETCH, days: "both", order: 2, exercise: "Glúteo sentado", left: "3x10 seg", right: "3x10 seg", notes: "Trayendo rodilla al pecho cruzado", videoUrl: "https://www.youtube.com/results?search_query=seated+glute+stretch+figure+4" },
  { block: BLOCK_STRETCH, days: "both", order: 3, exercise: "Isquios mano cruzada", left: "3x10 seg", right: "3x10 seg", videoUrl: "https://www.youtube.com/results?search_query=standing+hamstring+stretch+crossed+legs" },
  { block: BLOCK_STRETCH, days: "both", order: 4, exercise: "Cuádriceps con pie en baranda", left: "3x10 seg", right: "3x10 seg", videoUrl: "https://www.youtube.com/results?search_query=standing+quad+stretch+foot+elevated+couch+stretch" },
  { block: BLOCK_STRETCH, days: "both", order: 5, exercise: "Aductores", left: "3x10 seg", right: "3x10 seg", videoUrl: "https://www.youtube.com/results?search_query=standing+adductor+stretch" },
  { block: BLOCK_STRETCH, days: "both", order: 6, exercise: "Cuádriceps girando tronco hacia adelante", left: "3x10 seg", right: "3x10 seg", notes: "Variante que sesga TFL/recto femoral (coherente con tu TFL acortado)", videoUrl: "https://www.youtube.com/results?search_query=standing+quad+stretch+forward+trunk+lean" },
];

export interface ExcelPlanRow {
  monthLabel: string;
  day: number;
  order: number;
  exercise: string;
  block: string;
  series: number;
  reps: string;
  weight: string;
  effort?: string;
  videoUrl?: string;
}

export const UPPER_MONTH_ROWS: ExcelPlanRow[] = [
  { monthLabel: "Mayo 2026", day: 1, order: 1, exercise: "Sit ups a 1 brazo", block: "Zona Media (Superserie)", series: 3, reps: "10/10", weight: "" },
  { monthLabel: "Mayo 2026", day: 1, order: 2, exercise: "Russian Twist", block: "Zona Media (Superserie)", series: 3, reps: "10/10", weight: "" },
  { monthLabel: "Mayo 2026", day: 1, order: 3, exercise: "Press plano con barra", block: "Bloque 1", series: 4, reps: "8-5-3-1", weight: "27.5-30-32.5/35", effort: "9" },
  { monthLabel: "Mayo 2026", day: 1, order: 4, exercise: "Press hombro con mancuernas", block: "Bloque 2 (Superserie)", series: 3, reps: "6/8", weight: "20 c/l", effort: "9" },
  { monthLabel: "Mayo 2026", day: 1, order: 5, exercise: "Remo en banco inclinado", block: "Bloque 2 (Superserie)", series: 3, reps: "12/15", weight: "22.5 c/l", effort: "9" },
  { monthLabel: "Mayo 2026", day: 1, order: 6, exercise: "Remo al mentón con barra", block: "Bloque 3 (Superserie)", series: 3, reps: "10/12", weight: "7.5 cada lado", effort: "9" },
  { monthLabel: "Mayo 2026", day: 1, order: 7, exercise: "Tríceps cross body con banda", block: "Bloque 3 (Superserie)", series: 3, reps: "Fallo", weight: "banda amarilla finita", effort: "10" },
  { monthLabel: "Mayo 2026", day: 1, order: 8, exercise: "Curl de bíceps con polea prono", block: "Bloque 3 (Superserie)", series: 3, reps: "12/15", weight: "5 barra chica cada lado", effort: "9" },
  { monthLabel: "Mayo 2026", day: 2, order: 1, exercise: "Bicho muerto con banda", block: "Zona Media (Superserie)", series: 3, reps: "10/10", weight: "15" },
  { monthLabel: "Mayo 2026", day: 2, order: 2, exercise: "Oblicuos de pie con mancuernas", block: "Zona Media (Superserie)", series: 3, reps: "12/12", weight: "20" },
  { monthLabel: "Mayo 2026", day: 2, order: 3, exercise: "Remo T con landmine", block: "Bloque 1", series: 4, reps: "6/8", weight: "50", effort: "9" },
  { monthLabel: "Mayo 2026", day: 2, order: 4, exercise: "Press inclinado con mancuernas", block: "Bloque 2 (Superserie)", series: 3, reps: "8/12", weight: "25", effort: "9" },
  { monthLabel: "Mayo 2026", day: 2, order: 5, exercise: "Dominadas prono asistidas con banda", block: "Bloque 2 (Superserie)", series: 3, reps: "Fallo", weight: "", effort: "10" },
  { monthLabel: "Mayo 2026", day: 2, order: 6, exercise: "Flexiones con déficit", block: "Bloque 3 (Superserie)", series: 3, reps: "Fallo", weight: "", effort: "10" },
  { monthLabel: "Mayo 2026", day: 2, order: 7, exercise: "Bíceps y tríceps TRX", block: "Bloque 3 (Superserie)", series: 3, reps: "Fallo", weight: "35 y 45", effort: "10" },
  { monthLabel: "Mayo 2026", day: 2, order: 8, exercise: "Vuelos combinados", block: "Bloque 3 (Superserie)", series: 3, reps: "12", weight: "7,5", effort: "9" },
  { monthLabel: "Junio 2026", day: 1, order: 1, exercise: "Hollow en GHD", block: "Abs", series: 3, reps: "12", weight: "" },
  { monthLabel: "Junio 2026", day: 1, order: 2, exercise: "Rotaciones en plancha", block: "Abs", series: 3, reps: "6/6", weight: "" },
  { monthLabel: "Junio 2026", day: 1, order: 3, exercise: "Press inclinado con barra", block: "Bloque 1", series: 3, reps: "7/10", weight: "12.5/20 (22.5 max)" },
  { monthLabel: "Junio 2026", day: 1, order: 4, exercise: "Remo alto a 1 brazo con banda", block: "Bloque 1", series: 3, reps: "15/15", weight: "Banda roja" },
  { monthLabel: "Junio 2026", day: 1, order: 5, exercise: "Pull over con mancuerna", block: "Bloque 2", series: 3, reps: "12", weight: "27.5" },
  { monthLabel: "Junio 2026", day: 1, order: 6, exercise: "Remo unilateral con mancuerna 45°", block: "Bloque 2", series: 3, reps: "8/8", weight: "27.5" },
  { monthLabel: "Junio 2026", day: 1, order: 7, exercise: "6 posiciones de hombros", block: "Bloque 3", series: 3, reps: "Fallo", weight: "5" },
  { monthLabel: "Junio 2026", day: 1, order: 8, exercise: "Extensión de Tríceps Tras Nuca en Polea Baja", block: "Bloque 3", series: 3, reps: "15", weight: "40" },
  { monthLabel: "Junio 2026", day: 1, order: 9, exercise: "Curl Concentrado con Mancuernas", block: "Bloque 3", series: 3, reps: "12/12", weight: "12.5" },
  { monthLabel: "Junio 2026", day: 2, order: 1, exercise: "Bicho muerto doble", block: "Abs", series: 2, reps: "12", weight: "" },
  { monthLabel: "Junio 2026", day: 2, order: 2, exercise: "Rodillas al pecho colgado", block: "Abs", series: 3, reps: "15", weight: "" },
  { monthLabel: "Junio 2026", day: 2, order: 3, exercise: "Dominadas agarre prono", block: "Bloque 1", series: 3, reps: "5/7", weight: "" },
  { monthLabel: "Junio 2026", day: 2, order: 4, exercise: "Z press", block: "Bloque 1", series: 3, reps: "8/12", weight: "15 c/lado" },
  { monthLabel: "Junio 2026", day: 2, order: 5, exercise: "Fondos en Barra Paralelas", block: "Bloque 2", series: 3, reps: "Fallo", weight: "" },
  { monthLabel: "Junio 2026", day: 2, order: 6, exercise: "Remo TRX", block: "Bloque 2", series: 3, reps: "Fallo", weight: "" },
  { monthLabel: "Junio 2026", day: 2, order: 7, exercise: "Vuelos Frontales Supinos con Barra", block: "Bloque 3", series: 3, reps: "12", weight: "5 c/lado" },
  { monthLabel: "Junio 2026", day: 2, order: 8, exercise: "Curl martillo en banco inclinado", block: "Bloque 3", series: 3, reps: "8/12", weight: "10 c/ lado" },
  { monthLabel: "Junio 2026", day: 2, order: 9, exercise: "Press francés barra w", block: "Bloque 3", series: 3, reps: "8/12", weight: "7.5 c/lado" },
  { monthLabel: "Julio 2026", day: 1, order: 1, exercise: "Hollow pull over", block: "1. Zona Media (Superserie)", series: 3, reps: "12", weight: "" },
  { monthLabel: "Julio 2026", day: 1, order: 2, exercise: "Twist sentado", block: "1. Zona Media (Superserie)", series: 3, reps: "20", weight: "" },
  { monthLabel: "Julio 2026", day: 1, order: 3, exercise: "Press plano con barra", block: "Bloque 1 (Superserie)", series: 3, reps: "7/10", weight: "25/27.5", effort: "9" },
  { monthLabel: "Julio 2026", day: 1, order: 4, exercise: "Dominadas prono asistidas con banda", block: "Bloque 1 (Superserie)", series: 3, reps: "7/10", weight: "", effort: "9" },
  { monthLabel: "Julio 2026", day: 1, order: 5, exercise: "Apertura plana", block: "Bloque 2 (Superserie)", series: 3, reps: "12/15", weight: "", effort: "9" },
  { monthLabel: "Julio 2026", day: 1, order: 6, exercise: "Curl de bíceps barra W", block: "Bloque 2 (Superserie)", series: 3, reps: "8/12", weight: "", effort: "9" },
  { monthLabel: "Julio 2026", day: 1, order: 7, exercise: "Vuelos frontales con mancuernas", block: "Bloque 3 (Superserie)", series: 3, reps: "12/12", weight: "", effort: "10" },
  { monthLabel: "Julio 2026", day: 1, order: 8, exercise: "Facepull arrodillado con soga", block: "Bloque 3 (Superserie)", series: 2, reps: "20", weight: "", effort: "10" },
  { monthLabel: "Julio 2026", day: 2, order: 1, exercise: "See saw plank", block: "1. Zona Media (Superserie)", series: 3, reps: "15", weight: "" },
  { monthLabel: "Julio 2026", day: 2, order: 2, exercise: "Plancha lateral c/ vuelo posterior", block: "1. Zona Media (Superserie)", series: 3, reps: "6/6", weight: "" },
  { monthLabel: "Julio 2026", day: 2, order: 3, exercise: "Remo Pendlay", block: "Bloque 1 (Superserie)", series: 3, reps: "5/7", weight: "12.5kg c/ lado.", effort: "9" },
  { monthLabel: "Julio 2026", day: 2, order: 4, exercise: "Press cerrado con mancuernas", block: "Bloque 1 (Superserie)", series: 3, reps: "7/10", weight: "20kg", effort: "9" },
  { monthLabel: "Julio 2026", day: 2, order: 5, exercise: "Pull over en polea alta con barra", block: "Bloque 2 (Superserie)", series: 3, reps: "12/15", weight: "45kg", effort: "9" },
  { monthLabel: "Julio 2026", day: 2, order: 6, exercise: "Press hombro con mancuernas", block: "Bloque 2 (Superserie)", series: 3, reps: "10/12", weight: "17.5kg", effort: "9" },
  { monthLabel: "Julio 2026", day: 2, order: 7, exercise: "Curl de bíceps martillo en banco inclinado", block: "Bloque 4 (Superserie)", series: 3, reps: "8/12", weight: "10kg", effort: "10" },
  { monthLabel: "Julio 2026", day: 2, order: 8, exercise: "Extensión de tríceps con soga en polea", block: "Bloque 4 (Superserie)", series: 3, reps: "18-25", weight: "20kg", effort: "10" },
  { monthLabel: "Agosto 2026", day: 1, order: 1, exercise: "Remo renegado", block: "1. Zona Media (Superserie)", series: 3, reps: "5/5", weight: "" },
  { monthLabel: "Agosto 2026", day: 1, order: 2, exercise: "Press Pallof con Rotación", block: "1. Zona Media (Superserie)", series: 3, reps: "10/10", weight: "" },
  { monthLabel: "Agosto 2026", day: 1, order: 3, exercise: "Press Plano con Barra", block: "Bloque 1 (Superserie)", series: 4, reps: "6-4-4-2", weight: "25/27,5/30" },
  { monthLabel: "Agosto 2026", day: 1, order: 4, exercise: "Remo unilateral con mancuerna 45°", block: "Bloque 1 (Superserie)", series: 3, reps: "8/8", weight: "25" },
  { monthLabel: "Agosto 2026", day: 1, order: 5, exercise: "Fondos en Barra Paralelas", block: "Bloque 2 (Superserie)", series: 3, reps: "Fallo", weight: "10" },
  { monthLabel: "Agosto 2026", day: 1, order: 6, exercise: "Remo alto TRX", block: "Bloque 2 (Superserie)", series: 3, reps: "12/15", weight: "10" },
  { monthLabel: "Agosto 2026", day: 1, order: 7, exercise: "6 posiciones de hombros", block: "Bloque 3 (Superserie)", series: 2, reps: "Fallo", weight: "7,5" },
  { monthLabel: "Agosto 2026", day: 1, order: 8, exercise: "Curl de bíceps en Polea Baja", block: "Bloque 3 (Superserie)", series: 2, reps: "3 drop", weight: "30" },
  { monthLabel: "Agosto 2026", day: 2, order: 1, exercise: "Ruedita", block: "1. Zona Media (Superserie)", series: 2, reps: "12", weight: "" },
  { monthLabel: "Agosto 2026", day: 2, order: 2, exercise: "Plancha lateral c/ remo", block: "1. Zona Media (Superserie)", series: 2, reps: "8/8", weight: "" },
  { monthLabel: "Agosto 2026", day: 2, order: 3, exercise: "Remo Inclinado Agarre Prono con Barra", block: "Bloque 1 (Superserie)", series: 4, reps: "6", weight: "15 CL barr grand supino" },
  { monthLabel: "Agosto 2026", day: 2, order: 4, exercise: "Press Inclinado con Mancuernas", block: "Bloque 1 (Superserie)", series: 3, reps: "8/12", weight: "22.5" },
  { monthLabel: "Agosto 2026", day: 2, order: 5, exercise: "Dominadas supinas", block: "Bloque 2 (Superserie)", series: 3, reps: "Fallo", weight: "10" },
  { monthLabel: "Agosto 2026", day: 2, order: 6, exercise: "Vuelo frontal polea baja", block: "Bloque 2 (Superserie)", series: 2, reps: "2 drop", weight: "10" },
  { monthLabel: "Agosto 2026", day: 2, order: 7, exercise: "Bíceps TRX", block: "Bloque 3 (Superserie)", series: 2, reps: "3 rest", weight: "10" },
  { monthLabel: "Agosto 2026", day: 2, order: 8, exercise: "Tríceps cross body con banda", block: "Bloque 3 (Superserie)", series: 2, reps: "3 rest", weight: "10" },
];
