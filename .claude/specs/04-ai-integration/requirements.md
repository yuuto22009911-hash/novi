# Novi UI AI Integration — Requirements

| 項目 | 値 |
|------|-----|
| Status | **Implemented** |
| Author | yuuto |
| Reviewer | yuuto |
| Last Updated | 2026-08-20 |
| Architecture | [../../architecture.md](../../architecture.md) |
| Depends on | [../01-core/](../01-core/), [../02-theme-raster/](../02-theme-raster/), [../03-docs-site/](../03-docs-site/) |

> 本書中の MUST / MUST NOT / SHOULD / SHOULD NOT / MAY は RFC 2119 に従う。

---

## TL;DR
- **What**: AI コーディングエージェントが Novi UI を**正しく**使えるようにするための出力物一式（`llms.txt` / MCP サーバ / エージェント向け指示ファイル）。
- **Why**: AI 開発が主流になった時代に「AI に書かせても崩れない」ことが本ライブラリの中心的な価値だから。
- **Success**: AI エージェントに「Novi で設定画面を作って」と指示したとき、**存在しない props を1つも使わずに**動くコードが出る。

---

## Background

### 現状の課題
AI にコンポーネントを書かせると、次の順で失敗する。

1. **古い知識で書く** — 学習データに Novi は存在しない。あるいは古いバージョンの情報しかない
2. **API を推測する** — `disabled` / `onClick` など、他ライブラリの慣習で埋めてしまう
3. **デザインを勝手に足す** — ライブラリの美学から外れたスタイルを書き加える

1 と 2 は情報提供で解け、3 は設計で解ける（美学をライブラリ側に焼き付ける = architecture.md §11）。
本 Spec は **1 と 2 を解く**。

### 対策の優先順位（重要）
効果と導入コストは同じではない。**上から順に効く**。

| 順位 | 手段 | 効く理由 | ユーザーの設定コスト |
|---|---|---|---|
| 1 | **型 + JSDoc** | エディタが自動で LLM に渡す。設定不要で全ユーザーに効く | **ゼロ** |
| 2 | **`llms.txt` / `llms-full.txt`** | URL を貼るだけ。多くのエージェントが自動取得する | ほぼゼロ |
| 3 | **エージェント指示ファイル**（`AGENTS.md` / スキル / ルール） | リポジトリに置けば自動で読まれる | ゼロ（リポジトリ利用時） |
| 4 | **MCP サーバ** | 最も情報量が多く、検索もできる | **設定が必要**（最も高い） |

> **MCP を最優先にしない**。設定を要求する時点で大半のユーザーには届かない。
> 型と JSDoc が最も費用対効果が高く、これは 01-core / 02-theme-raster の Spec で既に必須化している。

### セキュリティ上の注意
公開 MCP レジストリには、開発ツールを装って認証情報を窃取する悪意あるサーバが存在する。
本プロジェクトは **一次配布元（自リポジトリ / 自 npm パッケージ）からのみ** MCP サーバを提供し、
第三者による再配布を推奨しない。

---

## Goals
- **G1**: AI が存在しない props / variant を生成しない状態にする
- **G2**: 全 AI 向け出力を**ソースから自動生成**し、実装とズレない状態を保つ
- **G3**: 設定ゼロで効く経路（型 / JSDoc / `llms.txt`）を最優先で整える
- **G4**: MCP サーバから props・slot・使用例・デザイン規則を取得できるようにする
- **G5**: 生成コードが Raster のデザイン規則（数値定義）から外れないよう、規則を機械可読で提供する

## Non-Goals
- **NG1**: AI がコードを生成する機能そのもの（本プロジェクトは情報提供側）
- **NG2**: 第三者製 MCP サーバのサポート
- **NG3**: 独自の AI モデル / 推論機能
- **NG4**: v0 / Cursor / Claude Code など特定ツール専用の作り込み（標準形式で提供し、各ツールが読む）

---

## User Stories

### US-01: AI が存在しない props を使わない
**As a** AI を使う開発者, **I want** エージェントが実在する props だけを使ってほしい, **so that** 生成直後に型エラーの修正から始めなくて済む。

