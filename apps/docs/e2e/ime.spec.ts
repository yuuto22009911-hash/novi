import { expect, type Page, test } from '@playwright/test'

/**
 * IME 変換中の Enter が誤発火しないことを、**本物の変換状態**で検査する（core T-18 / raster T-39）。
 *
 * jsdom のテストは `isComposing: true` を手で立てた合成イベントを送っているだけで、
 * 「ブラウザが本当にその順序でイベントを出すか」までは確かめられない。
 * ここでは CDP の `Input.imeSetComposition` を使い、実際の IME と同じ経路で
 * 変換中の状態を作ってから Enter を実キーとして送る。
 *
 * **観測点はテーマの `onKeyDown` に届いた回数**。
 * DOM に自前のリスナを足して `isComposing` を見る方法では検査にならない
 * （ブラウザは変換中の keydown にも `isComposing: true` を立てて配信するため、
 * 抑制が効いていてもいなくても同じに見える。実際それで一度、
 * 抑制を外しても通る空振りの検査を書いてしまった）。
 *
 * これで実機確認の代わりになるわけではない。macOS の日本語 IME、iOS、MS-IME は
 * それぞれ挙動が違う。ただし**回帰の検出**はこれで自動化できる。
 */

/** 変換中に Enter を送る。IME と同じ経路を通す。 */
async function pressEnterWhileComposing(page: Page, text: string) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.imeSetComposition', {
    text,
    selectionStart: text.length,
    selectionEnd: text.length,
  })
  await page.waitForTimeout(150)

  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Enter',
    code: 'Enter',
    windowsVirtualKeyCode: 13,
    nativeVirtualKeyCode: 13,
  })
  await page.waitForTimeout(200)
}

test('Input: 変換確定の Enter がキーハンドラに届かない', async ({ page }) => {
  await page.goto('/ime-probe/')

  const input = page.locator('[data-testid="preview"] input').first()
  await input.click()
  await pressEnterWhileComposing(page, 'にほんご')

  // 届いていたら、利用側の「Enter で送信」がそのまま暴発する
  await expect(page.getByTestId('input-enters')).toHaveText('0')
  // 抑制が入力そのものを殺していないことも確かめる
  await expect(input).toHaveValue('にほんご')
})

test('Input: 変換していないときの Enter は通す', async ({ page }) => {
  await page.goto('/ime-probe/')

  const input = page.locator('[data-testid="preview"] input').first()
  await input.click()
  await input.press('Enter')

  // 抑制しすぎて普通の Enter まで殺していたら、それはそれで壊れている
  await expect(page.getByTestId('input-enters')).toHaveText('1')
})

test('TextArea: 変換確定の Enter がキーハンドラに届かない', async ({ page }) => {
  await page.goto('/ime-probe/')

  await page.locator('[data-testid="preview"] textarea').first().click()
  await pressEnterWhileComposing(page, 'かいぎょう')

  await expect(page.getByTestId('textarea-enters')).toHaveText('0')
})

test('Select: 変換確定の Enter で候補が誤決定されない', async ({ page }) => {
  await page.goto('/docs/components/select/')

  const trigger = page.locator('[data-testid="preview"] [data-slot="trigger"]').first()
  const before = await trigger.textContent()

  await trigger.click()
  await expect(page.locator('[data-slot="listbox"]')).toBeVisible()

  await pressEnterWhileComposing(page, 'とうきょう')

  // 変換確定で選択が変わっていない
  expect(await trigger.textContent()).toBe(before)
})
