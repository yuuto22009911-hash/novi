/**
 * Flatlay のカラーセット「Stationery」とトーン。
 *
 * **specs/06-tones-and-colors と specs/07-theme-flatlay が唯一の真実**で、ここはその写し。
 * 構造は Raster / Tactile の `color-set.ts` と同じだが、値も**染まり方**も独立している。
 *
 * 三部作の中立色の扱いは3方式ある:
 * - Raster   染まらない紙（中立は完全な無彩）
 * - Tactile  染まる生地（中立まで hue に従う）
 * - Flatlay  **地は染まらず、罫線だけが染まる**（FR-07）
 *
 * 第3方式なのは、Flatlay が階層を罫線でしか作れないため。
 * 唯一の階層表現に色を持たせないと、色を選んだ実感がどこにも出ない。
 */

export interface FlatlayTone {
  /** OKLCH の L（% 単位の数値。47 = 47%） */
  l: number
  /** OKLCH の C */
  c: number
}

/**
 * Stationery のトーン。
 *
 * 三部作で L は 44 / 50 / **47**、C は light 0.090 / 0.080 / **0.070** の等差になる。
 * L47 は掃引で決めた値で、律速は **Fieldbook を `subtle` 面に置いたとき（5.76:1）**。
 * 実用上限は L52（4.65:1）で、L53 で 4.46:1 と基準を割る。上限ぎりぎりを採らないのは、
 * 後から subtle の明度を動かせなくなるため（`flatlay-tokens.test.ts` の変異テストが境界を固定する）。
 * C を両テーマより低く取るのは、机の上の事務道具は染料でも印刷インクでもなく、
 * 「褪せた実用品の色」だから。
 */
export const FLATLAY_TONE: { light: FlatlayTone; dark: FlatlayTone } = {
  light: { l: 47, c: 0.07 },
  dark: { l: 75, c: 0.06 },
}

export interface FlatlayColorDef {
  /** `data-novi-color` に指定する名前（kebab-case） */
  id: string
  /** 表示名 */
  name: string
  /** OKLCH の hue（度） */
  hue: number
  /** 相方（ダブルエントリー）。`--novi-color-secondary` にこの色の値が入る */
  pair: string
  /** 1行の出自。docs / llms / MCP が使う */
  description: string
  /** 無彩枠だけが持つ C の例外値（light） */
  fixedC?: number
  /** 同・dark */
  fixedCDark?: number
}

/**
 * 8色。全色が**机の上の事務道具**の実名を持つ。
 *
 * **赤が無いのは欠落ではなく決定**（requirements Background）。校正の朱書きは
 * エラー表示の道具なので、赤は意味色（danger）に予約する。
 * primary が danger と紛れる事故を、規則ではなく世界観で防ぐ。
 */
const COLOR_DEFS: readonly FlatlayColorDef[] = [
  {
    id: 'fieldbook',
    name: 'Fieldbook',
    hue: 172,
    pair: 'eraser',
    description: '測量野帳の表紙の緑。既定色',
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    hue: 215,
    pair: 'manila',
    description: '青焼き図面の青',
  },
  {
    id: 'carbon',
    name: 'Carbon',
    hue: 288,
    pair: 'legalpad',
    description: 'カーボン複写紙の紫',
  },
  {
    id: 'ribbon',
    name: 'Ribbon',
    hue: 330,
    pair: 'fieldbook',
    description: 'タイプライターのインクリボン',
  },
  {
    id: 'eraser',
    name: 'Eraser',
    hue: 352,
    pair: 'pencil',
    description: 'ピンクの消しゴム',
  },
  {
    id: 'manila',
    name: 'Manila',
    hue: 58,
    pair: 'blueprint',
    description: 'マニラ封筒の黄土',
  },
  {
    id: 'legalpad',
    name: 'Legalpad',
    hue: 98,
    pair: 'carbon',
    description: '黄色いリーガルパッド',
  },
  {
    id: 'pencil',
    name: 'Pencil',
    hue: 240,
    pair: 'eraser',
    description: '鉛筆の芯。無彩枠',
    fixedC: 0.02,
    fixedCDark: 0.017,
  },
]

/**
 * `data-novi-color` 未指定・未知の名前のときに効く色（FR-08）。
 *
 * Fieldbook（緑）なのは、Ink 268・Indigo 255 に続く**3代連続の藍を避ける**ため
 * （デザイン診断 B-2）。既定色はモデルの第一印象そのものになる。
 */
export const DEFAULT_COLOR_ID = 'fieldbook'

/**
 * OKLCH → 線形 sRGB。
 * 生成器（Node 実行）からも呼ぶため、依存なしで持つ（両テーマと同じ理由）。
 */
