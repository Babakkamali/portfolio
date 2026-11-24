import { expect, test } from '@playwright/test';

test('shows who I am without typing anything', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Babak Kamali');
  await expect(page.locator('.hero')).toContainText(/\d+\+ years in DevOps/);
  await expect(page.locator('[data-deploy-log]')).toContainText('observe');
});

test('the services map shows the part that was clicked', async ({ page }) => {
  await page.goto('/');
  const map = page.locator('.map:visible');
  await map.locator('[data-service="data"]').click();
  await expect(page.locator('.svc-detail.on')).toContainText('Managed databases');
});

test('the terminal runs commands and closes with Escape', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hero [data-terminal-open]').click();
  const input = page.locator('#term-input');
  await expect(input).toBeFocused();

  await input.fill('ls');
  await input.press('Enter');
  await expect(page.locator('.term-out')).toContainText('about.md');

  await input.fill('cat serv');
  await input.press('Tab');
  await expect(input).toHaveValue('cat services/');

  await input.fill('sudo rm -rf /');
  await input.press('Enter');
  await expect(page.locator('.term-block .t-orange').last()).toBeVisible();

  await input.press('Escape');
  await expect(page.locator('.term-overlay')).toBeHidden();
});

test('the contact form checks the email before sending', async ({ page }) => {
  await page.goto('/#contact');
  await page.locator('#mail-from').fill('not-an-email');
  await page.locator('#mail-body').fill('hello there, a short test');
  await page.getByRole('button', { name: /send/ }).click();
  await expect(page.locator('[data-contact-status]')).toHaveText('Please enter a valid email address.');
});
