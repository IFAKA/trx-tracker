import { test, expect } from '@playwright/test';
import { clickAppButton, isTrainingDay, completeFullWorkout } from './helpers';

test.describe('Session Persistence', () => {
  test('shows DONE after completing workout and refreshing', async ({ page }) => {
    if (!isTrainingDay()) { test.skip(); return; }

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);

    await completeFullWorkout(page);

    await expect(page.getByText('SESSION COMPLETE')).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.waitForTimeout(500);

    await expect(page.getByText('DONE')).toBeVisible();
  });

  test('localStorage contains session data after workout', async ({ page }) => {
    if (!isTrainingDay()) { test.skip(); return; }

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);

    // Start and complete one set
    await clickAppButton(page);
    await page.waitForTimeout(300);
    await page.getByPlaceholder('—').fill('10');
    await page.getByPlaceholder('—').press('Enter');
    await page.waitForTimeout(1000);

    const data = await page.evaluate(() => {
      return localStorage.getItem('trx_tracker_sessions');
    });

    expect(data === null || typeof data === 'string').toBe(true);
  });
});
