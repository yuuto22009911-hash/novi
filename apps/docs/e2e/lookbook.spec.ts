import { expect, test } from '@playwright/test'

/**
 * 試着室（fitting-room.tsx）。染料を本物のコンポーネントに着せて見せる。
 *
 * 見本帳の一覧は IR の JSON だけで描くが、試着室はライブラリ本体を lazy に読む。
 * 読み込みが遅れても一覧が跳ねないこと、色の切替が両面（light / dark）に効くことを固定する。
 */
test('試着室が既定色で開き、染料を選ぶと両面が着替える', async ({ page }) => {
  await page.goto('/docs/lookbook/')

  const room = page.locator('#fitting-room')
  await expect(room).toBeVisible()
  // 既定は Raster の Ink
  const faces = room.locator('[data-novi-color]:has([data-slot="root"])')
  await expect(faces).toHaveCount(2)
  await expect(faces.first()).toHaveAttribute('data-novi-color', 'ink')
  await expect(room.getByRole('button', { name: 'Ink' })).toHaveAttribute('aria-pressed', 'true')

  await room.getByRole('button', { name: 'Brick' }).click()
  await expect(faces.first()).toHaveAttribute('data-novi-color', 'brick')
  await expect(faces.nth(1)).toHaveAttribute('data-novi-color', 'brick')
  // 相方も掛け替わる（Brick の相方は Ink）
  await expect(room.getByText('相方 Ink').first()).toBeVisible()
})

test('見本帳のカードから「着せる」で試着室の色が替わる', async ({ page }) => {
  await page.goto('/docs/lookbook/')
  await expect(page.locator('#fitting-room')).toBeVisible()

  await page.getByRole('button', { name: '着せる' }).nth(2).click()
  const worn = page.getByRole('button', { name: '着用中' })
  await expect(worn).toHaveCount(1)

  const faces = page.locator('#fitting-room [data-novi-color]:has([data-slot="root"])')
  const id = await faces.first().getAttribute('data-novi-color')
  expect(id).not.toBe('ink')
})

test('モデルを替えると試着室もそのモデルの既定色に着替える', async ({ page }) => {
  await page.goto('/docs/lookbook/')
  await expect(page.locator('#fitting-room')).toBeVisible()
  await page.getByLabel('テーマ').selectOption('tactile')

  const faces = page.locator('#fitting-room [data-novi-color]:has([data-slot="root"])')
  await expect(faces.first()).toHaveAttribute('data-novi-theme', 'tactile')
  await expect(faces.first()).toHaveAttribute('data-novi-color', 'indigo')
})
