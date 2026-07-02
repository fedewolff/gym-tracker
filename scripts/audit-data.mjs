#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDataPath = path.join(repoRoot, "src/data/sourceData.ts");
const xlsxPath = process.env.GYM_AUDIT_XLSX ?? "/Users/fedewolff/Downloads/Plan Futbol  FW (1).xlsx";
const rehabCsvPath =
  process.env.GYM_AUDIT_REHAB_CSV ??
  "/Users/fedewolff/Downloads/1. Plan Rehabilitación Rodilla — Fede (30_06 → 30_07) - Untitled (1).csv";
const bundledPython = "/Users/fedewolff/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const pythonPath = process.env.GYM_AUDIT_PYTHON ?? (existsSync(bundledPython) ? bundledPython : "python3");

const rowFields = ["monthLabel", "day", "order", "exercise", "block", "series", "reps", "weight", "effort"];
const rehabFields = ["block", "order", "exercise", "left", "right", "notes", "videoUrl"];
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
  const rehabMatch = text.match(/(const BLOCK_WARMUP[\s\S]*?)export const REHAB_PLAN_ROWS: RehabPlanRow\[\] = (\[[\s\S]*?\n\]);/);
  const rowsMatch = text.match(/export const UPPER_MONTH_ROWS: ExcelPlanRow\[\] = (\[[\s\S]*?\n\]);/);

  if (!rehabMatch || !rowsMatch) {
    throw new Error("Could not read REHAB_PLAN_ROWS or UPPER_MONTH_ROWS from sourceData.ts");
  }

  return {
    rehabRows: Function(`"use strict"; ${rehabMatch[1]} return (${rehabMatch[2]});`)(),
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      field = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }
  return rows;
}

function parseRehabCsv(text) {
  const [, ...rows] = parseCsv(text);
  return rows.map((cells) => {
    const [block, order, exercise, left, right, notes, videoUrl] = cells.map((value) => clean(value).replace(/\\$/, ""));
    return {
      // The sheet titles blocks in caps and labels day A "Control de extensión terminal" only on its first row.
      block: block.replace(/ terminal$/i, ""),
      order: Number(order),
      exercise,
      left,
      right,
      notes,
      videoUrl,
    };
  });
}

function diffRehabRows(csvRows, appRows) {
  const diffs = [];
  const max = Math.max(csvRows.length, appRows.length);
  for (let index = 0; index < max; index += 1) {
    const csv = csvRows[index];
    const app = appRows[index];
    if (!csv || !app) {
      diffs.push({
        row: index + 1,
        key: csv ? `${csv.block} #${csv.order} ${csv.exercise}` : "missing CSV row",
        field: "row",
        csv: csv ?? null,
        app: app ?? null,
      });
      continue;
    }

    for (const field of rehabFields) {
      const csvValue = valueForCompare(csv[field]);
      const appValue = valueForCompare(app[field]);
      // Block names differ only in casing between the sheet and the app.
      const matches = field === "block" ? normalizeSearch(csvValue) === normalizeSearch(appValue) : clean(csvValue) === clean(appValue);
      if (!matches) {
        diffs.push({
          row: index + 1,
          key: `${csv.block} #${csv.order} ${csv.exercise}`,
          field,
          csv: csv[field] ?? "",
          app: app[field] ?? "",
        });
      }
    }
  }
  return diffs;
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
    console.error(`- ${diff.key} [${diff.field}]: source=${JSON.stringify(diff.excel ?? diff.csv)} app=${JSON.stringify(diff.app)}`);
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
except ModuleNotFoundError as exc:
    print(json.dumps({"error": f"Missing Python module: {exc.name}"}))
    sys.exit(2)

xlsx_path = sys.argv[1]

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

print(json.dumps({"excelRows": extract_upper_rows()}, ensure_ascii=False))
`;

assertFileExists(sourceDataPath, "sourceData.ts");
assertFileExists(xlsxPath, "Excel source");
assertFileExists(rehabCsvPath, "Rehab plan CSV source");

const sourceData = extractSourceData();
const pythonResult = spawnSync(pythonPath, ["-c", pythonProgram, xlsxPath], {
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
const csvRehabRows = parseRehabCsv(readFileSync(rehabCsvPath, "utf8"));
const countDiffs = validateCounts(countByMonthAndDay(extracted.excelRows));
const rowDiffs = diffRows(extracted.excelRows, sourceData.upperRows);
const rehabDiffs = diffRehabRows(csvRehabRows, sourceData.rehabRows);

if (countDiffs.length || rowDiffs.length || rehabDiffs.length) {
  if (countDiffs.length) {
    console.error("\nMonthly count differences");
    for (const diff of countDiffs) console.error(`- ${diff}`);
  }
  printDiffs("Excel row differences", rowDiffs);
  printDiffs("Rehab plan CSV differences", rehabDiffs);
  fail("source files do not match app seed");
  process.exit(1);
}

console.log("Data audit passed");
console.log(`- Excel upper rows: ${extracted.excelRows.length}`);
console.log(`- Rehab leg exercises: ${csvRehabRows.length}`);
