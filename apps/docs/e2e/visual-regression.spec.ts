import { expect, test } from '@playwright/test'
import { DEMO_SLUGS } from '../demos/meta'

/**
 * 視覚回帰（raster T-08 / T-36 / AC-05-3）。
 *
 * テーマを追加したときに既存テーマが壊れていないことを保証する。
 * 単体でスナップショット基盤を別に作るより、docs のデモをそのまま対象にする方が
 * 保守対象が1つで済み、テーマ切替の見た目も同時に守れる。
 */

const SCHEMES = ['light', 'dark'] as const

for (const scheme of SCHEMES) {
  test.describe(`見た目 (${scheme})`, () => {
    for (const slug of DEMO_SLUGS) {
      test(`${slug}`, async ({ page }) => {
        await page.goto(`/docs/components/${slug}/`)

        if (scheme === 'dark') {
          await page.getByRole('button', { name: 'ダーク' }).click()
        }

        const preview = page.locator('[data-testid="preview"]')
        await expect(preview).toBeVisible()

        // アニメーションの途中を撮らない
        await page.waitForTimeout(150)

        await expect(preview).toHaveScreenshot(`${slug}-${scheme}.png`, {
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
