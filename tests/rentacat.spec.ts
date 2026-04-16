import { test, expect } from '@playwright/test';

var baseURL = 'http://localhost:8080';

// Test Fixture: navigate to site and reset all cookies so no cats are rented
test.beforeEach(async ({ page }) => {
  await page.goto(baseURL + '/');
  await page.evaluate(() => {
    document.cookie = "1=false";
    document.cookie = "2=false";
    document.cookie = "3=false";
  });
});

test('TEST-CONNECTION', async ({ page }) => {
  await page.goto(baseURL);
});

// TEST-1-RESET: Given all cats are rented, resetting returns all cats to available
test('TEST-1-RESET', async ({ page }) => {
  await page.evaluate(() => {
    document.cookie = "1=true";
    document.cookie = "2=true";
    document.cookie = "3=true";
  });
  await page.getByRole('link', { name: 'Reset' }).click();
  await expect(page.getByTestId('cat-id1')).toHaveText('ID 1. Jennyanydots');
  await expect(page.getByTestId('cat-id2')).toHaveText('ID 2. Old Deuteronomy');
  await expect(page.getByTestId('cat-id3')).toHaveText('ID 3. Mistoffelees');
});

// TEST-2-CATALOG: The second image in the catalog is cat2.jpg
test('TEST-2-CATALOG', async ({ page }) => {
  await page.getByRole('link', { name: 'Catalog' }).click();
  await expect(page.locator('ol img').nth(1)).toHaveAttribute('src', '/images/cat2.jpg');
});

// TEST-3-LISTING: Exactly 3 cats in the listing, third is Mistoffelees
test('TEST-3-LISTING', async ({ page }) => {
  await page.getByRole('link', { name: 'Catalog' }).click();
  await expect(page.locator('#listing li')).toHaveCount(3);
  await expect(page.locator('#listing li').nth(2)).toHaveText('ID 3. Mistoffelees');
});

// TEST-4-RENT-A-CAT: Rent and Return buttons exist on the Rent-A-Cat page
test('TEST-4-RENT-A-CAT', async ({ page }) => {
  await page.getByRole('link', { name: 'Rent-A-Cat' }).click();
  await expect(page.getByRole('button', { name: 'Rent' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Return' })).toBeVisible();
});

// TEST-5-RENT: Renting cat ID 1 marks it as rented and shows Success!
test('TEST-5-RENT', async ({ page }) => {
  await page.getByRole('link', { name: 'Rent-A-Cat' }).click();
  await page.getByTestId('rentID').fill('1');
  await page.getByRole('button', { name: 'Rent' }).click();
  await expect(page.locator('#listing li').nth(0)).toHaveText('Rented out');
  await expect(page.locator('#listing li').nth(1)).toHaveText('ID 2. Old Deuteronomy');
  await expect(page.locator('#listing li').nth(2)).toHaveText('ID 3. Mistoffelees');
  await expect(page.getByTestId('rentResult')).toHaveText('Success!');
});

// TEST-6-RETURN: Returning cat ID 2 (when 2 and 3 are rented) marks it available and shows Success!
test('TEST-6-RETURN', async ({ page }) => {
  await page.evaluate(() => {
    document.cookie = "2=true";
    document.cookie = "3=true";
  });
  await page.getByRole('link', { name: 'Rent-A-Cat' }).click();
  await page.getByTestId('returnID').fill('2');
  await page.getByRole('button', { name: 'Return' }).click();
  await expect(page.getByTestId('cat-id1')).toHaveText('ID 1. Jennyanydots');
  await expect(page.getByTestId('cat-id2')).toHaveText('ID 2. Old Deuteronomy');
  await expect(page.getByTestId('cat-id3')).toHaveText('Rented out');
  await expect(page.getByTestId('returnResult')).toHaveText('Success!');
});

// TEST-7-FEED-A-CAT: Feed button exists on the Feed-A-Cat page
test('TEST-7-FEED-A-CAT', async ({ page }) => {
  await page.getByRole('link', { name: 'Feed-A-Cat' }).click();
  await expect(page.getByRole('button', { name: 'Feed' })).toBeVisible();
});

// TEST-8-FEED: Feeding 6 catnips to 3 cats shows "Nom, nom, nom." (7s delay)
test('TEST-8-FEED', async ({ page }) => {
  await page.getByRole('link', { name: 'Feed-A-Cat' }).click();
  await page.getByTestId('catnips').fill('6');
  await page.getByRole('button', { name: 'Feed' }).click();
  await expect(page.getByTestId('feedResult')).toHaveText('Nom, nom, nom.', { timeout: 10000 });
});

// TEST-9-GREET-A-CAT: 3 available cats produce 3 Meow!s on the Greet-A-Cat page
test('TEST-9-GREET-A-CAT', async ({ page }) => {
  await page.getByRole('link', { name: 'Greet-A-Cat' }).click();
  await expect(page.getByTestId('greeting')).toHaveText('Meow!Meow!Meow!');
});

// TEST-10-GREET-A-CAT-WITH-NAME: Greeting Jennyanydots by name shows "Meow! from Jennyanydots."
test('TEST-10-GREET-A-CAT-WITH-NAME', async ({ page }) => {
  await page.goto(baseURL + '/greet-a-cat/Jennyanydots');
  await expect(page.getByTestId('greeting')).toHaveText('Meow! from Jennyanydots.');
});
