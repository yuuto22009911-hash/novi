# @novi-ui/raster — Requirements

| 項目 | 値 |
|------|-----|
| Status | **Approved**（2026-09-09: 実装 42/60 進行中のため Draft から実態に合わせて更新） |
| Author | yuuto |
| Reviewer | yuuto |
| Last Updated | 2026-08-19 |
| Architecture | [../../architecture.md](../../architecture.md) |
| Depends on | [../01-core/requirements.md](../01-core/requirements.md) |

> 本書中の MUST / MUST NOT / SHOULD / SHOULD NOT / MAY は RFC 2119 に従う。

---

## TL;DR
- **What**: Novi UI の1本目のテーマ。ミニマル / スイス系の美学で MVP 20 コンポーネントを実装する。
- **Why**: core の slot 契約が実際に成立するかを実装で検証し、2本目以降の「型」を確立するため。
- **Success**: 20 コンポーネントすべてが契約テストと axe を通り、**axe violations 0** を維持する。

---

## Background

### 現状の課題
`@novi-ui/core` は型と契約しか持たない。それが実際に機能するかは、テーマを1本作り切るまで分からない。
また「複数の美学」という構想は、1本目が完成していなければ何も証明できない。

### なぜ「ミニマル / スイス系」を1本目にするのか
- **ごまかしが効かない**。グラデーションや影で誤魔化せないため、余白・階層・整列の精度がそのまま出る。
  つまり1本目として作れば、設計者としての実力が最も明確に示せる
- **実務での使い回しが最も広い**。管理画面・ドキュメント・SaaS のどれにも載る
- **2本目との対比が作りやすい**。装飾を削り切った基準点があると、装飾的なテーマとの差が際立つ

### なぜ今やるのか
core の slot 語彙は、実装で検証されるまで机上の仮説にすぎない。
2本目のテーマに着手する前に、1本目で語彙の過不足を洗い出す必要がある。

---

## Goals
- **G1**: MVP 20 コンポーネントを実装し、全件が core の契約テストを通る
- **G2**: 全コンポーネント × light/dark で **axe violations 0** を達成する
- **G3**: `solid | outline | soft | ghost | plain` の全 variant を全該当コンポーネントで実装する
- **G4**: Raster デザイン言語を**数値で**定義し、実装がそれに従っていることを検査可能にする
- **G5**: 1コンポーネント = 1PR を維持し、20個揃う前でも常に公開可能な状態を保つ

## Non-Goals
- **NG1**: MVP 20 以外のコンポーネント（DataTable / DatePicker / ComboBox / Slider / TagGroup）
- **NG2**: React Native 対応
- **NG3**: 2本目のテーマ（本 Spec の完了後に別 Spec で起票）
- **NG4**: アニメーションライブラリを使った複雑なモーション（ADR-08）
- **NG5**: ページ単位のブロック / テンプレート（コンポーネント単位に限定）

---

## Raster デザイン言語（数値定義）

「ミニマル」を主観で運用すると必ずブレる。**すべて数値で固定する**（G4）。

| 項目 | 規則 | 根拠 |
|---|---|---|
| ベースグリッド | 垂直リズムは **4px** の倍数。ブロック間余白は **8px** の倍数 | Rastersystem の格子 |
| コンポーネント高さ | `sm` = 32px / `md` = 40px / `lg` = 48px | 8px グリッド上に乗る |
| タップターゲット | 対話要素の実効サイズは **最小 24×24px**、タッチ環境では **44×44px** を目標 | WCAG 2.2 AA (2.5.8) |
| タイポスケール | 比率 **1.2**（minor third）。12 / 14 / 16 / 20 / 24 / 30 / 36px | 単一比率で階層を作るのがスイス的 |
| 行送り | 本文 **1.6**、見出し **1.25** | |
| 書体 | sans-serif 1種のみ。数値は `font-variant-numeric: tabular-nums` | 書体を混ぜない |
| トラッキング | 見出しは `-0.01em`、全大文字は `+0.08em` | |
| 境界線 | **1px のみ**。2px 以上を使ってはならない（MUST NOT） | 面の分割は線の太さでなく余白で行う |
| 影 | **使用禁止**（MUST NOT）。階層は境界線と背景色の差で表現する | ミニマルの核 |
| 角丸 | 既定は `--novi-radius-none`。**最大でも `sm`(2px)** まで（MUST NOT exceed） | 角を立てる |
| 配置 | **左揃えを原則**とする。中央揃えは意味的に必要な箇所のみ（MAY） | 非対称グリッド |
| 彩度 | **中立色は chroma 0**（`bg` `subtle` `fg` `muted` `border` `border-strong` `overlay` `default`）。**意味を持つ色のみ有彩**（`primary` `secondary` `success` `warning` `danger`）で chroma 上限 0.19 | 装飾に色を使わない。色は意味の伝達にのみ使う |
| モーション | `--novi-duration-fast`(120ms) と `--novi-ease-standard` のみ | |
| モーション種別 | `opacity` と `translate` のみ。`scale` / `rotate` は使用禁止（MUST NOT） | 動きで飾らない |

