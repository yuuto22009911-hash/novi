import * as raster from '@novi-ui/raster'

/**
 * テーマ名 → 実装の対応表。
 *
 * デモはここ経由でコンポーネントを解決するため、
 * **どのテーマかを知らずに書ける**。テーマを切り替えても JSX は1文字も変わらない。
 * 2本目のテーマはここに1行足すだけでサイト全体が対応する。
 */
export const themeRegistry = {
  raster: {
    label: 'Raster',
    description: 'ミニマル / スイス系',
    // コード例の import 文に差し込む。切り替えで変わるのはこの1行だけ
    pkg: '@novi-ui/raster',
    components: raster,
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