**Acceptance Criteria**:
- **AC-01-1**: **Given** `llms-full.txt` を文脈に与えたエージェント, **When** 「Novi で確認ダイアログを作って」と指示する, **Then** 生成コードが `tsc --noEmit` を通る。
- **AC-01-2**: **Given** 同上, **When** ボタンを無効化するコードを生成させる, **Then** `disabled` ではなく `isDisabled` が使われる。
- **AC-01-3**: **Given** 同上, **When** クリック処理を生成させる, **Then** `onClick` ではなく `onPress` が使われる。
- **AC-01-4**: **Given** 同上, **When** variant を指定させる, **Then** `solid` / `outline` / `soft` / `ghost` / `plain` 以外が使われない。

### US-02: 情報が実装とズレない
**As a** メンテナ, **I want** AI 向け出力が手書きでない状態にしたい, **so that** 更新漏れで AI に嘘を教えることがない。

**Acceptance Criteria**:
- **AC-02-1**: **Given** コンポーネントの props を1つ追加する, **When** ビルドする, **Then** `llms-full.txt` と MCP の応答の両方に自動で反映される。
- **AC-02-2**: **Given** AI 向け出力の生成物, **When** リポジトリを検査する, **Then** 手書きで維持されている API 情報が存在しない。
- **AC-02-3**: **Given** 生成が失敗する状況, **When** ビルドする, **Then** ビルドが失敗する（古い生成物を配信しない）。

### US-03: `llms.txt` で最小コストで文脈を渡したい
**As a** AI を使う開発者, **I want** URL を1つ渡すだけで済ませたい, **so that** MCP の設定をしなくても精度が上がる。

**Acceptance Criteria**:
- **AC-03-1**: **Given** 本番サイト, **When** `/llms.txt` を取得する, **Then** プロジェクト概要・重要な API 規約・コンポーネント一覧と各詳細ページへのリンクが含まれる。
- **AC-03-2**: **Given** 本番サイト, **When** `/llms-full.txt` を取得する, **Then** 全コンポーネントの props / slot / variant / 使用例が1ファイルに含まれる。
- **AC-03-3**: **Given** `/llms.txt`, **When** 内容を読む, **Then** 冒頭に「Provider は不要」「`isDisabled` / `onPress` を使う」「`data-slot` を出力する」の3点が明示されている。

### US-04: MCP から詳細情報を引きたい
**As a** AI コーディングエージェント, **I want** コンポーネント単位で正確な情報を取得したい, **so that** 文脈を無駄に消費せず必要な情報だけを得られる。

**Acceptance Criteria**:
- **AC-04-1**: **Given** MCP サーバに接続, **When** `list_components` を呼ぶ, **Then** 全コンポーネント名と1行説明、実装しているテーマ名が返る。
- **AC-04-2**: **Given** 同上, **When** `get_component` にコンポーネント名とテーマ名を渡す, **Then** props / slot / variant / 使用例 / a11y 注記が返る。
- **AC-04-3**: **Given** 同上, **When** `get_design_rules` にテーマ名を渡す, **Then** そのテーマの数値デザイン規則と禁止事項が返る。
- **AC-04-4**: **Given** 同上, **When** `search_components` に「日付を選ばせたい」のような自然文を渡す, **Then** 該当候補が返る。実装がない場合は**推測せず「未実装」と返す**。

### US-05: リポジトリ内でエージェントが自動的に規約を守る
**As a** 本リポジトリで作業する AI エージェント, **I want** リポジトリ固有の規約を自動で知りたい, **so that** 禁止クラスや slot 契約を破らない。

**Acceptance Criteria**:
- **AC-05-1**: **Given** リポジトリのルート, **When** エージェントが作業を開始する, **Then** `AGENTS.md` から slot 契約・禁止クラス・API 命名規約を読み取れる。
- **AC-05-2**: **Given** 新規コンポーネントを追加させる, **When** エージェントが実装する, **Then** 3ファイル構成・`data-slot` 出力・`tv()` の named export が守られる。

### US-06: 生成コードがデザイン規則から外れない
**As a** ライブラリ利用者, **I want** AI が生成した画面がライブラリの美学から外れないでほしい, **so that** 全体の一貫性が崩れない。

