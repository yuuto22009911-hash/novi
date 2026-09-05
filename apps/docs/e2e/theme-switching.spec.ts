import { expect, test } from '@playwright/test'
import { THEME_NAMES, themeRegistry } from '../lib/theme-registry'

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

test('OS がダークでもサイトとプレビューはライトで始まり、ダークは明示的に選ぶ', async ({
  browser,
}) => {
  // OS がダーク設定の環境を再現する
  const context = await browser.newContext({ colorScheme: 'dark' })
  const page = await context.newPage()
  await page.goto('/docs/components/button/')

  // サイト UI は OS に追従しない（2026-09-05 決定）。プレビューも light で始まる
  await expect(page.locator('html')).toHaveAttribute('data-novi-scheme', 'light')
  const body = page.locator('body')
  const preview = page.locator('[data-testid="preview"]')
  const lightBody = await body.evaluate((el) => getComputedStyle(el).backgroundColor)
  const lightPreview = await preview.evaluate((el) => getComputedStyle(el).backgroundColor)

  // ダークはヘッダーで明示的に選んだときだけ。効くのはプレビューで、サイト UI は変わらない
  await page.getByRole('button', { name: 'ダーク' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-novi-scheme', 'dark')
  expect(await preview.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
    lightPreview,
  )
  expect(await body.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(lightBody)
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

  const bodyOf = async () => {
    // 例が増えてコード例は複数ある。主デモ（先頭）で見る
    const code = await page.getByTestId('code-example').first().textContent()
    return { code: code ?? '', body: (code ?? '').split('\n').slice(1).join('\n') }
  }

  const first = await bodyOf()
  expect(first.body).toContain('<Button variant="solid" color="primary">保存</Button>')
  expect(first.code).toContain(`from '${themeRegistry.raster.pkg}'`)

  // **掛け替わるのは import の1行だけ**。ここが崩れると「テーマを替えても
  // コードは同じ」という約束が黙って破れる。既定の raster だけ見ていては分からない
  for (const theme of THEME_NAMES) {
    await page.getByLabel('テーマ').selectOption(theme)
    const current = await bodyOf()
    expect(current.code, `${theme} の import`).toContain(`from '${themeRegistry[theme].pkg}'`)
    expect(current.body, `${theme} の本体`).toBe(first.body)
  }
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
  // ダッシュボードは近づくまで組み立てられない（`LazyMount`）
  await page.getByRole('heading', { name: '組み上げるとこうなります' }).scrollIntoViewIfNeeded()

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

test('ヘッダーのナビが現在地を示す', async ({ page }) => {
  const banner = () => page.getByRole('banner')

  // コンポーネント配下では、リンク先（button）以外のページでも「コンポーネント」が現在地
  await page.goto('/docs/components/select/')
  const components = banner().getByRole('link', { name: 'コンポーネント' })
  await expect(components).toHaveAttribute('aria-current', 'page')

  // 現在地とそれ以外で文字色が実際に変わっている（クラスではなく計算結果を見る）
  const currentColor = await components.evaluate((el) => getComputedStyle(el).color)
  const otherColor = await banner()
    .getByRole('link', { name: 'はじめに' })
    .evaluate((el) => getComputedStyle(el).color)
  expect(currentColor).not.toBe(otherColor)

  // デザイン言語のページは「テーマの調整」の節
  await page.goto('/docs/themes/raster/')
  await expect(banner().getByRole('link', { name: 'テーマの調整' })).toHaveAttribute(
    'aria-current',
    'page',
  )

  // トップではどれも現在地ではない
  await page.goto('/')
  for (const name of ['はじめに', 'コンポーネント', 'テーマの調整']) {
    await expect(banner().getByRole('link', { name })).not.toHaveAttribute('aria-current', 'page')
  }
})

test('Lookbook が選択中のモデルの見本帳に掛け替わる', async ({ page }) => {
  await page.goto('/docs/lookbook/')

  // 既定は Raster の Print Inks。既定色 Ink のカードがある
  await expect(page.getByRole('heading', { name: /Print Inks/ })).toBeVisible()
  await expect(page.getByText('Ink', { exact: true })).toBeVisible()

  await page.getByLabel('テーマ').selectOption('tactile')

  // セットごと掛け替わり、Print Inks 側は残らない
  await expect(page.getByRole('heading', { name: /Textile Dyes/ })).toBeVisible()
  await expect(page.getByText('Indigo', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Print Inks/ })).toBeHidden()
  await expect(page.getByText('Ink', { exact: true })).toBeHidden()
})
