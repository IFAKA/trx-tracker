import { test, expect } from '@playwright/test';
import { clickAppButton, isTrainingDay } from './helpers';

test.describe('Workout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
  });

  test('full workout: start → reps → rest → complete', async ({ page }) => {
    if (!isTrainingDay()) { test.skip(); return; }

    // Click play to start
    await clickAppButton(page);
    await page.waitForTimeout(300);

    // First exercise
    await expect(page.getByText('TRX INVERTED ROW')).toBeVisible();
    await expect(page.getByText('1/7')).toBeVisible();
    await expect(page.getByText('10')).toBeVisible();

    const input = page.getByPlaceholder('—');
    await expect(input).toBeVisible();

    // Enter reps for set 1
    await input.fill('10');
    await input.press('Enter');
    await page.waitForTimeout(1000);

    // Rest timer
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();

    // Skip
    await clickAppButton(page);
    await page.waitForTimeout(300);

    // Set 2 of exercise 1
    await expect(page.getByText('TRX INVERTED ROW')).toBeVisible();
    await expect(page.getByText('8')).toBeVisible();

    // Complete remaining 13 sets
    for (let i = 0; i < 13; i++) {
      const inp = page.getByPlaceholder('—');
      const visible = await inp.isVisible().catch(() => false);
      if (visible) {
        await inp.fill('10');
        await inp.press('Enter');
        await page.waitForTimeout(900);
      }
      try {
        const timerVisible = await page.getByText(/\d{2}:\d{2}/).isVisible();
        if (timerVisible) {
          await clickAppButton(page);
          await page.waitForTimeout(300);
        }
      } catch { /* no timer */ }
    }

    await expect(page.getByText('SESSION COMPLETE')).toBeVisible({ timeout: 10000 });
  });

  test('exercise screen shows progress bar and set dots', async ({ page }) => {
    if (!isTrainingDay()) { test.skip(); return; }

    await clickAppButton(page);
    await page.waitForTimeout(300);

    await expect(page.getByRole('progressbar')).toBeVisible();
    await expect(page.getByText('1/7')).toBeVisible();
  });

  test('rest timer shows countdown and skip button', async ({ page }) => {
    if (!isTrainingDay()) { test.skip(); return; }

    await clickAppButton(page);
    await page.waitForTimeout(300);

    await page.getByPlaceholder('—').fill('10');
    await page.getByPlaceholder('—').press('Enter');
    await page.waitForTimeout(1000);

    const timerText = await page.getByText(/01:\d{2}/).textContent();
    expect(timerText).toMatch(/01:\d{2}/);

    await expect(page.locator('button[data-slot="button"]')).toBeVisible();
  });

  test('green flash when hitting target', async ({ page }) => {
    if (!isTrainingDay()) { test.skip(); return; }

    await clickAppButton(page);
    await page.waitForTimeout(300);

    await page.getByPlaceholder('—').fill('12');
    await page.getByPlaceholder('—').press('Enter');

    const container = page.locator('[class*="green"]');
    await expect(container.first()).toBeVisible({ timeout: 1000 });
  });
});
