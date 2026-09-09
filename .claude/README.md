# Novi UI — 設計書リポジトリ

**このディレクトリはコードを持ちません。** Novi UI の設計書だけを置く場所です。
実装は別ディレクトリで行い、本設計書を参照します。

---

## Novi UI とは

React Aria Components を土台にした、**複数の美学（テーマ）を持つ React UI ライブラリ群**。

```
@novi-ui/core     挙動・a11y・型契約・トークン規約（スタイルを1行も持たない）
@novi-ui/raster   美学1: ミニマル / スイス系
@novi-ui/<次>     美学2, 3, ...（coreを共有し、スタイル層だけを書く）
@novi-ui/mcp      AIエージェント向け MCP サーバ
```

### 3つの目的
1. 自分の開発で使う UI を広く揃える（実務資産）
2. AI 開発が急増する時代に需要のある UI ライブラリを作る
3. 「デザイナー気質の AI エンジニア」であることの証明物にする

### コンセプト
> **1つの core に、複数の美学。AI に書かせても崩れない。**

同じ 20 コンポーネントが、テーマを切り替えるだけで全く違う顔になる。
それをドキュメントサイト 1 本で見せ切ることが、このプロジェクトの成果物です。

---

## 読む順番

| # | ファイル | 内容 | 誰が読むか |
|---|---|---|---|
| 1 | [steering](./steering/project.md) | 全ライブラリ共通の不変ルール。技術スタック・コード規約・コマンド・Git・境界 | 実装前に全員が必ず |
| 2 | [architecture.md](./architecture.md) | **最重要**。core × theme 分離設計、slot 契約、抽象化の段階設計、API 命名規約 | 実装前に全員が必ず |
| 3 | [specs/01-core/](./specs/01-core/) | `@novi-ui/core` の要件・設計・タスク | core を触る人 |
| 4 | [specs/02-theme-raster/](./specs/02-theme-raster/) | `@novi-ui/raster`（1本目・20コンポーネント）の要件・設計・タスク | テーマを作る人 |
| 5 | [specs/03-docs-site/](./specs/03-docs-site/) | ドキュメントサイト（単一サイト + テーマ切替） | docs を触る人 |
| 6 | [specs/04-ai-integration/](./specs/04-ai-integration/) | `llms.txt` / MCP サーバ / Claude Code スキル | AI 連携を触る人 |
| 7 | [specs/05-theme-tactile/](./specs/05-theme-tactile/) | `@novi-ui/tactile`(2本目・タッチファースト)の要件・設計・タスク | テーマを作る人 |
| 8 | [specs/06-tones-and-colors/](./specs/06-tones-and-colors/) | トーンとカラーセット(`data-novi-color`・Print Inks / Textile Dyes) | 色を触る人 |
| 9 | [specs/07-theme-flatlay/](./specs/07-theme-flatlay/) | `@novi-ui/flatlay`(3本目・z 軸なし)の要件・設計・タスク | テーマを作る人 |
| 10 | [specs/08-design-voice/](./specs/08-design-voice/) | 余白・書体をテーマ所有に | テーマを触る人 |
| 11 | [specs/09-business-components/](./specs/09-business-components/) | 業務部品5つ（NumberField / ComboBox / Pagination / Table / DatePicker） | 部品を足す人 |

**2 が固まらないうちに 3 以降を実装してはいけません。** slot 契約が変わると全テーマが書き直しになります。

---

## 各 Spec の Status

| Spec | Status | 最終更新 |
|---|---|---|
| 01-core | Draft | 2026-08-19 |
| 02-theme-raster | Draft | 2026-08-19 |
| 03-docs-site | Draft | 2026-08-19 |
| 04-ai-integration | Draft | 2026-08-19 |
| 05-theme-tactile | Draft(実装済み・T-48/T-49 完了) | 2026-08-23 |
| 06-tones-and-colors | Approved(Phase A 実装済み) | 2026-08-22 |
| 07-theme-flatlay | Approved(実装着手) | 2026-08-26 |

Status は `Draft → In Review → Approved → Implemented` で運用します。
**Open Questions が1つでも残っている Spec は、次フェーズに進めません。**

---

## コスト前提（2026-08-19 時点で確認済み）

**運用費 0円で完結する。** 独自ドメインだけが唯一の任意費用。

