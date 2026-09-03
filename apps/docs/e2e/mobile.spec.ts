import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { THEME_NAMES } from '../lib/theme-registry'

/**
 * ホームのダッシュボードは近づくまで組み立てられない（`LazyDemo`）。
 * 実利用者と同じく、そこまで降りてから触る。
 */
async function goToHomeDashboard(page: Page) {
  await page.goto('/')
  await page.getByRole('heading', { name: '組み上げるとこうなります' }).scrollIntoViewIfNeeded()
  await expect(page.getByRole('tab', { name: '概要' })).toBeVisible()
}

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

const PAGES = [
  '/',
  '/docs/components/button/',
  '/docs/theming/',
  '/docs/getting-started/',
  '/docs/why/',
  '/docs/lookbook/',
  // 4列の比較表と8色の一覧を持つ。375px で表が枠を破っていないか
  '/docs/themes/flatlay/',
]

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

/**
 * 展開したまま横に溢れない（全テーマ）。
 *
 * 375px は展開が最も苦しい幅で、テーマごとに逃がし方が違う。
 * Raster は隣に浮き、Tactile は画面下端のシートになり、**Flatlay は
 * その場を押し下げる**。浮くものは画面外に出れば済むが、フローに入るものは
 * 親の幅を超えるとページごと横スクロールする。既定テーマだけ見ていては
 * この差がまるごと検査されない。
 */
for (const theme of THEME_NAMES) {
  test(`${theme}: 展開しても横スクロールが発生しない`, async ({ page }) => {
    await page.goto('/docs/components/select/')
    await page.getByLabel('テーマ').selectOption(theme)

    const preview = page.locator('[data-testid="preview"]')
    await preview.getByRole('button').first().click()
    // 一覧の在り処はテーマで違う（raster / tactile は body へポータル、
    // flatlay はプレビュー内のフロー）。ページ全体から探す
    await expect(page.locator('[data-slot="listbox"]')).toBeVisible()

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
  // デモは近づくまで組み立てない（LazyDemo）。見出しまでスクロールして呼び出す
  await page.getByRole('heading', { name: '右上でテーマを切り替える' }).scrollIntoViewIfNeeded()
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

/**
 * ダッシュボードは3つのタブすべてを見る。
 *
 * 既定タブしか見ないと、他のタブが壊れたまま気づけない。
 * 実際 375px では「売上」タブの平均単価が、320px では顧客タブの数値が欠けていた。
 */
for (const tab of ['概要', '売上', '顧客']) {
  test(`ダッシュボード（${tab}）の値が欠けずに読める`, async ({ page }) => {
    await goToHomeDashboard(page)
    await page.getByRole('tab', { name: tab }).click()

    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll('span, dd, td')]
        // sr-only は幅 1px に潰す実装なので、はみ出すのが正しい
        .filter((e) => !e.classList.contains('sr-only') && e.closest('.sr-only') === null)
        .filter((e) => e.children.length === 0 && (e.textContent ?? '').trim() !== '')
        .filter((e) => e.scrollWidth > e.clientWidth + 1)
        .map((e) => e.textContent?.trim()),
    )
    expect(clipped, `欠けている値: ${clipped.join(', ')}`).toEqual([])
  })
}

test('ダッシュボードの一覧が横スクロールなしで読める', async ({ page }) => {
  await goToHomeDashboard(page)

  // 表のままだと 412px の中身が 211px の枠に押し込まれ、状態バッジが切れていた。
  // 狭い画面では1件1ブロックに組み替わり、表は出ない
  await expect(page.locator('table')).toBeHidden()

  const list = page.locator('ul[aria-label="最近の注文"]')
  await expect(list).toBeVisible()
  await expect(list.locator('li')).toHaveCount(5)

  // 各項目のラベルと値がすべて画面内に収まっている
  const overflowing = await list.evaluate(
    (ul) =>
      [...ul.querySelectorAll('dd, dt')].filter(
        (e) => e.getBoundingClientRect().right > window.innerWidth,
      ).length,
  )
  expect(overflowing).toBe(0)
})
