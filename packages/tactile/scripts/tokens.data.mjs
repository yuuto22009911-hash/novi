/**
 * CSS 変数の組。**変数名の作り方をここ1箇所に置く。**
 *
 * 2箇所から読まれる:
 * - `theme-css.mjs`（→ `generate-theme-css.mjs`）  `tactile.css` を出力する
 * - docs の IR 生成             theming ページの一覧と AI 向け出力に載せる
 *
 * 利用者が上書きするのは変数名なので、ドキュメントに載る名前と
 * 実際に出力される名前がズレると、上書きが黙って効かなくなる（STATUS #22）。
 *
 * 並び順は `tactile.css` の出力順そのもの。変えると生成物の差分になる。
 */
import {
  colorById,
  DEFAULT_COLOR_ID,
  TACTILE_COLOR_SET,
  TACTILE_TONE,
} from '../src/tokens/color-set.ts'
import {
  TACTILE_DARK_COLORS,
  TACTILE_FONTS,
  TACTILE_GAP,
  TACTILE_LEADING,
  TACTILE_LIGHT_COLORS,
  TACTILE_MOTION,
  TACTILE_PAD,
  TACTILE_RADII,
  TACTILE_SHADOWS,
  TACTILE_TEXT,
  TACTILE_TRACKING,
} from '../src/tokens/tactile-tokens.ts'

/**
 * @type {{
 *   id: string,
 *   prefix: string,
 *   label: string,
 *   description: string,
 *   values: Record<string, string>,
 *   dark?: Record<string, string>,
 * }[]}
 */
export const TOKEN_GROUPS = [
  {
    id: 'radius',
    prefix: 'radius-',
    label: '角丸',
    description: 'none 以外は 8px 以上。指で触れる面は丸い方が「押せる」と読まれる',
    values: TACTILE_RADII,
  },
  {
    id: 'shadow',
    prefix: 'shadow-',
    label: '影',
    description:
      '面にも影を許可する（階層は持ち上がりで作る）。lg だけ上向きなのは、浮く面が画面下端から来るため',
    values: TACTILE_SHADOWS,
  },
  {
    id: 'text',
    prefix: 'text-',
    label: '文字サイズ',
    description: '本文 17px は iOS の本文寸法。入力欄は 16px を下回らせない（自動ズーム回避）',
    values: TACTILE_TEXT,
  },
  {
    id: 'pad',
    prefix: 'pad-',
    label: '余白（内側）',
    description:
      '3モデルで最大。指が触れる面は空間を要求するので、面は左右 28px・上下 24px を取る',
    values: TACTILE_PAD,
  },
  {
    id: 'gap',
    prefix: 'gap-',
    label: '余白（要素間）',
    description:
      'inline 10 < stack 20 < section 32。絶対値ではなく「塊の内側と外側の比」が余白の知覚を作る',
    values: TACTILE_GAP,
  },
  {
    id: 'tracking',
    prefix: 'tracking-',
    label: '字送り',
    description:
      'normal を +0.006em とわずかに開けているのは Tactile だけ。詰めると硬く、開けると柔らかい',
    values: TACTILE_TRACKING,
  },
  {
    id: 'leading',
    prefix: 'leading-',
    label: '行送り',
    description: '本文 1.75 は3モデルで最大。腕を伸ばした距離で次の行を目で拾い直せる間隔',
    values: TACTILE_LEADING,
  },
  {
    id: 'font',
    prefix: 'font-',
    label: '書体',
    description:
      '独自フォントを積まない（読み込み中に字面が動くのを避ける）。数字はプロポーショナルで、文中に馴染ませる',
    values: TACTILE_FONTS,
  },
  {
    id: 'motion',
    prefix: '',
    label: 'モーション',
    description: '出現 260ms / 消失 200ms / 状態変化 120ms の3段。下から出る面は移動距離が長い',
    values: TACTILE_MOTION,
  },
  {
    id: 'hue',
    prefix: '',
    label: '色相',
    description:
      '選択中のカラー（data-novi-color）の hue。既定は Indigo。中立色までこの hue に染まる',
    values: { hue: String(colorById(DEFAULT_COLOR_ID).hue) },
  },
  {
    id: 'color',
    prefix: 'color-',
    label: '色',
    description:
      'カラーセット Textile Dyes の既定色（Indigo × Saffron）。data-novi-color で切替。中立色も選んだ染料に染まる',
    values: TACTILE_LIGHT_COLORS,
    dark: TACTILE_DARK_COLORS,
  },
]

/** @param {string} prefix @param {string} name */
export const cssVariableName = (prefix, name) => `--novi-${prefix}${name}`

/**
 * カラーセット「Textile Dyes」。生成器と IR が読む。
 * 値の唯一の真実は specs/06-tones-and-colors、実装は src/tokens/color-set.ts。
 */
export const COLOR_SET = TACTILE_COLOR_SET
export { DEFAULT_COLOR_ID, TACTILE_TONE }
