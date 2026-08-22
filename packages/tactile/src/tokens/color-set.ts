/**
 * Tactile のカラーセット「Textile Dyes」とトーン。
 *
 * **specs/06-tones-and-colors が唯一の真実**で、ここはその写し。
 * 構造は Raster の `color-set.ts` と同じだが、値は独立している（ADR-C01）:
 * トーンは明るく淡く（L54/C0.080）、色は染料の名を持ち、hue は Raster と1つも重ならない。
 *
 * Raster との最大の違いは **`neutralsFollowHue`**。Tactile は染まる生地なので、
 * 中立色まで選んだ染料の hue を帯びる（FR-06）。Raster は染まらない紙で chroma 0 のまま。
 */

export interface TactileTone {
  /** OKLCH の L（% 単位の数値。54 = 54%） */
  l: number
  /** OKLCH の C */
  c: number
}

/**
 * Textile Dyes のトーン。
 *
 * light の L50 は掃引で決めた値。**律速は常に Peacock を `subtle` 面に置いたとき**で、
 * L52 では余裕が 0.1 を切り、L54 以上はどの C でも 4.5:1 に届かない。
 * L50 なら 4.93 で、丸めや将来の微調整に耐える余裕が残る。
 * Raster（L44）との差は 6 ポイントで、トーンはモデルの識別子として機能する。
 */
export const TACTILE_TONE: { light: TactileTone; dark: TactileTone } = {
  light: { l: 50, c: 0.08 },
  dark: { l: 76, c: 0.075 },
}

export interface TactileColorDef {
  /** `data-novi-color` に指定する名前（kebab-case） */
  id: string
  /** 表示名 */
  name: string
  /** OKLCH の hue（度） */
  hue: number
  /** バイカラーの相方。`--novi-color-secondary` にこの色の値が入る */
  pair: string
  /** 1行の出自。docs / llms / MCP が使う */
  description: string
  /** 無彩枠だけが持つ C の例外値（light） */
  fixedC?: number
  /** 同・dark */
  fixedCDark?: number
}

/**
 * 8色。全色が布を染めてきた染料の実名を持つ。
 * 紫・青緑・ピンクは Raster に無く、ここにある。入れる色と入れない色でモデルの性格を作る。
 */
const COLOR_DEFS: readonly TactileColorDef[] = [
  {
    id: 'indigo',
    name: 'Indigo',
    hue: 255,
    pair: 'saffron',
    description: '藍。デニムを染めた染料。既定色',
  },
  {
    id: 'peacock',
    name: 'Peacock',
    hue: 200,
    pair: 'madder',
    description: '孔雀の青緑。羽の見る角度の色',
  },
  {
    id: 'sage',
    name: 'Sage',
    hue: 148,
    pair: 'cochineal',
    description: 'セージの葉。くすみグリーンの定番',
  },
  {
    id: 'saffron',
    name: 'Saffron',
    hue: 78,
    pair: 'indigo',
    description: 'サフラン。染料にも香辛料にもなる黄',
  },
  {
    id: 'madder',
    name: 'Madder',
    hue: 28,
    pair: 'peacock',
    description: '茜。人類最古級の赤い染料',
  },
  {
    id: 'cochineal',
    name: 'Cochineal',
    hue: 5,
    pair: 'sage',
    description: 'コチニール。紅を生む染料',
  },
  {
    id: 'mauve',
    name: 'Mauve',
    hue: 315,
    pair: 'sage',
    description: 'モーブ。1856年、史上初の合成染料',
  },
  {
    id: 'greige',
    name: 'Greige',
    hue: 80,
    pair: 'indigo',
    description: '生機。染める前の布の色。無彩枠',
    fixedC: 0.022,
    fixedCDark: 0.018,
  },
]

/** `data-novi-color` 未指定・未知の名前のときに効く色（FR-05） */
export const DEFAULT_COLOR_ID = 'indigo'

