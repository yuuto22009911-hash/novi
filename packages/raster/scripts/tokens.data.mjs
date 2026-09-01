/**
 * CSS 変数の組。**変数名の作り方をここ1箇所に置く。**
 *
 * 2箇所から読まれる:
 * - `theme-css.mjs`（→ `generate-theme-css.mjs`）  `raster.css` を出力する
 * - docs の IR 生成             theming ページの一覧と AI 向け出力に載せる
 *
 * 利用者が上書きするのは変数名なので、ドキュメントに載る名前と
 * 実際に出力される名前がズレると、上書きが黙って効かなくなる。
 * 同じ定義から両方を作る（ADR-A1 と同じ理由）。
 *
 * 並び順は `raster.css` の出力順そのもの。変えると生成物の差分になる。
 */

import {
  colorById,
  DEFAULT_COLOR_ID,
  RASTER_COLOR_SET,
  RASTER_TONE,
} from '../src/tokens/color-set.ts'
import {
  RASTER_DARK_COLORS,
  RASTER_FONTS,
  RASTER_GAP,
  RASTER_LEADING,
  RASTER_LIGHT_COLORS,
  RASTER_MOTION,
  RASTER_PAD,
  RASTER_RADII,
  RASTER_SHADOWS,
  RASTER_TEXT,
  RASTER_TRACKING,
} from '../src/tokens/raster-tokens.ts'

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
    description: '3段の階調。小さな部品 sm / 操作類 md / 浮く面 lg が既定（ADR-R8）',
    values: RASTER_RADII,
  },
  {
    id: 'shadow',
    prefix: 'shadow-',
    label: '影',
    description:
      '浮いている層（メニュー・ダイアログ）だけが持つ。面は平らで、境界線と背景色の差で階層を作る',
    values: RASTER_SHADOWS,
  },
  {
    id: 'text',
    prefix: 'text-',
    label: '文字サイズ',
    description: '比率 1.2（minor third）。単一比率で階層を作る',
    values: RASTER_TEXT,
  },
  {
    id: 'pad',
    prefix: 'pad-',
    label: '余白（内側）',
    description:
      '面とコントロールの内側の余白。すべて 4px の倍数で、高さと同じ格子の上に乗せている',
    values: RASTER_PAD,
  },
  {
    id: 'gap',
    prefix: 'gap-',
    label: '余白（要素間）',
    description:
      '要素と要素の距離。inline : stack : section = 1 : 2 : 3 の比が「どこまでが一塊か」を伝える',
    values: RASTER_GAP,
  },
  {
    id: 'tracking',
    prefix: 'tracking-',
    label: '字送り',
    description: '文字同士の詰め。Raster が締めるのは見出しだけで、本文は可読性のため 0 に置く',
    values: RASTER_TRACKING,
  },
  {
    id: 'leading',
    prefix: 'leading-',
    label: '行送り',
    description: '行と行の距離。読む文章（body）と見る文字（heading）で必要な高さが違う',
    values: RASTER_LEADING,
  },
  {
    id: 'font',
    prefix: 'font-',
    label: '書体',
    description:
      '本文・等幅・見出しの書体と、数字の字形。Raster は書体で飾らず、見出しも sans を参照する',
    values: RASTER_FONTS,
  },
  {
    id: 'motion',
    prefix: '',
    label: 'モーション',
    description: 'Raster では速度を1つに固定している。動きで飾らない',
    values: RASTER_MOTION,
  },
  {
    id: 'hue',
    prefix: '',
    label: '色相',
    description:
      '選択中のカラー（data-novi-color）の hue。既定は Ink。利用者が派生色を作るときの参照点',
    values: { hue: String(colorById(DEFAULT_COLOR_ID).hue) },
  },
  {
    id: 'color',
    prefix: 'color-',
    label: '色',
    description:
      'primary / secondary はカラーセット Print Inks の既定色（Ink × Brick）。data-novi-color で切替。中立色の chroma は 0 に固定している',
    values: RASTER_LIGHT_COLORS,
    dark: RASTER_DARK_COLORS,
  },
]

/** @param {string} prefix @param {string} name */
export const cssVariableName = (prefix, name) => `--novi-${prefix}${name}`

/**
 * カラーセット「Print Inks」。生成器と IR（Phase C）が読む。
 * 値の唯一の真実は specs/06-tones-and-colors、実装は src/tokens/color-set.ts。
 */
export const COLOR_SET = RASTER_COLOR_SET
export { DEFAULT_COLOR_ID, RASTER_TONE }
