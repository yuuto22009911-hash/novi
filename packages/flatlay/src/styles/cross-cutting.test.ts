import {
  NOVI_COLORS,
  NOVI_CONTRACTS,
  NOVI_MVP_COMPONENT_COUNT,
  NOVI_SIZES,
  NOVI_VARIANTS,
} from '@novi-ui/core'
import { describe, expect, it } from 'vitest'
import * as flatlayNamespace from '../index'

/**
 * パッケージ横断の検査。**コンポーネントを足すたび自動で対象が増える。**
 *
 * 対象を手で並べた表を持つと、追加時に書き忘れて検査が素通りする。
 * ここは公開エントリを走査して集めるので、書き忘れが起きない。
 *
 * `check-design-rules.mjs` との棲み分け:
 * あちらは**ソースの文字列**を見て、例外の申告（理由コメント）を受け付ける。
 * ここは **tv() が合成した後の出力**を見る。variant を重ねた結果に紛れ込んだものは
 * ソースを1行ずつ読んでも見えないので、両方が要る。
 * 例外を持つ規律（position / transform）はあちら側だけが扱う。二重管理を避けるため。
 */

const flatlay: Record<string, unknown> = { ...flatlayNamespace }

type StyleFn = (props?: Record<string, unknown>) => Record<string, () => string>

/** `*Styles` という名前で公開されている tv() 定義をすべて集める。 */
function styleFns(): [name: string, fn: StyleFn][] {
  return Object.entries(flatlay)
    .filter(([name, value]) => name.endsWith('Styles') && typeof value === 'function')
    .map(([name, value]) => [name, value as StyleFn])
}

/** その定義が受け付ける slot 名（tv の戻り値のキー）。 */
const slotsOf = (fn: StyleFn): string[] => Object.keys(fn({}))

