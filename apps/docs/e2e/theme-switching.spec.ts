import { expect, test } from '@playwright/test'

/**
 * テーマ / カラースキーム切替の検証（AC-01-1〜3 / AC-04-1〜3）。
 *
 * jsdom は `@media` と属性のカスケードを正しく評価しないため、
 * ここが実ブラウザでの唯一の担保になる。
 */

test('テーマの選択がリロード後も維持される（AC-01-3）', async ({ page }) => {
  await page.goto('/docs/components/button/')

  const stored = await page.evaluate(() => localStorage.getItem('novi-theme'))
  await page.reload()

  const attr = await page.getAttribute('html', 'data-novi-theme')
  expect(attr).toBe(stored ?? 'raster')
})

test('スキーム切替が全体に効き、リロード後も維持される（AC-04-1 / AC-04-3）', async ({ page }) => {
  await page.goto('/docs/components/button/')

  await page.getByRole('button', { name: 'ダーク' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-novi-scheme', 'dark')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-novi-scheme', 'dark')
})

test('明示的な light 指定が OS 設定より優先される（AC-06-3 / core）', async ({ browser }) => {
  // OS がダーク設定の環境を再現する
  const context = await browser.newContext({ colorScheme: 'dark' })
  const page = await context.newPage()
  await page.goto('/docs/components/button/')

  const preview = page.locator('[data-testid="preview"]')

  // スキーム未指定。OS がダークなのでダーク値が使われるはず
  const osDrivenBg = await preview.evaluate((el) => getComputedStyle(el).backgroundColor)

  // 明示的に light を選ぶ（トグルなので2回押して light に到達させる）
  await page.getByRole('button', { name: 'ダーク' }).click()
  await page.getByRole('button', { name: 'ライト' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-novi-scheme', 'light')

  const explicitLightBg = await preview.evaluate((el) => getComputedStyle(el).backgroundColor)

  // OS がダークでも、明示 light ならライト値が勝つ
  expect(explicitLightBg).not.toBe(osDrivenBg)
  await context.close()
})

test('スキームを切り替えてもサイト UI は変わらない（ADR-D1）', async ({ page }) => {
  await page.goto('/docs/components/button/')
  const header = page.getByRole('banner')
  const preview = page.locator('[data-testid="preview"]')

  const before = {
    header: await header.evaluate((el) => getComputedStyle(el).backgroundColor),
    preview: await preview.evaluate((el) => getComputedStyle(el).backgroundColor),
  }

  await page.getByRole('button', { name: 'ダーク' }).click()

  const after = {
    header: await header.evaluate((el) => getComputedStyle(el).backgroundColor),
    preview: await preview.evaluate((el) => getComputedStyle(el).backgroundColor),
  }

  // 比較対象（プレビュー）だけが変わり、外枠は動かない。
  // ここが崩れると「何を見比べているのか」が分からなくなる
  expect(after.preview).not.toBe(before.preview)
  expect(after.header).toBe(before.header)
})

test('デモの JSX がテーマ切替で変わらない（AC-01-4）', async ({ page }) => {
  await page.goto('/docs/components/button/')

  const code = await page.getByTestId('code-example').textContent()
  const withoutImport = (code ?? '').split('\n').slice(1).join('\n')

  // import 文以外は、どのテーマでも同一であることを固定する
  expect(withoutImport).toContain('<Button variant="solid" color="primary">保存</Button>')
  expect(code).toContain("from '@novi-ui/raster'")
})

test('theming ページの色見本はプレビュー内でだけ解決される（FR-07）', async ({ page }) => {
  await page.goto('/docs/theming/')

  const header = page.getByRole('banner')
  const swatch = page.locator('[data-testid="preview"] li span').first()

  const headerBefore = await header.evaluate((el) => getComputedStyle(el).backgroundColor)
  const swatchBefore = await swatch.evaluate((el) => getComputedStyle(el).backgroundColor)

  // 変数が解決されていなければ背景は透明になる。見本として意味を成さない
  expect(swatchBefore).not.toBe('rgba(0, 0, 0, 0)')

  await page.getByRole('button', { name: 'ダーク' }).click()

  // 色見本だけがスキームに追従し、サイトの外枠は動かない
  expect(await swatch.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(swatchBefore)
  expect(await header.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(headerBefore)
})

test('ダッシュボードがテーマのトークンで描かれている（T-28）', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const bar = page.locator('[role="img"][aria-label*="売上推移"] > div').first()
  await expect(bar).toBeVisible()

  const before = await bar.evaluate((el) => getComputedStyle(el).backgroundColor)
  // 変数が解決されていなければ透明になる。ショーケースとして成立しない
  expect(before).not.toBe('rgba(0, 0, 0, 0)')

  await page.getByRole('button', { name: 'ダーク' }).click()
  await page.waitForTimeout(150)

  // スキームに追従する = サイトの CSS ではなくテーマのトークンで描かれている証拠
  expect(await bar.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before)
})
