# Novi UI Docs — Requirements

| 項目 | 値 |
|------|-----|
| Status | **Approved**（2026-09-09: 実装 40/56 進行中のため Draft から実態に合わせて更新） |
| Author | yuuto |
| Reviewer | yuuto |
| Last Updated | 2026-08-19 |
| Architecture | [../../architecture.md](../../architecture.md) |
| Depends on | [../01-core/](../01-core/), [../02-theme-raster/](../02-theme-raster/) |

> 本書中の MUST / MUST NOT / SHOULD / SHOULD NOT / MAY は RFC 2119 に従う。

---

## TL;DR
- **What**: 全テーマを1つのサイトで扱い、**切替ボタン1つで同じデモが別人になる**ドキュメントサイト。
- **Why**: 「1つの core に複数の美学」という構想は、見せなければ何も証明できないため。
- **Success**: 同一のデモコードのまま、テーマ切替で全コンポーネントの見た目が変わる。**デモ側のコードは1行も変わらない**。

---

## Background

### 現状の課題
Novi UI の価値は「複数の美学が同じ API で成立している」ことにある。
これはコンポーネント単体を見ても伝わらない。**切り替えて初めて伝わる**。

ライブラリごとに別サイトを作ると、この対比が消える。保守も本数分になる。

### なぜ今やるのか
docs サイトは「作った後に用意するもの」ではなく、**実装中の検証環境そのもの**になる。
テーマ切替で破綻する箇所は、slot 契約の設計ミスが表面化した場所である。早い段階で必要。

### 位置づけ
本サイトは最終的に、ユーザー本人が運用する「複数の UI ライブラリを紹介するサイト」に掲載される。
つまり**ポートフォリオの一部**であり、ドキュメントとしての正確さと、作品としての見栄えの両方を満たす必要がある。

---

## Goals
- **G1**: テーマ切替 UI により、同一デモの見た目が全コンポーネントで切り替わる
- **G2**: 表示中のテーマに応じて、コード例の import 文とパッケージ名が自動で切り替わる
- **G3**: 全コンポーネントのライブデモとコピー可能なコード例を提供する
- **G4**: props / slot の一覧を**手書きせず、ソースから自動生成**する
- **G5**: Lighthouse で LCP ≤ 2.5s / INP ≤ 200ms / CLS ≤ 0.1 を達成する

## Non-Goals
- **NG1**: テーマごとの独立サイト（単一サイト方針。architecture.md の決定事項）
- **NG2**: ブログ / チュートリアル記事（コンポーネントリファレンスに限定）
- **NG3**: 有料テンプレート / ブロックの販売機能
- **NG4**: 多言語化（v1 は日本語 + 英語のうち**日本語のみ**。英語は別 Spec）
- **NG5**: ビジュアルビルダー（shadcn の Visual Builder 相当）

---

## User Stories

### US-01: テーマを切り替えて見比べたい
**As a** サイト訪問者, **I want** ボタン1つで全テーマを行き来したい, **so that** 「同じ API で美学が違う」ことを体感できる。

**Acceptance Criteria**:
- **AC-01-1**: **Given** 任意のコンポーネントページ, **When** テーマ切替 UI で別テーマを選ぶ, **Then** ページ内の全デモの見た目が切り替わる。
- **AC-01-2**: **Given** テーマを切り替えた状態, **When** 別のコンポーネントページへ移動する, **Then** 選択したテーマが維持される。
- **AC-01-3**: **Given** テーマを切り替えた状態, **When** ページをリロードする, **Then** 選択したテーマが維持される（ちらつきなし）。
- **AC-01-4**: **Given** テーマ A のデモ, **When** テーマ B に切り替える, **Then** **デモの JSX コードは一切変化しない**（props もタグ名も同一）。

### US-02: コード例をそのままコピーして使いたい
**As a** 開発者, **I want** 表示されているコードをコピーすれば動く状態にしたい, **so that** 書き換えの手間と間違いがない。

**Acceptance Criteria**:
- **AC-02-1**: **Given** テーマ `raster` を選択中, **When** コード例を見る, **Then** import 文が `from '@novi-ui/raster'` になっている。
- **AC-02-2**: **Given** 別テーマに切り替えた, **When** 同じコード例を見る, **Then** import 文のパッケージ名だけが切り替わり、**それ以外は同一**である。
- **AC-02-3**: **Given** 任意のコード例, **When** コピーボタンを押す, **Then** クリップボードに import 文を含む完全なコードが入る。

### US-03: props と slot を正確に知りたい
**As a** 開発者, **I want** 実装と一致した props / slot の一覧を見たい, **so that** ドキュメントの嘘に振り回されない。

**Acceptance Criteria**:
- **AC-03-1**: **Given** 任意のコンポーネントページ, **When** props 表を見る, **Then** 型・既定値・説明が表示される。
- **AC-03-2**: **Given** ソースの props 定義を変更した, **When** ビルドする, **Then** props 表に自動反映される（手書き更新が不要）。
- **AC-03-3**: **Given** 任意のコンポーネントページ, **When** slot 一覧を見る, **Then** core の契約と一致した slot 名と必須/任意の別が表示される。

### US-04: ライト / ダークを切り替えたい
**As a** サイト訪問者, **I want** カラースキームを切り替えたい, **so that** 両方の見え方を確認できる。

**Acceptance Criteria**:
- **AC-04-1**: **Given** 任意のページ, **When** スキーム切替を操作する, **Then** サイト全体とデモの両方が切り替わる。
- **AC-04-2**: **Given** 初回訪問, **When** OS がダーク設定である, **Then** ダークで表示される。
- **AC-04-3**: **Given** リロード, **When** ページを開く, **Then** 選択が維持されちらつきが発生しない。

