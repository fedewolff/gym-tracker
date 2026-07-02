import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

interface StoredSession {
  date: string;
  kind?: string;
  mobilitySlot?: string;
  createdAt?: string;
}

async function readStoredSessions(page: Page): Promise<StoredSession[]> {
  return page.evaluate(
    () =>
      new Promise<StoredSession[]>((resolve, reject) => {
        const request = indexedDB.open("gym-fede-db");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction("sessions", "readonly");
          const store = transaction.objectStore("sessions");
          const allSessions = store.getAll();
          allSessions.onerror = () => reject(allSessions.error);
          allSessions.onsuccess = () => {
            database.close();
            resolve(allSessions.result as StoredSession[]);
          };
        };
      }),
  );
}

test("records rehab leg plan and monthly upper plan, then charts progress", async ({ page, context, browserName }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Entrenar" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pierna A" })).toBeVisible();
  await expect(page.getByTestId("day-progress")).toContainText("0 de 23");
  await expect(page.getByTestId("training-calendar")).toHaveCount(0);
  await expect(page.getByPlaceholder("Notas")).toHaveCount(0);

  await expect(page.getByRole("heading", { name: "1. Entrada en calor + core (todos los días)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "2. Rodilla Día A (3x/semana) — Control de extensión" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "4. Elongación (todos los días, post A y B)" })).toBeVisible();
  await expect(page.getByText("Activación metabólica suave")).toBeVisible();
  await expect(page.getByText("IZQ (lesionada) 3x6 · DER 1x6").first()).toBeVisible();
  await expect(page.getByText("Banda detrás de la rodilla tirando desde el frente", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Almeja (clamshell) peso")).toHaveCount(0);

  if ((page.viewportSize()?.width ?? 0) < 760) {
    await page.evaluate(() => window.scrollTo(0, 650));
    const dock = await page.locator(".tabbar").boundingBox();
    expect(dock).not.toBeNull();
    expect(Math.abs((page.viewportSize()?.height ?? 0) - dock!.y - dock!.height)).toBeLessThanOrEqual(2);
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  await page.getByRole("button", { name: "Almeja (clamshell) hecho" }).click();
  await expect(page.getByTestId("day-progress")).toContainText("1 de 23");
  await expect(page.getByTestId("day-progress")).toContainText("22 quedan");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Entrenar" })).toBeVisible();
  await expect(page.getByTestId("day-progress")).toContainText("1 de 23");

  await page.getByLabel("Día").selectOption("B");
  await expect(page.getByRole("heading", { name: "Pierna B" })).toBeVisible();
  await expect(page.getByTestId("day-progress")).toContainText("0 de 22");
  await expect(page.getByRole("heading", { name: "3. Rodilla Día B (2x/semana) — Fuerza pesada" })).toBeVisible();
  await expect(page.getByText("Subir con DOS piernas, bajar controlado con UNA (excéntrico)")).toBeVisible();
  await expect(page.getByLabel("GYM: Prensa excéntrica (2 arriba / 1 abajo) peso")).toBeVisible();
  await expect(page.getByLabel("Sentadilla isométrica 45° en step inclinado + pelota entre rodillas peso")).toHaveCount(0);

  await page.getByLabel("GYM: Prensa excéntrica (2 arriba / 1 abajo) peso").fill("80");
  await page.getByLabel("GYM: Camilla de cuádriceps excéntrica con tempos peso").fill("35");
  const savedDate = await page.getByLabel("Fecha").inputValue();
  await page.getByTestId("save-workout").click();
  await expect(page.getByRole("status")).toContainText("Entrenamiento guardado");
  await expect(page.getByTestId("day-progress")).toContainText("Completo");

  await page.getByRole("button", { name: "Progreso" }).click();
  await expect(page.getByTestId("training-balance-chart")).toContainText("Últimos 14 días");
  await expect(page.getByTestId("training-balance-summary")).toContainText("Pierna");
  await expect(page.getByTestId("training-balance-summary")).toContainText("Superior");
  await expect(page.getByTestId("training-balance-summary")).toContainText("Aeróbico");
  await expect(page.getByTestId("training-balance-summary")).toContainText("Desbalance");
  await expect(page.getByTestId("training-heatmap")).toContainText("Últimos 14 días");
  await expect(page.getByTestId("training-heatmap").locator(".heatmap-day-head")).toHaveCount(14);
  await expect(page.locator(".heatmap-total").first()).toContainText("1");
  await expect(page.locator(".heatmap-cell.heatmap-level-4").first()).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) < 760) {
    const heatmapScroll = await page.getByTestId("training-heatmap").evaluate((element) => ({
      left: element.scrollLeft,
      max: element.scrollWidth - element.clientWidth,
    }));
    expect(heatmapScroll.max).toBeGreaterThan(0);
    expect(heatmapScroll.left).toBeGreaterThanOrEqual(heatmapScroll.max - 4);
  }
  await expect(page.getByLabel("Ejercicio")).toHaveCount(0);
  await expect(page.getByTestId("progress-chart")).toHaveCount(0);
  await expect(page.getByTestId("training-calendar")).toHaveCount(0);
  await expect(page.getByTestId("training-calendar-scroller")).toHaveCount(0);
  await expect(page.getByText("Constancia")).toHaveCount(0);

  await page.getByLabel(`Pierna ${savedDate} entrenado`).click();
  await expect(page.getByRole("status")).toContainText("Pierna desmarcado");
  await expect(page.getByLabel(`Pierna ${savedDate} descanso`)).toBeVisible();
  await expect(page.locator(".heatmap-total").first()).toContainText("0");

  await page.getByLabel(`Pierna ${savedDate} descanso`).click();
  await expect(page.getByRole("status")).toContainText("Pierna marcado");
  await expect(page.getByLabel(`Pierna ${savedDate} entrenado`)).toBeVisible();
  await expect(page.locator(".heatmap-total").first()).toContainText("1");

  await page.getByLabel(`Aeróbico ${savedDate} descanso`).click();
  await expect(page.getByRole("status")).toContainText("Aeróbico marcado");
  await expect(page.getByLabel(`Aeróbico ${savedDate} entrenado`)).toBeVisible();
  await expect(page.locator(".heatmap-total").nth(2)).toContainText("1");

  await page.getByLabel(`Aeróbico ${savedDate} entrenado`).click();
  await expect(page.getByRole("status")).toContainText("Aeróbico desmarcado");
  await expect(page.getByLabel(`Aeróbico ${savedDate} descanso`)).toBeVisible();
  await expect(page.locator(".heatmap-total").nth(2)).toContainText("0");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Entrenar" })).toBeVisible();
  await expect(page.getByTestId("day-progress")).toContainText("1 de 23");
  await page.getByLabel("Día").selectOption("B");
  await expect(page.getByLabel("GYM: Prensa excéntrica (2 arriba / 1 abajo) peso")).toHaveValue("80");
  await expect(page.getByLabel("GYM: Camilla de cuádriceps excéntrica con tempos peso")).toHaveValue("35");
  await expect(page.getByTestId("day-progress")).toContainText("Completo");

  await page.getByRole("button", { name: "Movilidad", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Movilidad diaria" })).toBeVisible();
  await expect(page.getByText("Movilidad de tobillo contra pared")).toBeVisible();
  await expect(page.getByText("Cinto ruso / Spanish squat isométrico")).toBeVisible();
  await page.getByRole("button", { name: "Mañana movilidad pendiente" }).click();
  await expect(page.getByRole("status")).toContainText("Mañana marcada");
  await expect(page.getByTestId("mobility-progress")).toContainText("1 de 4");
  await page.getByRole("button", { name: "Mañana movilidad hecha" }).click();
  await expect(page.getByRole("status")).toContainText("Mañana desmarcada");
  await expect(page.getByTestId("mobility-progress")).toContainText("0 de 4");
  await page.getByRole("button", { name: "Mañana movilidad pendiente" }).click();
  await expect(page.getByRole("status")).toContainText("Mañana marcada");

  await page.getByRole("button", { name: "Superior" }).click();
  await page.getByLabel("Mes").selectOption({ label: "Mayo 2026" });
  await page.getByLabel("Día").selectOption("2");
  await expect(page.getByRole("heading", { name: "Superior 2" })).toBeVisible();
  await page.getByLabel("Remo T con landmine serie 1 peso").fill("55");
  await page.getByLabel("Remo T con landmine serie 1 reps").fill("6");
  await page.getByTestId("save-workout").click();

  await page.getByRole("button", { name: "Progreso" }).click();
  await expect(page.getByTestId("training-balance-chart")).toContainText("2");
  await expect(page.getByTestId("training-balance-summary")).toContainText("Desbalance");
  await expect(page.locator(".heatmap-total").first()).toContainText("1");
  await expect(page.locator(".heatmap-total").nth(1)).toContainText("1");
  await expect(page.getByTestId("mobility-balance-chart")).toContainText("Movilidad");
  await expect(page.getByTestId("mobility-balance-chart")).toContainText("1");
  await expect(page.getByTestId("mobility-heatmap")).toContainText("Mañana");
  await expect(page.getByLabel(`Mañana ${savedDate} hecha`)).toBeVisible();
  const preWorkoutCell = page.getByLabel(`Pre entrenar ${savedDate} pendiente`);
  const preWorkoutBox = await preWorkoutCell.boundingBox();
  expect(preWorkoutBox).not.toBeNull();
  await page.mouse.move(preWorkoutBox!.x + preWorkoutBox!.width / 2, preWorkoutBox!.y + preWorkoutBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(preWorkoutBox!.x + preWorkoutBox!.width / 2 - 48, preWorkoutBox!.y + preWorkoutBox!.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect(page.getByLabel(`Pre entrenar ${savedDate} pendiente`)).toBeVisible();
  await page.getByLabel(`Mediodía ${savedDate} pendiente`).click();
  await expect(page.getByRole("status")).toContainText("Mediodía marcada");
  await expect(page.getByLabel(`Mediodía ${savedDate} hecha`)).toBeVisible();
  let storedSessions = await readStoredSessions(page);
  expect(storedSessions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        date: savedDate,
        kind: "mobility",
        mobilitySlot: "midday",
        createdAt: expect.stringMatching(/-03:00$/),
      }),
    ]),
  );
  expect(storedSessions.filter((session) => session.kind === "mobility" && session.mobilitySlot === "midday" && session.date !== savedDate)).toHaveLength(0);
  await page.getByLabel(`Mediodía ${savedDate} hecha`).click();
  await expect(page.getByRole("status")).toContainText("Mediodía desmarcada");
  await expect(page.getByLabel(`Mediodía ${savedDate} pendiente`)).toBeVisible();
  storedSessions = await readStoredSessions(page);
  expect(storedSessions.filter((session) => session.kind === "mobility" && session.mobilitySlot === "midday" && session.date === savedDate)).toHaveLength(0);
  await expect(page.getByLabel("Ejercicio")).toHaveCount(0);
  await expect(page.getByTestId("progress-chart")).toHaveCount(0);

  await page.screenshot({ path: testInfo.outputPath("mobile-progress.png"), fullPage: true });

  await page.getByRole("button", { name: "Ajustes" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar backup" }).click();
  const download = await downloadPromise;
  const backupPath = path.join(testInfo.outputDir, "backup.json");
  await download.saveAs(backupPath);
  const backup = JSON.parse(await readFile(backupPath, "utf8"));
  expect(backup.exportedAt).toMatch(/-03:00$/);
  expect(backup.version).toBe(2);
  expect(backup.exerciseChecks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ date: savedDate, templateId: "template-leg-a", exerciseId: "ex-almeja-clamshell" }),
      expect.objectContaining({ date: savedDate, templateId: "template-leg-b", exerciseId: "ex-gym-prensa-excentrica-2-arriba-1-abajo" }),
    ]),
  );
  expect(backup.setEntries).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ exerciseId: "ex-gym-prensa-excentrica-2-arriba-1-abajo", weightText: "80", weightNumber: 80 }),
    ]),
  );

  await page.locator('input[type="file"]').setInputFiles(backupPath);
  await expect(page.getByRole("status")).toContainText("Backup importado");

  await page.getByRole("button", { name: "Entrenar" }).click();
  await page.getByRole("button", { name: "Pierna", exact: true }).click();
  await expect(page.getByTestId("day-progress")).toContainText("Completo");
  await expect(page.getByLabel("GYM: Prensa excéntrica (2 arriba / 1 abajo) peso")).toHaveValue("80");
  await page.getByLabel("Día").selectOption("A");
  await expect(page.getByTestId("day-progress")).toContainText("1 de 23");
  await page.getByRole("button", { name: "Ajustes" }).click();

  const hasServiceWorker = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
  expect(hasServiceWorker).toBe(true);

  if (browserName === "chromium") {
    await context.setOffline(true);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Entrenar" })).toBeVisible();
    await context.setOffline(false);
  }
});

