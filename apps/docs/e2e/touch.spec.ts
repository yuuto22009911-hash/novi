import { expect, test } from '@playwright/test'
import { DEMO_SLUGS } from '../demos/meta'

/**
 * タッチ品質の実測（tactile T-44 / AC-01-2, AC-01-3, AC-10-1〜3）。
 *
 * **jsdom では測れないものだけをここで見る。** 擬似要素で広げた当たり判定は
 * 計算済みスタイルにしか現れず、要素の `getBoundingClientRect()` にも出ない。
 * 単体テストが見ているのは「クラスが付いているか」までで、
 * 実際に指が届くかはブラウザに聞くしかない。
 *
 * 対象は Tactile のみ。Raster は情報密度が価値で、AA の 24px 下限で正しい
 * （寸法はテーマの美学に属する・spec 06 の Open Questions 参照）。
 */

const TAP_MIN = 44
const INPUT_FONT_MIN = 16

test.use({
  // devices[] プリセットを spread しない。defaultBrowserType: 'webkit' を含み、
  // CI に無いブラウザで起動しようとして落ちる（STATUS #24）
  viewport: { width: 375, height: 812 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
})

/** Tactile に切り替えてデモを描画する。 */
async function openDemo(page: import('@playwright/test').Page, slug: string) {
  await page.goto(`/docs/components/${slug}/`)
  await page.getByLabel('テーマ').selectOption('tactile')
  await page.waitForLoadState('networkidle')
  const preview = page.locator('[data-testid="preview"]')
  await expect(preview).toBeVisible()
  return preview
}

/**
 * 実効タップ領域を測る。要素本体と `::before` の和を取る。
 *
 * `::before` は当たり判定を広げるためだけに使っており（styles/tap-target.ts）、
 * 背景を持たないので視覚には現れない。`getBoundingClientRect()` は
 * 擬似要素を含まないため、計算済みスタイルから寸法を読む必要がある。
 */
interface EffectiveSize {
  width: number
  height: number
  rect: { x: number; y: number; width: number; height: number }
}

function effectiveSize(el: Element): EffectiveSize {
  const rect = el.getBoundingClientRect()
  const before = getComputedStyle(el, '::before')
  const parse = (v: string) => (v.endsWith('px') ? Number.parseFloat(v) : 0)
  const hasBefore = before.content !== 'none' && before.position === 'absolute'
  return {
    width: Math.max(rect.width, hasBefore ? parse(before.width) : 0),
    height: Math.max(rect.height, hasBefore ? parse(before.height) : 0),
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
  }
}

for (const slug of DEMO_SLUGS) {
  test(`${slug}: 対話要素の実効タップ領域が ${TAP_MIN}px 以上（AC-01-2）`, async ({ page }) => {
    const preview = await openDemo(page, slug)

    // RAC は Switch / Checkbox / Radio の実体として視覚的に隠した `<input>` を置き、
    // 実際に指が触れるのはそれを包むラベル側になる。隠し入力（13×13px）を測っても
    // 押しやすさについて何も分からないので、`data-slot="root"` を持つラベルを見る。
    //
    // Input の「メールアドレス」のようなフィールド見出しは対象外。押しても
    // 入力欄にフォーカスが移るだけで、狙って押す種類の的ではない
    const targets = preview.locator(
      [
        'button:visible',
        'a[href]:visible',
        'label[data-slot="root"]:visible',
        '[role="tab"]:visible',
      ].join(', '),
    )
    const count = await targets.count()
    // デモに対話要素が1つも無いもの（Skeleton など）は対象外
    test.skip(count === 0, '対話要素を持たないデモ')

    const tooSmall: string[] = []
    for (let i = 0; i < count; i++) {
      const el = targets.nth(i)
      const size = await el.evaluate(effectiveSize)
      if (size.width < TAP_MIN || size.height < TAP_MIN) {
        const label = ((await el.textContent()) ?? '').trim().slice(0, 16)
        tooSmall.push(`${label || '(無名)'}: ${Math.round(size.width)}×${Math.round(size.height)}`)
      }
    }
    expect(tooSmall, `${TAP_MIN}px を割る対話要素`).toEqual([])
  })
}

test('入力欄の文字が 16px 以上（フォーカスで自動ズームしない・AC-01-3）', async ({ page }) => {
  // iOS Safari は 16px 未満の入力欄でフォーカス時にページごと拡大し、
  // 以後レイアウトが崩れたまま戻らない
  const small: string[] = []
  for (const slug of ['input', 'textarea', 'select']) {
    const preview = await openDemo(page, slug)
    const fields = preview.locator('input:visible, textarea:visible')
    for (let i = 0; i < (await fields.count()); i++) {
      const px = await fields
        .nth(i)
        .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize))
      if (px < INPUT_FONT_MIN) small.push(`${slug}[${i}]: ${px}px`)
    }
  }
  expect(small, `${INPUT_FONT_MIN}px を割る入力欄`).toEqual([])
})

