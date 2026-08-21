/**
 * Raster のトークン値。
 *
 * Raster は「ミニマル / スイス系」。ごまかしが効かないので、
 * 余白・階層・整列の精度がそのまま出る。**すべて数値で固定する。**
 *
 * 値は目分量で決めない。`raster-tokens.test.ts` のコントラスト検査を先に通すこと。
 */

/**
 * 角丸は3段の階調を持つ（ADR-R8 で改定。旧: 全て 2px）。
 *
 * 完全な直角は 2020 年代の画面では「古い」と読まれる。控えめな丸みは
 * ミニマルさを損なわず、密度の高い画面の目の負担を下げる。
 * 部位ごとの既定: 小さな部品 sm / 操作類 md / 浮く面 lg。
 */
export const RASTER_RADII: Record<string, string> = {
  none: '0px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  // Avatar と Radio の円、Switch の錠剤形が使う
  full: '9999px',
}

/**
 * 影は**浮いている層だけ**が持つ（ADR-R8 で改定。旧: 全て none）。
 *
 * 面（カード・入力）は今も平らで、境界線と背景色の差で階層を作る。
 * ただしメニューやダイアログが平らだと、下の内容と同じ平面に貼り付いて見え、
 * どこまでが浮いているのか輪郭線を追わないと分からない。
 * 低不透明度の柔らかい影は「浮いている」という事実だけを伝える。
 */
export const RASTER_SHADOWS: Record<string, string> = {
  none: 'none',
  // 将来の微細な持ち上げ用。現在のコンポーネントは使わない
  sm: '0 1px 2px oklch(15% 0 0 / 0.06)',
  // ポップオーバー・メニュー・ツールチップ
  md: '0 4px 12px oklch(15% 0 0 / 0.1), 0 1px 3px oklch(15% 0 0 / 0.06)',
  // モーダル・トースト
  lg: '0 16px 40px oklch(15% 0 0 / 0.16), 0 4px 12px oklch(15% 0 0 / 0.08)',
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
  border: 'oklch(92% 0 0)',
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
  border: 'oklch(27% 0 0)',
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
  // 青紫寄りの indigo。古典的な「リンクの青」（hue 250）は 2010 年代の既定色として
  // 記憶されすぎている。hue 265 は同じ信頼感を保ったまま現代の道具の色になる
  primary: 'oklch(50% 0.19 265)',
  'primary-fg': 'oklch(99% 0 0)',
  secondary: 'oklch(48% 0.15 300)',
  'secondary-fg': 'oklch(99% 0 0)',
  success: 'oklch(47% 0.13 155)',
  'success-fg': 'oklch(99% 0 0)',
  // hue 70 は olive に寄って濁る。60 で琥珀に寄せる
  warning: 'oklch(47% 0.13 60)',
  'warning-fg': 'oklch(99% 0 0)',
  danger: 'oklch(50% 0.19 27)',
  'danger-fg': 'oklch(99% 0 0)',
}

const SEMANTIC_DARK = {
  primary: 'oklch(76% 0.13 265)',
  'primary-fg': 'oklch(16% 0 0)',
  secondary: 'oklch(76% 0.12 300)',
  'secondary-fg': 'oklch(16% 0 0)',
  success: 'oklch(77% 0.13 155)',
  'success-fg': 'oklch(16% 0 0)',
  warning: 'oklch(81% 0.13 65)',
  'warning-fg': 'oklch(16% 0 0)',
  danger: 'oklch(73% 0.16 27)',
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
