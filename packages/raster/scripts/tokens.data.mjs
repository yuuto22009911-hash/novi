/**
 * CSS 変数の組。**変数名の作り方をここ1箇所に置く。**
 *
 * 2箇所から読まれる:
 * - `generate-theme-css.mjs`  `raster.css` を出力する
 * - docs の IR 生成             theming ページの一覧と AI 向け出力に載せる
 *
 * 利用者が上書きするのは変数名なので、ドキュメントに載る名前と
 * 実際に出力される名前がズレると、上書きが黙って効かなくなる。
 * 同じ定義から両方を作る（ADR-A1 と同じ理由）。
 *
 * 並び順は `raster.css` の出力順そのもの。変えると生成物の差分になる。
 */
import {
  RASTER_DARK_COLORS,
  RASTER_LIGHT_COLORS,
  RASTER_MOTION,
  RASTER_RADII,
  RASTER_SHADOWS,
  RASTER_TEXT,
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
    description: 'Raster では full 以外すべて 2px 以下。角を立てるのが思想（ADR-R1）',
    values: RASTER_RADII,
  },
  {
    id: 'shadow',
    prefix: 'shadow-',
    label: '影',
    description: 'Raster ではすべて none。階層は境界線と背景色の差で表す',
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
    id: 'motion',
    prefix: '',
    label: 'モーション',
    description: 'Raster では速度を1つに固定している。動きで飾らない',
    values: RASTER_MOTION,
  },
  {
    id: 'color',
    prefix: 'color-',
    label: '色',
    description: 'ブランド色を変えるならここ。中立色の chroma は 0 に固定している',
    values: RASTER_LIGHT_COLORS,
    dark: RASTER_DARK_COLORS,
  },
]

/** @param {string} prefix @param {string} name */
export const cssVariableName = (prefix, name) => `--novi-${prefix}${name}`
