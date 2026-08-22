import { expect, test } from '@playwright/test'
import { DEMO_SLUGS } from '../demos/meta'

/**
 * 「指定したスタイルが実際に効いているか」の検証。
 *
 * **クラスが付いていることと、そのクラスが描画に届くことは別**。
 * tactile T-50（実機確認）で、Input / TextArea の既定 variant の境界線が
 * iOS Safari 上で完全に消えていた。原因は `--novi-shadow-none: none` で、
 * ring も box-shadow に合成されるため `box-shadow: <ring>, none` という
 * 不正値になり、宣言ごと破棄されていた。
 *
 * 単体テストはクラス文字列しか見ないため通り、視覚回帰も基準画像が
 * 同じ状態で撮られていたため差分ゼロで通っていた（STATUS #29 と同型）。
 * 合成結果を計算するのはブラウザだけなので、ここが唯一の担保になる。
 */

test.use({ viewport: { width: 375, height: 812 } })

/** リングを宣言しながら box-shadow が描画されていない要素を集める。 */
function ringlessElements(root: Element): string[] {
  return [...root.querySelectorAll('*')]
    .filter((el) => /ring-(\d|\[)/.test(el.getAttribute('class') ?? ''))
    .filter((el) => getComputedStyle(el).boxShadow === 'none')
    .map((el) => `${el.tagName.toLowerCase()}[${el.getAttribute('data-slot') ?? '?'}]`)
}

for (const theme of ['raster', 'tactile'] as const) {
  test(`${theme}: ring を宣言した要素の box-shadow が破棄されていない`, async ({ page }) => {
    const broken: string[] = []

    for (const slug of DEMO_SLUGS) {
      await page.goto(`/docs/components/${slug}/`)
      await page.getByLabel('テーマ').selectOption(theme)
      // 切替の前後で両テーマの preview が一瞬ならぶ。テーマで絞らないと取り違える
      const preview = page.locator(`[data-testid="preview"][data-novi-theme="${theme}"]`)
      await expect(preview).toBeVisible()

      const found = await preview.evaluate(ringlessElements)
      broken.push(...found.map((entry) => `${slug}: ${entry}`))
    }

    expect(broken, 'ring が box-shadow の合成で消えている').toEqual([])
  })
}
