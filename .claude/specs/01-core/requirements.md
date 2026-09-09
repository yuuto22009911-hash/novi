# @novi-ui/core — Requirements

| 項目 | 値 |
|------|-----|
| Status | **Approved**（2026-09-09: 実装 37/55 進行中のため Draft から実態に合わせて更新） |
| Author | yuuto |
| Reviewer | yuuto |
| Last Updated | 2026-08-19 |
| Architecture | [../../architecture.md](../../architecture.md) |
| Steering | [steering](../../steering/project.md) |

> 本書中の MUST / MUST NOT / SHOULD / SHOULD NOT / MAY は RFC 2119 に従う。

---

## TL;DR
- **What**: 全テーマが共有する「型契約・slot 語彙・挙動フック・トークン規約」だけを持ち、スタイルを1行も持たないパッケージ。
- **Why**: テーマごとに a11y と API を書き直すと、複数の美学を1人で維持できないため。
- **Success**: 2本目のテーマが **core を1行も変更せずに** 20 コンポーネントを実装できる。

---

## Background

### 現状の課題
Novi UI は「1つの core に複数の美学」という構造を取る。ここには本質的な緊張がある。

- テーマごとに**本物の美学差**（DOM 構造の差）を出したい
- しかしドキュメントサイトは**1本**で、テーマ切替だけで見せたい（= 公開 API は完全に同一）
- しかも a11y 修正は core 1箇所で直したい

この3つを同時に満たす層が core である。詳細な設計判断は [architecture.md](../../architecture.md) を参照。

### なぜ今やるのか
core の slot 語彙が固まらないと、テーマ実装が全部書き直しになる。
1本目のテーマ（`@novi-ui/raster`）に着手する前に確定させる必要がある。

### 関連システムとの関係
- 上流: `react-aria-components` 1.20+（peerDependency）
- 下流: 全テーマパッケージ、`@novi-ui/mcp`、`apps/docs`

---

## Goals
- **G1**: MVP 20 コンポーネント分の slot 語彙を確定し、型として提供する
- **G2**: 構造が根本的に違う2テーマが、同一の公開 API で実装可能であることを型レベルで保証する
- **G3**: 契約テストスイートを提供し、テーマの契約遵守を自動検査できるようにする
- **G4**: 日本語入力（IME）中の Enter による誤確定を、全テーマで一律に防ぐ
- **G5**: core のランタイムバンドルを gzip **2KB 未満**に収める

## Non-Goals
- **NG1**: React Aria Components の再エクスポート（上流の改善が届かなくなるため）
- **NG2**: 実行時のコンポーネントファクトリ（v0.1 では作らない。architecture.md §7）
- **NG3**: スタイル・CSS の提供（`base.css` のリセットと `@layer` 宣言を除く）
- **NG4**: グローバル Provider の提供（ADR-04）
- **NG5**: MVP 20 以外のコンポーネントの slot 契約（DataTable / DatePicker / ComboBox 等は別 Spec）

---

## User Stories

### US-01: slot 契約に型で従いたい
**As a** テーマ作者, **I want** slot のスタイル定義を書くときに型で誘導されたい, **so that** 必須 slot の書き忘れや slot 名の打ち間違いをビルド前に検出できる。

**Acceptance Criteria**:
- **AC-01-1**: **Given** `SlotMap<typeof modalSlots, 'backdrop'|'panel'|'body'>` で型付けした変数, **When** `panel` キーを省略する, **Then** TypeScript がコンパイルエラーを出す。
- **AC-01-2**: **Given** 同じ型注釈, **When** `header` キー（任意 slot）を省略する, **Then** コンパイルが通る。
- **AC-01-3**: **Given** 同じ型注釈, **When** 語彙に存在しない `wrapper` キーを追加する, **Then** TypeScript がコンパイルエラーを出す。

### US-02: 契約の遵守を自動で検査したい
**As a** テーマ作者, **I want** 自分のコンポーネントが必須 slot を出力しているかを自動テストしたい, **so that** テーマが増えても契約破りが混入しない。

**Acceptance Criteria**:
- **AC-02-1**: **Given** core が提供する契約テストスイート, **When** 必須 slot をすべて `data-slot` で出力するコンポーネントを流す, **Then** テストが成功する。
- **AC-02-2**: **Given** 同スイート, **When** 必須 slot `panel` を出力しないコンポーネントを流す, **Then** どの slot が欠けているかを明示してテストが失敗する。
- **AC-02-3**: **Given** 同スイート, **When** 語彙外の `data-slot="wrapper"` を出力するコンポーネントを流す, **Then** 語彙外 slot として検出しテストが失敗する。

