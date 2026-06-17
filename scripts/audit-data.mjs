#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDataPath = path.join(repoRoot, "src/data/sourceData.ts");
const xlsxPath = process.env.GYM_AUDIT_XLSX ?? "/Users/fedewolff/Downloads/Plan Futbol  FW (1).xlsx";
const pdfPath = process.env.GYM_AUDIT_PDF ?? "/Users/fedewolff/Downloads/Fede.pdf";
const bundledPython = "/Users/fedewolff/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const pythonPath = process.env.GYM_AUDIT_PYTHON ?? (existsSync(bundledPython) ? bundledPython : "python3");

const rowFields = ["monthLabel", "day", "order", "exercise", "block", "series", "reps", "weight", "effort"];
const pdfFields = ["name", "prescription", "series", "reps", "tempo", "effortTarget", "videoUrl", "notes"];
const expectedCounts = {
  "Mayo 2026": { 1: 8, 2: 8 },
  "Junio 2026": { 1: 9, 2: 9 },
  "Julio 2026": { 1: 8, 2: 8 },
  "Agosto 2026": { 1: 8, 2: 8 },
};

function fail(message) {
  console.error(`\nData audit failed: ${message}`);
  process.exitCode = 1;
}

function assertFileExists(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} not found at ${filePath}`);
    process.exit(1);
  }
}

function extractSourceData() {
  const text = readFileSync(sourceDataPath, "utf8");
  const pdfMatch = text.match(/export const PDF_PLAN_TEXT = `([\s\S]*?)`;/);
  const rowsMatch = text.match(/export const UPPER_MONTH_ROWS: ExcelPlanRow\[\] = (\[[\s\S]*?\n\]);/);

  if (!pdfMatch || !rowsMatch) {
    throw new Error("Could not read PDF_PLAN_TEXT or UPPER_MONTH_ROWS from sourceData.ts");
  }

  return {
    pdfText: pdfMatch[1],
    upperRows: Function(`"use strict"; return (${rowsMatch[1]});`)(),
  };
}

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeSearch(value) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parsePrescription(prescription) {
  const seriesMatch = prescription.match(/(\d+)\s*x\s*(\d+)\s*rep(?:\s*(c\/lado))?/i);
  const singleMatch = prescription.match(/(\d+)\s*rep/i);
  const tempoMatch = prescription.match(/\(([^)]+)\)/);

  if (seriesMatch) {
    return {
      series: Number(seriesMatch[1]),
      reps: `${seriesMatch[2]}${seriesMatch[3] ? " c/lado" : ""}`,
      tempo: tempoMatch ? clean(tempoMatch[1]) : undefined,
    };
  }

  return {
    series: 1,
    reps: singleMatch ? singleMatch[1] : "",
    tempo: prescription.includes("manteniendo") ? clean(prescription.replace(/^\d+\s*rep\s*/i, "")) : undefined,
  };
}

function parsePdfPlan(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const exercises = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lowerLine = normalizeSearch(line);
    if (
      !line.includes(":") ||
      lowerLine.startsWith("fede:") ||
      lowerLine.startsWith("programa") ||
      lowerLine.startsWith("pausa") ||
      lowerLine.startsWith("percepcion") ||
      /^https?:\/\//i.test(line)
    ) {
      continue;
    }

    const [rawName, ...rest] = line.split(":");
    const name = clean(rawName);
    const prescription = clean(rest.join(":"));
    const lookahead = lines.slice(index + 1, index + 5);
    const videoUrl = lookahead.find((candidate) => /^https?:\/\//i.test(candidate));
    if (!videoUrl) continue;

    const effortLine = lookahead.find((candidate) => normalizeSearch(candidate).includes("percepcion de esfuerzo"));
    const pauseLine = lookahead.find((candidate) => normalizeSearch(candidate).startsWith("pausa"));
    const parsed = parsePrescription(prescription);

    exercises.push({
      name,
      prescription,
      series: parsed.series,
      reps: parsed.reps,
      tempo: parsed.tempo,
      effortTarget: effortLine?.split(":").slice(1).join(":").trim(),
      videoUrl,
      notes: pauseLine,
    });
  }

  return exercises;
}

function valueForCompare(value) {
  return String(value ?? "");
}

function countByMonthAndDay(rows) {
  const counts = {};
  for (const row of rows) {
    counts[row.monthLabel] ??= {};
    counts[row.monthLabel][row.day] = (counts[row.monthLabel][row.day] ?? 0) + 1;
  }
  return counts;
}

function diffRows(actualRows, appRows) {
  const diffs = [];
  const max = Math.max(actualRows.length, appRows.length);
  for (let index = 0; index < max; index += 1) {
    const actual = actualRows[index];
    const app = appRows[index];
    if (!actual || !app) {
      diffs.push({
        row: index + 1,
        key: actual ? `${actual.monthLabel} Superior ${actual.day} #${actual.order} ${actual.exercise}` : "missing Excel row",
        field: "row",
        excel: actual ?? null,
        app: app ?? null,
      });
      continue;
    }

    for (const field of rowFields) {
      if (valueForCompare(actual[field]) !== valueForCompare(app[field])) {
        diffs.push({
          row: index + 1,
          key: `${actual.monthLabel} Superior ${actual.day} #${actual.order} ${actual.exercise}`,
          field,
          excel: actual[field] ?? "",
          app: app[field] ?? "",
        });
      }
    }
  }
  return diffs;
}

