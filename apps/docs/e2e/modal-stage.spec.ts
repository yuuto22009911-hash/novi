import { expect, test } from '@playwright/test'
import { THEME_NAMES } from '../lib/theme-registry'

/**
 * トップの Modal 見本（modal-triptych.tsx）は、テーマの slot クラスで静的に組んだ写しである。
 * 写しが本物からずれた瞬間に「同じ JSX でこう変わる」という主張が嘘になるので、
 * 実物の Modal を開いて slot の並びを取り、見本と突き合わせる。
 *
 * 比べるのは slot 名の**初出順**。Button の個数など、本物のデモと見本で
 * 意図して違えている中身は含めない。
 */
const slotSequence = (root: Element): string[] => {
  const names = [
    root.getAttribute('data-slot'),
    ...Array.from(root.querySelectorAll('[data-slot]')).map((el) => el.getAttribute('data-slot')),
  ]
  return names.filter((n, i): n is string => n !== null && names.indexOf(n) === i)
}

for (const theme of THEME_NAMES) {
  test(`${theme}: トップの Modal 見本は実物と同じ slot 構成`, async ({ page }) => {
    await page.goto('/docs/components/modal/')
    await page.getByLabel('テーマ').selectOption(theme)

    await page
      .locator('[data-testid="preview"]')
      .getByRole('button', { name: 'ダイアログを開く' })
      .click()
    const real = page.locator('[data-slot="backdrop"]')
    await expect(real).toBeVisible()
    const realSlots = await real.evaluate(slotSequence)

    await page.goto('/')
    const stage = page.locator(
      `[data-testid="modal-stage"][data-novi-theme="${theme}"] [data-slot="backdrop"]`,
    )
    await expect(stage).toBeVisible()
    const stageSlots = await stage.evaluate(slotSequence)

    expect(stageSlots).toEqual(realSlots)
  })
}

test('トップの Modal 見本は3テーマぶん揃い、ファーストビューにある', async ({ page }) => {
  await page.goto('/')
  const stages = page.locator('[data-testid="modal-stage"]')
  await expect(stages).toHaveCount(THEME_NAMES.length)

  const box = await stages.first().boundingBox()
  if (box === null) throw new Error('見本が見つかりません')
  const viewportHeight = page.viewportSize()?.height ?? 0
  expect(box.y).toBeLessThan(viewportHeight)
})
