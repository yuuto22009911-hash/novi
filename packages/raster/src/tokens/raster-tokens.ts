/**
 * Raster のトークン値。
 *
 * Raster は「ミニマル / スイス系」。ごまかしが効かないので、
 * 余白・階層・整列の精度がそのまま出る。**すべて数値で固定する。**
 *
 * 値は目分量で決めない。`raster-tokens.test.ts` のコントラスト検査を先に通すこと。
 */

/**
 * 角を立てるのが Raster の思想。
 *
 * API としては `radius="lg"` を受け付けるが、Raster では見た目が変わらない。
 * これは仕様であって不具合ではない（ADR-R1）。語彙は共通、解釈はテーマの自由。
 */
export const RASTER_RADII: Record<string, string> = {
  none: '0px',
  sm: '2px',
  md: '2px',
  lg: '2px',
  // Avatar と Radio の円だけが使う例外
  full: '9999px',
}

/** 影は使わない。階層は境界線と背景色の差だけで表す。 */
export const RASTER_SHADOWS: Record<string, string> = {
  none: 'none',
  sm: 'none',
  md: 'none',
  lg: 'none',
}

/** 比率 1.2（minor third）。単一比率で階層を作るのがスイス的。 */
export const RASTER_TEXT: Record<string, string> = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '30px',
  '3xl': '36px',
}

/** 8px グリッド上に乗る高さ。タップ領域は最小 24px、タッチ環境は 44px を目標。 */
export const RASTER_CONTROL_HEIGHTS: Record<string, number> = {
  sm: 32,
  md: 40,
  lg: 48,
}

/** モーションは fast のみ使う。動きで飾らない。 */
export const RASTER_MOTION: Record<string, string> = {
  'duration-fast': '120ms',
  'duration-base': '120ms',
  'duration-slow': '120ms',
  'ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
  'ease-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
}

/**
 * 中立色。**chroma は必ず 0**（AC-01-3）。
 * 面と文字の階層は明度だけで作る。
 */
const NEUTRAL_LIGHT = {
  bg: 'oklch(99% 0 0)',
  subtle: 'oklch(96% 0 0)',
  fg: 'oklch(20% 0 0)',
  muted: 'oklch(48% 0 0)',
  border: 'oklch(88% 0 0)',
  'border-strong': 'oklch(58% 0 0)',
  overlay: 'oklch(20% 0 0 / 0.45)',
  default: 'oklch(96% 0 0)',
  'default-fg': 'oklch(20% 0 0)',
}

const NEUTRAL_DARK = {
  bg: 'oklch(16% 0 0)',
  subtle: 'oklch(21% 0 0)',
  fg: 'oklch(95% 0 0)',
  muted: 'oklch(72% 0 0)',
  border: 'oklch(28% 0 0)',
  'border-strong': 'oklch(55% 0 0)',
  overlay: 'oklch(10% 0 0 / 0.6)',
  default: 'oklch(25% 0 0)',
  'default-fg': 'oklch(95% 0 0)',
}

/**
 * 意味を持つ色。**ここだけが有彩**（AC-01-4）。
 * 装飾には使わない。状態や結果を伝えるためだけに使う。
 */
const SEMANTIC_LIGHT = {
  primary: 'oklch(48% 0.18 250)',
  'primary-fg': 'oklch(99% 0 0)',
  secondary: 'oklch(46% 0.16 300)',
  'secondary-fg': 'oklch(99% 0 0)',
  success: 'oklch(45% 0.13 150)',
  'success-fg': 'oklch(99% 0 0)',
  warning: 'oklch(45% 0.12 70)',
  'warning-fg': 'oklch(99% 0 0)',
  danger: 'oklch(48% 0.19 25)',
  'danger-fg': 'oklch(99% 0 0)',
}

const SEMANTIC_DARK = {
  primary: 'oklch(74% 0.14 250)',
  'primary-fg': 'oklch(16% 0 0)',
  secondary: 'oklch(74% 0.13 300)',
  'secondary-fg': 'oklch(16% 0 0)',
  success: 'oklch(76% 0.13 150)',
  'success-fg': 'oklch(16% 0 0)',
  warning: 'oklch(82% 0.12 70)',
  'warning-fg': 'oklch(16% 0 0)',
  danger: 'oklch(72% 0.16 25)',
  'danger-fg': 'oklch(16% 0 0)',
}

export const RASTER_LIGHT_COLORS: Record<string, string> = { ...NEUTRAL_LIGHT, ...SEMANTIC_LIGHT }
export const RASTER_DARK_COLORS: Record<string, string> = { ...NEUTRAL_DARK, ...SEMANTIC_DARK }

/** chroma 0 が必須のトークン名。 */
export const NEUTRAL_COLOR_KEYS = Object.keys(NEUTRAL_LIGHT)

/** 有彩であることが必須のトークン名。 */
export const SEMANTIC_COLOR_KEYS = Object.keys(SEMANTIC_LIGHT)

/** 意味を持つ色の chroma 上限。これを超えると色が主張しすぎて Raster でなくなる。 */
export const MAX_SEMANTIC_CHROMA = 0.19