function diffPdfExercises(actualExercises, appExercises) {
  const diffs = [];
  const max = Math.max(actualExercises.length, appExercises.length);
  for (let index = 0; index < max; index += 1) {
    const actual = actualExercises[index];
    const app = appExercises[index];
    if (!actual || !app) {
      diffs.push({
        row: index + 1,
        key: actual?.name ?? "missing PDF exercise",
        field: "exercise",
        pdf: actual ?? null,
        app: app ?? null,
      });
      continue;
    }

    for (const field of pdfFields) {
      if (valueForCompare(actual[field]) !== valueForCompare(app[field])) {
        diffs.push({
          row: index + 1,
          key: actual.name,
          field,
          pdf: actual[field] ?? "",
          app: app[field] ?? "",
        });
      }
    }
  }
  return diffs;
}

function validateCounts(counts) {
  const diffs = [];
  for (const [monthLabel, dayCounts] of Object.entries(expectedCounts)) {
    for (const [day, expected] of Object.entries(dayCounts)) {
      const actual = counts[monthLabel]?.[day] ?? 0;
      if (actual !== expected) {
        diffs.push(`${monthLabel} Superior ${day}: expected ${expected}, got ${actual}`);
      }
    }
  }
  return diffs;
}

function printDiffs(title, diffs) {
  if (!diffs.length) return;
  console.error(`\n${title}`);
  for (const diff of diffs.slice(0, 50)) {
    console.error(`- ${diff.key} [${diff.field}]: source=${JSON.stringify(diff.excel ?? diff.pdf)} app=${JSON.stringify(diff.app)}`);
  }
  if (diffs.length > 50) {
    console.error(`- ...and ${diffs.length - 50} more differences`);
  }
}