### US-03: 日本語入力中に誤送信されたくない
**As a** エンドユーザー, **I want** 日本語変換の確定 Enter でフォームが送信されたり候補が選択されたりしないでほしい, **so that** 入力途中で意図しない操作が起きない。

**Acceptance Criteria**:
- **AC-03-1**: **Given** IME 変換中（`isComposing === true`）の入力欄, **When** Enter キーを押す, **Then** `onKeyDown` に渡したハンドラが**呼ばれない**。
- **AC-03-2**: **Given** IME 変換が確定した直後, **When** もう一度 Enter キーを押す, **Then** ハンドラが**呼ばれる**。
- **AC-03-3**: **Given** IME を使わない直接入力, **When** Enter キーを押す, **Then** ハンドラが即座に呼ばれる。
- **AC-03-4**: **Given** `compositionend` の直後に `keydown` が発火する環境（Safari 系の既知の挙動差）, **When** 変換確定の Enter を押す, **Then** ハンドラが呼ばれない。

### US-04: 上流の不安定 API に振り回されたくない
**As a** テーマ作者, **I want** `UNSTABLE_` 接頭辞の API を直接触らずに済ませたい, **so that** 上流の破壊的変更で全テーマが壊れない。

**Acceptance Criteria**:
- **AC-04-1**: **Given** core が再公開する Toast API, **When** テーマから import する, **Then** `UNSTABLE_` を含まない安定した名前で利用できる。
- **AC-04-2**: **Given** テーマパッケージのソース, **When** `UNSTABLE_` を含む識別子を直接 import する, **Then** CI が失敗する。

### US-05: Provider なしで使いたい
**As a** エンドユーザー（および AI コーディングエージェント）, **I want** import してすぐ使いたい, **so that** Provider の設置ミスで壊れない。

**Acceptance Criteria**:
- **AC-05-1**: **Given** Provider を一切設置していない React Server Components のページ, **When** テーマのコンポーネントを描画する, **Then** 正しくスタイルが当たり、エラーなく動作する。
- **AC-05-2**: **Given** core の公開 API, **When** 全 export を走査する, **Then** 利用が必須の Provider コンポーネントが存在しない。

### US-06: ダークモードを属性1つで切り替えたい
**As a** エンドユーザー, **I want** JS なしでカラースキームを切り替えたい, **so that** SSR でちらつかず、実装も単純になる。

**Acceptance Criteria**:
- **AC-06-1**: **Given** `base.css` を読み込んだページ, **When** ルート要素に `data-novi-scheme="dark"` を付ける, **Then** 全トークンがダーク値に切り替わる。
- **AC-06-2**: **Given** `data-novi-scheme` 未指定かつ OS がダーク設定, **When** ページを開く, **Then** ダーク値が適用される。
- **AC-06-3**: **Given** OS がダーク設定, **When** ルート要素に `data-novi-scheme="light"` を付ける, **Then** ライト値が適用される（OS 設定より明示指定が優先）。

### US-07: variant 語彙の実装漏れを型で検知したい
**As a** テーマ作者, **I want** core が定めた variant 語彙をすべて実装したことを型で保証したい, **so that** テーマ切替時に一部の variant だけ効かない事故を防げる。

**Acceptance Criteria**:
- **AC-07-1**: **Given** core の `NoviVariant` 型で variants を型付けした `tv()` 定義, **When** `soft` の実装を省略する, **Then** TypeScript がコンパイルエラーを出す。
- **AC-07-2**: **Given** 同じ型付け, **When** 語彙にない `elevated` を追加する, **Then** TypeScript がコンパイルエラーを出す。

---

## Functional Requirements (EARS)

