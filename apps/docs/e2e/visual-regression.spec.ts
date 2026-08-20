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
        })
      })
    }
  })
}
