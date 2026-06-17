import { expect, test } from "@playwright/test";
import path from "node:path";

test("records fixed leg plan and monthly upper plan, then charts progress", async ({ page, context, browserName }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Entrenar" })).toBeVisible();
  await expect(page.getByTestId("day-progress")).toContainText("0 de 6");
  await expect(page.getByTestId("training-calendar-scroller")).toContainText("Últimos 30");
  await expect(page.getByTestId("training-calendar-scroller")).toContainText("30-59 días atrás");
  await expect(page.getByText("Últimos 30")).toBeInViewport();
  const initialCalendarPosition = await page.getByTestId("training-calendar-scroller").evaluate((element) => {
    const windows = Array.from(element.querySelectorAll<HTMLElement>(".calendar-window"));
    const currentWindow = windows.find((window) => window.textContent?.includes("Últimos 30"));
    const previousWindow = windows.find((window) => window.textContent?.includes("30-59 días atrás"));

    return {
      left: element.scrollLeft,
      max: element.scrollWidth - element.clientWidth,
      currentLeft: currentWindow?.offsetLeft ?? 0,
      previousLeft: previousWindow?.offsetLeft ?? 0,
    };
  });
  expect(initialCalendarPosition.left).toBeGreaterThanOrEqual(initialCalendarPosition.max - 4);
  expect(initialCalendarPosition.previousLeft).toBeLessThan(initialCalendarPosition.currentLeft);
  await page.getByTestId("training-calendar-scroller").evaluate((element) => {
    const previousWindow = Array.from(element.querySelectorAll<HTMLElement>(".calendar-window")).find((window) =>
      window.textContent?.includes("30-59 días atrás"),
    );
    if (previousWindow) element.scrollLeft = previousWindow.offsetLeft;
  });
  await expect(page.getByText("30-59 días atrás")).toBeInViewport();

  await page.getByRole("button", { name: "Sentadilla con barra hecho" }).click();
  await expect(page.getByTestId("day-progress")).toContainText("1 de 6");
  await expect(page.getByTestId("day-progress")).toContainText("5 quedan");

  await page.getByLabel("Sentadilla con barra serie 1 peso").fill("50");
  await page.getByLabel("Sentadilla con barra serie 1 reps").fill("6");
  const savedDate = await page.getByLabel("Fecha").inputValue();
  await page.getByTestId("save-workout").click();
  await expect(page.getByRole("status")).toContainText("Entrenamiento guardado");
  const savedDateSquare = page.locator(`[aria-label^="${savedDate}:"]`);
  await expect(savedDateSquare).toHaveAttribute("data-count", "1");

  await savedDateSquare.click();
  await expect(savedDateSquare).toHaveAttribute("data-count", "2");
  await expect(page.getByRole("status")).toContainText("Entrenamiento rápido guardado");

  await page.reload();
  await expect(page.getByLabel("Sentadilla con barra serie 1 peso")).toHaveValue("50");
  await expect(page.getByLabel("Sentadilla con barra serie 1 reps")).toHaveValue("6");

  await page.getByRole("button", { name: "Superior" }).click();
  await page.getByLabel("Mes").selectOption({ label: "Mayo 2026" });
  await page.getByLabel("Día").selectOption("2");
  await expect(page.getByRole("heading", { name: "Superior 2" })).toBeVisible();
  await page.getByLabel("Remo T con landmine serie 1 peso").fill("55");
  await page.getByLabel("Remo T con landmine serie 1 reps").fill("6");
  await page.getByTestId("save-workout").click();

  await page.getByRole("button", { name: "Progreso" }).click();
  await page.getByLabel("Ejercicio").selectOption({ label: "Remo T con landmine" });
  await expect(page.getByTestId("progress-chart")).toContainText("Remo T con landmine");
  await expect(page.getByTestId("progress-metric")).toContainText("55");

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
