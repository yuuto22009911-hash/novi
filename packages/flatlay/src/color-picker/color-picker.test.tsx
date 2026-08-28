import { NOVI_CONTRACTS, NOVI_SIZES } from '@novi-ui/core'
import { testSlotContract } from '@novi-ui/core/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it, vi } from 'vitest'
import { FLATLAY_COLOR_SET } from '../tokens/color-set'
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

describe('カラーセット Stationery', () => {
  it('既定でテーマの全8色が並ぶ', () => {
    render(<ColorPicker label="配色" />)
    expect(screen.getAllByRole('radio')).toHaveLength(FLATLAY_COLOR_SET.length)
  })

  it('公開する選択肢がカラーセットと同じ順序・同じ id', () => {
    expect(COLOR_OPTIONS.map((c) => c.id)).toEqual(FLATLAY_COLOR_SET.map((c) => c.id))
  })

  it('赤は並ばない（朱書きは danger に予約している）', () => {
    // 「赤が無い」のは欠落ではなく決定。並びに紛れ込んだら世界観が崩れる
    expect(COLOR_OPTIONS.map((c) => c.id)).not.toContain('red')
    expect(COLOR_OPTIONS.map((c) => c.name)).toEqual([
      'Fieldbook',
      'Blueprint',
      'Carbon',
      'Ribbon',
      'Eraser',
      'Manila',
      'Legalpad',
      'Pencil',
    ])
  })

  it('色の名前が読み上げられる', () => {
    render(<ColorPicker label="配色" />)
    for (const color of FLATLAY_COLOR_SET) {
      expect(screen.getByRole('radio', { name: color.name })).toBeDefined()
    }
  })

  it('colors を渡すとその並びだけを出す', () => {
    render(
      <ColorPicker
        label="配色"
        colors={[
          { id: 'manila', name: 'Manila' },
          { id: 'pencil', name: 'Pencil' },
        ]}
      />,
    )
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(radios.map((r) => r.getAttribute('aria-label'))).toEqual(['Manila', 'Pencil'])
  })
})

