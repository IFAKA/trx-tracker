import { test, expect, Page } from '@playwright/test';

const PANEL = '.fixed.z-\\[9998\\]';
const FAB = 'button[title="DevTools (Ctrl+Shift+D)"]';

async function openDevTools(page: Page) {
  await page.locator(FAB).click();
  await expect(page.locator(PANEL)).toBeVisible();
  // Wait for polling to pick up state
  await page.waitForTimeout(400);
}

async function closeDevTools(page: Page) {
  await page.locator(FAB).click();
  await expect(page.locator(PANEL)).not.toBeVisible();
}

async function openSection(page: Page, title: string) {
  await page.locator(PANEL).locator('button').filter({ hasText: title }).click();
}

async function setDateOverride(page: Page, dateStr: string) {
  const panel = page.locator(PANEL);
  await panel.locator('input[type="date"]').fill(dateStr);
  await panel.locator('button').filter({ hasText: 'Set' }).click();
  await page.waitForTimeout(500);
}

async function setupTrainingDay(page: Page) {
  await openDevTools(page);
  await openSection(page, 'Time Controls');
  await setDateOverride(page, '2026-02-18');
  await closeDevTools(page);
  await page.waitForTimeout(300);
}

async function startWorkout(page: Page) {
  await page.locator('button[data-slot="button"]').first().click();
  await page.waitForTimeout(300);
}

async function logSet(page: Page, reps: string) {
  await page.getByPlaceholder('0').fill(reps);
  await page.getByPlaceholder('0').press('Enter');
  await page.waitForTimeout(900);
}

