/**
 * Flatlay のトークン値。
 *
 * Flatlay は「z 軸を持たない」。開く = 場所を取る。浮く層が存在しないので影は嘘になる。
 * **すべて数値で固定する。** 値は目分量で決めず、`flatlay-tokens.test.ts` の検査
 * （48判定 / 罫線 chroma 帯域 / 影が全段透明 / radius / 反転押下）を先に通すこと。
 *
 * 色は `color-set.ts` が持ち、ここは寸法・影・書体・モーション。
 *
 * デザイン規律の**例外**（literal-color / duration / radius / shadow-literal）。
 * トークンの値そのものを書く唯一の場所で、ここでの `4px` や `oklch(...)` は
 * 「使用」ではなく「定義」。使う側が同じものを書いたら違反になる。
 */
import { colorById, DEFAULT_COLOR_ID, neutralsFor } from './color-set.ts'

/**
 * 角丸は**書類の直角**。2px は「断裁の丸み」程度で、丸みとしては読まれない。
 *
 * sm と md を同じ 2px に潰しているのは意図。段階を作ると「少し丸い」「もっと丸い」
 * という序列が生まれ、それは面の階層の言葉になる（core は同値に潰すことを許している）。
 * 6/8/12（Raster）・8/14/20（Tactile）に対する第3の識別子。
 */
export const FLATLAY_RADII: Record<string, string> = {
  none: '0px',
  sm: '2px',
  md: '2px',
  lg: '4px',
  // Avatar / Radio の円だけが使う。円は「丸み」ではなく形なので直角規律の外
  full: '9999px',
}

/**
 * 影は**全段が透明**（FR-04）。浮く層が存在しない以上、影は存在しない光源の嘘になる。
 *
 * `none` ではなく `0 0 #0000` にするのは Tactile の教訓。ring も box-shadow に
 * 合成されるため `box-shadow: <ring>, none` は不正値になり、宣言ごと破棄されて
 * リングまで消える。Flatlay は全段が「影なし」なので、この罠が全段にある。
 */
export const FLATLAY_SHADOWS: Record<string, string> = {
  none: '0 0 #0000',
  sm: '0 0 #0000',
  md: '0 0 #0000',
  lg: '0 0 #0000',
}

/**
 * 面の内側と、コントロールの左右の余白。**余白はテーマの所有物**（spec 08）。
 *
 * `surface-y` が 14px と3モデルで最小なのに詰まって見えないのは、余白を padding では
 * なく `FLATLAY_LEADING.body`（1.7）の行送りで取っているから。野帳の罫線間隔が広いのと
 * 同じ理屈で、帳票は「箱の内側を空ける」のではなく「行を離す」。padding を厚くすると
 * 罫線と本文の距離だけが伸び、行同士は詰まったままになって帳票に見えなくなる。
 *
 * `surface-x`（20px）だけが `surface-y` より厚いのは、左端が読み出しの基準線だから。
 * 罫線から字が始まるまでの距離は列の見出し位置そのもので、ここが浅いと線に字が触れる。
 *
 * `control-x-*` は 10 / 12 / 16px。高さ（28/32/40px）に対して横が詰まっているのは、
 * 行の中に置いても行が膨らまない寸法を優先しているため。
 */
export const FLATLAY_PAD: Record<string, string> = {
  'surface-x': '20px',
  'surface-y': '14px',
  'control-x-sm': '10px',
  'control-x-md': '12px',
  'control-x-lg': '16px',
}

/**
 * 要素間の余白。**比が余白の知覚を作る。**
 *
 * `section / stack` は 24 / 12 = **2.0 で3モデル最大**。罫線で区切る美学なので、
 * 区画の切れ目だけが大きく空き、区画の中は等間隔に詰まる。従来は Card の
 * header / body / footer が実質 1:1 で、線はあるのに「まとまり」が読めなかった。
 *
 * `inline`（8px）は同じ行の中で記号と語を離す距離。行を跨がないので最小に置く。
 */
export const FLATLAY_GAP: Record<string, string> = {
  inline: '8px',
  stack: '12px',
  section: '24px',
}

/**
 * 字送り。**見出しでも字を詰めない。**
 *
 * `tight` が 0em なのは意図。字を詰めるのは複数の語を1つの「まとまり」に見せる操作で、
 * 帳票の見出しは各項目が独立している。詰めた瞬間に、隣の項目との境界より
 * 語の内側のほうが強く結ばれてしまう。
 *
 * `normal` の +0.01em は、等幅の規則正しさを sans の本文にも及ぼすための微量。
 */
export const FLATLAY_TRACKING: Record<string, string> = {
  tight: '0em',
  normal: '0.01em',
}

/**
 * 行送り。**Flatlay が余白を取る主な手段はこちら**（padding ではない）。
 *
 * `body` 1.7 は野帳の罫線間隔。`surface-y` が 14px で足りるのはこの値が支えていて、
 * 片方だけを動かすと密度が崩れる（`flatlay-tokens.test.ts` が下限 1.65 を固定する）。
 *
 * `heading` 1.35 は、見出しが2行に折り返しても行が離れすぎないための値。
 * 見出しは「読み進める文」ではなく「見つける札」なので、本文より締める。
 */
export const FLATLAY_LEADING: Record<string, string> = {
  body: '1.7',
  heading: '1.35',
}

/**
 * 本文 16px は入力欄の自動ズーム回避の下限。比率 ≒1.18 と両テーマより詰まっているのは、
 * 帳票が「読む文書」ではなく「引く表」だから。
 */
export const FLATLAY_TEXT: Record<string, string> = {
  xs: '11px',
  sm: '13px',
  base: '16px',
  lg: '18px',
  xl: '22px',
  '2xl': '26px',
  '3xl': '32px',
}

