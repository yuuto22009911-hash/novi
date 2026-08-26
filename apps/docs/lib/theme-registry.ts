/**
 * テーマのメタ情報。**実装（コンポーネント本体）をここに置かない。**
 *
 * このファイルは layout とヘッダーから読まれるため、全ページのバンドルに入る。
 * かつて `import * as raster` がここにあり、デモの無いページまで
 * ライブラリ全体（約 900KB）を読み込んでいた。
 * 実装は `theme-components.ts` にあり、デモを持つ画面だけが読む。
 *
 * 2本目のテーマはここと theme-components.ts に1行ずつ足すだけでサイト全体が対応する。
 */
export const themeRegistry = {
  raster: {
    label: 'Raster',
    description: 'ミニマル / スイス系',
    // コード例の import 文に差し込む。切り替えで変わるのはこの1行だけ
    pkg: '@novi-ui/raster',
  },
  tactile: {
    label: 'Tactile',
    description: 'タッチファースト',
    pkg: '@novi-ui/tactile',
  },
  flatlay: {
    label: 'Flatlay',
    description: '帳票・文具 / z 軸なし',
    pkg: '@novi-ui/flatlay',
  },
} as const

export type ThemeName = keyof typeof themeRegistry

export const THEME_NAMES = Object.keys(themeRegistry) as ThemeName[]

export const DEFAULT_THEME: ThemeName = 'raster'

export type ColorScheme = 'light' | 'dark'

/** `<html>` に付ける属性名。インラインスクリプトと CSS の両方が参照する。 */
export const THEME_ATTR = 'data-novi-theme'
export const SCHEME_ATTR = 'data-novi-scheme'

export const STORAGE_KEY = { theme: 'novi-theme', scheme: 'novi-scheme' } as const