> これらは design.md でトークンに落とし、**Lint 可能な形**（禁止 Tailwind クラスのリスト）にする。

---

## User Stories

### US-01: デザイン言語に従った一貫した見た目
**As a** エンドユーザー, **I want** どのコンポーネントを組み合わせても見た目が破綻しないでほしい, **so that** 自分で調整しなくても整った画面になる。

**Acceptance Criteria**:
- **AC-01-1**: **Given** 任意のコンポーネントのソース, **When** 禁止クラス検査を実行する, **Then** `shadow-*`（`shadow-none` 除く）/ `rounded-md` 以上 / `border-2` 以上 / `scale-*` / `rotate-*` が1件も使われていない。
- **AC-01-2**: **Given** 任意のコンポーネント, **When** 高さを測定する, **Then** `sm`/`md`/`lg` がそれぞれ 32/40/48px である。
- **AC-01-3**: **Given** 中立色のトークン, **When** chroma を検査する, **Then** すべて 0 である。
- **AC-01-4**: **Given** 意味を持つ色のトークン, **When** chroma を検査する, **Then** 0 より大きく 0.19 以下である。

> 当初は「`primary` 以外はすべて chroma 0」としていたが、それだと `success` と `danger` が
> 同じ灰色になり見分けがつかない。[ADR-06](../../architecture.md) が全テーマに意味的6色の実装を
> 義務づけている以上、意味を持つ色は有彩でなければならない。
> 「色は情報にのみ使う」の正しい適用は**装飾に色を使わないこと**であって、意味の伝達を捨てることではない。

### US-02: variant 語彙がすべて効く
**As a** エンドユーザー, **I want** ドキュメントに書かれた variant がすべて実際に効いてほしい, **so that** テーマを切り替えてもコードを書き換えずに済む。

**Acceptance Criteria**:
- **AC-02-1**: **Given** variant を持つ全コンポーネント, **When** `solid`/`outline`/`soft`/`ghost`/`plain` を順に指定する, **Then** それぞれ視覚的に異なるクラスが適用される。
- **AC-02-2**: **Given** 同上, **When** `soft` の実装を削除する, **Then** TypeScript がコンパイルエラーを出す。
- **AC-02-3**: **Given** color を持つ全コンポーネント, **When** `default`/`primary`/`secondary`/`success`/`warning`/`danger` を指定する, **Then** すべてが対応するトークンを参照する。

### US-03: slot 契約を守る
**As a** テーマ作者, **I want** 自分の実装が core の契約から外れていないことを自動で保証したい, **so that** ドキュメントとテストがテーマ横断で成立し続ける。

**Acceptance Criteria**:
- **AC-03-1**: **Given** 20 コンポーネントすべて, **When** `testSlotContract` を実行する, **Then** 全件が成功する。
- **AC-03-2**: **Given** 任意のコンポーネント, **When** DOM を走査する, **Then** 語彙外の `data-slot` が1つも存在しない。
- **AC-03-3**: **Given** `classNames={{ <slot>: 'x' }}` を渡す, **When** 描画する, **Then** その slot の要素にクラス `x` が付く。

### US-04: キーボードだけで操作できる
**As a** キーボード利用者 / スクリーンリーダー利用者, **I want** マウスなしで全機能を使いたい, **so that** 支援技術で問題なく操作できる。

**Acceptance Criteria**:
- **AC-04-1**: **Given** 全コンポーネント（light / dark 両方）, **When** axe を実行する, **Then** violations が **0** である。
- **AC-04-2**: **Given** Modal, **When** 開いた状態で Tab を押し続ける, **Then** フォーカスがモーダル内から出ない。
- **AC-04-3**: **Given** Modal / Popover / Menu / Select, **When** Escape を押す, **Then** 閉じてトリガーへフォーカスが戻る。
- **AC-04-4**: **Given** Menu / Select / Tabs / RadioGroup, **When** 矢印キーを押す, **Then** 項目間をフォーカスが移動する。
- **AC-04-5**: **Given** 任意の対話要素, **When** キーボードでフォーカスする, **Then** フォーカスリングが視認でき、コントラスト比 3:1 以上である。

