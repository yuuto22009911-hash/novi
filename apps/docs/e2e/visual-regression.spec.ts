import { expect, test } from '@playwright/test'
import { DEMO_SLUGS } from '../demos/meta'
import { THEME_NAMES } from '../lib/theme-registry'

/**
 * 視覚回帰（raster T-08 / T-36 / tactile T-43 / AC-05-3）。
 *
 * テーマを追加したときに既存テーマが壊れていないことを保証する。
 * 単体でスナップショット基盤を別に作るより、docs のデモをそのまま対象にする方が
 * 保守対象が1つで済み、テーマ切替の見た目も同時に守れる。
 *
 * **基準画像は判定するのと同じ Linux で撮る。** 手元（macOS）で撮ると環境差のぶん
 * 許容差を緩めることになり、緩めた検査は本物の変化も見逃す（STATUS #29 / #30）。
 * 更新は Actions の「視覚回帰の基準を更新」ワークフローで行う。
 */

const SCHEMES = ['light', 'dark'] as const

for (const theme of THEME_NAMES) {
  for (const scheme of SCHEMES) {
    test.describe(`見た目 ${theme} (${scheme})`, () => {
      for (const slug of DEMO_SLUGS) {
        test(`${slug}`, async ({ page }) => {
          await page.goto(`/docs/components/${slug}/`)

          if (theme !== 'raster') {
            await page.getByLabel('テーマ').selectOption(theme)
          }
          if (scheme === 'dark') {
            await page.getByRole('button', { name: 'ダーク' }).click()
          }

          const preview = page.locator('[data-testid="preview"]')
          await expect(preview).toBeVisible()

          // アニメーションの途中を撮らない
          await page.waitForTimeout(150)

          // raster の基準名は据え置く。テーマ名を足すと既存 42 枚が全部差し替えになり、
          // 本当に変わったのかリネームなのかが差分から読めなくなる
          const name =
            theme === 'raster' ? `${slug}-${scheme}.png` : `${theme}-${slug}-${scheme}.png`
          await expect(preview).toHaveScreenshot(name, {
            animations: 'disabled',
            maxDiffPixelRatio: 0.01,
            // 既定の 0.2 では primary を別の色に差し替えても「差分 0 ピクセル」と判定される。
            // ADR-R8（角丸 0→12px・hue 転回・影の追加）が基準を1枚も更新せずに通っていたのは
            // この緩さが原因で、色の改定を検出できない視覚回帰は目的を果たしていない。
            // 0.05 は文字のアンチエイリアスのゆらぎは吸収しつつ、面の色の変化は捉える
            threshold: 0.05,
          })
        })
      }
    })
  }
}