test('隣接する対話要素の当たり判定が重ならない', async ({ page }) => {
  // 44px に広げた結果、隣のターゲットを侵食していないこと。
  // 重なると「押したつもりの隣が反応する」が起きる
  const preview = await openDemo(page, 'button')
  const boxes = await preview.locator('button:visible').evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    }),
  )

  const overlaps: string[] = []
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]
      const b = boxes[j]
      if (a === undefined || b === undefined) continue
      const gapX = Math.max(a.x - (b.x + b.width), b.x - (a.x + a.width))
      const gapY = Math.max(a.y - (b.y + b.height), b.y - (a.y + a.height))
      // 縦横どちらかが離れていれば重なっていない
      if (gapX < 0 && gapY < 0) overlaps.push(`${i}-${j}`)
    }
  }
  expect(overlaps, '当たり判定が重なっている組').toEqual([])
})

test('ボトムシートがホームインジケータに隠れない（AC-10-1 / AC-10-3）', async ({ page }) => {
  const preview = await openDemo(page, 'modal')
  await preview
    .getByRole('button', { name: /ダイアログ|開く/ })
    .first()
    .click()

  const panel = page.locator('[data-slot="panel"]').last()
  await expect(panel).toBeVisible()
  await panel.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)))

  const info = await panel.evaluate((el) => {
    const cs = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    return {
      paddingBottom: cs.paddingBottom,
      bottom: rect.bottom,
      viewportHeight: window.innerHeight,
      maxHeight: cs.maxHeight,
    }
  })

  // 下端に張り付いている（ボトムシートであることの実測）
  expect(Math.round(info.bottom)).toBe(info.viewportHeight)
  // safe-area が 0 の環境では余分な空白を作らない（AC-10-3）
  expect(info.paddingBottom).toBe('0px')
  // 高さは dvh 基準（アドレスバーの伸縮で見切れない・AC-10-2）
  expect(info.maxHeight).not.toBe('none')
})

test('Select のシートが viewport 下端に固定される（AC-02-2）', async ({ page }) => {
  // jsdom はレイアウトを持たないため、ここが「本当に下端に出る」ことの唯一の担保。
  // RAC のインライン配置を !important で奪えているかを実測する（ADR-T2）
  const preview = await openDemo(page, 'select')
  await preview.getByRole('button').first().click()

  // popover は portal に描画される。ページ内の別要素と取り違えないよう最後の1つを見る
  const popover = page.locator('[data-slot="popover"]').last()
  await expect(popover).toBeVisible()
  // シートは 260ms かけてせり上がる。途中で測ると下端に届いていない
  await popover.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)))

  const info = await popover.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return {
      position: getComputedStyle(el).position,
      bottom: rect.bottom,
      left: rect.x,
      width: rect.width,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    }
  })

  expect(info.position).toBe('fixed')
  expect(Math.round(info.bottom)).toBe(info.viewportHeight)
  expect(Math.round(info.left)).toBe(0)
  expect(Math.round(info.width)).toBe(info.viewportWidth)
})