### US-05: ダークモードで破綻しない
**As a** エンドユーザー, **I want** ダークモードでも読めて操作できてほしい, **so that** 環境に関係なく使える。

**Acceptance Criteria**:
- **AC-05-1**: **Given** `data-novi-scheme="dark"`, **When** 全コンポーネントを描画する, **Then** 本文テキストのコントラスト比が **4.5:1 以上**である。
- **AC-05-2**: **Given** 同上, **When** 境界線・アイコン等の非テキスト要素を検査する, **Then** コントラスト比が **3:1 以上**である。
- **AC-05-3**: **Given** 同上, **When** 視覚回帰スナップショットを撮る, **Then** light との差分が意図した箇所のみである。

### US-06: スタイルを拡張できる
**As a** エンドユーザー, **I want** ライブラリのスタイルを自分のブランドに寄せたい, **so that** npm 配布でも「所有できない」不満がない。

**Acceptance Criteria**:
- **AC-06-1**: **Given** `import { buttonStyles } from '@novi-ui/raster'`, **When** `tv({ extend: buttonStyles, base: '...' })` を書く, **Then** 型エラーなく拡張でき、元の variant がすべて維持される。
- **AC-06-2**: **Given** 全コンポーネント, **When** 公開エクスポートを走査する, **Then** すべての `tv()` 定義が named export されている。
- **AC-06-3**: **Given** ユーザーが `--novi-color-primary` を上書きする, **When** 描画する, **Then** primary を使う全コンポーネントに反映される。

### US-07: 日本語入力で誤動作しない
**As a** 日本語ユーザー, **I want** 変換確定の Enter で意図しない操作が起きないでほしい, **so that** 入力途中で送信や選択が暴発しない。

**Acceptance Criteria**:
- **AC-07-1**: **Given** Input / TextArea / Select / Menu, **When** IME 変換中に Enter を押す, **Then** 送信・選択・決定のいずれも発生しない。
- **AC-07-2**: **Given** 同上, **When** 変換確定後にもう一度 Enter を押す, **Then** 期待どおり動作する。

### US-08: モーション低減設定を尊重する
**As a** 前庭障害のあるユーザー, **I want** OS のモーション低減設定を尊重してほしい, **so that** 不快な動きが起きない。

**Acceptance Criteria**:
- **AC-08-1**: **Given** `prefers-reduced-motion: reduce`, **When** Modal / Popover / Tooltip / Toast を開閉する, **Then** トランジション時間が 0ms になる。
- **AC-08-2**: **Given** 同上, **When** Spinner / Skeleton を描画する, **Then** ループアニメーションが停止または大幅に減衰する。

---

## Functional Requirements (EARS)

| ID | パターン | 要件 |
|----|---------|------|
| FR-01 | Ubiquitous | The system SHALL implement all 20 MVP components listed in architecture.md §6. |
| FR-02 | Ubiquitous | The system SHALL emit `data-slot="<name>"` on every element corresponding to a slot in the contract. |
| FR-03 | Ubiquitous | The system SHALL implement every value of `NOVI_VARIANTS` on every component that accepts `variant`. |
| FR-04 | Ubiquitous | The system SHALL named-export every `tv()` definition so consumers can extend it via `tv({ extend })`. |
| FR-05 | Ubiquitous | The system SHALL accept a `classNames` prop keyed by slot name on every component. |
| FR-06 | Ubiquitous | The system SHALL reference colors only through `--novi-color-*` custom properties, never literal color values. |
| FR-07 | Ubiquitous | The system SHALL NOT use box-shadow other than `none`, border widths above 1px, border-radius above `sm`, or `scale`/`rotate` transforms. |
| FR-08 | Event-driven | When a key event occurs during IME composition on a text-entry or list-selection component, the system SHALL suppress the associated action. |
| FR-09 | State-driven | While `prefers-reduced-motion: reduce` is active, the system SHALL render transitions with 0ms duration. |
| FR-10 | State-driven | While the root has `data-novi-scheme="dark"`, the system SHALL maintain 4.5:1 text contrast and 3:1 non-text contrast. |
| FR-11 | Unwanted | If a component emits a `data-slot` value outside its contract vocabulary, then the contract test SHALL fail. |
| FR-12 | Unwanted | If a component's source uses a prohibited utility class, then CI SHALL fail. |
| FR-13 | Optional | Where a component has no natural `startContent`/`endContent`, the system MAY omit those optional slots. |
| FR-14 | Ubiquitous | The system SHALL provide a JSDoc usage example for every exported component. |

