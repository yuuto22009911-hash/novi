/**
 * Tactile のトークン値。
 *
 * Tactile は「タッチファースト」。指で触る前提の寸法とモーションを持つ。
 * **すべて数値で固定する。** 値は目分量で決めず、`tactile-tokens.test.ts` の
 * 検査（コントラスト / chroma 帯域 / 影 α / radius 下限）を先に通すこと。
 *
 * 色は `color-set.ts`（specs/06-tones-and-colors）が持ち、ここは寸法・影・モーション。
 */
import { colorById, DEFAULT_COLOR_ID, neutralsFor, surfaceFor } from './color-set.ts'

/**
 * 角丸は `none` 以外 8px 以上（FR-09）。指で触れる面は丸い方が「押せる」と読まれる。
 *
 * `sm` が 8px なのは 24px 級の小部品（Checkbox の箱）が円に見えない上限でもある。
 */
export const TACTILE_RADII: Record<string, string> = {
  none: '0px',
  sm: '8px',
  md: '14px',
  lg: '20px',
  // Avatar / Radio の円、Badge と Switch の錠剤形が使う
  full: '9999px',
}

/**
 * 影は**面にも許可する**（Raster は浮く層だけ）。階層は持ち上がりで作る。
 *
 * `lg` だけ影が**上向き**なのは Tactile の性格そのもので、
 * 浮く面が画面下端から来るため光源に対して影が上に落ちる。
 * 不透明度は α ≤ 0.24 を検査が縛る。
 */
export const TACTILE_SHADOWS: Record<string, string> = {
  // `none` ではなく透明な影。ring も box-shadow に合成されるため、
  // `none` を混ぜると `box-shadow: <ring>, none` という不正値になり宣言ごと破棄され、
  // ring まで消える（実機で outline variant の境界線が消えていた）
  none: '0 0 #0000',
  // カード・行など「置かれている」面
  sm: '0 1px 3px oklch(20% 0.01 255 / 0.10), 0 1px 2px oklch(20% 0.01 255 / 0.06)',
  // メニュー・ポップオーバー
  md: '0 6px 16px oklch(20% 0.01 255 / 0.14), 0 2px 4px oklch(20% 0.01 255 / 0.08)',
  // 下から来るシート（モーダル・セレクト）
  lg: '0 -8px 32px oklch(20% 0.01 255 / 0.18), 0 -2px 8px oklch(20% 0.01 255 / 0.08)',
}

/** 本文 17px は iOS の本文寸法。腕を伸ばした距離で読む前提（比率 ≒1.23）。 */
export const TACTILE_TEXT: Record<string, string> = {
  xs: '13px',
  sm: '15px',
  base: '17px',
  lg: '21px',
  xl: '26px',
  '2xl': '32px',
  '3xl': '40px',
}

/**
 * 最小段でもタップ下限（44px）を視覚寸法で割らない。
 * `sm` の 40px は視覚寸法で、実効タップ領域は擬似要素で 44px に広げる（styles/tap-target.ts）。
 */
export const TACTILE_CONTROL_HEIGHTS: Record<string, number> = {
  sm: 40,
  md: 48,
  lg: 56,
}

/**
 * モーションは3段。下から出る面は移動距離が長く、120ms では瞬間移動に見える。
 * `ease-emphasized` は減速主体でオーバーシュートしない（質量のある面が止まる感じ）。
 */
export const TACTILE_MOTION: Record<string, string> = {
  'duration-fast': '120ms',
  'duration-base': '200ms',
  'duration-slow': '260ms',
  'ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
  'ease-emphasized': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
}

const DEFAULT_COLOR = colorById(DEFAULT_COLOR_ID)
const DEFAULT_PAIR = colorById(DEFAULT_COLOR.pair)

/**
 * 意味を持つ色。**色選択の影響を受けない**（FR-08）。
 * 状態の認知は既定色の統一より優先する。
 */
const SEMANTIC_LIGHT = {
  success: 'oklch(48% 0.12 155)',
  'success-fg': 'oklch(98.5% 0.004 155)',
  warning: 'oklch(48% 0.12 62)',
  'warning-fg': 'oklch(98.5% 0.004 62)',
  danger: 'oklch(50% 0.16 27)',
  'danger-fg': 'oklch(98.5% 0.004 27)',
}

const SEMANTIC_DARK = {
  success: 'oklch(78% 0.12 155)',
  'success-fg': 'oklch(18% 0.02 155)',
  warning: 'oklch(82% 0.12 65)',
  'warning-fg': 'oklch(18% 0.02 65)',
  danger: 'oklch(74% 0.14 27)',
  'danger-fg': 'oklch(18% 0.02 27)',
}

/**
 * 既定色（Indigo）で染めた色トークン一式。
 * `data-novi-color` で別の染料を選ぶと、生成 CSS がこれらを丸ごと差し替える。
 */
export const TACTILE_LIGHT_COLORS: Record<string, string> = {
  ...neutralsFor(DEFAULT_COLOR.hue, 'light'),
  surface: surfaceFor(DEFAULT_COLOR.hue, 'light'),
  primary: DEFAULT_COLOR.light.primary,
  'primary-fg': DEFAULT_COLOR.light.primaryFg,
  secondary: DEFAULT_PAIR.light.primary,
  'secondary-fg': DEFAULT_PAIR.light.primaryFg,
  ...SEMANTIC_LIGHT,
}

export const TACTILE_DARK_COLORS: Record<string, string> = {
  ...neutralsFor(DEFAULT_COLOR.hue, 'dark'),
  surface: surfaceFor(DEFAULT_COLOR.hue, 'dark'),
  primary: DEFAULT_COLOR.dark.primary,
  'primary-fg': DEFAULT_COLOR.dark.primaryFg,
  secondary: DEFAULT_PAIR.dark.primary,
  'secondary-fg': DEFAULT_PAIR.dark.primaryFg,
  ...SEMANTIC_DARK,
}

/** 染まる中立色のトークン名（chroma 帯域の検査対象）。 */
export const NEUTRAL_COLOR_KEYS = Object.keys(neutralsFor(0, 'light'))

/** 有彩であることが必須のトークン名。 */
export const SEMANTIC_COLOR_KEYS = Object.keys(SEMANTIC_LIGHT)

/** 中立色の chroma 帯域。0 は無機質すぎ、0.02 超は色が付いて見える（ADR-T6）。 */
export const NEUTRAL_CHROMA_RANGE = { min: 0.004, max: 0.02 } as const

/** 意味を持つ色の chroma 上限。 */
export const MAX_SEMANTIC_CHROMA = 0.19

/** 影の不透明度の上限。これを超えると影が「汚れ」に見える。 */
export const MAX_SHADOW_ALPHA = 0.24

/** `none` 以外の角丸の下限。指の面は丸い。 */
export const MIN_RADIUS_PX = 8
