/**
 * Raster のデザイン規律の定義。**ここが唯一の真実。**
 *
 * 2箇所から読まれる:
 * - `check-design-rules.mjs`  ソースを機械的に検査する
 * - docs の IR 生成             AI 向け出力（llms.txt / MCP）に規則を載せる
 *
 * 検査と AI への説明がズレると、AI は CI で落ちるコードを自信を持って書く。
 * 同じ定義から両方を作る（ADR-A1 と同じ理由）。
 */

/**
 * 禁止事項。`prohibited` は人間と AI が読む表記、`pattern` は検査に使う表記。
 * 両方を1箇所に置くことで、片方だけ直して食い違う事故を防ぐ。
 *
 * @type {{id: string, prohibited: string, pattern: RegExp, message: string}[]}
 */
export const DESIGN_RULES = [
  {
    id: 'shadow',
    prohibited: 'shadow-*（shadow-none とトークン shadow-[var(--novi-shadow-*)] は可）',
    pattern: /(?<![\w-])shadow-(?!none\b)(?!\[var\(--novi-shadow)[\w[]/g,
    message: '影はトークン経由で、浮いている層だけに使う。面は境界線と背景色の差で表す',
  },
  {
    id: 'radius',
    prohibited: 'rounded-md / lg / xl / 2xl / 3xl と任意値の角丸',
    pattern: /(?<![\w-])rounded-(?:md|lg|xl|2xl|3xl|\[(?!var\(--novi))/g,
    message: '角丸はトークン経由。Raster は sm=6 / md=8 / lg=12px の3段',
  },
  {
    id: 'border-width',
    prohibited: 'border-2 以上',
    pattern: /(?<![\w-])border-(?:[2-9]|\d\d)(?![\w-])/g,
    message: '境界線は 1px のみ。面の分割は線の太さでなく余白で行う',
  },
  {
    id: 'scale',
    prohibited: 'scale-* / scale-x-* / scale-y-*',
    pattern: /(?<![\w-])(?:scale|scale-x|scale-y)-\d/g,
    message: '動きで飾らない。モーションは opacity と translate のみ',
  },
  {
    id: 'rotate',
    prohibited: 'rotate-* / animate-spin',
    pattern: /(?<![\w-])(?:rotate|animate-spin)/g,
    message: '同上。回転は Spinner のみ例外（ADR-R2）',
  },
  {
    id: 'literal-color',
    prohibited: 'リテラルの色値（#fff / rgb() / hsl() / oklch()）',
    pattern: /#[0-9a-fA-F]{3,8}\b|(?<![\w-])(?:rgb|rgba|hsl|oklch)\(/g,
    message: '色は必ず --novi-color-* を経由する。リテラル値を書かない',
  },
  {
    id: 'duration',
    prohibited: 'duration-*（--novi-duration-* の任意値を除く）',
    pattern: /(?<![\w-])duration-(?!\[var\(--novi)/g,
    message: 'モーションの時間はトークン経由にする',
  },
]

/**
 * 例外。キーはファイル名、値は許可するルール ID と理由。
 * 追加するときは PR で必ず理由を確認する。理由が無いものは認めない。
 *
 * @type {Record<string, {rules: string[], reason: string}>}
 */
export const DESIGN_RULE_EXCEPTIONS = {
  'spinner.styles.ts': {
    rules: ['rotate'],
    reason: 'ローディング表現の代替（点滅・バー往復）は視認性か情報量で劣る（ADR-R2）',
  },
  'raster-tokens.ts': {
    rules: ['literal-color', 'duration', 'radius', 'shadow'],
    reason: 'トークンの値そのものを定義する唯一の場所。ここだけは「使用」ではなく「定義」',
  },
}

/** 色の扱い。禁止パターンでは表せない方針を文章で持つ。 */
export const COLOR_RULE =
  '色は `--novi-color-*` の CSS 変数経由でのみ指定する。リテラルの色値は書かない。' +
  '中立色の chroma は 0 に固定し、面と文字の階層は明度だけで作る。'