---

## Non-Functional Requirements

| カテゴリ | 要件 | 測定方法 |
|---------|------|---------|
| バンドル | 下記の測定方法に従う。`sideEffects: false` / tree-shakable | size-limit |
| Accessibility | axe violations **0**、WCAG 2.2 **AA** 準拠 | vitest-axe + 手動 SR 確認 |
| コントラスト | 本文 4.5:1 / 非テキスト 3:1（light・dark 両方） | 自動コントラスト検査 |
| 型 | `tsc --noEmit` エラー **0** | `pnpm typecheck` |
| カバレッジ | **80%** 以上 | Vitest coverage |
| 視覚回帰 | 20 コンポーネント × light/dark のスナップショットを保持 | Playwright |
| SSR | 全コンポーネントが RSC 環境で import 時にエラーを出さない（クライアント境界は明示） | docs サイトで検証 |
| 対応環境 | Chrome / Safari / Edge / Firefox 最新2、iOS 17+ / Android 13+ | Playwright + 実機 |
| ビルド時間 | < 30s | `pnpm build --filter=@novi-ui/raster` |

### バンドルサイズの測定方法

**「Button 単体 < 3KB」は測定対象の取り違えだった**（2026-08-19 実測で判明）。
`tailwind-variants`（内部の `tailwind-merge` 込み）が **11.4 KB** あり、これが全体の 92% を占める。
このランタイムは**全コンポーネントで共有される**ので、1つ目に全部乗せて数えるのは実態を表さない。

| 指標 | 実測（14契約 / `unbundle` 適用後） | 上限 |
|---|---|---|
| 共有ランタイム（`tailwind-variants` のみ） | 11.4 KB | — |
| 初回コスト（共有ランタイム + Button 1個） | **12.4 KB** | **13 KB** |
| パッケージ全体（14契約） | 16.7 KB | **35 KB** |

> **tree-shaking が効いていることの確認方法**
> バンドラの metafile で「`dist/` から取り込まれたバイト数」を見る。
> パッケージ全体の実サイズに近ければ tree-shaking は壊れている。
>
> | | dist からの取り込み | Button 単体 brotli |
> |---|---|---|
> | 1ファイルにバンドル（誤り） | 21.7 KB | 14.04 KB |
> | `unbundle: true`（正） | **3.9 KB** | **12.36 KB** |
>
> **ファイルサイズだけ見ていると気づけない。** 数字は微増にしか見えず、
> 実際にはコンポーネントが増えるたび全員が全部を背負っていた（[ADR-R7](./design.md)）。

> **なぜ `tailwind-merge` を切らないのか**
> `tv({ twMerge: false })` にすれば 11 KB のほとんどが消えるが、
> `classNames={{ root: 'bg-...' }}` による上書きが variant のクラスと衝突して効かなくなる。
> それは AC-03-3（slot 単位の上書き）と「スタイルを所有できる」という約束の否定にあたる。
> 11 KB は**その機能の対価**として受け入れる。

---

## Constraints
- `@novi-ui/core` の slot 語彙を変更しないこと。不足が判明した場合は **Ask first**（全テーマに波及するため）
- ランタイム依存は `tailwind-variants` のみ。追加は **Ask first**
- 1コンポーネント = 1PR を維持する（G5）
- `UNSTABLE_` 接頭辞の API を直接 import しない（core 経由のみ）

---

## Open Questions
なし（着手可能）。

> 検討して解決済みの論点:
> - ~~variant 語彙をテーマ側で減らせるか~~ → 減らせない。全語彙の実装が必須（ADR-06）
> - ~~影を完全禁止すると Modal の階層表現が成立するか~~ → 成立する。backdrop の暗転 + 1px 境界線で階層を作る
> - ~~角丸 0 でタップ領域の視認性が落ちないか~~ → 落ちない。境界線と余白で領域を示す
> - ~~Toast を MVP から外すか~~ → 外さない。RAC の `UNSTABLE_` は core が封じ込め済み（ADR-07）

---

## Glossary

| 用語 | 意味 |
|------|------|
| Raster | 本テーマ名。スイスのグリッドシステム "Rastersystem" 由来 |
| 禁止クラス検査 | FR-07 / FR-12 を機械的に検査する CI スクリプト |
| 契約テスト | core が提供する `testSlotContract` |
| 実効サイズ | 視覚的な大きさではなく、実際にポインタ入力を受け付ける領域の大きさ |
