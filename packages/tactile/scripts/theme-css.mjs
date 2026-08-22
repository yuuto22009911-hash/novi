/**
 * `tactile.css` / `tactile.scoped.css` の組み立て（純関数）。
 *
 * 書き込みは `generate-theme-css.mjs`、検査は `src/tokens/colors.test.ts` が行う。
 * **build と CI が同じ関数の出力を読む**ことで、生成物とテスト対象のズレを無くす。
 *
 * Raster との違いは**色ブロックの中身**。Tactile は染まる生地なので、
 * primary / secondary だけでなく中立色と surface も色ごとに差し替える（FR-06）。
 */
import { neutralsFor, surfaceFor } from '../src/tokens/color-set.ts'
import { COLOR_SET, cssVariableName, TOKEN_GROUPS } from './tokens.data.mjs'

const HEADER =
  '/* 自動生成。編集しないこと。src/tokens/tactile-tokens.ts と color-set.ts を変更して再生成する。 */\n'

/** @param {Record<string,string>} tokens @param {string} prefix @param {string} indent */
const decls = (tokens, prefix, indent) =>
  Object.entries(tokens)
    .map(([name, value]) => `${indent}${cssVariableName(prefix, name)}: ${value};`)
    .join('\n')

/** @param {string} selector @param {string} indent */
function tokenBlock(selector, indent) {
  const inner = `${indent}  `
  return [
    `${indent}${selector} {`,
    ...TOKEN_GROUPS.map((group) => decls(group.values, group.prefix, inner)),
    `${indent}}`,
  ].join('\n')
}

/** ダークで差し替わるのは色だけ。他のトークンはスキームに依存しない。 */
function darkBlock(selector, indent) {
  return [
    `${indent}${selector} {`,
    ...TOKEN_GROUPS.filter((group) => group.dark !== undefined).map((group) =>
      decls(group.dark ?? {}, group.prefix, `${indent}  `),
    ),
    `${indent}}`,
  ].join('\n')
}

/** @param {string} id */
function entryOf(id) {
  const entry = COLOR_SET.find((c) => c.id === id)
  if (entry === undefined) throw new Error(`Textile Dyes に無い色です: ${id}`)
  return entry
}

/**
 * 1色ぶんの変数宣言。染まる生地なので中立色も丸ごと差し替える。
 * success / warning / danger は**出さない**（FR-08: 色を切り替えても意味色は不変）。
 *
 * @param {import('../src/tokens/color-set.ts').TactileColorEntry} entry
 * @param {'light'|'dark'} scheme @param {string} indent @param {boolean} withHue
 */
function colorDecls(entry, scheme, indent, withHue) {
  const pair = entryOf(entry.pair)
  const neutrals = neutralsFor(entry.hue, scheme)
  return [
    ...(withHue ? [`${indent}--novi-hue: ${entry.hue};`] : []),
    ...Object.entries(neutrals).map(([name, value]) => `${indent}--novi-color-${name}: ${value};`),
    `${indent}--novi-color-surface: ${surfaceFor(entry.hue, scheme)};`,
    `${indent}--novi-color-primary: ${entry[scheme].primary};`,
    `${indent}--novi-color-primary-fg: ${entry[scheme].primaryFg};`,
    `${indent}--novi-color-secondary: ${pair[scheme].primary};`,
    `${indent}--novi-color-secondary-fg: ${pair[scheme].primaryFg};`,
  ].join('\n')
}

/**
 * @param {(id: string) => string} selector
 * @param {'light'|'dark'} scheme @param {string} indent @param {boolean} withHue
 */
function colorBlocks(selector, scheme, indent, withHue) {
  return COLOR_SET.map((entry) =>
    [
      `${indent}${selector(entry.id)} {`,
      colorDecls(entry, scheme, `${indent}  `, withHue),
      `${indent}}`,
    ].join('\n'),
  ).join('\n\n')
}

/**
 * カラーセット節。未知の色名はどのセレクタにも一致しないため、
 * base ブロックの既定色（Indigo）がそのまま効く — フォールバックはこの「不在」で実現する（FR-05）。
 *
 * @param {{ light: (id: string) => string, dark: (id: string) => string, mediaDark: (id: string) => string }} sel
 */
function colorSection(sel) {
  return [
    `  /* ── カラーセット Textile Dyes（specs/06-tones-and-colors） ──
     data-novi-color は data-novi-theme と同じ要素（テーマルート）に置く。
     未知の色名はどれにも一致せず、既定色 Indigo のまま描画される。
     Tactile は染まる生地なので、中立色と surface も色ごとに差し替わる。 */`,
    colorBlocks(sel.light, 'light', '  ', true),
    '',
    colorBlocks(sel.dark, 'dark', '  ', false),
    '',
    '  @media (prefers-color-scheme: dark) {',
    colorBlocks(sel.mediaDark, 'dark', '    ', false),
    '  }',
  ].join('\n')
}

/** 通常利用: `:root` に直接適用する */
export function buildGlobalCss() {
  return `${HEADER}
@layer novi.base {
${tokenBlock(':root', '  ')}

${darkBlock("[data-novi-scheme='dark']", '  ')}

  @media (prefers-color-scheme: dark) {
${darkBlock(":root:not([data-novi-scheme='light'])", '    ')}
  }

${colorSection({
  light: (id) => `[data-novi-color='${id}']`,
  dark: (id) => `[data-novi-scheme='dark'][data-novi-color='${id}']`,
  mediaDark: (id) => `:root:not([data-novi-scheme='light'])[data-novi-color='${id}']`,
})}
}
`
}

/** docs 用: テーマ属性の配下にのみ適用する */
export function buildScopedCss() {
  return `${HEADER}
@layer novi.base {
${tokenBlock("[data-novi-theme='tactile']", '  ')}

${darkBlock("[data-novi-theme='tactile'][data-novi-scheme='dark']", '  ')}

  @media (prefers-color-scheme: dark) {
${darkBlock("[data-novi-theme='tactile']:not([data-novi-scheme='light'])", '    ')}
  }

${colorSection({
  light: (id) => `[data-novi-theme='tactile'][data-novi-color='${id}']`,
  dark: (id) => `[data-novi-theme='tactile'][data-novi-scheme='dark'][data-novi-color='${id}']`,
  mediaDark: (id) =>
    `[data-novi-theme='tactile']:not([data-novi-scheme='light'])[data-novi-color='${id}']`,
})}
}
`
}
