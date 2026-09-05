import { NOVI_COLORS, NOVI_CONTRACTS, NOVI_SIZES, NOVI_VARIANTS } from '@novi-ui/core'
import { describe, expect, it } from 'vitest'
import * as tactileNamespace from '../index'

/**
 * パッケージ横断の検査（T-07）。**コンポーネントを足すたび自動で対象が増える。**
 *
 * Raster では対象を手で並べた表を持っており、追加時に書き忘れると検査が素通りする。
 * ここは公開エントリを走査して対象を集めるため、書き忘れが起きない。
 *
 * 個々のコンポーネントのテストは各ファイルにあるが、
 * 「網羅していること」「互いに見分けがつくこと」はここでしか担保できない。
 */

const tactile: Record<string, unknown> = { ...tactileNamespace }

type StyleFn = (props?: Record<string, unknown>) => Record<string, () => string>

/** `*Styles` という名前で公開されている tv() 定義をすべて集める。 */
function styleFns(): [name: string, fn: StyleFn][] {
  return Object.entries(tactile)
    .filter(([name, value]) => name.endsWith('Styles') && typeof value === 'function')
    .map(([name, value]) => [name, value as StyleFn])
}

/** その定義が受け付ける slot 名（tv の戻り値のキー）。 */
const slotsOf = (fn: StyleFn): string[] => Object.keys(fn({}))

describe('公開 API', () => {
  it('すべての tv() 定義が named export されている（AC-07-2 / FR-04）', () => {
    // 拡張できないコンポーネントがあると「スタイルを所有できる」という約束が崩れる
    expect(styleFns().length).toBeGreaterThan(0)
    for (const [name, fn] of styleFns()) {
      expect(typeof fn, name).toBe('function')
    }
  })

  it('公開しているコンポーネント名が契約の語彙に含まれる', () => {
    const contracts = new Set(Object.keys(NOVI_CONTRACTS))
    const components = Object.keys(tactile).filter(
      (name) =>
        /^[A-Z]/.test(name) &&
        !name.endsWith('Styles') &&
        // COLOR_OPTIONS のような定数はコンポーネントではない。
        // 大文字始まりだけで判定すると、公開する定数を1つ増やすたびにここが落ちる
        !/^[A-Z0-9_]+$/.test(name),
    )
    // 照合を緩める点が2つある:
    // - 契約1つに複数の公開名が対応する（Tabs → TabItem / TabContent）ので接頭辞で見る。
    //   契約が複数形で公開名が単数のことがあるため末尾の s も落とす
    // - 公開名の大小は RAC / HeroUI の慣習に寄せてあり、契約と揺れる（Textarea → TextArea）。
    //   ADR-05 が「独自命名を作らない」を優先しているので、ここは小文字化して比べる
    const prefixes = [...contracts]
      .flatMap((c) => [c, c.replace(/s$/, '')])
      .map((c) => c.toLowerCase())
    // Toast の region は `NoviToastRegion` として公開される（Raster と同じ）。
    // ライブラリ名の接頭辞は契約名に含まれないので落としてから照合する
    const unknown = components.filter((name) => {
      const bare = name.replace(/^Novi/, '').toLowerCase()
      return !prefixes.some((p) => bare.startsWith(p))
    })
    expect(unknown).toEqual([])
  })
})

describe('variant / size / color が互いに見分けられる（AC-04-1）', () => {
  // 「実装したつもり」で2つが同じクラスになっていても型は通る。
  // その状態だと語彙は共通でも解釈が存在しないのと同じになる
  it.each(styleFns())('%s: variant 語彙がすべて異なるクラスを生む', (_name, fn) => {
    const slot = slotsOf(fn)[0] as string
    const produced = NOVI_VARIANTS.map((variant) => fn({ variant })[slot]?.())
    // variant を受け付けない定義（Card 等）はすべて同じ値を返すので対象外
    if (new Set(produced).size === 1) return
    expect(new Set(produced).size).toBe(NOVI_VARIANTS.length)
  })

  it.each(styleFns())('%s: size 語彙がすべて異なるクラスを生む', (_name, fn) => {
    const slot = slotsOf(fn)[0] as string
    const produced = NOVI_SIZES.map((size) => fn({ size })[slot]?.())
    if (new Set(produced).size === 1) return
    expect(new Set(produced).size).toBe(NOVI_SIZES.length)
  })

  it.each(styleFns())('%s: color 語彙がすべて異なるクラスを生む', (_name, fn) => {
    const slot = slotsOf(fn)[0] as string
    const produced = NOVI_COLORS.map((color) => fn({ color })[slot]?.())
    if (new Set(produced).size === 1) return
    expect(new Set(produced).size).toBe(NOVI_COLORS.length)
  })
})

