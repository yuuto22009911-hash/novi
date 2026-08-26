import { describe, expect, it } from 'vitest'
import { disabledState, focusRing } from './focus-ring'
import { mono, monoNumeric } from './mono'

/**
 * 共通断片の検査（T-07）。
 *
 * 断片は全コンポーネントに配られるので、ここが崩れると 24 箇所が同時に崩れる。
 * しかも症状は「キーボードでリングが出ない」「数字が揃わない」のように地味で、
 * 個々のコンポーネントのテストでは誰も気づかない。
 */

describe('focusRing', () => {
  it('data-focus-visible で出す（ポインタで押しただけでは出さない）', () => {
    expect(focusRing).toContain('data-[focus-visible]:outline')
    // :focus-visible 擬似クラスに戻すと、RAC が押下方法を判別してくれた結果を捨てることになる
    expect(focusRing).not.toContain('focus-visible:')
    expect(focusRing).toContain('outline-none')
  })

  it('リングの寸法と色をすべてトークンから採る', () => {
    for (const token of [
      '--novi-focus-ring-width',
      '--novi-focus-ring-color',
      '--novi-focus-ring-offset',
    ]) {
      expect(focusRing, token).toContain(token)
    }
  })

  it('両テーマと同一の断片である（フォーカスは表現ではなく操作の保証）', () => {
    // 文字列そのものを固定する。差し替えたい衝動が起きたときにここで一度止まる
    expect(focusRing).toBe(
      'outline-none data-[focus-visible]:outline ' +
        'data-[focus-visible]:outline-[length:var(--novi-focus-ring-width)] ' +
        'data-[focus-visible]:outline-[var(--novi-focus-ring-color)] ' +
        'data-[focus-visible]:outline-offset-[var(--novi-focus-ring-offset)]',
    )
  })
})

describe('disabledState', () => {
  it('色を足さず、透明度と操作不能だけで示す', () => {
    expect(disabledState).toBe('data-[disabled]:opacity-40 data-[disabled]:pointer-events-none')
    expect(disabledState).not.toMatch(/text-|bg-|border-/)
  })
})

describe('mono（ADR-F7）', () => {
  it('トークン経由で等幅を指定する', () => {
    expect(mono).toContain('--novi-font-mono')
  })

  it('Tailwind 既定の font-mono に落ちない（トークンの外に出る）', () => {
    expect(mono).not.toMatch(/(?<![\w-])font-mono(?![\w-])/)
  })

  it('数値用は桁が揃う', () => {
    expect(monoNumeric).toContain('tabular-nums')
    expect(monoNumeric).toContain(mono)
  })
})
