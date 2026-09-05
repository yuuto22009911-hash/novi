'use client'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import {
  type ColorScheme,
  DEFAULT_THEME,
  SCHEME_ATTR,
  STORAGE_KEY,
  THEME_ATTR,
  type ThemeName,
  themeRegistry,
} from './theme-registry'

interface ThemeState {
  theme: ThemeName
  scheme: ColorScheme | null
  setTheme: (theme: ThemeName) => void
  setScheme: (scheme: ColorScheme | null) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

/**
 * テーマ選択を保持する。
 *
 * 初期値は `<html>` の属性から読む。属性はハイドレーション前に
 * インラインスクリプトが設定済みなので、ここでちらつきは起きない（ADR-D3）。
 */
export function NoviThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME)
  // プレビューは OS に追従させず light から始める。ダークはヘッダーで明示的に選ぶ
  const [scheme, setSchemeState] = useState<ColorScheme | null>('light')

  useEffect(() => {
    const root = document.documentElement
    const initialTheme = root.getAttribute(THEME_ATTR) as ThemeName | null
    const initialScheme = root.getAttribute(SCHEME_ATTR) as ColorScheme | null
    if (initialTheme !== null && initialTheme in themeRegistry) setThemeState(initialTheme)
    if (initialScheme !== null) setSchemeState(initialScheme)
  }, [])

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next)
    document.documentElement.setAttribute(THEME_ATTR, next)
    try {
      localStorage.setItem(STORAGE_KEY.theme, next)
    } catch {
      // プライベートモードなどで保存できなくても表示は続ける
    }
  }, [])

  const setScheme = useCallback((next: ColorScheme | null) => {
    setSchemeState(next)
    const root = document.documentElement
    if (next === null) {
      root.removeAttribute(SCHEME_ATTR)
    } else {
      root.setAttribute(SCHEME_ATTR, next)
    }
    try {
      if (next === null) localStorage.removeItem(STORAGE_KEY.scheme)
      else localStorage.setItem(STORAGE_KEY.scheme, next)
    } catch {
      // 同上
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, scheme, setTheme, setScheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** 現在のテーマ選択を読む。 */
export function useThemeState(): ThemeState {
  const state = useContext(ThemeContext)
  if (state === null) throw new Error('NoviThemeProvider の外で使われています')
  return state
}

// useNoviTheme（コンポーネントの解決）は theme-components.tsx にある。
// このファイルは layout 経由で全ページに入るため、実装を引き込んではいけない
