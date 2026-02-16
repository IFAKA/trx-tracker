import { Page } from '@playwright/test';

/** Click the main app button (not Next.js dev tools) */
export async function clickAppButton(page: Page) {
  await page.locator('button[data-slot="button"]').first().click();
}

/** Check if today is a training day */
export function isTrainingDay(): boolean {
  return [1, 3, 5].includes(new Date().getDay());
}

/** Complete a full workout session by entering reps and skipping timers */
export async function completeFullWorkout(page: Page) {
  await clickAppButton(page);
  await page.waitForTimeout(300);

  // 7 exercises × 2 sets = 14 sets total
  for (let i = 0; i < 14; i++) {
    const input = page.getByPlaceholder('—');
    const visible = await input.isVisible().catch(() => false);
    if (visible) {
      await input.fill('10');
      await input.press('Enter');
      await page.waitForTimeout(900);
    }
    try {
      const timerVisible = await page.getByText(/\d{2}:\d{2}/).isVisible();
      if (timerVisible) {
        await clickAppButton(page);
        await page.waitForTimeout(300);
      }
    } catch {
      // ignore
    }
  }
}
