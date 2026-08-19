#!/usr/bin/env node
/**
 * `dist/base.css` を単一ソース（src/tokens/definitions.ts）から生成する。
 *
 * ダーク値は `[data-novi-scheme='dark']` と `@media (prefers-color-scheme: dark)` の
 * 2箇所で必要になる。手書きすると必ず片方が腐るため生成する（ADR-C3）。
 *
 * この生成があるおかげで core のソースに .css を1つも置かずに済んでいる（FR-10）。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Node 24 は型注釈付き .ts をそのまま import できる
const { DARK_COLORS, LIGHT_COLORS, SCHEME_INDEPENDENT_TOKENS, TOKEN_PREFIX } = await import(
  '../src/tokens/definitions.ts'
)

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(PKG_ROOT, 'dist', 'base.css')
const INDENT = '    '

/** @param {Record<string,string>} colors */
function colorDecls(colors) {
  return Object.entries(colors)
    .map(([name, value]) => `${INDENT}${TOKEN_PREFIX}color-${name}: ${value};`)
    .join('\n')
}

function independentDecls() {
  return Object.entries(SCHEME_INDEPENDENT_TOKENS)
    .map(([group, tokens]) =>
      Object.entries(tokens)
        .map(([name, value]) => `${INDENT}${TOKEN_PREFIX}${group}-${name}: ${value};`)
        .join('\n'),
    )
    .join(`\n\n`)
}

const css = `/* 自動生成。編集しないこと。src/tokens/definitions.ts を変更して再生成する。 */

/* ユーザーの上書きが常に勝つようにレイヤ順を宣言する */
@layer novi.reset, novi.base, novi.component, novi.override;

@layer novi.reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* フォーカスリングはコンポーネント側で :focus-visible に付ける */
  :where(button, input, select, textarea) {
    font: inherit;
    color: inherit;
  }
}

@layer novi.base {
  :root {
${independentDecls()}

${colorDecls(LIGHT_COLORS)}
  }

  /* 明示指定。OS 設定より優先される */
  [data-novi-scheme='dark'] {
${colorDecls(DARK_COLORS)}
  }

  /* OS 設定への追従。明示的に light が指定されている場合は適用しない */
  @media (prefers-color-scheme: dark) {
    :root:not([data-novi-scheme='light']) {
${colorDecls(DARK_COLORS)}
    }
  }

  /* モーション低減をトークン層で吸収する。各テーマが個別に対応する必要がなくなる */
  @media (prefers-reduced-motion: reduce) {
    :root {
${INDENT}${TOKEN_PREFIX}duration-fast: 0ms;
${INDENT}${TOKEN_PREFIX}duration-base: 0ms;
${INDENT}${TOKEN_PREFIX}duration-slow: 0ms;
    }
  }
}
`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, css, 'utf8')
console.log(`✓ base.css を生成しました (${css.length} B)`)
