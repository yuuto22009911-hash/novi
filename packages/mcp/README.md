# @novi-ui/mcp

Novi UI の API を AI エージェントに渡す MCP サーバ。**読み取り専用・オフライン。**

コンポーネントの props / slot / 使用例 / アクセシビリティ注記と、
テーマのデザイン規則（数値定義・書いてはいけないクラス）を返します。

## 設定

```json
{
  "mcpServers": {
    "novi-ui": {
      "command": "npx",
      "args": ["-y", "@novi-ui/mcp"]
    }
  }
}
```

Claude Code なら次の1行でも入ります。

```bash
claude mcp add novi-ui -- npx -y @novi-ui/mcp
```

## ツール

| ツール | 入力 | 返すもの |
|---|---|---|
| `list_components` | なし | 全コンポーネントの名前・1行説明・実装テーマ |
| `get_component` | `name`, `theme?` | props / slot / 使用例 / アクセシビリティ注記 |
| `get_design_rules` | `theme` | 数値定義 / 禁止クラス / 色の扱い |
| `search_components` | `query` | 自然文に一致する候補。無ければ「未実装」 |

### 未実装のものを代替提案しません

```
入力: 「日付を選ばせたい」
出力: 「日付を選ばせたい」に一致するコンポーネントは Novi UI にありません。
      実装済みは次の 28 件だけです: …
      近いコンポーネントで代用しないでください。
      react-aria-components に同等のものがあればそれを直接使ってください。
```

「近いもの」を返すと、AI はそれを実装済みの代替と解釈して誤ったコードを書きます。
親切に見える提案が、幻覚の直接の原因になります。

## 一次配布元だけを使ってください

このパッケージは Novi UI 本体と同じリポジトリから公開しています。
`@novi-ui/mcp` 以外の「Novi 対応」を名乗る MCP サーバは、私たちが配布したものではありません。

MCP サーバはエディタの中で動き、モデルへの入力を作ります。
そこに任意のコードを差し込めるということは、**開発環境そのものを差し込めるということ**です。
公開レジストリには、開発ツールを装って認証情報を集める事例が実際にあります。

このサーバは、その risk を注意ではなく構造で潰しています。

| 方針 | 実装 |
|---|---|
| 資格情報を扱わない | 環境変数を読まない |
| データを取りに行かない | ネットワークに出ない。ファイルも読まない |
| データは同梱のみ | `component-index.json` をビルド時に JS へ埋め込み、それだけを返す |
| 実行時依存は2つだけ | `@modelcontextprotocol/sdk` と `zod` |

いずれも `pnpm --filter @novi-ui/mcp check:security` が CI で機械的に検査しています。
検査はソースと配布物の両方を走査します。

情報が更新されるのはパッケージを更新したときだけです。
返す内容には常にバージョンが入るので、古い情報を掴んでいれば判別できます。

## データの出どころ

すべて実装から生成しています。手書きの API 情報はこのパッケージに含まれません。

```
packages/core/src/contracts/*.contract.ts   slot 契約 / props / JSDoc
packages/raster/scripts/design-rules.data.mjs   禁止クラス（CI の検査と同一の定義）
packages/raster/src/tokens/raster-tokens.ts     数値トークン
        ↓  scripts/generate-component-index.mjs
data/component-index.json
```

CI が検査している規則と、AI に説明する規則が同じ定義から出ています。
ここがズレると、AI は CI で落ちるコードを自信を持って書きます。

## ライセンス

MIT
