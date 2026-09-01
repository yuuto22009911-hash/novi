/**
 * Tactile のデザイン規律の定義。**ここが唯一の真実。**
 *
 * 2箇所から読まれる:
 * - `check-design-rules.mjs`  ソースを機械的に検査する
 * - docs の IR 生成             AI 向け出力（llms.txt / MCP）に規則を載せる
 *
 * 検査と AI への説明がズレると、AI は CI で落ちるコードを自信を持って書く。
 * 同じ定義から両方を作る（ADR-A6 と同じ理由）。
 *
 * **Raster とは規律の中身が違う。** Tactile は影を面にも許し、scale を押下に限って許す。
 *
 * 寸法（タップ 44px / 入力 16px）はここでは検査しない。正規表現では
 * 「その `h-6` がボタンの高さなのか Badge の高さなのか」を区別できず、
 * 例外を積むと規則そのものが形骸化する。tv() の構造を見る `cross-cutting.test.ts` と、
 * 実測する e2e（T-44）が担当する。
 */

/**
 * 禁止事項。`prohibited` は人間と AI が読む表記、`pattern` は検査に使う表記。
 *
 * @type {{id: string, prohibited: string, pattern: RegExp, message: string}[]}
 */
export const DESIGN_RULES = [
  {
    id: 'radius',
    prohibited: 'トークンを経由しない角丸（rounded-sm / rounded-full / rounded-t-xl など）',
    // 「方向つきトークン」でも「トークン」でもないものだけを違反にする。
    // 省略可能なグループにすると、後戻りして正しい指定にも当たってしまう
    pattern: /(?<![\w-])rounded-(?![trblse]{1,2}-\[var\(--novi-radius)(?!\[var\(--novi-radius)/g,
    message: '角丸はトークン経由。Tactile は sm=8 / md=14 / lg=20px で、none 以外は 8px 以上',
  },
  {
    id: 'shadow-literal',
    prohibited: 'トークン外の影（shadow-md / shadow-[0_1px…] など）',
    pattern: /(?<![\w-])shadow-(?!none\b)(?!\[var\(--novi-shadow)[\w[]/g,
    message: '影はトークン経由。値は α ≤ 0.24 に縛られている',
  },
  {
    id: 'border-width',
    prohibited: 'border-2 以上',
    pattern: /(?<![\w-])border-(?:[2-9]|\d\d)(?![\w-])/g,
    message: '境界線は補助。使う場合も 1px のみ。面の分割は影と背景色差で行う',
  },
  {
    id: 'scale-decorative',
    prohibited: '押下状態以外の scale-*',
    // data-[pressed]: や active: が直前に付いていない scale だけを検出する（ADR-T5）
    pattern: /(?<!data-\[pressed\]:)(?<!active:)(?<![\w-])scale-(?!100\b)\d/g,
    message: '装飾目的の scale は使わない。押下フィードバック（data-[pressed]:scale-*）のみ許可',
  },
  {
    id: 'rotate',
    prohibited: 'rotate-* / animate-spin',
    pattern: /(?<![\w-])(?:rotate|animate-spin)/g,
    message: '回転は Spinner と Accordion のシェブロンのみ例外（ADR-T4）',
  },
  {
    id: 'literal-color',
    prohibited: 'リテラルの色値（#fff / rgb() / hsl() / oklch()）',
    pattern: /#[0-9a-fA-F]{3,8}\b|(?<![\w-])(?:rgb|rgba|hsl|oklch)\(/g,
    message: '色は必ず --novi-color-* を経由する。リテラル値を書かない',
  },
  {
    id: 'raw-spacing',
    prohibited: '8px 以上の生の余白ユーティリティ（p/px/py/pt/pb/pl/pr/gap-2 以上）',
    pattern:
      /(?<![\w-])(?:p|px|py|pt|pb|pl|pr|gap|gap-x|gap-y)-(?:[2-9]|\d\d)(?:\.5)?(?![\w-])/g,
    message:
      '余白はトークン経由（--novi-pad-* / --novi-gap-*）。' +
      '余白がテーマの所有物でないと、各コンポーネントが自分の判断で数値を書き、3モデルが同じ密度に潰れる。' +
      '8px 未満の微小インセット（アイコンの位置合わせ）だけ生値を許す',
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
  'tactile-tokens.ts': {
    rules: ['literal-color', 'duration', 'radius', 'shadow-literal'],
    reason: 'トークンの値そのものを定義する唯一の場所。ここだけは「使用」ではなく「定義」',
  },
  'color-set.ts': {
    rules: ['literal-color'],
    reason:
      'カラーセット Textile Dyes の値を定義する場所（specs/06-tones-and-colors）。tactile-tokens.ts と同じ「定義」側',
  },
  'spinner.styles.ts': {
    rules: ['rotate'],
    reason: 'ローディング表現の代替（点滅・バー往復）は視認性か情報量で劣る（ADR-R2 と同じ判断）',
  },
  'accordion.styles.ts': {
    rules: ['rotate'],
    reason:
      'シェブロンの回転は開閉方向そのものを示す。+/− への置き換えは向きの情報を失う（ADR-T4）',
  },
}

/** 色は必ずトークン経由、という規則の人間向け説明（IR が読む）。 */
export const COLOR_RULE =
  '色は --novi-color-* の CSS 変数経由でのみ指定する。data-novi-color で選ばれた染料に中立色まで追従するため、リテラル値を書くとテーマの外に取り残される'
