import { test, expect } from '@playwright/test';
import { isTrainingDay } from './helpers';

test.describe('Landing Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
  });

  test('shows correct screen based on day of week', async ({ page }) => {
    if (isTrainingDay()) {
      await expect(page.getByText('TRAINING')).toBeVisible();
      await expect(page.locator('button[data-slot="button"]')).toBeVisible();
    } else {
      await expect(page.getByText('REST DAY')).toBeVisible();
    }
  });

  test('shows week number and set count on training day', async ({ page }) => {
    if (!isTrainingDay()) {
      test.skip();
      return;
    }
    await expect(page.getByText(/W\d/)).toBeVisible();
    await expect(page.getByText(/\d SETS/)).toBeVisible();
  });

  test('shows weekly progress counter', async ({ page }) => {
    await expect(page.getByText(/\d\/3/)).toBeVisible();
  });

  test('displays formatted date on training day', async ({ page }) => {
    if (!isTrainingDay()) {
      test.skip();
      return;
    }
    await expect(page.getByText(/[A-Z]+ \d+ [A-Z]+/)).toBeVisible();
  });
});
