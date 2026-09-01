/**
 * Novi の固定語彙。
 *
 * これらの語彙は core が所有し、**全テーマが全値を実装しなければならない**。
 * テーマごとに語彙が違うと「単一ドキュメント + テーマ切替」が成立しなくなるため。
 * 見た目の解釈だけがテーマごとに異なる。
 */

/**
 * 見た目の強さ。
 *
 * - `solid`   塗りつぶし。最も強い視覚的重み
 * - `outline` 境界線のみ。背景は透明
 * - `soft`    淡い背景。境界線なし
 * - `ghost`   通常時は無装飾、hover で背景が出る
 * - `plain`   常に無装飾。テキストリンク相当
 */
export const NOVI_VARIANTS = ['solid', 'outline', 'soft', 'ghost', 'plain'] as const

/** 寸法。テーマは高さを 8px グリッド上に乗せることが推奨される。 */
export const NOVI_SIZES = ['sm', 'md', 'lg'] as const

/** 意味的な色。リテラルの色名（blue-500 など）は語彙に含めない。 */
export const NOVI_COLORS = [
  'default',
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
] as const

/** 角丸。テーマは各値の実際の大きさを自由に決めてよい（同じ値に潰してもよい）。 */
export const NOVI_RADII = ['none', 'sm', 'md', 'lg', 'full'] as const

/**
 * 意味を持つ余白の語彙（ADR-D1）。**テーマは全件に値を与えなければならない。**
 *
 * 生の `--novi-space-*` と違い、これは「どこに使う余白か」を名前で決めている。
 * 名前で決めておかないと、コンポーネントが各自の判断で数値を書き、
 * 余白がテーマの所有物でなくなる。
 */
export const NOVI_PAD_TOKENS = [
  'surface-x',
  'surface-y',
  'control-x-sm',
  'control-x-md',
  'control-x-lg',
] as const

/** 要素間の距離の語彙。inline < stack < section の比が「余白の多さ」の知覚を作る。 */
export const NOVI_GAP_TOKENS = ['inline', 'stack', 'section'] as const

/** 字送りの語彙。見出し用と本文用を分ける（ADR-D2）。 */
export const NOVI_TRACKING_TOKENS = ['tight', 'normal'] as const

export type NoviVariant = (typeof NOVI_VARIANTS)[number]
export type NoviSize = (typeof NOVI_SIZES)[number]
export type NoviColor = (typeof NOVI_COLORS)[number]
export type NoviRadius = (typeof NOVI_RADII)[number]
export type NoviPadToken = (typeof NOVI_PAD_TOKENS)[number]
export type NoviGapToken = (typeof NOVI_GAP_TOKENS)[number]
export type NoviTrackingToken = (typeof NOVI_TRACKING_TOKENS)[number]

/**
 * `tv()` の variants を型付けし、語彙の実装漏れと語彙外の追加をコンパイルエラーにする。
 *
 * @example
 * const variant: VariantMap<NoviVariant, { root: string }> = {
 *   solid:   { root: 'bg-[--novi-color-primary]' },
 *   outline: { root: 'border border-[--novi-color-border]' },
 *   soft:    { root: 'bg-[--novi-color-subtle]' },
 *   ghost:   { root: 'hover:bg-[--novi-color-subtle]' },
 *   plain:   { root: 'underline-offset-4 hover:underline' },
 *   // `soft` を消すとコンパイルエラー。`elevated` を足してもコンパイルエラー。
 * }
 */
export type VariantMap<K extends string, S> = Record<K, S>
