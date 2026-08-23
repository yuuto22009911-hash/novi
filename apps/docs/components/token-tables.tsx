import index from '../.generated/component-index.json'
import { Preview } from './preview'

interface CssVariable {
  name: string
  value: string
  dark: string | null
}

interface VariableGroup {
  id: string
  label: string
  description: string
  variables: CssVariable[]
}

interface ThemeEntry {
  pkg: string
  label: string
  description: string
  cssVariables: VariableGroup[]
  designRules: {
    numeric: Record<string, Record<string, string | number>>
    prohibited: { id: string; pattern: string; reason: string }[]
    exceptions: { file: string; rules: string[]; reason: string }[]
    colorRule: string
  }
}

const THEMES = index.themes as unknown as Record<string, ThemeEntry>

export function getTheme(name: string): ThemeEntry {
  const found = THEMES[name]
  if (found === undefined) throw new Error(`テーマ ${name} が見つかりません`)
  return found
}

/**
 * CSS 変数の一覧。**`raster.css` を出力しているのと同じ定義から描画する**。
 *
 * ここに載る名前と実際に出力される名前がズレると、
 * 利用者の上書きが黙って効かなくなり、原因も分からない。
 */
export function TokenTable({ theme, group }: { theme: string; group: string }) {
  const entry = getTheme(theme)
  const found = entry.cssVariables.find((g) => g.id === group)
  if (found === undefined) throw new Error(`${theme} に ${group} のトークンがありません`)

  const hasDark = found.variables.some((v) => v.dark !== null)

  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">
        {entry.label} の{found.label}トークン
      </caption>
      <thead>
        <tr className="border-b border-site-border text-left">
          <th scope="col" className="pt-2 pb-3 pr-4 sm:pr-6 font-medium">
            CSS 変数
          </th>
          <th scope="col" className="pt-2 pb-3 pr-4 sm:pr-6 font-medium">
            {hasDark ? 'ライト' : '値'}
          </th>
          {hasDark && (
            <th scope="col" className="pt-2 pb-3 font-medium">
              ダーク
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {found.variables.map((variable) => (
          <tr key={variable.name} className="border-b border-site-border align-top">
            <td className="py-3 pr-4 sm:pr-6 font-mono text-xs whitespace-nowrap">
              {variable.name}
            </td>
            <td className="py-3 pr-4 sm:pr-6 font-mono text-xs text-site-muted">
              {variable.value}
            </td>
            {hasDark && (
              <td className="py-3 font-mono text-xs text-site-muted">{variable.dark ?? '同じ'}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * 色の見本。**必ず `Preview` の中に置く**（ADR-D1 / FR-07）。
 *
 * テーマのトークンは `[data-novi-theme]` 配下でのみ定義される。
 * 外に出すと値が解決されないうえ、サイト UI までテーマ色に染まる。
 */
export function ColorSwatches({ theme }: { theme: string }) {
  const entry = getTheme(theme)
  const colors = entry.cssVariables.find((g) => g.id === 'color')
  if (colors === undefined) throw new Error(`${theme} に色トークンがありません`)

  return (
    <Preview className="gap-3">
      <ul className="flex flex-wrap gap-4">
        {colors.variables.map((variable) => (
          <li key={variable.name} className="flex w-32 flex-col gap-2">
            <span
              // 現在のスキームで実際に解決される値を見せる。表の数値だけでは分からない
              style={{ background: `var(${variable.name})` }}
              className="h-10 w-full border border-[var(--novi-color-border)]"
            />
            <code className="font-mono text-[11px] break-all text-[var(--novi-color-muted)]">
              {variable.name.replace('--novi-color-', '')}
            </code>
          </li>
        ))}
      </ul>
    </Preview>
  )
}

/** 数値で決まっている設計。目分量の値を書かせないために全部出す。 */
export function NumericRules({ theme }: { theme: string }) {
  const { designRules } = getTheme(theme)

  return (
    <dl className="flex flex-col gap-6 text-sm leading-relaxed">
      {Object.entries(designRules.numeric).map(([group, values]) => (
        <div key={group}>
          <dt className="font-mono text-xs font-medium">{group}</dt>
          <dd className="text-site-muted">
            {Object.entries(values)
              .map(([key, value]) => `${key}: ${value}`)
              .join(' / ')}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** 書いてはいけないクラス。**CI が実際に落とす規則をそのまま出す**。 */
export function ProhibitedRules({ theme }: { theme: string }) {
  const { designRules } = getTheme(theme)

  return (
    <ul className="flex flex-col gap-6 text-sm leading-relaxed">
      {designRules.prohibited.map((rule) => (
        <li key={rule.id} className="flex flex-col gap-2">
          <code className="font-mono text-xs">{rule.pattern}</code>
          <span className="max-w-[38em] text-site-muted">{rule.reason}</span>
        </li>
      ))}
    </ul>
  )
}