/**
 * OKLCH → 線形 sRGB。
 * 生成器（Node 実行）からも呼ぶため、依存なしで持つ（Raster と同じ理由）。
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
 * 染まる中立色の配合（FR-06）。
 *
 * L は固定で、chroma と hue だけが染料に従う。`--novi-color-*` の全中立トークンを
 * この表から生成するため、色を選ぶと地の色ごと変わる。
 * chroma は 0.004〜0.02 の帯域に収める（ADR-T6）。
 */
const NEUTRAL_RECIPE = {
  light: {
    bg: { l: 97.6, c: 0.006 },
    subtle: { l: 94.5, c: 0.009 },
    fg: { l: 22, c: 0.015 },
    muted: { l: 47, c: 0.012 },
    border: { l: 90, c: 0.011 },
    'border-strong': { l: 63, c: 0.013 },
    default: { l: 94.5, c: 0.009 },
    'default-fg': { l: 22, c: 0.015 },
  },
  // dark は「持ち上がるほど明るい」。bg < subtle < surface の順を崩さないこと
  dark: {
    bg: { l: 14, c: 0.012 },
    subtle: { l: 20, c: 0.014 },
    fg: { l: 94, c: 0.008 },
    muted: { l: 70, c: 0.012 },
    border: { l: 30, c: 0.015 },
    'border-strong': { l: 55, c: 0.014 },
    default: { l: 20, c: 0.014 },
    'default-fg': { l: 94, c: 0.008 },
  },
} as const

/** 浮く面（シート・メニュー）の色。地より明るくして「持ち上がり」を作る（AC-06-3）。 */
const SURFACE_RECIPE = {
  light: { l: 99.3, c: 0.004 },
  // dark で 24% なのは bg(14%) との背景色差 1.2:1 を満たす下限。
  // 暗所では影がほとんど見えないため、浮きは明度差で伝えるしかない（AC-06-3）
  dark: { l: 24, c: 0.014 },
} as const

export type Scheme = 'light' | 'dark'

const oklch = (l: number, c: number, hue: number) => `oklch(${l}% ${c} ${hue})`

/** その染料で染めた中立色一式を作る。 */
export function neutralsFor(hue: number, scheme: Scheme): Record<string, string> {
  const recipe = NEUTRAL_RECIPE[scheme]
  const out: Record<string, string> = {}
  for (const [name, { l, c }] of Object.entries(recipe)) {
    out[name] = oklch(l, c, hue)
  }
  // overlay は背景を覆う暗幕。alpha を持つため個別に組む
  out.overlay = scheme === 'light' ? `oklch(20% 0.01 ${hue} / 0.45)` : `oklch(8% 0.01 ${hue} / 0.6)`
  return out
}

/** 浮く面の色。`--novi-color-surface` として出力する。 */
export function surfaceFor(hue: number, scheme: Scheme): string {
  const { l, c } = SURFACE_RECIPE[scheme]
  return oklch(l, c, hue)
}

export interface TactileColorSchemeValues {
  primary: string
  primaryFg: string
}

export interface TactileColorEntry extends TactileColorDef {
  light: TactileColorSchemeValues
  dark: TactileColorSchemeValues
}

/** primary の面に乗る文字。染料の hue をわずかに含ませて、地と同じ空気にする。 */
const primaryFgFor = (hue: number, scheme: Scheme) =>
  scheme === 'light' ? oklch(98.5, 0.004, hue) : oklch(18, 0.02, hue)

/**
 * 定義とトーンから実際の CSS 値を組み立てる。
 * テストが不正な色を作って検査を確かめるのにも使う（AC-03-4 相当）。
 */
export function buildColorEntry(
  def: TactileColorDef,
  tone: { light: TactileTone; dark: TactileTone } = TACTILE_TONE,
): TactileColorEntry {
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

/** Textile Dyes の全8色（事前計算済み） */
export const TACTILE_COLOR_SET: readonly TactileColorEntry[] = COLOR_DEFS.map((def) =>
  buildColorEntry(def),
)

/** @throws セットに無い id（相方の参照ミスは実行時ではなくここで死ぬべき） */
export function colorById(id: string): TactileColorEntry {
  const entry = TACTILE_COLOR_SET.find((c) => c.id === id)
  if (entry === undefined) throw new Error(`Textile Dyes に無い色です: ${id}`)
  return entry
}