| 項目 | 費用 | 根拠 |
|---|---|---|
| 全ライブラリ（React Aria / Tailwind / Vitest / Playwright / Biome ほか） | 0円 | すべて OSS |
| **視覚回帰テスト** | 0円 | Playwright をセルフホストする。Chromatic 等の SaaS を使わない |
| **npm 公開 scoped パッケージ + org** | 0円 | 公開パッケージのみなら org も無料。`@novi-ui` 取得済み |
| ビルド来歴（SLSA Build L3 provenance） | 0円 | Trusted Publishing を使うと公開パッケージに自動で付く |
| **GitHub Actions** | 0円 | public リポジトリ + 標準ランナーは分数無制限 |
| **Cloudflare Pages** | 0円 | 帯域無制限。**商用利用が明示的に許可されている** |
| Cloudflare Web Analytics | 0円 | Cookie 不使用のため同意バナーも不要 |
| 独自ドメイン | **0円（使わない）** | `*.pages.dev` で運用すると決定（2026-08-19） |

**運用費は 0円で確定。** 例外なく無料枠内に収める。

### 判断の理由と落とし穴

- **なぜ Vercel ではないか**: Vercel Hobby は非商用の個人利用限定で、「そのプロジェクトの制作に関わった誰かの金銭的利益のための利用」を商用と定義している。本サイトはポートフォリオの一部であり受託の営業導線になりうるため、規約上グレーになる。Pro は $20/月。
  → Cloudflare Pages なら 0円かつ商用利用が明示的に許可されている（[03-docs-site ADR-D4](./specs/03-docs-site/design.md)）
- **GitHub Pages は使えない**: 商用利用が明確に禁止されており、この用途には不適
- **npm の落とし穴**: scoped パッケージは既定が private 扱いで publish に失敗する。
  `npm publish --access public`、または `package.json` に `"publishConfig": { "access": "public" }` が必要
- **AI 精度回帰テスト**（[04-ai-integration](./specs/04-ai-integration/tasks.md) T-26〜T-30）は LLM 呼び出しを伴うため、
  **CI で自動実行しないと決定（2026-08-19）**。リリース前に既存の AI 環境から手動実行することで 0円に収める
- **Windows + MS-IME の実機確認**（[01-core](./specs/01-core/tasks.md) T-18）は macOS だけでは完結しない。
  自動テストは GitHub Actions の Windows ランナー（public リポジトリなら無料）で回し、
  人が実際に変換確定 Enter を押す最終確認のみ Windows 評価版 VM（90日・無料）で行う
- **iOS / Android の確認**は Xcode Simulator と Android Studio エミュレータ（いずれも無料）でカバーする

---

## この構想に至った経緯（要約）

出発点は「HeroUI のようなライブラリを作りたい」でしたが、2026年8月時点の調査で
**「React Aria + Tailwind + variants でキレイなコンポーネント群」というポジションは HeroUI v3（2026年3月）が完全に埋めている**
ことが分かりました。

| ライブラリ | 状況 |
|---|---|
| HeroUI v3 | 全面書き直し。Web 75+ / Native 37。Provider 撤廃、Framer Motion 削除、パッケージ2つだけ |
| Base UI 1.0 | MUI チーム、35コンポーネント、render prop 方式 |
| shadcn/ui | 2026年7月から新規プロジェクトのデフォルトが Base UI に。registry + MCP で配布プロトコル化 |
| Radix | WorkOS 買収後、開発ペース鈍化 |

正面から同じものを作っても勝ち目はありません。
そこで構想を **「1本の HeroUI クローン」→「複数の美学を持つライブラリ群 + それを束ねる紹介サイト = ひとつのブランド」**
に再定義しました。ライブラリ単体ではなく、**ポートフォリオ全体が作品**になります。

詳細な意思決定の記録は [architecture.md](./architecture.md) の ADR セクションにあります。

---

## 実装ディレクトリへの引き継ぎ事項

- **npm scope は `@novi-ui` で確定**（2026-08-19 取得済み / owner: `kojimanpm__`）。
  `@novi` は既に他者が占有しているため昇格の余地はない。設計書中のパッケージ名の変更は不要
- **公開は Trusted Publishing（OIDC）で行う**。詳細は [steering](./steering/project.md) の「公開（publish）」を参照。
  ただし**各パッケージの初回バージョンだけは手動 publish が必要**（Trusted Publisher は公開後にしか設定できない）
- グローバル CLAUDE.md の「Webデザイン作成」セクション（`/design-init`・`ui-designer`・OKLCH テンプレート）は
  **本プロジェクトでは適用しない**
- 仕様書ルール（RFC 2119 / Given-When-Then / EARS / 数値 NFR / AC-FR 紐付け）は適用する
