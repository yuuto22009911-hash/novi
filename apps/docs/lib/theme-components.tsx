'use client'

/**
 * テーマ名 → 実装の対応表。**ライブラリ全体を引き込む唯一の場所。**
 *
 * `theme-registry.ts`（メタ情報）と分かれているのは、あちらが layout 経由で
 * 全ページのバンドルに入るため。実装まで一緒に置くと、デモの無いページまで
 * ライブラリ全体を読み込む。ここを import してよいのはデモを描画する画面だけ。
 */
import * as flatlay from '@novi-ui/flatlay'
import * as raster from '@novi-ui/raster'
import * as tactile from '@novi-ui/tactile'
import type { ThemeName } from './theme-registry'
import { useThemeState } from './use-novi-theme'

const themeComponents = {
  raster,
  tactile,
  flatlay,
} as const satisfies Record<ThemeName, unknown>

/**
 * 現在のテーマのコンポーネント群を返す。
 *
 * デモはこれ経由で解決するため、**特定のテーマを import しない**。
 * 直接 import した瞬間、そのデモはテーマ切替に追従しなくなる（CI で検査している）。
 *
 * @example
 * const { Button } = useNoviTheme()
 * return <Button variant="solid">保存</Button>
 */
export function useNoviTheme() {
  const { theme } = useThemeState()
  return themeComponents[theme]
}
