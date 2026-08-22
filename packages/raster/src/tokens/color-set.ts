/**
 * Raster のカラーセット「Print Inks」とトーン。
 *
 * **specs/06-tones-and-colors が唯一の真実**で、ここはその写し。
 * 値を変えるときは spec を先に変える（Ask first — 全組み合わせの検査対象が変わるため）。
 *
 * トーン（L / C）はモデルが所有し、色は hue と名前だけを持つ（ADR-C01）。
 * 差し色は新しい色を作らず、同じセット内の別のインクを組む「2色刷り」（ADR-C03）。
 * 全値はここで事前計算し、生成器・テスト・IR が同じ計算結果を読む（ADR-C02）。
 */

export interface RasterTone {
  /** OKLCH の L（% 単位の数値。44 = 44%） */
  l: number
  /** OKLCH の C */
  c: number
}

/**
 * Print Inks のトーン。
 * light の C 0.090 は、このセットでの色域上限 0.095（律速 Ochre）の 0.005 内側。
 */
export const RASTER_TONE: { light: RasterTone; dark: RasterTone } = {
  light: { l: 44, c: 0.09 },
  dark: { l: 74, c: 0.09 },
}

export interface RasterColorDef {
  /** `data-novi-color` に指定する名前（kebab-case） */
  id: string
  /** 表示名 */
  name: string
  /** OKLCH の hue（度） */
  hue: number
  /** 2色刷りの相方。`--novi-color-secondary` にこの色の値が入る */
  pair: string
  /** 1行の出自。docs / llms / MCP が使う */
  description: string
  /** 無彩枠だけが持つ C の例外値（light） */
  fixedC?: number
  /** 同・dark */
  fixedCDark?: number
}

/**
 * 8色。全色が顔料・インクの実名を持つ。
 * 紫・青緑・ピンクは意図的に入れていない（Tactile のセット候補。入れない色で性格を作る）。
 */
const COLOR_DEFS: readonly RasterColorDef[] = [
  {
    id: 'ink',
    name: 'Ink',
    hue: 268,
    pair: 'brick',
    description: '万年筆の藍黒。書き物の色。既定色',
  },
  {
    id: 'prussian',
    name: 'Prussian',
    hue: 235,
    pair: 'ochre',
    description: '紺青。18世紀からある合成顔料の名',
  },
  {
    id: 'forest',
    name: 'Forest',
    hue: 160,
    pair: 'ochre',
    description: '深い常緑。製図インクの緑',
  },
  { id: 'olive', name: 'Olive', hue: 125, pair: 'ink', description: 'オリーブドラブ。土に近い緑' },
  {
    id: 'ochre',
    name: 'Ochre',
    hue: 70,
    pair: 'prussian',
    description: '黄土。最古の顔料のひとつ',
  },
  {
    id: 'brick',
    name: 'Brick',
    hue: 35,
    pair: 'ink',
    description: '煉瓦の朱。スイスポスターの赤の末裔',
  },
  { id: 'bordeaux', name: 'Bordeaux', hue: 12, pair: 'ochre', description: 'ワインの澱の赤' },
  {
    id: 'graphite',
    name: 'Graphite',
    hue: 270,
    pair: 'brick',
    description: '黒鉛。色を消すという選択肢',
    fixedC: 0.02,
    fixedCDark: 0.017,
  },
]

/** `data-novi-color` 未指定・未知の名前のときに効く色（FR-05） */
export const DEFAULT_COLOR_ID = 'ink'

/**
 * OKLCH → 線形 sRGB。
 * core の testing にも同じ変換があるが、あちらは文字列 API でテスト専用。
 * ここは生成器（Node 実行）からも呼ぶため、依存なしで持つ。
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

/**
 * その OKLCH が sRGB で再現できるか。
 *
 * トーンの天井はコントラストではなくこれが決める（暗く鮮やかな黄・青緑は sRGB に無い）。
 * 「表示はされるが実際は別の色に丸められている」を仕様上の合格にしないための検査。
 *
 * @param l 0〜1 の L（`parseOklch` の返り値と同じ単位）
 */
export function inSrgbGamut(l: number, c: number, hue: number): boolean {
  const tolerance = 0.0005
  return toLinearSrgb(l, c, hue).every((v) => v >= -tolerance && v <= 1 + tolerance)
}

export interface RasterColorSchemeValues {
  primary: string
  primaryFg: string
}

export interface RasterColorEntry extends RasterColorDef {
  light: RasterColorSchemeValues
  dark: RasterColorSchemeValues
}

/** 文字色は地色と同じ値（bg light / bg dark）。面の上に地の色で書く、が Raster の約束。 */
const PRIMARY_FG_LIGHT = 'oklch(99% 0 0)'
const PRIMARY_FG_DARK = 'oklch(16% 0 0)'

const oklch = (l: number, c: number, hue: number) => `oklch(${l}% ${c} ${hue})`

/**
 * 定義（hue と例外 C）とトーンから、実際の CSS 値を組み立てる。
 * テストが不正な色（域外の hue × C）を作って検査を確かめるのにも使う（AC-03-4）。
 */
export function buildColorEntry(
  def: RasterColorDef,
  tone: { light: RasterTone; dark: RasterTone } = RASTER_TONE,
): RasterColorEntry {
  return {
    ...def,
    light: {
      primary: oklch(tone.light.l, def.fixedC ?? tone.light.c, def.hue),
      primaryFg: PRIMARY_FG_LIGHT,
    },
    dark: {
      primary: oklch(tone.dark.l, def.fixedCDark ?? tone.dark.c, def.hue),
      primaryFg: PRIMARY_FG_DARK,
    },
  }
}

/** Print Inks の全8色（事前計算済み） */
export const RASTER_COLOR_SET: readonly RasterColorEntry[] = COLOR_DEFS.map((def) =>
  buildColorEntry(def),
)

/** @throws セットに無い id（相方の参照ミスは実行時ではなくここで死ぬべき） */
export function colorById(id: string): RasterColorEntry {
  const entry = RASTER_COLOR_SET.find((c) => c.id === id)
  if (entry === undefined) throw new Error(`Print Inks に無い色です: ${id}`)
  return entry
}
