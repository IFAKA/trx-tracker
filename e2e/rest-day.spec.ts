import { test, expect } from '@playwright/test';
import { clickAppButton, isTrainingDay } from './helpers';

test.describe('Rest Day & Mobility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
  });

  test('shows REST DAY on non-training days', async ({ page }) => {
    if (isTrainingDay()) { test.skip(); return; }

    await expect(page.getByText('REST DAY')).toBeVisible();
    await expect(page.getByText('5 MIN MOBILITY')).toBeVisible();
  });

  test('mobility flow starts when play button is clicked', async ({ page }) => {
    if (isTrainingDay()) { test.skip(); return; }

    await clickAppButton(page);
    await page.waitForTimeout(500);

    await expect(page.getByText('HIP FLEXOR STRETCH')).toBeVisible();
    await expect(page.getByText(/\d+s/)).toBeVisible();
    await expect(page.getByText('1/5')).toBeVisible();
  });

  test('shows next training day on rest day', async ({ page }) => {
    if (isTrainingDay()) { test.skip(); return; }

    await expect(page.getByText(/NEXT:/)).toBeVisible();
  });
});
