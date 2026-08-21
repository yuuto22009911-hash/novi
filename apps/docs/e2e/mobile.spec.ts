import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * モバイル（375px）のレイアウト検査。
 *
 * ここで固定しているのは、実際に壊れていたもの:
 * - ヘッダーのリンクが1文字ずつ縦に折れていた（固定高に3要素を押し込んでいた）
 * - トップのデモカードが画面右に見切れていた（grid の子に min-w-0 が無かった）
 * - コンポーネント一覧がモバイルに存在しなかった（hidden lg:block のみ）
 * - タップターゲットが 32px しかなかった
 */
// devices['iPhone 13'] を spread しない。プリセットは defaultBrowserType: 'webkit' を含み、
// CI に無いブラウザで起動しようとして落ちる。検査対象はレイアウトなので chromium の
// モバイルエミュレーション（タッチ + 375px）で足りる
test.use({
  viewport: { width: 375, height: 812 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
})

const PAGES = ['/', '/docs/components/button/', '/docs/theming/', '/docs/getting-started/']

for (const path of PAGES) {
  test(`${path}: 横スクロールが発生しない`, async ({ page }) => {
    await page.goto(path)
    // デモの遅延チャンクが載った後の最終状態で測る
    await page.waitForLoadState('networkidle')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('ヘッダーのリンクが1行のまま保たれ、タップターゲットが 44px 以上ある', async ({ page }) => {
  await page.goto('/')

  for (const name of ['はじめに', 'コンポーネント', 'テーマの調整']) {
    const box = await page.getByRole('banner').getByRole('link', { name }).boundingBox()
    if (box === null) throw new Error(`${name} が見つかりません`)
    // 縦書きに潰れていた状態では幅 20〜34px / 高さ 60〜80px だった
    expect(box.width, `${name} の幅`).toBeGreaterThan(40)
    expect(box.height, `${name} の高さ`).toBeLessThanOrEqual(52)
    expect(box.height, `${name} のタップ高`).toBeGreaterThanOrEqual(44)
  }

  for (const locator of [
    page.getByLabel('テーマ'),
    page.getByRole('banner').getByRole('button', { name: 'ダーク' }),
  ]) {
    const box = await locator.boundingBox()
    if (box === null) throw new Error('ヘッダーの操作が見つかりません')
    expect(box.height).toBeGreaterThanOrEqual(44)
  }
})

test('トップのデモが画面内に収まる', async ({ page }) => {
  await page.goto('/')
  const preview = page.locator('[data-testid="preview"]').first()
  await expect(preview).toBeVisible()

  const box = await preview.boundingBox()
  if (box === null) throw new Error('preview が見つかりません')
  expect(box.x + box.width).toBeLessThanOrEqual(375)
})

test('コンポーネント一覧がモバイルでも辿れる', async ({ page }) => {
  await page.goto('/docs/components/button/')

  // サイドバーは出ていない
  await expect(page.locator('nav[aria-label="コンポーネント"]').first()).toBeHidden()

  // 折りたたみを開くと一覧が現れ、遷移できる
  const summary = page.getByText('コンポーネント一覧')
  await expect(summary).toBeVisible()
  await summary.click()

  const link = page.getByRole('link', { name: 'Select', exact: true })
  await expect(link).toBeVisible()
  await link.click()
  await expect(page).toHaveURL(/\/docs\/components\/select\/$/)
})

test('モバイルの axe: violations 0', async ({ page }) => {
  await page.goto('/docs/components/button/')
  // モバイルナビを開いた状態も含めて検査する
  await page.getByText('コンポーネント一覧').click()

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()

  const summary = results.violations.map((v) => `${v.id}: ${v.description}`)
  expect(summary, summary.join('\n')).toEqual([])
})

test('ダッシュボードの指標が欠けずに読める', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // 375px で2列にすると内容幅が 105px を切り、金額が必ず途中で切れていた。
  // 数値は折り返せないので、欠けた時点で「読めない」= 見せる意味が無くなる
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll('span')]
      .filter((s) => /^[¥0-9]/.test(s.textContent ?? '') && s.scrollWidth > 0)
      .filter((s) => s.scrollWidth > s.clientWidth + 1)
      .map((s) => s.textContent),
  )
  expect(clipped, `欠けている数値: ${clipped.join(', ')}`).toEqual([])
})
