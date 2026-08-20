import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { DEMO_SLUGS } from '../demos/meta'

/**
 * 全コンポーネント × light/dark の axe 検査（raster T-35 / AC-04-1）。
 *
 * jsdom では不十分。axe はレイアウトと計算済みスタイルを見るため、
 * コントラスト違反や重なりによる問題は実ブラウザでないと検出できない。
 */

const SCHEMES = ['light', 'dark'] as const

async function setScheme(page: import('@playwright/test').Page, scheme: string) {
  await page.evaluate((s) => {
    document.documentElement.setAttribute('data-novi-scheme', s)
  }, scheme)
}

for (const scheme of SCHEMES) {
  test.describe(`axe (${scheme})`, () => {
    for (const slug of DEMO_SLUGS) {
      test(`${slug}: violations 0`, async ({ page }) => {
        await page.goto(`/docs/components/${slug}/`)
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

test.describe('サイト全体', () => {
  for (const path of ['/', '/docs/getting-started/']) {
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
