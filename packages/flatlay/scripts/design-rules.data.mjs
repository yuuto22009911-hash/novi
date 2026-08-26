/**
 * Flatlay のデザイン規律の定義。**ここが唯一の真実。**
 *
 * 2箇所から読まれる:
 * - `check-design-rules.mjs`  ソースを機械的に検査する
 * - docs の IR 生成             AI 向け出力（llms.txt / MCP）に規則を載せる
 *
 * 検査と AI への説明がズレると、AI は CI で落ちるコードを自信を持って書く。
 * 同じ定義から両方を作る（ADR-A6 と同じ理由）。
 *
 * **両テーマとは規律の中身がまるで違う。** Flatlay は z 軸を持たないので、
 * 重なりを作る語彙（z-index / fixed / absolute / sticky / 影）を丸ごと禁じる。
 * 「浮かせない」は主観では守れない。1箇所でも漏れると原理が崩れるので機械で縛る。
 */

/**
 * 禁止事項。`prohibited` は人間と AI が読む表記、`pattern` は検査に使う表記。
 *
 * @type {{id: string, prohibited: string, pattern: RegExp, message: string}[]}
 */
export const DESIGN_RULES = [
  {
    id: 'z-index',
    prohibited: 'z-index の指定（z-10 / z-[999] / zIndex）',
    // 報告に出す `found` を読める形にするため、数字と任意値は最後まで飲む
    pattern: /(?<![\w-])z-(?:\d+|\[[^\]]*\])|zIndex/g,
    message: 'Flatlay は z 軸を持たない。重なりの順序は DOM 順だけで表す（例外なし・FR-02）',
  },
  {
    id: 'position',
    prohibited: 'fixed / absolute',
    pattern: /(?<![\w-])(?:fixed|absolute)(?![\w-])/g,
    message:
      '浮く面を作らない。例外は modal.styles.ts（テイクオーバー）と tooltip.styles.ts の2つだけ（FR-03）',
  },
  {
    id: 'sticky',
    prohibited: 'sticky',
    pattern: /(?<![\w-])sticky(?![\w-])/g,
    message: '滞留も重なり。スクロール中にコンテンツへ被る時点で z 軸の語彙になる（ADR-F4）',
  },
  {
    id: 'shadow-literal',
    prohibited: 'トークン外の影（shadow-md / shadow-[0_1px…] など）',
    pattern: /(?<![\w-])shadow-(?!none\b)(?!\[var\(--novi-shadow)[\w[]/g,
    message: '影は嘘（浮く層が存在しない）。トークンは全段 0 0 #0000 で、書いても何も出ない',
  },
  {
    id: 'expand-animation',
    prohibited: '高さ・スライドのアニメーション',
    pattern: /transition-\[(?:max-)?height|animate-\[[^\]]*(?:height|slide)/g,
    message:
      '展開・格納は即時。押し下げに transition を付けると後続が滑り続けて読めなくなる（FR-12 / ADR-F1）',
  },
  {
    id: 'transform',
    prohibited: 'scale-* / translate-* / rotate-* / animate-spin',
    pattern: /(?<![\w-])(?:scale|translate|rotate)-(?!none\b)[\w[]|animate-spin/g,
    message: '押下は反転（スタンプ）で示す。動きで飾らない。例外は spinner.styles.ts のみ（FR-11）',
  },
  {
    id: 'radius',
    prohibited: 'トークンを経由しない角丸（rounded-sm / rounded-full / rounded-t-xl など）',
    // 「方向つきトークン」でも「トークン」でもないものだけを違反にする。
    // 省略可能なグループにすると、後戻りして正しい指定にも当たってしまう
    pattern: /(?<![\w-])rounded-(?![trblse]{1,2}-\[var\(--novi-radius)(?!\[var\(--novi-radius)/g,
    message: '角丸はトークン経由。Flatlay は書類の直角で sm=md=2 / lg=4px',
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
    message: 'モーションの時間はトークン経由にする（Flatlay は 100ms の1本しかない）',
  },
]

/**
 * 例外。キーはファイル名、値は許可するルール ID と理由。
 * 追加するときは PR で必ず理由を確認する。理由が無いものは認めない。
 *
 * **`position` の例外は Modal と Tooltip の2つで固定**（NG1）。3つ目を足すときは
 * 「z 軸を持たない」という主張そのものを見直すことになる。
 *
 * @type {Record<string, {rules: string[], reason: string}>}
 */
export const DESIGN_RULE_EXCEPTIONS = {
  'flatlay-tokens.ts': {
    rules: ['literal-color', 'duration', 'radius', 'shadow-literal'],
    reason: 'トークンの値そのものを定義する唯一の場所。ここだけは「使用」ではなく「定義」',
  },
  'color-set.ts': {
    rules: ['literal-color'],
    reason: 'カラーセット Stationery の値を定義する場所。flatlay-tokens.ts と同じ「定義」側',
  },
  'spinner.styles.ts': {
    rules: ['transform'],
    reason: 'ローディング表現の代替（点滅・バー往復）は視認性か情報量で劣る（両テーマと同じ判断）',
  },
  'modal.styles.ts': {
    rules: ['position'],
    reason:
      '全画面テイクオーバーの例外1号。viewport 全面を占めるには fixed が要るが、z-index は使わず DOM 順で最前に置く（ADR-F2 / FR-06）',
  },
  'tooltip.styles.ts': {
    rules: ['position'],
    reason:
      '例外2号。ポインタ追従の一時表示はフローに入れられない（レイアウトが動くと hover が外れる）ため、唯一の浮きとして absolute を許す（ADR-F6）',
  },
}

/**
 * 例外ファイルに必須の注記。**理由をコードのそばに残させる。**
 *
 * このデータファイルの `reason` だけでは、実際にその行を書き換える人の目に入らない。
 * 例外が許されているファイルには、なぜ規律の外にいるのかをコメントで書かせる。
 */
export const EXCEPTION_COMMENT_MARKER = '例外'

/** 色は必ずトークン経由、という規則の人間向け説明（IR が読む）。 */
export const COLOR_RULE =
  '色は --novi-color-* の CSS 変数経由でのみ指定する。data-novi-color で染まるのは罫線だけだが、地の色もトークン経由でなければテーマの外に取り残される'