### US-05: サイト自体が作品として成立している
**As a** ポートフォリオの閲覧者, **I want** サイト自体の質から作者の力量を判断したい, **so that** 「デザイナー気質の AI エンジニア」であることが伝わる。

**Acceptance Criteria**:
- **AC-05-1**: **Given** 本番デプロイ, **When** Lighthouse を実行する, **Then** LCP ≤ 2.5s / INP ≤ 200ms / CLS ≤ 0.1 を満たす。
- **AC-05-2**: **Given** 本番デプロイ, **When** axe を実行する, **Then** violations が **0** である。
- **AC-05-3**: **Given** トップページ, **When** 初見の訪問者が見る, **Then** 「複数の美学を切り替えられる」ことが**スクロールなしで**分かる。

### US-06: AI エージェントが正しい情報を取得できる
**As a** AI コーディングエージェント, **I want** 最新の API 情報を機械可読な形で取得したい, **so that** 古い知識で誤ったコードを生成しない。

**Acceptance Criteria**:
- **AC-06-1**: **Given** 本番サイト, **When** `/llms.txt` を取得する, **Then** コンポーネント一覧と各ページへのリンクを含む要約が返る。
- **AC-06-2**: **Given** 本番サイト, **When** `/llms-full.txt` を取得する, **Then** 全コンポーネントの props / slot / 使用例を含む全文が返る。
- **AC-06-3**: **Given** ソースを変更した, **When** ビルドする, **Then** `llms.txt` / `llms-full.txt` が自動再生成される。

---

## Functional Requirements (EARS)

| ID | パターン | 要件 |
|----|---------|------|
| FR-01 | Ubiquitous | The site SHALL render every demo through a theme registry so the active theme resolves the component implementation. |
| FR-02 | Event-driven | When the user selects a theme, the site SHALL re-render all demos with that theme's components and tokens. |
| FR-03 | State-driven | While a theme is selected, the site SHALL persist the selection across navigation and reloads. |
| FR-04 | Ubiquitous | The site SHALL render code examples with the active theme's package name substituted into the import statement, leaving all other lines unchanged. |
| FR-05 | Ubiquitous | The site SHALL generate props tables from the TypeScript source, not from hand-written markdown. |
| FR-06 | Ubiquitous | The site SHALL generate the slot table from the core contract definitions. |
| FR-07 | Ubiquitous | The site SHALL scope each theme's CSS custom properties so that multiple themes can coexist on one page without bleeding. |
| FR-08 | Event-driven | When the build runs, the site SHALL regenerate `/llms.txt` and `/llms-full.txt` from the same source used for the props and slot tables. |
| FR-09 | State-driven | While no explicit color-scheme choice exists, the site SHALL follow the OS preference. |
| FR-10 | Unwanted | If a demo references a component that the active theme does not implement, then the build SHALL fail. |
| FR-11 | Ubiquitous | The site SHALL build as a fully static export (`output: 'export'`) using the Next.js App Router, with Server Components rendered at build time wherever interactivity is not required. |
| FR-12 | Ubiquitous | The site SHALL deploy to Cloudflare Pages and SHALL NOT depend on any host-specific runtime feature. |
| FR-13 | Ubiquitous | The site SHALL use an analytics solution that requires no cookie-consent banner. |

---

## Non-Functional Requirements

| カテゴリ | 要件 | 測定方法 |
|---------|------|---------|
| Performance | LCP ≤ 2.5s / INP ≤ 200ms / CLS ≤ 0.1 | Lighthouse CI / Cloudflare Web Analytics |
| Accessibility | axe violations **0** / WCAG 2.2 AA | axe + Playwright |
| ちらつき | テーマ・スキームの初期表示で FOUC が発生しない | 目視 + 視覚回帰 |
| ビルド時間 | < 120s | Cloudflare Pages ビルドログ |
| 費用 | **0円** | Cloudflare Pages 無料枠（帯域無制限 / 500ビルド per 月）に収まること。**独自ドメインは使わず `*.pages.dev` で運用する**（決定 2026-08-19） |
| 対応環境 | Chrome / Safari / Edge / Firefox 最新2、iOS 17+ / Android 13+ | Playwright + 実機 |
| SEO | 全コンポーネントページが静的生成され、metadata を持つ | ビルド出力の確認 |

---

## Constraints
- テーマパッケージは **スコープ付き CSS ビルド**を出力する必要がある（FR-07）。
  複数テーマが同一ページに同居するため、`:root` にトークンを撒くビルドだけでは衝突する
- デモは**テーマ非依存**で書く（FR-01）。特定テーマのコンポーネントを直接 import してはならない（MUST NOT）
- 日本語のみ（NG4）

---

## Open Questions
なし（着手可能）。

> 検討して解決済みの論点:
> - ~~テーマごとに iframe で隔離するか~~ → しない。`[data-novi-theme]` によるスコープ付き CSS で十分（FR-07）。iframe は LCP と INP を悪化させる
> - ~~デモを MDX に直接書くか、コンポーネント化するか~~ → コンポーネント化。テーマ非依存に書く必要があるため
> - ~~props 表を手書きするか~~ → しない。実装とズレたドキュメントは AI の生成精度を直接落とす（G4 / FR-05）

---

## Glossary

| 用語 | 意味 |
|------|------|
| テーマレジストリ | テーマ名 → コンポーネント実装群 の対応表。デモはここ経由で解決する |
| スコープ付き CSS | `[data-novi-theme='<name>']` 配下にのみトークンを適用する CSS ビルド |
| FOUC | Flash of Unstyled Content。初期表示時のちらつき |