describe('公開 API', () => {
  it('すべての tv() 定義が named export されている（FR-04）', () => {
    // 拡張できないコンポーネントがあると「スタイルを所有できる」という約束が崩れる
    expect(styleFns().length).toBeGreaterThan(0)
    for (const [name, fn] of styleFns()) {
      expect(typeof fn, name).toBe('function')
    }
  })

  it('公開しているコンポーネント名が契約の語彙に含まれる', () => {
    const contracts = new Set(Object.keys(NOVI_CONTRACTS))
    const components = Object.keys(flatlay).filter(
      (name) =>
        /^[A-Z]/.test(name) &&
        !name.endsWith('Styles') &&
        // COLOR_OPTIONS のような定数はコンポーネントではない。
        // 大文字始まりだけで判定すると、公開する定数を1つ増やすたびにここが落ちる
        !/^[A-Z0-9_]+$/.test(name),
    )
    // 契約1つに複数の公開名が対応する（Tabs → TabItem / TabContent）ので接頭辞で見る。
    // 大小の揺れ（Textarea → TextArea）は ADR-05 が独自命名を作らない方を優先しているので
    // 小文字化して比べる
    const prefixes = [...contracts]
      .flatMap((c) => [c, c.replace(/s$/, '')])
      .map((c) => c.toLowerCase())
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

/** 全定義 × 全 variant × 全 color の、全 slot のクラス文字列を1つに集める。 */
function allClasses(): string {
  return styleFns()
    .flatMap(([, fn]) =>
      NOVI_VARIANTS.flatMap((variant) =>
        NOVI_COLORS.map((color) =>
          Object.values(fn({ variant, color }))
            .map((slot) => slot())
            .join(' '),
        ),
      ),
    )
    .join(' ')
}

describe('デザイン規律（全コンポーネント）', () => {
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

  it('色をリテラルで書いていない（すべてトークン経由・FR-06）', () => {
    expect(allClasses()).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(/)
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

describe('z 軸を持たない（FR-02 / 例外なし）', () => {
  // 両テーマは影とレイヤで階層を作る。Flatlay にはその層が無いので、
  // 影も z-index も「無いものを指している」ことになる。片方でも混ざれば原理が崩れる。

  it('影を一切持たない（浮く層が無い以上、影は嘘）', () => {
    // `shadow-none` すら書かせない。打ち消す対象が存在しないので、あるだけで誤解を生む
    expect(allClasses()).not.toMatch(/(?<![\w-])shadow-/)
  })

  it('z-index を一切持たない（重なりの順序は DOM 順だけで表す）', () => {
    expect(allClasses()).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
  })
})

describe('帳票の行（FR-07 / ADR-F7）', () => {
  // Flatlay の前提はポインタとキーボード。指の当たり判定を広げる細工はしない。
  // それは Tactile の領分で、そこが3本目の密度の identity になっている。

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
    ['button', flatlay.buttonStyles as StyleFn, 'root'],
    ['input', flatlay.inputStyles as StyleFn, 'inputWrapper'],
    ['number-field', flatlay.numberFieldStyles as StyleFn, 'inputWrapper'],
    ['combo-box', flatlay.comboBoxStyles as StyleFn, 'inputWrapper'],
    ['pagination', flatlay.paginationStyles as StyleFn, 'item'],
    ['select', flatlay.selectStyles as StyleFn, 'trigger'],
    ['tabs', flatlay.tabsStyles as StyleFn, 'tab'],
  ]

  it.each(CONTROLS)('%s: 高さが行の階級（28 / 32 / 40px）に載る', (name, fn, slot) => {
    const heights = NOVI_SIZES.map((size) => heightPx(fn({ size })[slot]?.() ?? ''))
    expect(heights, `${name} の高さが読めない`).not.toContain(null)
    expect(heights, name).toEqual([28, 32, 40])
  })

  it('当たり判定を擬似要素で広げていない', () => {
    // 見た目より広い領域が押せると、罫線で区切った帳票の「どこまでが1行か」が嘘になる
    expect(allClasses()).not.toMatch(/before:size-\[max\(/)
  })
})

describe('MVP の網羅（G1 / AC-03-2）', () => {
  /**
   * 契約名 → 公開されているコンポーネント名。
   *
   * 「あとで作る」つもりで抜けたまま公開されるのを防ぐ。個々のコンポーネントの
   * テストは各ファイルにあるが、**網羅していること自体**はここでしか担保できない。
   */
  const IMPLEMENTED: Record<string, string> = {
    Accordion: 'Accordion',
    Avatar: 'Avatar',
    Badge: 'Badge',
    Breadcrumbs: 'Breadcrumbs',
    Button: 'Button',
    Card: 'Card',
    Checkbox: 'Checkbox',
    CheckboxGroup: 'CheckboxGroup',
    ColorPicker: 'ColorPicker',
    ComboBox: 'ComboBox',
    Input: 'Input',
    Menu: 'Menu',
    Modal: 'Modal',
    NumberField: 'NumberField',
    Pagination: 'Pagination',
    Popover: 'Popover',
    Progress: 'Progress',
    Radio: 'Radio',
    RadioGroup: 'RadioGroup',
    Select: 'Select',
    Skeleton: 'Skeleton',
    Spinner: 'Spinner',
    Switch: 'Switch',
    Table: 'Table',
    Tabs: 'Tabs',
    Textarea: 'TextArea',
    Toast: 'NoviToastRegion',
    Tooltip: 'Tooltip',
  }

  it('core の全契約に対応する実装がある', () => {
    const missing = Object.keys(NOVI_CONTRACTS).filter((name) => !(name in IMPLEMENTED))
    expect(missing, '契約はあるが実装がない').toEqual([])
  })

  it.each(Object.entries(IMPLEMENTED))('%s が公開されている', (_contract, exportName) => {
    expect(flatlay[exportName]).toBeDefined()
  })

  it('MVP のコンポーネント数 + 追加分と一致する', () => {
    // Checkbox/CheckboxGroup、Radio/RadioGroup、Progress/Spinner は対で1コンポーネント
    const paired = ['CheckboxGroup', 'RadioGroup', 'Spinner']
    // MVP を締めたあとに足したもの。MVP の数（20）は歴史的な値として動かさない
    const postMvp = ['ColorPicker', 'NumberField', 'ComboBox', 'Pagination', 'Table']
    expect(Object.keys(IMPLEMENTED).length - paired.length - postMvp.length).toBe(
      NOVI_MVP_COMPONENT_COUNT,
    )
  })
})
