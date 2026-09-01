/**
 * CSS カスタムプロパティの単一ソース。
 *
 * ダーク値は `[data-novi-scheme='dark']` と `@media (prefers-color-scheme: dark)` の
 * 2箇所に出力する必要があり、手書きすると必ず片方が腐る。
 * ここを唯一の定義とし、`base.css` はビルド時に生成する（ADR-C3）。
 *
 * 色は必ずセマンティック名にする。`blue-500` のようなリテラル名を作ってはならない。
 * 名前が色を指してしまうと、テーマが色相を変えたときに意味が壊れる。
 */

/** カラースキームに依存しないトークン。ライト・ダークで同じ値を使う。 */
export const SCHEME_INDEPENDENT_TOKENS: Record<string, Record<string, string>> = {
  radius: {
    none: '0px',
    sm: '2px',
    md: '6px',
    lg: '12px',
    full: '9999px',
  },
  space: {
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
  },
  /**
   * 意味を持つ余白。**コンポーネントが消費するのはこちら**（ADR-D1）。
   *
   * 生の `space-*` は利用者の逃げ口として残すが、コンポーネントからは使わない。
   * 素の数値を直接書くと、余白がテーマの所有物にならず、
   * 3テーマが同じ密度に潰れる（実際に潰れていた）。
   */
  pad: {
    // 面（Card / Modal / Popover / Menu / Toast）の内側
    'surface-x': '20px',
    'surface-y': '16px',
    // コントロール（Button / Input / Select トリガー）の左右
    'control-x-sm': '12px',
    'control-x-md': '16px',
    'control-x-lg': '20px',
  },
  /**
   * 要素間の距離。
   *
   * **inline < stack < section** の比がそのまま「余白の多さ」の知覚になる。
   * 絶対値ではなく比が効く（近接の法則）。比が 1:1 に潰れると詰まって見える。
   */
  gap: {
    // 行内（アイコン ↔ ラベル）
    inline: '8px',
    // 縦に積む同格の要素間
    stack: '16px',
    // 面の中の区画間
    section: '24px',
  },
  /** 字送り。テーマの「声」を作る主要な軸のひとつ（ADR-D2）。 */
  tracking: {
    tight: '0em',
    normal: '0em',
  },
  text: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '30px',
    '3xl': '36px',
  },
  leading: {
    body: '1.6',
    heading: '1.25',
  },
  font: {
    sans: 'system-ui, sans-serif',
    mono: 'ui-monospace, monospace',
    // 見出しの書体。sans と別に持つことで、テーマが見出しだけ声を変えられる
    heading: 'var(--novi-font-sans)',
    // font-variant-numeric の値。数字の字形もテーマの声のうち
    numeric: 'normal',
  },
  shadow: {
    none: 'none',
    sm: '0 1px 2px oklch(20% 0 0 / 0.06)',
    md: '0 2px 8px oklch(20% 0 0 / 0.08)',
    lg: '0 8px 24px oklch(20% 0 0 / 0.10)',
  },
  duration: {
    fast: '120ms',
    base: '200ms',
    slow: '320ms',
  },
  ease: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  },
  focus: {
    'ring-width': '2px',
    'ring-offset': '2px',
    // 色はスキームで変わるため、値ではなく参照を置く
    'ring-color': 'var(--novi-color-primary)',
  },
}

/**
 * ライトスキームの色。
 *
 * `border` は装飾用（面の区切り）、`border-strong` は機能上必要な境界
 * （入力欄の枠など）で **WCAG 1.4.11 の 3:1 を満たす**。
 * 1つにまとめると、装飾に合わせれば基準を割り、基準に合わせれば重くなる。
 */
export const LIGHT_COLORS: Record<string, string> = {
  bg: 'oklch(99% 0 0)',
  subtle: 'oklch(96.5% 0 0)',
  fg: 'oklch(20% 0 0)',
  muted: 'oklch(48% 0 0)',
  border: 'oklch(90% 0 0)',
  'border-strong': 'oklch(58% 0 0)',
  overlay: 'oklch(20% 0 0 / 0.45)',

  default: 'oklch(96.5% 0 0)',
  'default-fg': 'oklch(20% 0 0)',
  primary: 'oklch(48% 0.18 250)',
  'primary-fg': 'oklch(99% 0 0)',
  secondary: 'oklch(46% 0.16 300)',
  'secondary-fg': 'oklch(99% 0 0)',
  success: 'oklch(45% 0.13 150)',
  'success-fg': 'oklch(99% 0 0)',
  warning: 'oklch(45% 0.12 70)',
  'warning-fg': 'oklch(99% 0 0)',
  danger: 'oklch(48% 0.19 25)',
  'danger-fg': 'oklch(99% 0 0)',
}

/** ダークスキームの色。ライトと同じキー集合を持つ必要がある（テストで保証）。 */
export const DARK_COLORS: Record<string, string> = {
  bg: 'oklch(16% 0 0)',
  subtle: 'oklch(22% 0 0)',
  fg: 'oklch(95% 0 0)',
  muted: 'oklch(72% 0 0)',
  border: 'oklch(28% 0 0)',
  'border-strong': 'oklch(55% 0 0)',
  overlay: 'oklch(10% 0 0 / 0.6)',

  default: 'oklch(26% 0 0)',
  'default-fg': 'oklch(95% 0 0)',
  primary: 'oklch(72% 0.15 250)',
  'primary-fg': 'oklch(16% 0 0)',
  secondary: 'oklch(72% 0.14 300)',
  'secondary-fg': 'oklch(16% 0 0)',
  success: 'oklch(75% 0.14 150)',
  'success-fg': 'oklch(16% 0 0)',
  warning: 'oklch(80% 0.13 70)',
  'warning-fg': 'oklch(16% 0 0)',
  danger: 'oklch(70% 0.17 25)',
  'danger-fg': 'oklch(16% 0 0)',
}

/** CSS カスタムプロパティの接頭辞。全トークンがこの名前空間に入る（FR-15）。 */
export const TOKEN_PREFIX = '--novi-'