/**
 * 書体。**`--novi-font-*` を実際に上書きする初のテーマ**（G6 / ADR-F7）。
 *
 * 依存ゼロ原則により Web フォントは同梱しない。代わりに mono のスタックを精密に組み、
 * 数値・ショートカット・コード・ラベルの slot がこれを消費する。
 * core の既定（`ui-monospace, monospace`）のままでは、フォールバックが痩せていて
 * 環境によって等幅にならない。
 *
 * `heading` が mono を指すのは **3モデルで唯一、見出しの書体が本文と違う**という宣言。
 * Web フォントを足せない以上、テーマの声を分けられるのは既存2スタックの使い分けだけで、
 * そこが最大の識別子になる（ADR-F7 の mono 運用の延長）。
 *
 * `numeric` は帳票が数字を**突き合わせて読む**ため。桁が縦に揃い（tabular-nums）、
 * 0 と O が判別できる（slashed-zero）ことは、書式ではなく情報の正しさに属する。
 */
export const FLATLAY_FONTS: Record<string, string> = {
  sans: 'system-ui, sans-serif',
  mono: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  heading: 'var(--novi-font-mono)',
  numeric: 'tabular-nums slashed-zero',
}

/**
 * 高さは帳票の行。ポインタ / キーボード前提の密度で、タッチ下限（44px）は満たさない。
 * それは Tactile の領分で、両立させると3本とも同じ寸法に収束する。
 */
export const FLATLAY_CONTROL_HEIGHTS: Record<string, number> = {
  sm: 28,
  md: 32,
  lg: 40,
}

/**
 * モーションは**1本**（FR-12）。展開・格納はアニメーションしない。
 *
 * 押し下げは大きなレイアウト変化で、height transition を付けると後続が滑り続けて読めない。
 * 3段に見えるのは core の語彙を満たすためで、値はすべて同じ 100ms。
 * 残った 100ms が担うのは中身の fade だけ。
 */
export const FLATLAY_MOTION: Record<string, string> = {
  'duration-fast': '100ms',
  'duration-base': '100ms',
  'duration-slow': '100ms',
  'ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
  'ease-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
}

const DEFAULT_COLOR = colorById(DEFAULT_COLOR_ID)
const DEFAULT_PAIR = colorById(DEFAULT_COLOR.pair)

/**
 * 意味を持つ色。**色選択の影響を受けない**（FR-08）。
 * L / C はトーン（light 47 / dark 75）に合わせ、赤帯 27 は danger が独占する。
 */
const SEMANTIC_LIGHT = {
  success: 'oklch(47% 0.13 155)',
  'success-fg': 'oklch(98.5% 0.004 155)',
  warning: 'oklch(47% 0.12 62)',
  'warning-fg': 'oklch(98.5% 0.004 62)',
  danger: 'oklch(47% 0.17 27)',
  'danger-fg': 'oklch(98.5% 0.004 27)',
}

const SEMANTIC_DARK = {
  success: 'oklch(75% 0.13 155)',
  'success-fg': 'oklch(18% 0.02 155)',
  warning: 'oklch(75% 0.13 65)',
  'warning-fg': 'oklch(18% 0.02 65)',
  danger: 'oklch(75% 0.15 27)',
  'danger-fg': 'oklch(18% 0.02 27)',
}

/**
 * 既定色（Fieldbook）を選んだときの色トークン一式。
 * `data-novi-color` で別の色を選ぶと、生成 CSS が罫線と primary / secondary を差し替える。
 */
export const FLATLAY_LIGHT_COLORS: Record<string, string> = {
  ...neutralsFor(DEFAULT_COLOR.hue, 'light'),
  primary: DEFAULT_COLOR.light.primary,
  'primary-fg': DEFAULT_COLOR.light.primaryFg,
  secondary: DEFAULT_PAIR.light.primary,
  'secondary-fg': DEFAULT_PAIR.light.primaryFg,
  ...SEMANTIC_LIGHT,
}

export const FLATLAY_DARK_COLORS: Record<string, string> = {
  ...neutralsFor(DEFAULT_COLOR.hue, 'dark'),
  primary: DEFAULT_COLOR.dark.primary,
  'primary-fg': DEFAULT_COLOR.dark.primaryFg,
  secondary: DEFAULT_PAIR.dark.primary,
  'secondary-fg': DEFAULT_PAIR.dark.primaryFg,
  ...SEMANTIC_DARK,
}

/** 中立色のトークン名（生成器と検査が網羅性を見る）。 */
export const NEUTRAL_COLOR_KEYS = Object.keys(neutralsFor(0, 'light'))

/** 染まってはいけない中立色。紙は選択色に影響されない（FR-07）。 */
export const ACHROMATIC_NEUTRAL_KEYS = [
  'bg',
  'subtle',
  'surface',
  'overlay',
  'fg',
  'muted',
  'default',
  'default-fg',
]

/** 選択色に染まる唯一のトークン。階層を作る当事者だけが色を持つ。 */
export const TINTED_BORDER_KEYS = ['border', 'border-strong']

/** 罫線の chroma 帯域。下回ると色が見えず、超えると「色を塗った線」になる。 */
export const BORDER_CHROMA_RANGE = { min: 0.02, max: 0.03 } as const

/** 有彩であることが必須のトークン名。 */
export const SEMANTIC_COLOR_KEYS = Object.keys(SEMANTIC_LIGHT)

/** 意味を持つ色の chroma 上限。 */
export const MAX_SEMANTIC_CHROMA = 0.19

/** `full` を除く角丸の上限。これを超えると書類の直角ではなくなる。 */
export const MAX_RADIUS_PX = 4
