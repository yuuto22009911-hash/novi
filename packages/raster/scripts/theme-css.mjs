/**
 * `raster.css` / `raster.scoped.css` の組み立て（純関数）。
 *
 * 書き込みは `generate-theme-css.mjs`、検査は `src/tokens/colors.test.ts` が行う。
 * **build と CI が同じ関数の出力を読む**ことで、生成物とテスト対象のズレを無くす。
 *
 * カスケードの正しさはセレクタの詳細度と並び順そのもの:
 * - 色の light 上書き（後勝ち）は base の各ブロックより後に置く
 * - 色の dark(attr) 上書きは同色の light より後・詳細度も上
 * - 色つき media は base の media より後・詳細度も上
 * この順序は colors.test.ts が固定している。崩すとテストが落ちる。
 */
import { COLOR_SET, cssVariableName, TOKEN_GROUPS } from './tokens.data.mjs'

const HEADER =
  '/* 自動生成。編集しないこと。src/tokens/raster-tokens.ts と color-set.ts を変更して再生成する。 */\n'

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
 * スウォッチは自分の色だけを参照でき、ライト / ダークの選択も親のものが効く。
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
  if (entry === undefined) throw new Error(`Print Inks に無い色です: ${id}`)
  return entry
}

/**
 * 1色ぶんの変数宣言。secondary には相方（2色刷り）の値が入る。
 * success / warning / danger は**出さない**（FR-08: 色を切り替えても意味色は不変）。
 *
 * @param {import('../src/tokens/color-set.ts').RasterColorEntry} entry
 * @param {'light'|'dark'} scheme @param {string} indent @param {boolean} withHue
 */
function colorDecls(entry, scheme, indent, withHue) {
  const pair = entryOf(entry.pair)
  return [
    ...(withHue ? [`${indent}--novi-hue: ${entry.hue};`] : []),
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
 * base ブロックの既定色（Ink）がそのまま効く — フォールバックはこの「不在」で実現する（FR-05）。
 *
 * @param {{ light: (id: string) => string, dark: (id: string) => string, mediaDark: (id: string) => string }} sel
 */
function colorSection(sel) {
  return [
    `  /* ── カラーセット Print Inks（specs/06-tones-and-colors） ──
     data-novi-color は data-novi-theme と同じ要素（テーマルート）に置く。
     未知の色名はどれにも一致せず、既定色 Ink のまま描画される。 */`,
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
${tokenBlock("[data-novi-theme='raster']", '  ')}

${darkBlock("[data-novi-theme='raster'][data-novi-scheme='dark']", '  ')}

  @media (prefers-color-scheme: dark) {
${darkBlock("[data-novi-theme='raster']:not([data-novi-scheme='light'])", '    ')}
  }

${colorSection({
  light: (id) => `[data-novi-theme='raster'][data-novi-color='${id}']`,
  dark: (id) => `[data-novi-theme='raster'][data-novi-scheme='dark'][data-novi-color='${id}']`,
  mediaDark: (id) =>
    `[data-novi-theme='raster']:not([data-novi-scheme='light'])[data-novi-color='${id}']`,
})}
}
`
}
