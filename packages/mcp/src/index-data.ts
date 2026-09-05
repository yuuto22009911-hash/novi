/**
 * 同梱の IR。**唯一のデータ源。**
 *
 * ビルド時に JS へ埋め込まれるため、実行時にファイルを読まない。
 * 環境変数・ファイルシステム・ネットワークに触れないことが、このサーバの
 * 安全性の根拠そのもの（ADR-A3）。読むものが1つも無ければ、盗めるものも無い。
 *
 * 情報の更新はパッケージの更新でのみ起きる。IR の `version` と
 * `@novi-ui/core` のバージョンが一致するため、古い情報を掴んでいるかを利用者が判別できる。
 */
import raw from '../data/component-index.json'

export interface PropEntry {
  name: string
  required: boolean
  type: string
  doc: string
}

export interface ComponentEntry {
  name: string
  summary: string
  notes: string | null
  a11y: string
  keywords: string[]
  implementedBy: string[]
  importName: string
  props: PropEntry[]
  example: string
  keyboard: { keys: string; action: string }[]
  slots: { all: string[]; required: string[] }
}

export interface DesignRules {
  numeric: Record<string, Record<string, string | number>>
  prohibited: { id: string; pattern: string; reason: string }[]
  exceptions: { file: string; rules: string[]; reason: string }[]
  colorRule: string
}

export interface ThemeEntry {
  pkg: string
  label: string
  description: string
  designRules: DesignRules
}

export interface ComponentIndex {
  version: string
  conventions: {
    noProvider: boolean
    emitsDataSlot: boolean
    propNaming: Record<string, string>
  }
  vocabularies: Record<string, string[]>
  tokenTypes: Record<string, string>
  themes: Record<string, ThemeEntry>
  components: ComponentEntry[]
}

// JSON から推論される型は値そのものに引きずられて扱いにくい。境界で1度だけ形を宣言する
export const index = raw as unknown as ComponentIndex
