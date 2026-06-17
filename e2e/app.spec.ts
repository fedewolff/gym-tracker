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
  await expect(page.getByTestId("training-balance-summary")).toContainText("0.5/sem");
  await expect(page.getByLabel("Ejercicio")).toHaveCount(0);
  await expect(page.getByTestId("progress-chart")).toHaveCount(0);

  const balanceScroll = await page.getByTestId("training-balance-line-scroller").evaluate((element) => ({
    left: element.scrollLeft,
    max: element.scrollWidth - element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(balanceScroll.scrollWidth).toBeGreaterThan(balanceScroll.clientWidth);
  expect(balanceScroll.left).toBeGreaterThanOrEqual(balanceScroll.max - 4);
  await page.getByTestId("training-balance-line-scroller").evaluate((element) => {
    element.scrollLeft = 0;
  });
  const pastBalanceScroll = await page.getByTestId("training-balance-line-scroller").evaluate((element) => element.scrollLeft);
  expect(pastBalanceScroll).toBeLessThan(balanceScroll.left);

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
  await page.getByTestId("training-calendar-scroller").evaluate((element) => {
    element.scrollLeft = element.scrollWidth - element.clientWidth;
  });
  await expect(page.getByText("Últimos 30")).toBeInViewport();
  const savedDateSquare = page.locator(`[aria-label^="${savedDate}:"]`);
  await expect(savedDateSquare).toHaveAttribute("data-count", "1");

  const squareBox = await savedDateSquare.boundingBox();
  expect(squareBox).not.toBeNull();
  await page.mouse.move(squareBox!.x + squareBox!.width - 4, squareBox!.y + squareBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(squareBox!.x + 4, squareBox!.y + squareBox!.height / 2, { steps: 4 });
  await page.mouse.up();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(savedDateSquare).toHaveAttribute("data-count", "1");

  await savedDateSquare.click();
  await expect(page.getByRole("dialog", { name: `Registrar entrenamiento ${savedDate}` })).toBeVisible();
  await page.getByRole("button", { name: "Registrar Aeróbico" }).click();
  await expect(savedDateSquare).toHaveAttribute("data-count", "2");
  await expect(page.getByRole("status")).toContainText("Aeróbico guardado");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Entrenar" })).toBeVisible();
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
  await expect(page.getByTestId("training-balance-chart")).toContainText("3");
  await expect(page.getByTestId("training-balance-summary")).toContainText("0.5/sem");
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
