import { expect, test } from "@playwright/test";
import path from "node:path";

test("records fixed leg plan and monthly upper plan, then charts progress", async ({ page, context, browserName }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Entrenar" })).toBeVisible();
  await expect(page.getByTestId("day-progress")).toContainText("0 de 6");
  await expect(page.getByTestId("training-calendar")).toHaveCount(0);
  await expect(page.getByPlaceholder("Notas")).toHaveCount(0);

  if ((page.viewportSize()?.width ?? 0) < 760) {
    await page.evaluate(() => window.scrollTo(0, 650));
    const dock = await page.locator(".tabbar").boundingBox();
    expect(dock).not.toBeNull();
    expect(Math.abs((page.viewportSize()?.height ?? 0) - dock!.y - dock!.height)).toBeLessThanOrEqual(2);
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  await page.getByRole("button", { name: "Sentadilla con barra hecho" }).click();
  await expect(page.getByTestId("day-progress")).toContainText("1 de 6");
  await expect(page.getByTestId("day-progress")).toContainText("5 quedan");

  await page.getByLabel("Sentadilla con barra serie 1 peso").fill("50");
  await page.getByLabel("Sentadilla con barra serie 1 reps").fill("6");
  const savedDate = await page.getByLabel("Fecha").inputValue();
  await page.getByTestId("save-workout").click();
  await expect(page.getByRole("status")).toContainText("Entrenamiento guardado");

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
  await expect(page.getByLabel("Sentadilla con barra serie 1 peso")).toHaveValue("50");
  await expect(page.getByLabel("Sentadilla con barra serie 1 reps")).toHaveValue("6");

  await page.getByRole("button", { name: "Movilidad" }).click();
  await expect(page.getByRole("heading", { name: "Movilidad diaria" })).toBeVisible();
  await expect(page.getByText("Movilidad de tobillo contra pared")).toBeVisible();
  await expect(page.getByText("Pararse y caminar")).toBeVisible();
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
  await page.getByLabel(`Mediodía ${savedDate} pendiente`).click();
  await expect(page.getByRole("status")).toContainText("Mediodía marcada");
  await expect(page.getByLabel(`Mediodía ${savedDate} hecha`)).toBeVisible();
  await page.getByLabel(`Mediodía ${savedDate} hecha`).click();
  await expect(page.getByRole("status")).toContainText("Mediodía desmarcada");
  await expect(page.getByLabel(`Mediodía ${savedDate} pendiente`)).toBeVisible();
  await expect(page.getByLabel("Ejercicio")).toHaveCount(0);
  await expect(page.getByTestId("progress-chart")).toHaveCount(0);

  await page.screenshot({ path: testInfo.outputPath("mobile-progress.png"), fullPage: true });

  await page.getByRole("button", { name: "Ajustes" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar backup" }).click();
  const download = await downloadPromise;
  const backupPath = path.join(testInfo.outputDir, "backup.json");
  await download.saveAs(backupPath);

  await page.locator('input[type="file"]').setInputFiles(backupPath);
  await expect(page.getByRole("status")).toContainText("Backup importado");

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