test("keeps unsaved weight input when toggling exercise checks", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pierna A" })).toBeVisible();
  await page.getByLabel("Día").selectOption("B");
  await expect(page.getByRole("heading", { name: "Pierna B" })).toBeVisible();

  await page.getByLabel("GYM: Prensa excéntrica (2 arriba / 1 abajo) peso").fill("77");
  await page.getByRole("button", { name: "Bici estática hecho" }).click();
  await expect(page.getByTestId("day-progress")).toContainText("1 de 22");
  await expect(page.getByLabel("GYM: Prensa excéntrica (2 arriba / 1 abajo) peso")).toHaveValue("77");

  await page.getByRole("button", { name: "Bici estática hecho" }).click();
  await expect(page.getByTestId("day-progress")).toContainText("0 de 22");
  await expect(page.getByLabel("GYM: Prensa excéntrica (2 arriba / 1 abajo) peso")).toHaveValue("77");
});

test("imports a v1 backup from the old tendon plan without losing history", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pierna A" })).toBeVisible();
  const todayDate = await page.getByLabel("Fecha").inputValue();

  const v1Backup = {
    version: 1,
    exportedAt: "2026-06-20T10:00:00.000-03:00",
    exercises: [
      {
        id: "ex-sentadilla-con-barra",
        name: "Sentadilla con barra",
        group: "Pierna",
        block: "Plan tendón actual",
        source: "pdf-current",
        activeInRoutine: true,
      },
    ],
    templates: [
      {
        id: "template-leg-fixed",
        name: "Pierna",
        type: "leg",
        exercises: [{ exerciseId: "ex-sentadilla-con-barra", order: 1, block: "Plan tendón actual" }],
      },
    ],
    sessions: [
      {
        id: "session-old-1",
        templateId: "template-leg-fixed",
        date: todayDate,
        kind: "workout",
        createdAt: `${todayDate}T13:00:00.000Z`,
      },
    ],
    setEntries: [
      {
        id: "set-old-1",
        sessionId: "session-old-1",
        exerciseId: "ex-sentadilla-con-barra",
        date: todayDate,
        setNumber: 1,
        weightText: "50",
        weightNumber: 50,
        reps: "6",
      },
    ],
    meta: [{ key: "seedVersion", value: "2026-06-17-v2-reset" }],
  };

  await page.getByRole("button", { name: "Ajustes" }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "backup-v1.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(v1Backup)),
  });
  await expect(page.getByRole("status")).toContainText("Backup importado");

  await page.getByRole("button", { name: "Entrenar" }).click();
  await expect(page.getByRole("heading", { name: "Pierna A" })).toBeVisible();
  await expect(page.getByTestId("day-progress")).toContainText("0 de 23");

  await page.getByRole("button", { name: "Progreso" }).click();
  await expect(page.getByLabel(`Pierna ${todayDate} entrenado`)).toBeVisible();

  const storedSessions = await readStoredSessions(page);
  const oldSession = storedSessions.find((session) => session.date === todayDate && session.kind === "workout");
  expect(oldSession?.createdAt).toMatch(/-03:00$/);
});

test("minimal desktop layout shows monthly upper routines without overlap", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Superior" }).click();
  await page.getByLabel("Mes").selectOption({ label: "Agosto 2026" });
  await page.getByLabel("Día").selectOption("2");
  await expect(page.getByRole("heading", { name: "Superior 2" })).toBeVisible();
  await expect(page.getByText("Press Inclinado con Mancuernas")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("desktop-upper.png"), fullPage: true });
});
