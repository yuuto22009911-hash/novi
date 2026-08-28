import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { DEMO_SLUGS } from '../demos/meta'
import { THEME_NAMES } from '../lib/theme-registry'

/**
 * 全コンポーネント × 全テーマ × light/dark の axe 検査（raster T-35 / AC-04-1）。
 *
 * jsdom では不十分。axe はレイアウトと計算済みスタイルを見るため、
 * コントラスト違反や重なりによる問題は実ブラウザでないと検出できない。
 *
 * テーマを回すのは、**同じ DOM でも配色と構造がテーマごとに違う**ため。
 * Flatlay は overlay をインフローに置き換えているので、重なりの前提が他の2本と異なる。
 * 既定テーマだけ見ていると、その差分がまるごと検査されない（flatlay T-31）。
 */

const SCHEMES = ['light', 'dark'] as const

async function setScheme(page: import('@playwright/test').Page, scheme: string) {
  await page.evaluate((s) => {
    document.documentElement.setAttribute('data-novi-scheme', s)
  }, scheme)
}

for (const theme of THEME_NAMES) {
  for (const scheme of SCHEMES) {
    test.describe(`axe ${theme} (${scheme})`, () => {
      for (const slug of DEMO_SLUGS) {
        test(`${slug}: violations 0`, async ({ page }) => {
          await page.goto(`/docs/components/${slug}/`)
          if (theme !== 'raster') {
            await page.getByLabel('テーマ').selectOption(theme)
          }
          await setScheme(page, scheme)
          await page.waitForSelector('[data-testid="preview"]')

          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze()

          const summary = results.violations.map(
            (v) => `${v.id}: ${v.description} (${v.nodes.length}件)`,
          )
          expect(summary, summary.join('\n')).toEqual([])
        })
      }
    })
  }
}

test.describe('サイト全体', () => {
  for (const path of [
    '/',
    '/docs/getting-started/',
    '/docs/theming/',
    '/docs/themes/raster/',
    '/docs/themes/tactile/',
    '/docs/themes/flatlay/',
    '/docs/lookbook/',
  ]) {
    test(`${path}: violations 0`, async ({ page }) => {
      await page.goto(path)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()

      const summary = results.violations.map((v) => `${v.id}: ${v.description}`)
      expect(summary, summary.join('\n')).toEqual([])
    })
  }
})
