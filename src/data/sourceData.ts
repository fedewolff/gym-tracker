export type RehabDay = "A" | "B" | "both";

export interface RehabPlanRow {
  block: string;
  day: RehabDay;
  order: number;
  exercise: string;
  left: string;
  right: string;
  notes?: string;
  videoUrl?: string;
  tracksWeight?: boolean;
}

const BLOCK_WARMUP = "1. Entrada en calor";
const BLOCK_MAIN = "2. Día de pierna";
const BLOCK_RUN = "2. Trote";
const BLOCK_STRETCH = "3. Elongación";

// Plan Rehabilitación Rodilla — Fede
// Día A = pierna (fuerza/control); Día B = trote. Calentamiento y elongación son compartidos.
export const REHAB_PLAN_ROWS: RehabPlanRow[] = [
  { block: BLOCK_WARMUP, day: "both", order: 1, exercise: "Bici estática", left: "3 min", right: "-", notes: "Activación metabólica suave" },
  { block: BLOCK_WARMUP, day: "both", order: 2, exercise: "Movilidad articular", left: "2x6", right: "-", notes: "Post bici, según indicación del médico" },
  { block: BLOCK_MAIN, day: "A", order: 1, exercise: "Abdominales con pierna extendida", left: "10 reps", right: "-", notes: "Crunch corto, abdominales cortitos con los dedos de las manos cruzados", videoUrl: "https://www.youtube.com/results?search_query=straight+leg+crunch" },
  { block: BLOCK_MAIN, day: "A", order: 2, exercise: "Isométrico de pie en cruz", left: "10 reps", right: "-", notes: "Parado con las piernas abiertas, un brazo y el otro estirados formando una cruz, trabar el abdomen" },
  { block: BLOCK_MAIN, day: "A", order: 3, exercise: "Equilibrio en la pared", left: "10 reps", right: "-", notes: "Agarrado a la pared, levantar una pierna y mantener 3\", cambiar a la otra. No inclinar el tronco hacia atrás", videoUrl: "https://www.youtube.com/results?search_query=single+leg+balance+wall" },
  { block: BLOCK_MAIN, day: "A", order: 4, exercise: "Paso lateral con banda", left: "3x6", right: "-", notes: "Banda por debajo de la rodilla, abrir el pie y dar un paso lateral", videoUrl: "https://www.youtube.com/results?search_query=banded+lateral+walk" },
  { block: BLOCK_MAIN, day: "A", order: 5, exercise: "Presión externa de rodilla vs pelota (media estocada)", left: "3x6", right: "-", notes: "Empujar la pelota contra la pared con la cara externa de la rodilla, haciendo media estocada", videoUrl: "https://www.youtube.com/results?search_query=isometric+knee+abduction+ball+wall+standing" },
  { block: BLOCK_MAIN, day: "A", order: 6, exercise: "Clamshell con elevación de cadera", left: "3x6", right: "-", notes: "Como el clamshell pero primero levanto la cadera y, ya arriba, abro la pierna", videoUrl: "https://www.youtube.com/results?search_query=clamshell+exercise" },
  { block: BLOCK_MAIN, day: "A", order: 7, exercise: "TKE bilateral con banda a 45°", left: "3x6", right: "-", notes: "A 45°, banda por atrás en las dos piernas; extender la rodilla contra la banda (la banda tira a flexión)", videoUrl: "https://www.youtube.com/results?search_query=double+leg+terminal+knee+extension+resistance+band" },
  { block: BLOCK_MAIN, day: "A", order: 8, exercise: "TKE unilateral con banda a 45°", left: "3x6", right: "-", notes: "Igual pero con una sola pierna, la otra levantada sin apoyar. Tirar el tronco hacia adelante al extender para no irse hacia atrás", videoUrl: "https://www.youtube.com/results?search_query=single+leg+terminal+knee+extension+band" },
  { block: BLOCK_MAIN, day: "A", order: 9, exercise: "Extensión con pelota detrás de la rodilla", left: "3x6", right: "-", notes: "Pelota entre la pared y detrás de la rodilla; empujar el talón bien abajo, apretar, levantar la otra rodilla y los brazos, mantener y bajar. El pie que no aprieta va bien adelante antes de subir", videoUrl: "https://www.youtube.com/results?search_query=terminal+knee+extension+ball+wall" },
  { block: BLOCK_MAIN, day: "A", order: 10, exercise: "Step-up al cajón con barra", left: "3x6", right: "-", notes: "Subir al cajón con un pie mientras el otro extiende a 45°, con barra con peso arriba de la cabeza. Trabar el abdomen", videoUrl: "https://www.youtube.com/results?search_query=overhead+barbell+step+up", tracksWeight: true },
  { block: BLOCK_MAIN, day: "A", order: 11, exercise: "Estocada en TRX con elevación de pierna", left: "3x6", right: "-", notes: "A 90° respecto del piso, levantar la pierna con impulso de la espalda hasta arriba", videoUrl: "https://www.youtube.com/results?search_query=trx+lunge" },
  { block: BLOCK_MAIN, day: "A", order: 12, exercise: "Búlgara con barra sobre la cabeza", left: "3x6", right: "-", notes: "Sentadilla búlgara con barra con peso arriba de la cabeza", videoUrl: "https://www.youtube.com/results?search_query=overhead+bulgarian+split+squat", tracksWeight: true },
  { block: BLOCK_MAIN, day: "A", order: 13, exercise: "Caída frontal con toma (1 pierna)", left: "3x6", right: "-", notes: "Dejarse caer hacia adelante y frenar con una pierna. La rodilla no pasa la punta del pie, caída suave, el pie no muy lejos: apoyar primero punta y después talón. Tronco derecho", videoUrl: "https://www.youtube.com/results?search_query=single+leg+landing+deceleration" },
  { block: BLOCK_MAIN, day: "A", order: 14, exercise: "Caída lateral con toma", left: "3x6", right: "-", notes: "Dejarse caer de costado y frenar amortiguando", videoUrl: "https://www.youtube.com/results?search_query=lateral+landing+deceleration+drill" },
  { block: BLOCK_MAIN, day: "A", order: 15, exercise: "Caída con toma con dos piernas desde step", left: "3x6", right: "-", notes: "Desde el step, caer con los dos pies (punta-talón al mismo tiempo) y amortiguar flexionando las rodillas", videoUrl: "https://www.youtube.com/results?search_query=drop+landing+two+feet" },
  { block: BLOCK_MAIN, day: "A", order: 16, exercise: "Caída con toma a un pie desde step", left: "3x6", right: "-", notes: "Caer con una sola pierna, equilibrio 2\" y meter un mini trote de 3 pasos", videoUrl: "https://www.youtube.com/results?search_query=single+leg+drop+landing" },
  { block: BLOCK_MAIN, day: "A", order: 17, exercise: "Cuádriceps izquierdo con BFR", left: "30 reps (15/15/15) · 20\" descanso", right: "-", notes: "Solo pierna izquierda, con oclusión (BFR)", videoUrl: "https://www.youtube.com/results?search_query=bfr+leg+extension", tracksWeight: true },
  { block: BLOCK_MAIN, day: "A", order: 18, exercise: "Isquios en camilla", left: "3x6", right: "2x6", notes: "Camilla de isquios: 3 series con la izquierda y 2 con la derecha", videoUrl: "https://www.youtube.com/results?search_query=lying+leg+curl", tracksWeight: true },
  { block: BLOCK_RUN, day: "B", order: 1, exercise: "Intervalos 1' trote / 1' caminar", left: "8 pasadas", right: "-", notes: "8 pasadas de 1 minuto de trote por 1 minuto caminando" },
  { block: BLOCK_RUN, day: "B", order: 2, exercise: "Intervalos 2' trote / 1' caminar", left: "6 pasadas", right: "-", notes: "6 pasadas de 2 minutos de trote por 1 minuto caminando" },
  { block: BLOCK_RUN, day: "B", order: 3, exercise: "Intervalos 3' trote / 1' caminar", left: "4 pasadas", right: "-", notes: "4 pasadas de 3 minutos de trote por 1 minuto caminando" },
  { block: BLOCK_STRETCH, day: "both", order: 1, exercise: "Gemelos", left: "3x10 seg", right: "3x10 seg", videoUrl: "https://www.youtube.com/results?search_query=standing+calf+stretch+wall" },
  { block: BLOCK_STRETCH, day: "both", order: 2, exercise: "Glúteo sentado", left: "3x10 seg", right: "3x10 seg", notes: "Trayendo rodilla al pecho cruzado", videoUrl: "https://www.youtube.com/results?search_query=seated+glute+stretch+figure+4" },
  { block: BLOCK_STRETCH, day: "both", order: 3, exercise: "Isquios mano cruzada", left: "3x10 seg", right: "3x10 seg", videoUrl: "https://www.youtube.com/results?search_query=standing+hamstring+stretch+crossed+legs" },
  { block: BLOCK_STRETCH, day: "both", order: 4, exercise: "Cuádriceps con pie en baranda", left: "3x10 seg", right: "3x10 seg", videoUrl: "https://www.youtube.com/results?search_query=standing+quad+stretch+foot+elevated+couch+stretch" },
  { block: BLOCK_STRETCH, day: "both", order: 5, exercise: "Aductores", left: "3x10 seg", right: "3x10 seg", videoUrl: "https://www.youtube.com/results?search_query=standing+adductor+stretch" },
  { block: BLOCK_STRETCH, day: "both", order: 6, exercise: "Cuádriceps girando tronco hacia adelante", left: "3x10 seg", right: "3x10 seg", notes: "Variante que sesga TFL/recto femoral (coherente con tu TFL acortado)", videoUrl: "https://www.youtube.com/results?search_query=standing+quad+stretch+forward+trunk+lean" },
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