**Acceptance Criteria**:
- **AC-06-1**: **Given** `get_design_rules` または `llms-full.txt` を与えたエージェント, **When** カスタムスタイルを含む画面を生成させる, **Then** 禁止クラス（`shadow-*` / `rounded-md` 以上 / `border-2` 以上 / `scale-*` / `rotate-*`）が使われない。
- **AC-06-2**: **Given** 同上, **When** 色を指定させる, **Then** リテラルの色値ではなく `--novi-color-*` が使われる。

---

## Functional Requirements (EARS)

| ID | パターン | 要件 |
|----|---------|------|
| FR-01 | Ubiquitous | The system SHALL generate all AI-facing artifacts from the same source used for the docs props/slot tables. |
| FR-02 | Ubiquitous | The system SHALL publish `/llms.txt` containing an overview, the critical API conventions, and links to per-component pages. |
| FR-03 | Ubiquitous | The system SHALL publish `/llms-full.txt` containing props, slots, variants, and one usage example for every component. |
| FR-04 | Ubiquitous | `/llms.txt` SHALL state, within its first section, that no provider is required, that `isDisabled`/`onPress` are used, and that every component emits `data-slot`. |
| FR-05 | Ubiquitous | The MCP server SHALL expose the tools `list_components`, `get_component`, `get_design_rules`, and `search_components`. |
| FR-06 | Unwanted | If `search_components` finds no implemented match, then the server SHALL report that it is unimplemented rather than suggesting an approximation. |
| FR-07 | Ubiquitous | The repository SHALL contain an `AGENTS.md` at its root describing the slot contract, prohibited classes, API naming rules, and the 3-file component pattern. |
| FR-08 | Event-driven | When the build runs, the system SHALL regenerate every AI-facing artifact. |
| FR-09 | Unwanted | If artifact generation fails, then the build SHALL fail rather than shipping stale artifacts. |
| FR-10 | Ubiquitous | The MCP server SHALL be distributed only from the project's own npm package and repository. |
| FR-11 | Ubiquitous | The MCP server SHALL NOT read, transmit, or require any credential, environment variable, or file outside its own data set. |
| FR-12 | Ubiquitous | `get_design_rules` SHALL return the numeric design rules and the prohibited-class list for the requested theme. |

---

## Non-Functional Requirements

| カテゴリ | 要件 | 測定方法 |
|---------|------|---------|
| 鮮度 | 生成物と実装のズレが**常に0**（手書き情報を持たない） | 生成物の差分検査を CI に入れる |
| MCP 応答 | `get_component` が P95 < 200ms | ローカル計測 |
| サイズ | `llms.txt` < 20KB / `llms-full.txt` < 500KB | ビルド時に検査 |
| セキュリティ | 資格情報・環境変数への一切のアクセスがない | 依存とソースの監査 |
| 精度 | 20 コンポーネントの生成テストで型エラー **0** | 回帰テスト（後述） |
| 対応 | MCP 仕様に準拠し、標準クライアントから接続できる | 実接続確認 |

---

## Constraints
- 生成のソースは 03-docs-site の生成パイプラインと**共通**にする（二重管理をしない）
- MCP サーバは資格情報を一切扱わない（FR-11）
- 特定 AI ツール専用の作り込みをしない（NG4）

---

## Open Questions
なし（着手可能）。

> 検討して解決済みの論点:
> - ~~MCP を最優先で作るか~~ → しない。設定コストが最も高く、届く範囲が最も狭い。型 / JSDoc / `llms.txt` を先に整える
> - ~~AI 向けドキュメントを手書きで丁寧に書くか~~ → 書かない。手書きは必ず腐り、腐った情報は AI に嘘を教える（無いより悪い）
> - ~~未実装コンポーネントを近い候補で代替提案するか~~ → しない。「未実装」と明示する（FR-06）。曖昧な提案は幻覚の原因になる

---

## Glossary

| 用語 | 意味 |
|------|------|
| `llms.txt` | サイトを LLM 向けに要約した標準的なテキストファイル |
| `llms-full.txt` | 同、全文版 |
| MCP | Model Context Protocol。エージェントが外部ツールに接続する標準 |
| `AGENTS.md` | リポジトリで作業するエージェント向けの指示ファイル |
| 生成物 | ソースから自動生成される AI 向け出力の総称 |
