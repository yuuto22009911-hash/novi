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
 * 内側の余白。**3モデルで最大**（ADR-D1）。
 *
 * 触覚モデルの支配軸は「面積」。指が触れる面は空間を要求するので、
 * 面（Card / Modal / Popover / シート）は左右 28px・上下 24px を取る。
 * 左右を上下より広くしているのは、横は指がはみ出しても押し間違いにならないが、
 * 縦は隣の行に当たるため — 詰めていい方向と詰めてはいけない方向が違う。
 *
 * `control-x-*` はコントロールの左右で、段の差はここにだけ出る。
 * 指の接触面は文字の幅より大きいので、文字量に対して常に広く取る。
 */
export const TACTILE_PAD: Record<string, string> = {
  'surface-x': '28px',
  'surface-y': '24px',
  'control-x-sm': '16px',
  'control-x-md': '20px',
  'control-x-lg': '24px',
}

/**
 * 要素間の距離。**絶対値ではなく比が余白の知覚を作る。**
 *
 * inline(10) < stack(20) < section(32) で、隣の段との比を 1.6 倍以上に開ける。
 * 以前は Card の header / body / footer が py-3 / py-4 / py-3 と実質 1:1 で、
 * 「グループ内」と「グループ間」が同じ距離だった。比が 1 に潰れると、
 * どれだけ絶対値を増やしても中身は詰まって見える。
 */
export const TACTILE_GAP: Record<string, string> = {
  // アイコンと文字、ラベルと補足など「1つの塊の内側」
  inline: '10px',
  // 積まれた行どうし。塊の境目が読める最小の距離
  stack: '20px',
  // 区画と区画。ここだけスクロールの単位として認識される
  section: '32px',
}

/**
 * 字送り。**normal を +0.006em とわずかに開けているのは Tactile だけ。**
 *
 * 字を詰めると硬くなり、開けると柔らかくなる。触って操作する面は柔らかい方が近い。
 * Raster の 0em（機械的な既定値のまま）、Flatlay の +0.01em（規則性の表明）に対する
 * 第3の声で、3モデルが同じタイポに潰れないための識別子でもある。
 *
 * `tight` を負にするのは見出しだけ。大きい字は既定の字間だとバラけて見える。
 */
export const TACTILE_TRACKING: Record<string, string> = {
  tight: '-0.006em',
  normal: '0.006em',
}

/**
 * 行送り。`body` の 1.75 は**3モデルで最大**。
 *
 * 本文を 17px にしたのと同じ理由で、腕を伸ばした距離・手ブレのある状態で読む前提。
 * 行が近いと次の行を目で拾い直せない。支配軸「面積」は行間にも及ぶ。
 *
 * `heading` を 1.3 に詰めるのは、見出しは1〜2行で読み終わるため。
 * ここまで本文と離すことで、行送りの差だけで階層が読める。
 */
export const TACTILE_LEADING: Record<string, string> = {
  body: '1.75',
  heading: '1.3',
}

/**
 * 書体。**独自のフォントを積まない** — 読み込み待ちの間だけ字面が変わるのは、
 * 指で触れている最中に面が動くのと同じで、触覚モデルでは最も嫌われる。
 *
 * `heading` が `--novi-font-sans` を指すのは、見出しを別書体にせず
 * 字送り（tracking-tight）と行送り（leading-heading）だけで階層を作るため。
 *
 * `numeric: normal`（プロポーショナル）は意図。Tactile が扱うのは「引く表」ではなく
 * 「読む文章」で、桁を揃えると数字だけが文中で浮く。
 * Raster / Flatlay の tabular-nums に対する、もう1つのモデル識別子。
 */
export const TACTILE_FONTS: Record<string, string> = {
  sans: 'system-ui, sans-serif',
  mono: 'ui-monospace, monospace',
  heading: 'var(--novi-font-sans)',
  numeric: 'normal',
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
