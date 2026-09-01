/**
 * CSS 変数の組。**変数名の作り方をここ1箇所に置く。**
 *
 * 2箇所から読まれる:
 * - `theme-css.mjs`（→ `generate-theme-css.mjs`）  `flatlay.css` を出力する
 * - docs の IR 生成             theming ページの一覧と AI 向け出力に載せる
 *
 * 利用者が上書きするのは変数名なので、ドキュメントに載る名前と
 * 実際に出力される名前がズレると、上書きが黙って効かなくなる（STATUS #22）。
 *
 * 並び順は `flatlay.css` の出力順そのもの。変えると生成物の差分になる。
 */
import {
  colorById,
  DEFAULT_COLOR_ID,
  FLATLAY_COLOR_SET,
  FLATLAY_TONE,
} from '../src/tokens/color-set.ts'
import {
  FLATLAY_DARK_COLORS,
  FLATLAY_FONTS,
  FLATLAY_GAP,
  FLATLAY_LEADING,
  FLATLAY_LIGHT_COLORS,
  FLATLAY_MOTION,
  FLATLAY_PAD,
  FLATLAY_RADII,
  FLATLAY_SHADOWS,
  FLATLAY_TEXT,
  FLATLAY_TRACKING,
} from '../src/tokens/flatlay-tokens.ts'

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
    description: '書類の直角。sm と md は同じ 2px で、丸みに序列を作らない（full だけが例外）',
    values: FLATLAY_RADII,
  },
  {
    id: 'shadow',
    prefix: 'shadow-',
    label: '影',
    description:
      '全段が透明。浮く層が存在しないので影は嘘になる。none ではなく 0 0 #0000 なのはリング合成のため',
    values: FLATLAY_SHADOWS,
  },
  {
    id: 'text',
    prefix: 'text-',
    label: '文字サイズ',
    description: '本文 16px は入力欄の自動ズーム回避の下限。比率は詰め気味（読む文書でなく引く表）',
    values: FLATLAY_TEXT,
  },
  {
    id: 'font',
    prefix: 'font-',
    label: '書体',
    description:
      'mono を精密に定義する初のテーマ。数値・ショートカット・コード・ラベルがこれを消費する',
    values: FLATLAY_FONTS,
  },
  {
    id: 'pad',
    prefix: 'pad-',
    label: '余白（内側）',
    description:
      '面は 20/14px、コントロールの左右は 10/12/16px。上下が薄いのは余白を行送りで取るため',
    values: FLATLAY_PAD,
  },
  {
    id: 'gap',
    prefix: 'gap-',
    label: '余白（要素間）',
    description: '8/12/24px。section が stack の 2 倍あり、区画の切れ目だけが大きく空く',
    values: FLATLAY_GAP,
  },
  {
    id: 'tracking',
    prefix: 'tracking-',
    label: '字送り',
    description: '見出しでも詰めない（tight=0em）。詰めるのは語をまとまりに見せる操作だから',
    values: FLATLAY_TRACKING,
  },
  {
    id: 'leading',
    prefix: 'leading-',
    label: '行送り',
    description: '本文 1.7 は野帳の罫線間隔。Flatlay が余白を取る主な手段はこちら',
    values: FLATLAY_LEADING,
  },
  {
    id: 'motion',
    prefix: '',
    label: 'モーション',
    description: '1本（100ms）。展開・格納はアニメーションしない。100ms が担うのは中身の fade だけ',
    values: FLATLAY_MOTION,
  },
  {
    id: 'hue',
    prefix: '',
    label: '色相',
    description:
      '選択中のカラー（data-novi-color）の hue。既定は Fieldbook。染まるのは罫線だけで、地は染まらない',
    values: { hue: String(colorById(DEFAULT_COLOR_ID).hue) },
  },
  {
    id: 'color',
    prefix: 'color-',
    label: '色',
    description:
      'カラーセット Stationery の既定色（Fieldbook × Eraser）。data-novi-color で切替。地は紙のまま、罫線だけが選んだ色を帯びる',
    values: FLATLAY_LIGHT_COLORS,
    dark: FLATLAY_DARK_COLORS,
  },
]

/** @param {string} prefix @param {string} name */
export const cssVariableName = (prefix, name) => `--novi-${prefix}${name}`

/**
 * カラーセット「Stationery」。生成器と IR が読む。
 * 値の唯一の真実は specs/07-theme-flatlay、実装は src/tokens/color-set.ts。
 */
export const COLOR_SET = FLATLAY_COLOR_SET
export { DEFAULT_COLOR_ID, FLATLAY_TONE }