describe('デザイン規律（全コンポーネント）', () => {
  /** 全定義 × 全 variant のクラス文字列を1つに集める。 */
  function allClasses(): string {
    return styleFns()
      .flatMap(([, fn]) =>
        NOVI_VARIANTS.flatMap((variant) =>
          NOVI_COLORS.map((color) => {
            const result = fn({ variant, color })
            return Object.values(result)
              .map((slot) => slot())
              .join(' ')
          }),
        ),
      )
      .join(' ')
  }

  it('色をリテラルで書いていない（すべてトークン経由・FR-06）', () => {
    expect(allClasses()).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(/)
  })

  // 先頭は `\b` ではなく `(?<![\w-])` で縛る。`\b` だと `--novi-shadow-sm` のような
  // 変数名の内側にもマッチし、トークン経由で正しく書いた指定を違反と誤判定する
  it('装飾目的の scale が無い（押下状態のみ・ADR-T5）', () => {
    expect(allClasses()).not.toMatch(
      /(?<!data-\[pressed\]:)(?<!motion-reduce:data-\[pressed\]:)(?<![\w-])scale-(?!100\b)/,
    )
  })

  /**
   * `rounded-t-[...]` のような方向つきの指定を誤検出しないよう、
   * 塊への正規表現ではなくクラス単位で見る。
   */
  function offenders(prefix: string, allowed: RegExp): string[] {
    return allClasses()
      .split(/\s+/)
      .map((cls) => cls.replace(/^(?:!|[\w-]+:)+/, '')) // ! と修飾子（hover: 等）を落とす
      .filter((cls) => cls.startsWith(`${prefix}-`))
      .filter((cls) => !allowed.test(cls))
  }

  it('影がトークン経由でのみ指定されている', () => {
    expect(offenders('shadow', /^shadow-(?:none|\[var\(--novi-shadow-[a-z]+\)\])$/)).toEqual([])
  })

  it('角丸がトークン経由でのみ指定されている（方向つきも可）', () => {
    expect(
      offenders('rounded', /^rounded-(?:[trblse]{1,2}-)?\[var\(--novi-radius-[a-z]+\)\]$/),
    ).toEqual([])
  })

  it('モーションの時間がトークン経由でのみ指定されている', () => {
    expect(offenders('duration', /^duration-\[var\(--novi-duration-[a-z]+\)\]$/)).toEqual([])
  })
})

describe('タッチの寸法（FR-07 / FR-08）', () => {
  // 正規表現では「その h-6 がボタンなのか Badge なのか」を区別できないため、
  // ここで tv() の構造を見る。**実効領域の実測は e2e（T-44）が担当する** —
  // 擬似要素で広げた当たり判定は計算済みスタイルでしか測れない。

  /** 高さクラス（h-10 等）を px に直す。Tailwind の h-<n> は n*4px。 */
  function heightPx(classes: string): number | null {
    const arbitrary = /(?<![\w-])h-\[(\d+)px\]/.exec(classes)
    if (arbitrary !== null) return Number(arbitrary[1])
    const scale = [...classes.matchAll(/(?<![\w-])(?:min-)?h-(\d+)(?![\w-])/g)]
      .map((m) => Number(m[1]) * 4)
      .sort((a, b) => b - a)
    return scale[0] ?? null
  }

  /** 対話要素の主たる面と、その高さを持つ slot。 */
  const CONTROLS: [name: string, fn: StyleFn, slot: string][] = [
    ['button', tactile.buttonStyles as StyleFn, 'root'],
    ['input', tactile.inputStyles as StyleFn, 'inputWrapper'],
    ['number-field', tactile.numberFieldStyles as StyleFn, 'inputWrapper'],
    ['combo-box', tactile.comboBoxStyles as StyleFn, 'inputWrapper'],
    ['select', tactile.selectStyles as StyleFn, 'trigger'],
    ['tabs', tactile.tabsStyles as StyleFn, 'tab'],
    ['accordion', tactile.accordionStyles as StyleFn, 'trigger'],
  ]

  it.each(CONTROLS)('%s: どの size でも高さが 40px 以上（FR-07）', (name, fn, slot) => {
    for (const size of NOVI_SIZES) {
      const px = heightPx(fn({ size })[slot]?.() ?? '')
      expect(px, `${name}/${size} の高さが読めない`).not.toBeNull()
      expect(px, `${name}/${size}`).toBeGreaterThanOrEqual(40)
    }
  })

  it.each([
    ['select', tactile.selectStyles as StyleFn, 'option'],
    ['menu', tactile.menuStyles as StyleFn, 'item'],
    ['combo-box', tactile.comboBoxStyles as StyleFn, 'option'],
  ])('%s: 一覧の行が 48px 以上（誤タップは一覧で最も起きる）', (name, fn, slot) => {
    for (const size of NOVI_SIZES) {
      const px = heightPx(fn({ size })[slot]?.() ?? '')
      expect(px, `${name}/${size} の行高が読めない`).not.toBeNull()
      expect(px, `${name}/${size}`).toBeGreaterThanOrEqual(48)
    }
  })

  it.each([
    ['input', tactile.inputStyles as StyleFn, 'input'],
    ['number-field', tactile.numberFieldStyles as StyleFn, 'input'],
    ['combo-box', tactile.comboBoxStyles as StyleFn, 'input'],
    ['textarea', tactile.textareaStyles as StyleFn, 'textarea'],
  ])('%s: 入力の文字が 16px 未満にならない（AC-01-3）', (name, fn, slot) => {
    // iOS Safari は 16px 未満の入力欄でフォーカス時にページごと拡大し、レイアウトが飛ぶ
    for (const size of NOVI_SIZES) {
      const classes = fn({ size })[slot]?.() ?? ''
      expect(classes, `${name}/${size}`).not.toMatch(/text-\[length:var\(--novi-text-(xs|sm)\)\]/)
    }
  })

  it('Checkbox / Radio は視覚寸法が小さくても当たり判定を広げている（AC-01-5）', () => {
    for (const [name, fn] of [
      ['checkbox', tactile.checkboxStyles as StyleFn],
      ['radio', tactile.radioStyles as StyleFn],
    ] as const) {
      expect(fn({}).root?.(), name).toContain('before:size-[max(100%,44px)]')
    }
  })
})

describe('MVP の網羅（G1）', () => {
  it('実装済みコンポーネント数を記録する', () => {
    const implemented = Object.keys(tactile).filter(
      (name) => /^[A-Z]/.test(name) && !name.endsWith('Styles'),
    )
    // 23契約が揃うまでは増えていく。0 になったら公開エントリが壊れている
    expect(implemented.length).toBeGreaterThan(0)
  })
})