describe('色の解決', () => {
  it('スウォッチが色ごとの変数を参照し、色値を実装に埋め込んでいない', () => {
    const { container } = render(<ColorPicker label="配色" />)
    const swatches = [...container.querySelectorAll<HTMLElement>('[data-slot="swatch"]')]

    expect(swatches.map((el) => el.style.background)).toEqual(
      FLATLAY_COLOR_SET.map((c) => `var(--novi-swatch-${c.id})`),
    )
  })

  it('スウォッチはテーマも色も宣言し直さない（親のスキームに従う）', () => {
    const { container } = render(<ColorPicker label="配色" />)
    for (const el of container.querySelectorAll('[data-slot="swatch"]')) {
      expect(el.getAttribute('data-novi-theme')).toBeNull()
      expect(el.getAttribute('data-novi-color')).toBeNull()
    }
  })

  it('スタイルに色のリテラルを持たない（生成 CSS に委ねている）', () => {
    expect(colorPickerStyles().swatch()).not.toMatch(/oklch\(|#[0-9a-f]{3,8}\b/i)
  })
})

describe('見本帳は方眼（FR-08）', () => {
  it('升目を隙間なく並べる（両テーマのように色面を離さない）', () => {
    const list = colorPickerStyles().list()
    expect(list).toContain('grid')
    expect(list).not.toMatch(/(?<![\w-])gap-/)
    expect(list).not.toContain('flex-wrap')
  })

  it('方眼は上辺と左辺を list が、右辺と下辺を各升目が引く', () => {
    // 隣り合う升で線が二重にならず、1px の格子になる
    expect(colorPickerStyles().list()).toContain(
      'border-t border-l border-[var(--novi-color-border-strong)]',
    )
    expect(colorPickerStyles().item()).toContain(
      'border-r border-b border-[var(--novi-color-border-strong)]',
    )
  })

  it('スウォッチ自身は枠を持たない（升目の罫線が枠を兼ねる）', () => {
    const swatch = colorPickerStyles().swatch()
    expect(swatch).not.toMatch(/(?<![\w-])border(?![\w-])/)
    expect(swatch).not.toMatch(/(?<![\w-])border-/)
  })

  it('見本は角丸を持たない（升目に貼った紙片）', () => {
    expect(colorPickerStyles().swatch()).toContain('rounded-[var(--novi-radius-none)]')
  })

  it('md の見本は 28px 角（Button の高さ・Switch のトラック幅と同じ）', () => {
    expect(colorPickerStyles({ size: 'md' }).swatch()).toContain('size-7')
  })
})

describe('選択は枠の反転（ADR-F3）', () => {
  it('選ぶと升目の地が紙からインクに入れ替わる', () => {
    const item = colorPickerStyles().item()
    expect(item).toContain('bg-[var(--novi-color-bg)]')
    expect(item).toContain('data-[selected]:bg-[var(--novi-color-fg)]')
  })

  it('反転した升目の上では色名も地色で読ませる', () => {
    expect(colorPickerStyles().itemLabel()).toContain(
      'group-data-[selected]:text-[var(--novi-color-bg)]',
    )
  })

  it('影も z-index も transform も持たない（FR-02 / FR-11）', () => {
    const classes = Object.values(colorPickerStyles())
      .map((slot) => slot())
      .join(' ')
    expect(classes).not.toMatch(/(?<![\w-])shadow-/)
    expect(classes).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
    expect(classes).not.toMatch(/(?<![\w-])(?:scale|rotate|translate)-/)
  })
})

describe('選択', () => {
  it('既定値はテーマの既定色 Fieldbook', () => {
    render(<ColorPicker label="配色" />)
    // RAC は role="radio" を隠し input に載せる。data-slot は包むラベル側
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Fieldbook' }).checked).toBe(true)
  })

  it('選ぶと id が返る', async () => {
    const onChange = vi.fn()
    render(<ColorPicker label="配色" onChange={onChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Blueprint' }))
    expect(onChange).toHaveBeenCalledWith('blueprint')
  })

  it('矢印キーで色を移動できる', async () => {
    const onChange = vi.fn()
    render(<ColorPicker label="配色" defaultValue="fieldbook" onChange={onChange} />)

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith(FLATLAY_COLOR_SET[1]?.id)
  })

  it('選択中は印が出る（色だけに頼らない）', () => {
    const { container } = render(<ColorPicker label="配色" defaultValue="ribbon" />)
    const indicators = container.querySelectorAll('[data-slot="indicator"]')
    expect(indicators).toHaveLength(1)

    const selected = screen.getByRole('radio', { name: 'Ribbon' }).closest('[data-slot="item"]')
    expect(selected?.querySelector('[data-slot="indicator"]')).not.toBeNull()
  })

  it('印は Checkbox と同じ等幅の文字で、SVG ではない', () => {
    const { container } = render(<ColorPicker label="配色" defaultValue="ribbon" />)
    const indicator = container.querySelector('[data-slot="indicator"]')
    expect(indicator?.textContent).toBe('✓')
    expect(indicator?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelector('svg')).toBeNull()
    expect(colorPickerStyles().indicator()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('isDisabled で操作できない', async () => {
    const onChange = vi.fn()
    render(<ColorPicker label="配色" isDisabled onChange={onChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Blueprint' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('表示', () => {
  it('showLabels で色名を出す', () => {
    render(<ColorPicker label="配色" showLabels />)
    expect(screen.getByText('Fieldbook')).toBeDefined()
  })

  it('既定では色名を出さない（スウォッチだけ並べる）', () => {
    const { container } = render(<ColorPicker label="配色" />)
    expect(container.querySelector('[data-slot="itemLabel"]')).toBeNull()
  })

  it('項目名も色名も等幅（ADR-F7）', () => {
    expect(colorPickerStyles().label()).toContain('font-(family-name:--novi-font-mono)')
    expect(colorPickerStyles().itemLabel()).toContain('font-(family-name:--novi-font-mono)')
  })

  it('size ごとにスウォッチのクラスが異なる', () => {
    const classes = NOVI_SIZES.map((size) => colorPickerStyles({ size }).swatch())
    expect(new Set(classes).size).toBe(NOVI_SIZES.length)
    for (const cls of classes) expect(cls).toMatch(/size-\d+/)
  })
})

describe('拡張', () => {
  it('tv({ extend }) で slot を上書きできる', () => {
    const myPicker = tv({ extend: colorPickerStyles, slots: { list: 'grid-cols-2' } })
    expect(myPicker().list()).toContain('grid-cols-2')
  })

  it('classNames で個別 slot にクラスを足せる', () => {
    const { container } = render(<ColorPicker label="配色" classNames={{ list: 'my-list' }} />)
    expect(container.querySelector('[data-slot="list"]')?.className).toContain('my-list')
  })
})
