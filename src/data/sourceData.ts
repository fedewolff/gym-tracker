export const PDF_PLAN_TEXT = `
Programa de Ejercicio Físico Adaptado
Fede (3 veces por semana - día por medio)

Sentadilla con cinto ruso isométrico: 5 rep manteniendo 10 seg
https://youtu.be/mik90mAS6fU
Pausa entre rep: 8 seg

Sentadilla con barra: 4 x 6 rep (baja en 2 seg, sube en 2 seg)
https://youtu.be/8tCHW2IJ5UY
Percepción de esfuerzo: 7-8

Extensores de rodilla unilateral: 4 x 6 rep (sube en 2 seg baja en 2 seg)
Percepción de esfuerzo: 5-7
https://youtu.be/fWwmC--hRGI

Prensa: 4 x 6 rep (baja en 2 seg, sube en 2 seg)
https://youtu.be/cjSjskAxI_c
Percepción de esfuerzo: 7-8

Bulgara front: 2 x 8 rep c/lado
https://www.youtube.com/shorts/fnQFJAhqt3Q?feature=share
Percepción de esfuerzo: 6-7

Peso muerto c/rotación: 2 x 8 rep
https://youtu.be/11_D7wCPxBg
Percepción de esfuerzo: 6-7

Fede: molestias durante gym que NO sobrepase de 2-3.
Semana a semana si podés incrementar algo el peso. Ej de a 5 kg.
`;

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
