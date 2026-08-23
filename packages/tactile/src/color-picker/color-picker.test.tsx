import { NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { TACTILE_COLOR_SET } from '../tokens/color-set'
import { COLOR_OPTIONS, ColorPicker } from './color-picker'
import { colorPickerStyles } from './color-picker.styles'

testSlotContract({
  name: 'ColorPicker',
  contract: NOVI_CONTRACTS.ColorPicker,
  render: () => (
    <ColorPicker
      label="配色"
      description="いつでも変えられます"
      errorMessage="必須です"
      isInvalid
      showLabels
    />
  ),
})

describe('カラーセット', () => {
  it('既定でテーマの全色が並ぶ', () => {
    render(<ColorPicker label="配色" />)
    expect(screen.getAllByRole('radio')).toHaveLength(TACTILE_COLOR_SET.length)
  })

  it('公開する選択肢がカラーセットと同じ順序・同じ id', () => {
    expect(COLOR_OPTIONS.map((c) => c.id)).toEqual(TACTILE_COLOR_SET.map((c) => c.id))
  })

  it('色の名前が読み上げられる', () => {
    render(<ColorPicker label="配色" />)
    // スウォッチは色の面でしかないため、名前がないと何を選ぶのか分からない
    for (const color of TACTILE_COLOR_SET) {
      expect(screen.getByRole('radio', { name: color.name })).toBeDefined()
    }
  })

  it('colors を渡すとその並びだけを出す', () => {
    render(
      <ColorPicker
        label="配色"
        colors={[
          { id: 'madder', name: 'Madder' },
          { id: 'sage', name: 'Sage' },
        ]}
      />,
    )
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(radios.map((r) => r.getAttribute('aria-label'))).toEqual(['Madder', 'Sage'])
  })
})

describe('色の解決', () => {
  it('スウォッチが色ごとの変数を参照し、色値を実装に埋め込んでいない', () => {
    const { container } = render(<ColorPicker label="配色" />)
    const swatches = [...container.querySelectorAll<HTMLElement>('[data-slot="swatch"]')]

    expect(swatches.map((el) => el.style.background)).toEqual(
      TACTILE_COLOR_SET.map((c) => `var(--novi-swatch-${c.id})`),
    )
  })

  it('スウォッチはテーマも色も宣言し直さない（親のスキームに従う）', () => {
    // どちらかを置くと、その要素でライト / ダークの分岐が再評価される。
    // docs は <html> にもテーマを宣言するため、色の上書きを配下に効かせる形も採れない
    const { container } = render(<ColorPicker label="配色" />)
    for (const el of container.querySelectorAll('[data-slot="swatch"]')) {
      expect(el.getAttribute('data-novi-theme')).toBeNull()
      expect(el.getAttribute('data-novi-color')).toBeNull()
    }
  })

  it('スタイルに色のリテラルを持たない（生成 CSS に委ねている）', () => {
    const s = colorPickerStyles()
    expect(s.swatch()).not.toMatch(/oklch\(|#[0-9a-f]{3,8}\b/i)
  })
})

describe('選択', () => {
  it('既定値はテーマの既定色', () => {
    render(<ColorPicker label="配色" />)
    // RAC は role="radio" を隠し input に載せる。data-slot は包むラベル側
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Indigo' }).checked).toBe(true)
  })

  it('選ぶと id が返る', async () => {
    const onChange = vi.fn()
    render(<ColorPicker label="配色" onChange={onChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Madder' }))
    expect(onChange).toHaveBeenCalledWith('madder')
  })

  it('矢印キーで色を移動できる', async () => {
    const onChange = vi.fn()
    render(<ColorPicker label="配色" defaultValue="indigo" onChange={onChange} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith(TACTILE_COLOR_SET[1]?.id)
  })

  it('選択中は indicator が出る（色だけに頼らない）', () => {
    const { container } = render(<ColorPicker label="配色" defaultValue="madder" />)
    const indicators = container.querySelectorAll('[data-slot="indicator"]')
    expect(indicators).toHaveLength(1)

    const selected = screen.getByRole('radio', { name: 'Madder' }).closest('[data-slot="item"]')
    expect(selected?.querySelector('[data-slot="indicator"]')).not.toBeNull()
  })

  it('isDisabled で操作できない', async () => {
    const onChange = vi.fn()
    render(<ColorPicker label="配色" isDisabled onChange={onChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Madder' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('表示', () => {
  it('showLabels で色名を出す', () => {
    render(<ColorPicker label="配色" showLabels />)
    expect(screen.getByText('Indigo')).toBeDefined()
  })

  it('既定では色名を出さない（スウォッチだけ並べる）', () => {
    const { container } = render(<ColorPicker label="配色" />)
    expect(container.querySelector('[data-slot="itemLabel"]')).toBeNull()
  })

  it.each(NOVI_SIZES)('size=%s でスウォッチの寸法が変わる', (size) => {
    const s = colorPickerStyles({ size })
    expect(s.swatch()).toMatch(/size-\d+/)
  })

  it('size ごとにスウォッチのクラスが異なる', () => {
    const classes = NOVI_SIZES.map((size) => colorPickerStyles({ size }).swatch())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
  })
})

describe('タッチ品質（Tactile 固有）', () => {
  it('実効タップ領域を 44px に広げている', () => {
    const s = colorPickerStyles()
    // 玉が 44px 未満の size でも、擬似要素で当たり判定だけを広げる（AC-01-2 / G5）
    expect(s.item()).toContain('before:size-[max(100%,44px)]')
  })

  it('玉の直径は最小でも 32px（Raster の見本帳より大きい）', () => {
    // 寸法はテーマの美学（ADR-06）。指で押し分けられない見本帳にはしない
    expect(colorPickerStyles({ size: 'sm' }).swatch()).toContain('size-8')
  })

  it('押下の縮みが motion-reduce で消える', () => {
    const swatch = colorPickerStyles().swatch()
    expect(swatch).toContain('group-data-[pressed]:scale-[0.92]')
    expect(swatch).toContain('motion-reduce:group-data-[pressed]:scale-100')
  })
})

describe('拡張', () => {
  it('tv({ extend }) で slot を上書きできる', () => {
    const myPicker = tv({ extend: colorPickerStyles, slots: { list: 'gap-6' } })
    expect(myPicker().list()).toContain('gap-6')
  })

  it('classNames で個別 slot にクラスを足せる', () => {
    const { container } = render(<ColorPicker label="配色" classNames={{ list: 'my-list' }} />)
    expect(container.querySelector('[data-slot="list"]')?.className).toContain('my-list')
  })
})
