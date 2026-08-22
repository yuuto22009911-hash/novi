import { expect, type Page, test } from '@playwright/test'

/**
 * safe-area の実挙動（tactile AC-10-1 / AC-10-3 / FR-13）。
 *
 * **これまで safe-area が 0 の環境でしか検査できていなかった。** 0 の環境では
 * `env()` の第2引数が効くだけで、加算そのものは一度も実行されない。
 * CDP の `Emulation.setSafeAreaInsetsOverride` で inset を注入すると、
 * 実機と同じ経路（`env()` が非 0 を返す）で検査できる。
 *
 * T-50 の実機確認で iOS Safari のブラウザモードでは inset が常に 0 と分かったため、
 * **34px が入る環境（ホーム画面に追加した standalone・Android の一部）と
 * 横向き（ノッチが左右に来る）は、ここでしか再現できない**。
 */

/** 縦向き。ノッチ 47px / ホームインジケータ 34px。 */
const PORTRAIT = { top: 47, left: 0, bottom: 34, right: 0 }

/** 横向き。ノッチが左右に回り込む。 */
const LANDSCAPE = { top: 0, left: 59, bottom: 21, right: 59 }

async function overrideInsets(page: Page, insets: typeof PORTRAIT) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets })
}

async function openTactile(page: Page, slug: string) {
  await page.goto(`/docs/components/${slug}/`)
  await page.getByLabel('テーマ').selectOption('tactile')
  const preview = page.locator('[data-testid="preview"][data-novi-theme="tactile"]')
  await expect(preview).toBeVisible()
  return preview
}

/** アニメーションの途中で測ると、まだ画面端に着いていない。 */
async function settled(locator: ReturnType<Page['locator']>) {
  await locator.waitFor()
  await locator.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)))
}

/**
 * 面の中の「文字と操作要素」が収まっている水平範囲を返す。
 *
 * 面そのものは画面幅いっぱいで正しい（背景がノッチの下まで続く）。
 * 隠れて困るのは中身の方なので、装飾のための div は見ない。
 */
function contentBounds(el: Element): { left: number; right: number; worst: string } | null {
  const kids = [
    ...el.querySelectorAll(
      'button, a[href], [role="option"], [role="menuitem"], p, h1, h2, h3, span',
    ),
  ].filter((k) => k.getBoundingClientRect().width > 0 && (k.textContent ?? '').trim() !== '')
  if (kids.length === 0) return null

  const rects = kids.map((k) => ({ el: k, rect: k.getBoundingClientRect() }))
  const left = Math.min(...rects.map((r) => r.rect.left))
  const right = Math.max(...rects.map((r) => r.rect.right))
  const worst = rects.find((r) => r.rect.left === left)
  return {
    left,
    right,
    worst: `${worst?.el.tagName}[${worst?.el.getAttribute('data-slot') ?? '?'}]`,
  }
}

test.describe('縦向き（ホームインジケータ 34px）', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('ボトムシートのボタンがホームインジケータに隠れない（AC-10-1）', async ({ page }) => {
    await overrideInsets(page, PORTRAIT)
    const preview = await openTactile(page, 'modal')
    await preview.getByRole('button').first().click()

    const panel = page.locator('[data-slot="panel"]').last()
    await settled(panel)

    const gap = await panel.evaluate((el) => {
      const buttons = [...el.querySelectorAll('button')]
      const last = buttons[buttons.length - 1]
      if (last === undefined) return null
      return el.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom
    })

    expect(gap, 'フッター最下のボタンとシート下端の距離').toBeGreaterThanOrEqual(PORTRAIT.bottom)
  })
})

test.describe('横向き（ノッチが左右 59px）', () => {
  test.use({ viewport: { width: 812, height: 375 } })

  const SAFE_LEFT = LANDSCAPE.left
  const SAFE_RIGHT = 812 - LANDSCAPE.right

  test('ボトムシートの中身がノッチに潜らない（FR-13）', async ({ page }) => {
    await overrideInsets(page, LANDSCAPE)
    const preview = await openTactile(page, 'modal')
    await preview.getByRole('button').first().click()

    const panel = page.locator('[data-slot="panel"]').last()
    await settled(panel)

    const bounds = await panel.evaluate(contentBounds)
    expect(bounds).not.toBeNull()
    expect(bounds?.left, `最も左の要素 ${bounds?.worst}`).toBeGreaterThanOrEqual(SAFE_LEFT)
    expect(bounds?.right).toBeLessThanOrEqual(SAFE_RIGHT)
  })

  test('下端シート（Select）の項目がノッチに潜らない（FR-13）', async ({ page }) => {
    await overrideInsets(page, LANDSCAPE)
    const preview = await openTactile(page, 'select')
    await preview.getByRole('button').first().click()

    const popover = page.locator('[data-slot="popover"]').last()
    await settled(popover)

    const bounds = await popover.evaluate(contentBounds)
    expect(bounds).not.toBeNull()
    expect(bounds?.left, `最も左の要素 ${bounds?.worst}`).toBeGreaterThanOrEqual(SAFE_LEFT)
    expect(bounds?.right).toBeLessThanOrEqual(SAFE_RIGHT)
  })

  test('上端の Toast がノッチに潜らない（FR-13）', async ({ page }) => {
    await overrideInsets(page, LANDSCAPE)
    const preview = await openTactile(page, 'toast')
    await preview.getByRole('button').first().click()

    const region = page.locator('[data-slot="region"]')
    await settled(region)

    const bounds = await region.evaluate(contentBounds)
    expect(bounds).not.toBeNull()
    expect(bounds?.left, `最も左の要素 ${bounds?.worst}`).toBeGreaterThanOrEqual(SAFE_LEFT)
    expect(bounds?.right).toBeLessThanOrEqual(SAFE_RIGHT)
  })
})