| ID | パターン | 要件 |
|----|---------|------|
| FR-01 | Ubiquitous | The system SHALL export slot 語彙（slot 名配列・必須 slot 配列・slot 型）for all 20 MVP components. |
| FR-02 | Ubiquitous | The system SHALL export `SlotMap<S, R>` 型ヘルパ which makes required slots mandatory and all other slots optional. |
| FR-03 | Ubiquitous | The system SHALL export `ClassNames<S>` 型ヘルパ which maps slot names to optional class strings. |
| FR-04 | Ubiquitous | The system SHALL export the fixed vocabularies `NOVI_VARIANTS` / `NOVI_SIZES` / `NOVI_COLORS` / `NOVI_RADII` and their derived union types. |
| FR-05 | Ubiquitous | The system SHALL export a contract test suite that verifies a component emits all required `data-slot` values and emits no slot outside the vocabulary. |
| FR-06 | Event-driven | When a `keydown` event occurs while IME composition is active, the system SHALL NOT invoke the consumer-supplied key handler. |
| FR-07 | Event-driven | When `compositionend` fires, the system SHALL suppress the key handler for any `keydown` occurring in the same event loop turn. |
| FR-08 | Ubiquitous | The system SHALL re-export upstream `UNSTABLE_*` APIs under stable Novi names, importing them from `src/unstable/` only. |
| FR-09 | Unwanted | If a theme package imports an identifier containing `UNSTABLE_` directly, then CI SHALL fail. |
| FR-10 | Unwanted | If a file under `packages/core/src/` other than `base.css` contains CSS, then CI SHALL fail. |
| FR-11 | Ubiquitous | The system SHALL provide `base.css` containing only reset rules, the `@layer novi.reset, novi.base, novi.component, novi.override` declaration, and the light/dark token definitions. |
| FR-12 | State-driven | While the root element has `data-novi-scheme="dark"`, the system SHALL apply dark token values. |
| FR-13 | State-driven | While the root element has no `data-novi-scheme` and the OS prefers dark, the system SHALL apply dark token values. |
| FR-14 | Ubiquitous | The system SHALL NOT export any component that is required to be mounted as a provider. |
| FR-15 | Ubiquitous | The system SHALL define every CSS custom property under the `--novi-<category>-<name>` namespace, using semantic color names only. |
| FR-16 | Optional | Where a consumer opts in, the system MAY expose the raw contract objects so that third parties can build their own themes. |

---

## Non-Functional Requirements

| カテゴリ | 要件 | 測定方法 |
|---------|------|---------|
| バンドル | **消費者が実際に取り込む量**で gzip **< 2KB** | size-limit。下記の測定方法に従う |
| Tree-shaking | `sideEffects: false`。未使用の contract が bundle に残らない | rollup-plugin-visualizer |
| 型 | `tsc --noEmit` エラー **0**（strict + `noUncheckedIndexedAccess`） | `pnpm typecheck` |
| カバレッジ | **90%** 以上 | Vitest coverage |
| Accessibility | core 自体は DOM を持たないため axe 対象外。IME フックの挙動テストで代替 | Vitest |
| SSR | React Server Components 環境でエラーなく import できる | docs サイトの RSC ページで検証 |
| 対応環境 | Node.js >= 22 / React 19 / Chrome・Safari・Edge・Firefox 最新2 | Playwright |
| ビルド時間 | < 10s | `pnpm build --filter=@novi-ui/core` |

### バンドルサイズの測定方法（曖昧だと計測ミスを招くため明記する）

**`dist/index.mjs` のファイルサイズを見てはならない。** それは全 export を含む未 tree-shaking の値で、
実際に誰かが払うコストではない。**代表的な import パターンごとに bundle して測る。**

| パターン | 内容 | 上限 |
|---|---|---|
| A: 型のみ | `import type { ButtonProps } from '@novi-ui/core'` | **0 B**（1バイトでも出たら設計ミス） |
| B: 単一コンポーネント | 1つの `xxxSlots` / `xxxRequiredSlots` と語彙定数 | 300 B gzip |
| C: レジストリ全体 | `NOVI_CONTRACTS`。ツール側の使い方 | 2 KB gzip |

> 2026-08-19 実測: A = 0 B / B = 133 B / C = 800 B gzip。いずれも上限内。

---

## Constraints
- `react-aria-components` / `react` / `react-dom` は **peerDependencies**（多重ロード防止）
- ランタイム依存の追加は **Ask first**（steering の境界定義）
- slot 語彙の変更は全テーマに波及するため **Ask first**、かつ `1.0` 以降は **major** 扱い
- 個人開発のため、1コンポーネントの契約 = 1PR の粒度を保つ

---

## Open Questions
なし（着手可能）。

> 検討して解決済みの論点:
> - ~~core が RAC を再エクスポートすべきか~~ → しない（NG1 / architecture.md §2）
> - ~~テーマファクトリを v0.1 で作るか~~ → 作らない（NG2 / architecture.md §7）
> - ~~`isDisabled` と `disabled` のどちらを採るか~~ → `isDisabled`（ADR-05）
> - ~~variant 語彙をテーマごとに変えられるようにするか~~ → 変えられない。core で固定（ADR-06）

---

## Glossary

| 用語 | 意味 |
|------|------|
| slot | コンポーネントを構成する名前付きの部位 |
| slot 語彙 | core が定義する slot 名の集合。テーマはこの外の名前を使えない |
| 必須 slot | テーマが必ず描画しなければならない slot |
| 契約テスト | テーマが slot 契約を守っているかを検査する、core 提供の共通テストスイート |
| IME | Input Method Editor。日本語・中国語・韓国語等の変換入力 |
| RAC | react-aria-components |