test.describe('DevTools Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
  });

  test('FAB button is visible on page load', async ({ page }) => {
    const fab = page.locator(FAB);
    await expect(fab).toBeVisible();
    await expect(fab).toHaveText('D');
  });

  test('panel opens on FAB click and closes on FAB click', async ({ page }) => {
    await openDevTools(page);
    const panel = page.locator(PANEL);
    await expect(panel.getByText('State Inspector')).toBeVisible();
    await expect(panel.getByText('Quick Actions')).toBeVisible();

    await closeDevTools(page);
    await expect(panel).not.toBeVisible();
  });

  test('panel opens and closes with Ctrl+Shift+D', async ({ page }) => {
    await page.keyboard.press('Control+Shift+D');
    await expect(page.locator(PANEL)).toBeVisible();

    await page.keyboard.press('Control+Shift+D');
    await expect(page.locator(PANEL)).not.toBeVisible();
  });

  test('state inspector shows workout state', async ({ page }) => {
    await openDevTools(page);
    const panel = page.locator(PANEL);

    await expect(panel.getByText('State', { exact: true })).toBeVisible();
    await expect(panel.locator('text=idle').first()).toBeVisible();
  });

  test('state inspector shows schedule info', async ({ page }) => {
    await openDevTools(page);
    const panel = page.locator(PANEL);

    await expect(panel.getByText('Training day')).toBeVisible();
    await expect(panel.getByText('Done today')).toBeVisible();
    await expect(panel.getByText('Week progress')).toBeVisible();
  });

  test('date override switches between training and rest day', async ({ page }) => {
    await openDevTools(page);
    await openSection(page, 'Time Controls');

    await setDateOverride(page, '2026-02-17'); // Tuesday = rest day
    await expect(page.getByRole('heading', { name: 'REST DAY' })).toBeVisible();

    await setDateOverride(page, '2026-02-18'); // Wednesday = training day
    await expect(page.getByRole('heading', { name: 'TRAINING' })).toBeVisible();
  });

  test('clear date override returns to real date', async ({ page }) => {
    await openDevTools(page);
    await openSection(page, 'Time Controls');
    const panel = page.locator(PANEL);

    await setDateOverride(page, '2026-02-18');
    await expect(panel.getByText('Overriding to:')).toBeVisible();

    await panel.locator('button').filter({ hasText: 'Clear' }).click();
    await page.waitForTimeout(500);
    await expect(panel.getByText('Overriding to:')).not.toBeVisible();
  });

  test('timer speed buttons update speed indicator', async ({ page }) => {
    await openDevTools(page);
    await openSection(page, 'Time Controls');
    const panel = page.locator(PANEL);

    await expect(panel.locator('button').filter({ hasText: '1x' })).toHaveClass(/amber/);

    const speed10 = panel.locator('button').filter({ hasText: '10x' });
    await speed10.click();
    await expect(speed10).toHaveClass(/amber/);
  });

  test('force state to exercising shows exercise screen', async ({ page }) => {
    await setupTrainingDay(page);
    await startWorkout(page);
    await expect(page.getByRole('heading', { name: 'TRX INVERTED ROW' })).toBeVisible();

    // Log a set to go to resting
    await logSet(page, '10');
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();

    // Force back to exercising
    await openDevTools(page);
    await page.locator(PANEL).locator('button').filter({ hasText: 'exercising' }).click();
    await page.waitForTimeout(300);
    await closeDevTools(page);

    await expect(page.getByRole('heading', { name: 'TRX INVERTED ROW' })).toBeVisible();
  });

  test('skip rest advances to next set', async ({ page }) => {
    await setupTrainingDay(page);
    await startWorkout(page);
    await logSet(page, '10');
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();

    await openDevTools(page);
    await page.locator(PANEL).locator('button').filter({ hasText: 'Skip Rest' }).click();
    await page.waitForTimeout(300);
    await closeDevTools(page);

    await expect(page.getByRole('heading', { name: 'TRX INVERTED ROW' })).toBeVisible();
  });

  test('log perfect set logs target reps', async ({ page }) => {
    await setupTrainingDay(page);
    await startWorkout(page);

    await openDevTools(page);
    await page.locator(PANEL).locator('button').filter({ hasText: 'Log Perfect' }).click();
    await page.waitForTimeout(900);
    await closeDevTools(page);

    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();
  });

  test('seed sessions populates localStorage', async ({ page }) => {
    await openDevTools(page);
    await openSection(page, 'Data Tools');

    await page.locator(PANEL).locator('button').filter({ hasText: 'Seed Sessions' }).click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(500);

    const count = await page.evaluate(() => {
      const raw = localStorage.getItem('trx_tracker_sessions');
      return raw ? Object.keys(JSON.parse(raw)).length : 0;
    });
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('view data shows localStorage JSON', async ({ page }) => {
    await openDevTools(page);
    await openSection(page, 'Data Tools');

    await page.locator(PANEL).locator('button').filter({ hasText: 'View Data' }).click();
    await expect(page.locator(PANEL).locator('pre')).toBeVisible();
  });

  test('jump to exercise changes current exercise', async ({ page }) => {
    await setupTrainingDay(page);
    await startWorkout(page);
    await expect(page.getByRole('heading', { name: 'TRX INVERTED ROW' })).toBeVisible();

    await openDevTools(page);
    await page.locator(PANEL).locator('select').selectOption('4');
    await page.waitForTimeout(300);
    await closeDevTools(page);

    await expect(page.getByRole('heading', { name: 'PUSH-UPS' })).toBeVisible();
  });

  test('complete button forces session complete', async ({ page }) => {
    await setupTrainingDay(page);
    await startWorkout(page);

    await openDevTools(page);
    await page.locator(PANEL).locator('button').filter({ hasText: 'Complete' }).first().click();
    await page.waitForTimeout(500);
    await closeDevTools(page);

    await expect(page.getByText('SESSION COMPLETE')).toBeVisible({ timeout: 10000 });
  });

  test('set week changes week number', async ({ page }) => {
    await openDevTools(page);
    await openSection(page, 'Data Tools');

    await page.locator(PANEL).locator('input[placeholder="e.g. 5"]').fill('5');
    await page.locator(PANEL).locator('button').filter({ hasText: 'Set Week' }).click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(500);

    const firstSession = await page.evaluate(() =>
      localStorage.getItem('trx_tracker_first_session')
    );
    expect(firstSession).toBeTruthy();
  });

  test('timer speed 10x accelerates rest countdown', async ({ page }) => {
    await openDevTools(page);
    await openSection(page, 'Time Controls');
    await page.locator(PANEL).locator('button').filter({ hasText: '10x' }).click();
    await setDateOverride(page, '2026-02-18');
    await closeDevTools(page);
    await page.waitForTimeout(300);

    await startWorkout(page);
    await logSet(page, '10');

    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();

    // Wait 3 real seconds (at 10x = ~30 timer seconds)
    await page.waitForTimeout(3000);

    const stillResting = await page.getByText(/\d{2}:\d{2}/).isVisible().catch(() => false);
    if (stillResting) {
      const newTimer = await page.getByText(/\d{2}:\d{2}/).textContent();
      const [min, sec] = newTimer!.split(':').map(Number);
      expect(min * 60 + sec).toBeLessThan(70);
    }
  });
});
