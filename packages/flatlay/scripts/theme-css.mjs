/**
 * `flatlay.css` / `flatlay.scoped.css` の組み立て（純関数）。
 *
 * 書き込みは `generate-theme-css.mjs`、検査は `src/tokens/colors.test.ts` が行う。
 * **build と CI が同じ関数の出力を読む**ことで、生成物とテスト対象のズレを無くす。
 *
 * 両テーマとの違いは**色ブロックが痩せている**こと。Flatlay は地が染まらないので、
 * 色を切り替えても差し替わるのは罫線 2 本と primary / secondary だけ（FR-07）。
 * この「出力の細さ」そのものが第3方式の実装上の姿になる。
 */
import { neutralsFor } from '../src/tokens/color-set.ts'
import { TINTED_BORDER_KEYS } from '../src/tokens/flatlay-tokens.ts'
import { COLOR_SET, cssVariableName, TOKEN_GROUPS } from './tokens.data.mjs'

const HEADER =
  '/* 自動生成。編集しないこと。src/tokens/flatlay-tokens.ts と color-set.ts を変更して再生成する。 */\n'

/**
 * 開閉のキーフレーム。**テーマの CSS が持つ**（core は CSS を持たない原則）。
 *
 * Flatlay が持つのは `novi-fade-in` **1本だけ**。ADR-F1 により展開・格納は
 * アニメーションしないため、slide 系のキーフレームは定義そのものを持たない。
 * 定義が無ければ、うっかり参照しても何も起きない代わりに検査で捕まえられる。
 */
const KEYFRAMES = `  @keyframes novi-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`

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
    swatchDecls('light', inner),
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
    swatchDecls('dark', `${indent}  `),
    `${indent}}`,
  ].join('\n')
}

/**
 * 色見本用の変数。**ColorPicker のスウォッチが参照する。**
 *
 * スウォッチに `data-novi-color` を置く形は採れない。docs は FOUC 対策で
 * `<html>` にもテーマを宣言するため、色の上書きセレクタが「テーマルートの子孫」に
 * 効くようにすると、ページ全体が最後に選んだ色で塗られてしまう。
 * 色ごとの値を独立した変数として**テーマルートで一度に宣言**すれば、
 * スウォッチは自分の色だけを参照できる。
 *
 * @param {'light'|'dark'} scheme @param {string} indent
 */
function swatchDecls(scheme, indent) {
  return COLOR_SET.map((entry) =>
    [
      `${indent}--novi-swatch-${entry.id}: ${entry[scheme].primary};`,
      `${indent}--novi-swatch-${entry.id}-fg: ${entry[scheme].primaryFg};`,
    ].join('\n'),
  ).join('\n')
}

/** @param {string} id */
function entryOf(id) {
  const entry = COLOR_SET.find((c) => c.id === id)
  if (entry === undefined) throw new Error(`Stationery に無い色です: ${id}`)
  return entry
}

/**
 * 1色ぶんの変数宣言。**染まるのは罫線だけ**なので、地・文字・面は出さない（FR-07）。
 * success / warning / danger も出さない（FR-08: 色を切り替えても意味色は不変）。
 *
 * @param {import('../src/tokens/color-set.ts').FlatlayColorEntry} entry
 * @param {'light'|'dark'} scheme @param {string} indent @param {boolean} withHue
 */
function colorDecls(entry, scheme, indent, withHue) {
  const pair = entryOf(entry.pair)
  const neutrals = neutralsFor(entry.hue, scheme)
  return [
    ...(withHue ? [`${indent}--novi-hue: ${entry.hue};`] : []),
    ...TINTED_BORDER_KEYS.map((name) => `${indent}--novi-color-${name}: ${neutrals[name]};`),
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
 * base ブロックの既定色（Fieldbook）がそのまま効く — フォールバックはこの「不在」で実現する（FR-08）。
 *
 * @param {{ light: (id: string) => string, dark: (id: string) => string, mediaDark: (id: string) => string }} sel
 */
function colorSection(sel) {
  return [
    `  /* ── カラーセット Stationery（specs/07-theme-flatlay） ──
     data-novi-color は data-novi-theme と同じ要素（テーマルート）に置く。
     未知の色名はどれにも一致せず、既定色 Fieldbook のまま描画される。
     Flatlay は染まらない紙なので、差し替わるのは罫線と primary / secondary だけ。 */`,
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
${KEYFRAMES}
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
${KEYFRAMES}
${tokenBlock("[data-novi-theme='flatlay']", '  ')}

${darkBlock("[data-novi-theme='flatlay'][data-novi-scheme='dark']", '  ')}

  @media (prefers-color-scheme: dark) {
${darkBlock("[data-novi-theme='flatlay']:not([data-novi-scheme='light'])", '    ')}
  }

${colorSection({
  light: (id) => `[data-novi-theme='flatlay'][data-novi-color='${id}']`,
  dark: (id) => `[data-novi-theme='flatlay'][data-novi-scheme='dark'][data-novi-color='${id}']`,
  mediaDark: (id) =>
    `[data-novi-theme='flatlay']:not([data-novi-scheme='light'])[data-novi-color='${id}']`,
})}
}
`
}
