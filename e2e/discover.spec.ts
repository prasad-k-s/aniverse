import { expect, test } from '@playwright/test'

test('home page shows trending anime and opens a detail page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Trending now' })).toBeVisible()

  // Open the first anime from the "Trending now" row
  const firstCard = page
    .getByRole('region', { name: 'Trending now' })
    .getByRole('link')
    .filter({ hasNot: page.getByText('See all') })
    .first()
  await firstCard.click()

  await expect(page).toHaveURL(/\/anime\/\d+/)
  await expect(page.getByRole('heading', { name: 'Synopsis' })).toBeVisible()
  await expect(page.getByRole('link', { name: /sign in to track/i })).toBeVisible()
})

test('search finds an anime by title and keeps the query in the URL', async ({ page }) => {
  await page.goto('/search')

  await page.getByRole('searchbox', { name: 'Search anime' }).fill('Frieren')

  await expect(page).toHaveURL(/q=Frieren/)
  await expect(page.getByRole('link', { name: /frieren/i }).first()).toBeVisible()
})

test('protected pages redirect to the login page', async ({ page }) => {
  await page.goto('/watchlist')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
})