const pythonProgram = String.raw`
import datetime
import json
import re
import sys

try:
    import openpyxl
    import pdfplumber
except ModuleNotFoundError as exc:
    print(json.dumps({"error": f"Missing Python module: {exc.name}"}))
    sys.exit(2)

xlsx_path, pdf_path = sys.argv[1], sys.argv[2]

def norm(value):
    if value is None:
        return ""
    if isinstance(value, (datetime.datetime, datetime.date)):
        return f"{value.month}/{value.day}"
    if isinstance(value, float):
        return str(int(value)) if value.is_integer() else ("%s" % value).rstrip("0").rstrip(".")
    if isinstance(value, int):
        return str(value)
    text = str(value).strip()
    if re.match(r"^-?\d+\.0$", text):
        return text[:-2]
    return text

def is_url(value):
    return bool(re.match(r"^https?://", value or "", re.I))

def extract_upper_rows():
    workbook = openpyxl.load_workbook(xlsx_path, data_only=True)
    rows = []
    for worksheet in workbook.worksheets:
        sequence = {1: 0, 2: 0}
        for raw in worksheet.iter_rows(min_row=2, values_only=True):
            values = [norm(value) for value in raw]
            title = worksheet.title
            if title == "Junio 2026":
                if len(values) < 8 or values[0] != "Superior":
                    continue
                day = int(float(values[1]))
                sequence[day] += 1
                row = {
                    "monthLabel": title,
                    "day": day,
                    "order": sequence[day],
                    "exercise": values[3],
                    "block": values[4],
                    "series": int(float(values[5])),
                    "reps": norm(raw[6]),
                    "weight": norm(raw[7]),
                    "effort": "",
                }
            elif title in ("Mayo 2026", "Julio 2026"):
                if len(values) < 6 or values[0] not in ("Tren superior 1", "Tren superior 2"):
                    continue
                day = 1 if values[0].endswith("1") else 2
                sequence[day] += 1
                if title == "Mayo 2026":
                    peso = norm(raw[6]) if len(raw) > 6 else ""
                    video_or_weight = norm(raw[7]) if len(raw) > 7 else ""
                    effort = norm(raw[5])
                    row = {
                        "monthLabel": title,
                        "day": day,
                        "order": sequence[day],
                        "exercise": values[2],
                        "block": values[1],
                        "series": int(float(values[3])),
                        "reps": norm(raw[4]),
                        "weight": peso or (video_or_weight if video_or_weight and not is_url(video_or_weight) else ""),
                        "effort": "" if effort == "-" else effort,
                    }
                else:
                    effort = norm(raw[6]) if len(raw) > 6 else ""
                    row = {
                        "monthLabel": title,
                        "day": day,
                        "order": sequence[day],
                        "exercise": values[2],
                        "block": values[1],
                        "series": int(float(values[3])),
                        "reps": norm(raw[4]),
                        "weight": norm(raw[5]) if len(raw) > 5 else "",
                        "effort": "" if effort == "-" else effort,
                    }
            elif title == "Agosto 2026":
                if len(values) < 7 or values[0] not in ("Tren superior 1", "Tren superior 2"):
                    continue
                day = 1 if values[0].endswith("1") else 2
                sequence[day] += 1
                fuerza = norm(raw[6]) if len(raw) > 6 else ""
                row = {
                    "monthLabel": title,
                    "day": day,
                    "order": sequence[day],
                    "exercise": values[3],
                    "block": values[2],
                    "series": int(float(values[4])),
                    "reps": norm(raw[5]),
                    "weight": "" if fuerza == "-" else fuerza,
                    "effort": "",
                }
            else:
                continue
            rows.append(row)
    return rows

with pdfplumber.open(pdf_path) as pdf:
    pdf_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

print(json.dumps({"excelRows": extract_upper_rows(), "pdfText": pdf_text}, ensure_ascii=False))
`;

assertFileExists(sourceDataPath, "sourceData.ts");
assertFileExists(xlsxPath, "Excel source");
assertFileExists(pdfPath, "PDF source");

const sourceData = extractSourceData();
const pythonResult = spawnSync(pythonPath, ["-c", pythonProgram, xlsxPath, pdfPath], {
  cwd: repoRoot,
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});

if (pythonResult.error) {
  fail(`Could not run Python at ${pythonPath}: ${pythonResult.error.message}`);
  process.exit(1);
}

if (pythonResult.status !== 0) {
  const parsed = JSON.parse(pythonResult.stdout || "{}");
  fail(parsed.error ?? pythonResult.stderr.trim() ?? "Python extraction failed");
  process.exit(1);
}

const extracted = JSON.parse(pythonResult.stdout);
const countDiffs = validateCounts(countByMonthAndDay(extracted.excelRows));
const rowDiffs = diffRows(extracted.excelRows, sourceData.upperRows);
const pdfDiffs = diffPdfExercises(parsePdfPlan(extracted.pdfText), parsePdfPlan(sourceData.pdfText));

if (countDiffs.length || rowDiffs.length || pdfDiffs.length) {
  if (countDiffs.length) {
    console.error("\nMonthly count differences");
    for (const diff of countDiffs) console.error(`- ${diff}`);
  }
  printDiffs("Excel row differences", rowDiffs);
  printDiffs("PDF leg plan differences", pdfDiffs);
  fail("source files do not match app seed");
  process.exit(1);
}

console.log("Data audit passed");
console.log(`- Excel upper rows: ${extracted.excelRows.length}`);
console.log(`- PDF leg exercises: ${parsePdfPlan(extracted.pdfText).length}`);
