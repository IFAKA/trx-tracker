import { test, expect } from '@playwright/test';
import { clickAppButton, isTrainingDay } from './helpers';

test.describe('Progression', () => {
  test('targets increase after hitting all targets in previous session', async ({ page }) => {
    if (!isTrainingDay()) { test.skip(); return; }

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Seed a completed previous session with all targets hit
    const day = new Date().getDay();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - (day === 1 ? 3 : 2));
    const dateKey = yesterday.toISOString().split('T')[0];

    await page.evaluate((key) => {
      const sessions = {
        [key]: {
          inverted_row: [10, 8],
          single_arm_row: [10, 8],
          pike_pushup: [10, 8],
          face_pull: [10, 8],
          pushup: [10, 8],
          wall_lateral_raise: [10, 8],
          plank: [20, 15],
          logged_at: new Date().toISOString(),
          week_number: 1,
        },
      };
      localStorage.setItem('trx_tracker_sessions', JSON.stringify(sessions));
      localStorage.setItem('trx_tracker_first_session', key);
    }, dateKey);

    await page.reload();
    await page.waitForTimeout(500);

    await clickAppButton(page);
    await page.waitForTimeout(300);

    // Target should be 11 (10 + 1)
    await expect(page.getByText('11')).toBeVisible();
  });

  test('shows previous session reps for comparison', async ({ page }) => {
    if (!isTrainingDay()) { test.skip(); return; }

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    const day = new Date().getDay();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - (day === 1 ? 3 : 2));
    const dateKey = yesterday.toISOString().split('T')[0];

    await page.evaluate((key) => {
      const sessions = {
        [key]: {
          inverted_row: [9, 7],
          single_arm_row: [8, 6],
          pike_pushup: [8, 6],
          face_pull: [9, 7],
          pushup: [12, 10],
          wall_lateral_raise: [9, 7],
          plank: [18, 14],
          logged_at: new Date().toISOString(),
          week_number: 1,
        },
      };
      localStorage.setItem('trx_tracker_sessions', JSON.stringify(sessions));
      localStorage.setItem('trx_tracker_first_session', key);
    }, dateKey);

    await page.reload();
    await page.waitForTimeout(500);

    await clickAppButton(page);
    await page.waitForTimeout(300);

    // Previous reps (9) should be shown
    await expect(page.getByText('9')).toBeVisible();
  });
});