function toLinearSrgb(l: number, c: number, hue: number): [number, number, number] {
  const rad = (hue * Math.PI) / 180
  const a = c * Math.cos(rad)
  const b = c * Math.sin(rad)

  const lc = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mc = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const sc = (l - 0.0894841775 * a - 1.291485548 * b) ** 3

  return [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ]
}

/** その OKLCH が sRGB で再現できるか。トーンの天井はコントラストではなくこれが決める。 */
export function inSrgbGamut(l: number, c: number, hue: number): boolean {
  const tolerance = 0.0005
  return toLinearSrgb(l, c, hue).every((v) => v >= -tolerance && v <= 1 + tolerance)
}

/**
 * 染まらない紙の配合。**chroma は 0 で固定**（FR-07）。
 *
 * `surface` が `bg` と同値なのは Flatlay の性格そのもの。浮く面が存在しないので、
 * 「持ち上がった面の色」という概念が要らない。面の境目は罫線だけが作る。
 * `overlay` も同じ理由で暗幕ではなく紙色になる（ADR-F2）。
 */
const PAPER_RECIPE = {
  light: {
    bg: 98.8,
    subtle: 95.5,
    surface: 98.8,
    overlay: 98.8,
    fg: 22,
    muted: 46,
    default: 95.5,
    'default-fg': 22,
  },
  dark: {
    bg: 15,
    subtle: 20,
    surface: 15,
    overlay: 15,
    fg: 94,
    muted: 70,
    default: 20,
    'default-fg': 94,
  },
} as const

/**
 * 染まる罫線の配合。**Flatlay で唯一 hue に従うトークン**。
 *
 * C は 0.02〜0.03 の帯域。これ未満だと選んだ色が見えず、超えると
 * 「線に色が塗ってある」ようになって帳票の顔から外れる。
 * `border-strong` の L は全 hue で bg に対し 3:1 を満たす値（実測 3.99〜4.20:1）。
 */
const RULE_RECIPE = {
  light: {
    border: { l: 88, c: 0.025 },
    'border-strong': { l: 58, c: 0.03 },
  },
  dark: {
    border: { l: 32, c: 0.022 },
    'border-strong': { l: 55, c: 0.03 },
  },
} as const

export type Scheme = 'light' | 'dark'

const oklch = (l: number, c: number, hue: number) => `oklch(${l}% ${c} ${hue})`

/**
 * その色を選んだときの中立色一式。
 * 地・文字は hue を渡しても無彩のまま返り、罫線 2 本だけが染まる。
 */
export function neutralsFor(hue: number, scheme: Scheme): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, l] of Object.entries(PAPER_RECIPE[scheme])) {
    out[name] = oklch(l, 0, 0)
  }
  for (const [name, { l, c }] of Object.entries(RULE_RECIPE[scheme])) {
    out[name] = oklch(l, c, hue)
  }
  return out
}

export interface FlatlayColorSchemeValues {
  primary: string
  primaryFg: string
}

export interface FlatlayColorEntry extends FlatlayColorDef {
  light: FlatlayColorSchemeValues
  dark: FlatlayColorSchemeValues
}

/**
 * 色面に乗る文字。押下で反転すると**この色が面になる**ため（ADR-F3）、
 * 地の紙とほぼ同じ明度に置いて、反転しても紙の上に見えるようにする。
 */
const primaryFgFor = (hue: number, scheme: Scheme) =>
  scheme === 'light' ? oklch(98.5, 0.004, hue) : oklch(18, 0.02, hue)

/**
 * 定義とトーンから実際の CSS 値を組み立てる。
 * テストが不正なトーンを作って検査そのものを確かめるのにも使う。
 */
export function buildColorEntry(
  def: FlatlayColorDef,
  tone: { light: FlatlayTone; dark: FlatlayTone } = FLATLAY_TONE,
): FlatlayColorEntry {
  return {
    ...def,
    light: {
      primary: oklch(tone.light.l, def.fixedC ?? tone.light.c, def.hue),
      primaryFg: primaryFgFor(def.hue, 'light'),
    },
    dark: {
      primary: oklch(tone.dark.l, def.fixedCDark ?? tone.dark.c, def.hue),
      primaryFg: primaryFgFor(def.hue, 'dark'),
    },
  }
}

/** Stationery の全8色（事前計算済み） */
export const FLATLAY_COLOR_SET: readonly FlatlayColorEntry[] = COLOR_DEFS.map((def) =>
  buildColorEntry(def),
)

/** @throws セットに無い id（相方の参照ミスは実行時ではなくここで死ぬべき） */
export function colorById(id: string): FlatlayColorEntry {
  const entry = FLATLAY_COLOR_SET.find((c) => c.id === id)
  if (entry === undefined) throw new Error(`Stationery に無い色です: ${id}`)
  return entry
}
