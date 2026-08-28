import { expect, type Locator, type Page, test } from '@playwright/test'

/**
 * インフロー展開の押し下げを実測する（flatlay T-14 / AC-01-1, AC-01-2）。
 *
 * **jsdom では 1px も測れない。** 単体テスト（`inflow.test.tsx` / `select.test.tsx`）が
 * 見ているのは「押し下げが起こりうる DOM の形か」まで。Flatlay の原理は
 * 「開く = 場所を取る」なので、場所を取ったことの確認はここが唯一の担保になる。
 */

const PROBE = '/flatlay-probe/'

/** 文書内での絶対 Y。スクロールしても比較できる形にする。 */
function documentY(el: Element): number {
  return el.getBoundingClientRect().y + window.scrollY
}

async function openSelect(fixture: Locator): Promise<Locator> {
  await fixture.getByRole('button').click()
  const popover = fixture.locator('[data-slot="popover"]')
  await expect(popover).toBeVisible()
  return popover
}

/** 展開部が持つ高さ。押し下げ量と突き合わせる。 */
async function popoverHeight(popover: Locator): Promise<number> {
  return popover.evaluate((el) => el.getBoundingClientRect().height)
}

test('開くと後続が押し下がる（AC-01-1）', async ({ page }) => {
  await page.goto(PROBE)
  const fixture = page.getByTestId('probe-top')
  const below = page.getByTestId('below-top')

  const before = await below.evaluate(documentY)
  const popover = await openSelect(fixture)
  const after = await below.evaluate(documentY)

  // 押し下げ量は展開部の高さぶん。浮いていれば 0 のまま動かない
  expect(after - before).toBeGreaterThanOrEqual(await popoverHeight(popover))
})

test('閉じると場所を返す（AC-01-2）', async ({ page }) => {
  await page.goto(PROBE)
  const fixture = page.getByTestId('probe-top')
  const below = page.getByTestId('below-top')

  const before = await below.evaluate(documentY)
  await openSelect(fixture)
  await page.keyboard.press('Escape')
  await expect(fixture.locator('[data-slot="popover"]')).toHaveCount(0)

  // 1px でもズレると、開閉のたびにページが少しずつ伸びていくことになる
  expect(await below.evaluate(documentY)).toBe(before)
})

test('展開部が浮かず、フローの中に積まれる', async ({ page }) => {
  await page.goto(PROBE)
  const popover = await openSelect(page.getByTestId('probe-top'))

  const info = await popover.evaluate((el) => ({
    position: getComputedStyle(el).position,
    zIndex: getComputedStyle(el).zIndex,
    boxShadow: getComputedStyle(el).boxShadow,
  }))

  expect(info.position).toBe('static')
  expect(info.zIndex).toBe('auto')
  // 影のトークンは全段 0 0 #0000。塗りが乗っていれば浮いて見える
  expect(info.boxShadow).not.toMatch(/rgba?\((?!0,\s*0,\s*0,\s*0\))/)
})

/** トリガーを viewport の下端に寄せる。展開が折り返しの外へ出る状況を作る。 */
async function parkAtBottomEdge(page: Page, fixture: Locator): Promise<void> {
  await fixture.getByRole('button').evaluate((el) => el.scrollIntoView({ block: 'end' }))
  await page.waitForTimeout(100)
}

test('展開が視界の外に出るときだけ、最小限スクロールする', async ({ page }) => {
  await page.goto(PROBE)
  const fixture = page.getByTestId('probe-bottom')
  await parkAtBottomEdge(page, fixture)

  const scrollBefore = await page.evaluate(() => window.scrollY)
  const popover = await openSelect(fixture)

  // `block: 'nearest'` なので、見えるところまでしか動かさない。
  // 'center' や 'start' だとトリガーごと動いて「押し下げた」因果が見えなくなる
  const scrollAfter = await page.evaluate(() => window.scrollY)
  expect(scrollAfter).toBeGreaterThan(scrollBefore)

  const fits = await popover.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return rect.top >= 0 && rect.bottom <= window.innerHeight
  })
  expect(fits, '展開部が viewport に収まっていない').toBe(true)
})

test('開くために押しただけでは選ばれない', async ({ page }) => {
  await page.goto(PROBE)
  const fixture = page.getByTestId('probe-bottom')
  const value = fixture.locator('[data-slot="value"]')
  await parkAtBottomEdge(page, fixture)

  const before = await value.textContent()
  await openSelect(fixture)

  // 押している最中にページが動くと、指の下へ別の項目が滑り込んで
  // 離した瞬間に選ばれてしまう。追従は指を離してから
  expect(await value.textContent()).toBe(before)
})

test('スクロールしても閉じない', async ({ page }) => {
  await page.goto(PROBE)
  const fixture = page.getByTestId('probe-top')
  const popover = await openSelect(fixture)

  // 展開部は文書の一部なので、送っても離れていかない。
  // アンカー型の作法（ずれる前に閉じる）をそのまま持ち込むと、
  // 長い一覧を読むために送っただけで畳まれる
  await page.mouse.wheel(0, 200)
  await expect(popover).toBeVisible()
})

test('折り返しの中で開くときは動かさない', async ({ page }) => {
  await page.goto(PROBE)
  const fixture = page.getByTestId('probe-top')

  const scrollBefore = await page.evaluate(() => window.scrollY)
  await openSelect(fixture)

  // 見えているものを勝手に動かすと、開いた瞬間に読んでいた場所を失う
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore)
})
