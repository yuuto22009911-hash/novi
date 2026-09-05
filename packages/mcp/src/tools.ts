/**
 * 4つのツールの中身。**MCP の配線から切り離した純関数**にしてある。
 *
 * 応答の文面そのものが仕様（未実装をどう伝えるか、が要件）なので、
 * サーバを起動しないでも文面を検査できる形にしておく。
 *
 * IR を引数で受けるのは、同梱データでは再現できない状態
 * （どのテーマも実装していない契約、例外が1つも無いテーマ）を検査するため。
 * 通常は下部の束縛済みの関数を使う。
 */
import { type ComponentEntry, type ComponentIndex, index } from './index-data.js'

export function createTools(source: ComponentIndex) {
  const { components, themes, tokenTypes, version } = source

  /** 型名だけでは取りうる値が分からない。IR が持つ展開に置き換える。 */
  const displayType = (type: string) => tokenTypes[type] ?? type

  /**
   * 実装済みのコンポーネントだけを「使える」とみなす。
   * 契約があるだけのものを一覧に混ぜると、import できないものを勧めることになる。
   */
  const isAvailable = (component: ComponentEntry) => component.implementedBy.length > 0

  const availableNames = () => components.filter(isAvailable).map((component) => component.name)

  /**
   * テーマ名 → パッケージ名。
   *
   * IR のスキーマ検証が `implementedBy` ⊆ `themes` を保証しているので、
   * 見つからないのは IR が壊れているとき。**その場合でも黙って落ちない**。
   * import 先が分からないと答える方が、それらしい名前を作るより安全。
   */
  const pkgOf = (key: string) => themes[key]?.pkg ?? `（不明なテーマ: ${key}）`

  /**
   * 未実装をどう伝えるか。**近いもので代替提案しない**（ADR-A4）。
   *
   * 「近いもの」を返すと、AI はそれを実装済みの代替と解釈して誤ったコードを書く。
   * 上流の react-aria-components を挙げるにとどめる。
   */
  function notImplemented(subject: string): string {
    return [
      `${subject}は Novi UI にありません。`,
      '',
      `実装済みは次の ${availableNames().length} 件だけです:`,
      availableNames().join(' / '),
      '',
      '**近いコンポーネントで代用しないでください。** 見た目が似ていても役割が違います。',
      'Novi の基盤である react-aria-components に同等のものがあればそれを直接使うか、',
      'Novi 側の実装を待ってください。',
    ].join('\n')
  }

  /** 全コンポーネントの一覧（AC-04-1）。 */
  function listComponents(): string {
    const rows = components.map((component) => {
      const where = isAvailable(component)
        ? component.implementedBy.map(pkgOf).join(', ')
        : '**未実装**'
      return `- **${component.name}** — ${component.summary} （${where}）`
    })

    return [
      `# Novi UI ${version} のコンポーネント（${components.length} 件）`,
      '',
      ...rows,
      '',
      'この一覧にないものは未実装です。近いもので代用しないでください。',
    ].join('\n')
  }

  /** 1コンポーネントの詳細（AC-04-2）。 */
  function getComponent(name: string, theme?: string): string {
    // 大文字小文字だけの違いは同じものとして扱う。綴りが違うものは別物として落とす
    const component = components.find((c) => c.name.toLowerCase() === name.trim().toLowerCase())
    if (component === undefined) return notImplemented(`\`${name}\``)

    if (!isAvailable(component)) {
      return [
        `# ${component.name}`,
        '',
        '契約は存在しますが、**どのテーマも実装していません**。現在は使えません。',
        '',
        notImplemented(`\`${component.name}\` の実装`),
      ].join('\n')
    }

    if (theme !== undefined && !component.implementedBy.includes(theme)) {
      return [
        `\`${component.name}\` はテーマ \`${theme}\` では実装されていません。`,
        `実装しているテーマ: ${component.implementedBy.join(', ')}`,
      ].join('\n')
    }

    // isAvailable を通っているので implementedBy は空ではない
    const [first] = component.implementedBy
    const pkg = pkgOf(theme ?? first ?? '')

    const props = component.props.map(
      (prop) =>
        `| \`${prop.name}\` | \`${displayType(prop.type)}\` | ${prop.required ? '必須' : '任意'} | ${prop.doc || '-'} |`,
    )

    return [
      `# ${component.name}`,
      '',
      component.summary,
      ...(component.notes === null ? [] : ['', component.notes]),
      '',
      `\`\`\`tsx`,
      `import { ${component.importName} } from '${pkg}'`,
      '',
      component.example,
      '```',
      '',
      '## props',
      '',
      '| 名前 | 型 | | 説明 |',
      '|---|---|---|---|',
      ...props,
      '',
      '## slot',
      '',
      `すべて \`data-slot="<名前>"\` として出力されます。スタイルの上書きはこれを狙ってください。`,
      '',
      `- 全 slot: ${component.slots.all.join(' / ')}`,
      `- 必須 slot: ${component.slots.required.join(' / ')}`,
      '',
      '## アクセシビリティ',
      '',
      component.a11y,
      ...(component.keyboard.length > 0
        ? ['', '## キーボード', '', ...component.keyboard.map((k) => `- ${k.keys}: ${k.action}`)]
        : []),
      '',
      `> Novi UI ${version} の情報です。`,
    ].join('\n')
  }

  /** テーマのデザイン規則（AC-04-3 / FR-12）。 */
  function getDesignRules(theme: string): string {
    const entry = themes[theme]
    if (entry === undefined) {
      return [
        `テーマ \`${theme}\` はありません。`,
        `利用できるテーマ: ${Object.keys(themes).join(', ')}`,
      ].join('\n')
    }

    const { designRules } = entry
    const numeric = Object.entries(designRules.numeric).map(
      ([group, values]) =>
        `- **${group}**: ${Object.entries(values)
          .map(([key, value]) => `${key}=${value}`)
          .join(', ')}`,
    )

    const prohibited = designRules.prohibited.map(
      (rule) => `- \`${rule.pattern}\` — ${rule.reason}`,
    )

    const exceptions = designRules.exceptions.map(
      (exception) =>
        `- \`${exception.file}\` で \`${exception.rules.join(', ')}\` のみ許可 — ${exception.reason}`,
    )

    return [
      `# ${entry.label}（${entry.pkg}）のデザイン規則`,
      '',
      entry.description,
      '',
      '## 数値',
      '',
      '目分量で近い値を書かないでください。ここにある値がそのまま定義です。',
      '',
      ...numeric,
      '',
      '## 書いてはいけないクラス',
      '',
      'CI が機械的に検査しています。違反するとビルドが落ちます。',
      '',
      ...prohibited,
      '',
      '## 色',
      '',
      designRules.colorRule,
      '',
      '## 例外',
      '',
      ...(exceptions.length === 0 ? ['なし'] : exceptions),
    ].join('\n')
  }

  /** ASCII だけで書かれた語かどうか。日本語と英語で照合の仕方を変えるために使う。 */
  const isAscii = (value: string) => /^[\x20-\x7e]+$/.test(value)

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  /**
   * 語から意味の核だけを取り出す。ひらがなの助詞・活用語尾を落とす。
   *
   * 「一覧から選ぶ」→ ['一覧', '選']
   */
  const chunksOf = (value: string) => value.split(/[ぁ-ゖー\s]+/).filter(Boolean)

  /**
   * 検索語が問い合わせ文に現れるか。
   *
   * 英語は語境界で照合する。部分一致にすると `tab` が `table` に当たり、
   * 未実装の Table を Tabs として答えてしまう。
   *
   * 日本語は語境界が無いうえ、活用と助詞で語が分断される。
   * 「一覧から選ぶ」は「一覧から1つ選ばせたい」の中に文字列としては現れない。
   * そこで意味の核（漢字・カタカナ）が**順番どおりに全部現れるか**で見る。
   * 順序を要求するのは、無関係な文に核が散らばっているだけの一致を弾くため。
   *
   * 核がすべて1文字の語（「折りたたみ」→『折』）は、そのまま照合すると緩すぎる。
   * その場合だけは語全体の部分一致に落とす。緩い一致で未実装を実装済みと答えるより、
   * 見つからない方がましという方針（ADR-A4）。
   */
  function hits(keyword: string, query: string): boolean {
    const lowered = keyword.toLowerCase()
    if (isAscii(lowered)) return new RegExp(`\\b${escapeRegExp(lowered)}\\b`).test(query)

    const chunks = chunksOf(lowered)
    if (!chunks.some((chunk) => chunk.length >= 2)) return query.includes(lowered)

    let from = 0
    for (const chunk of chunks) {
      const at = query.indexOf(chunk, from)
      if (at === -1) return false
      from = at + chunk.length
    }
    return true
  }

  /**
   * 自然文からコンポーネントを探す（AC-04-4 / FR-06）。
   *
   * 照合対象は契約に書かれた `@keywords` と名前だけ。説明文の全文検索にすると
   * 「選ぶ」「表示」のような一般語で無関係なものが当たり、未実装を実装済みと答えてしまう。
   */
  function searchComponents(query: string): string {
    const normalized = query.trim().toLowerCase()
    if (normalized === '') return '検索語が空です。作りたいものを日本語か英語で書いてください。'

    const matched = components
      .filter(isAvailable)
      .map((component) => {
        const terms = [component.name, ...component.keywords].filter((term) =>
          hits(term, normalized),
        )
        return { component, terms }
      })
      .filter((entry) => entry.terms.length > 0)
      // 一致した語が長いほど具体的。具体的なものを先に見せる
      .sort(
        (a, b) =>
          Math.max(...b.terms.map((t) => t.length)) - Math.max(...a.terms.map((t) => t.length)),
      )

    if (matched.length === 0) return notImplemented(`「${query}」に一致するコンポーネント`)

    const rows = matched.map(
      ({ component, terms }) =>
        `- **${component.name}** — ${component.summary}\n  一致した語: ${terms.join(', ')}`,
    )

    return [
      `「${query}」に一致したコンポーネント（${matched.length} 件）`,
      '',
      ...rows,
      '',
      '詳しい props と slot は `get_component` で取得してください。',
      'ここに出ていない役割のものは未実装です。近いもので代用しないでください。',
    ].join('\n')
  }

  return { listComponents, getComponent, getDesignRules, searchComponents }
}

// 同梱の IR に束縛したもの。サーバはこれを使う
const bound = createTools(index)

export const listComponents = bound.listComponents
export const getComponent = bound.getComponent
export const getDesignRules = bound.getDesignRules
export const searchComponents = bound.searchComponents
