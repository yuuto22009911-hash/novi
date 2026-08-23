import { writeFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { DEMO_SLUGS } from '../demos/meta'

const OUT = process.env.Y_OUT ?? '/tmp/y.json'

test('y probe', async ({ browser }) => {
  test.setTimeout(300_000)
  const out: Record<string, unknown> = {}
  for (const theme of ['raster', 'tactile'] as const) {
    const ctx = await browser.newContext()
    await ctx.addInitScript((t) => {
      localStorage.setItem('novi-theme', t as string)
    }, theme)
    const page = await ctx.newPage()
    for (const slug of DEMO_SLUGS) {
      await page.goto(`/docs/components/${slug}/`)
      const preview = page.locator(`[data-testid="preview"][data-novi-theme="${theme}"]`)
      await expect(preview).toBeVisible()
      await page.waitForTimeout(120)
      out[`${theme}/${slug}`] = await preview.evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top + window.scrollY, h: r.height, w: r.width }
      })
    }
    if (theme === 'raster') {
      out.header = await page.locator('article > header').evaluate((el) => {
        const r = el.getBoundingClientRect()
        const h1 = el.querySelector('h1')?.getBoundingClientRect()
        const p = el.querySelector('p')?.getBoundingClientRect()
        return { h: r.height, h1: h1?.height, p: p?.height, mb: getComputedStyle(el).marginBottom }
      })
    }
    await ctx.close()
  }
  writeFileSync(OUT, JSON.stringify(out, null, 2))
})
