# @novi-ui/flatlay — Requirements

| 項目 | 値 |
|------|-----|
| Status | **Implemented**（2026-09-09: tasks 46/46 完了を確認して更新） |
| Author | yuuto |
| Last Updated | 2026-08-26 |
| Architecture | [../../architecture.md](../../architecture.md) |
| Depends on | core 安定 / [06 Tones & Colors](../06-tones-and-colors/requirements.md) の枠組み / スパイク成立(novi `spike/flatlay-inflow` f263c39) |

> 本書中の MUST / MUST NOT / SHOULD / SHOULD NOT / MAY は RFC 2119 に従う。

---

## TL;DR
- **What**: 3本目のモデル `@novi-ui/flatlay`。原理は「**z 軸を持たない**」— 開く = 場所を取る(インライン展開・押し下げ)。画面を覆うときは浮かばず**画面そのものになる**(テイクオーバー)。カラーセットは **Stationery**(机の上の事務道具・8色・確定済み)。
- **Why**: ①三部作の完成(紙のポインタ / 布のタッチ / 書類のフロー)②v0.3 判断(共通化の再検討)の材料 ③タイポの声(`--novi-font-*` 消費)を最初から持つ初のモデル。
- **Success**: 全契約を実装し、着手条件(Modal / Select / Tabs の DOM 構造差)を満たし、`z-index` ゼロ・影ゼロが CI で機械検査され、押し下げ(展開で後続が下がり、閉じると戻る)が実測で保証される。

---

## Background

### 経緯(2026-08-24 の壁打ちで確定)

1. 空いている軸の分析から「z 軸を持たない」を選定(配置原理: 中央+アンカー / 下端シートに続く第3案はインフロー+上端/テイクオーバー)
2. Modal は**全画面テイクオーバー**、複合(現場等)はせず純粋に「重ならない」だけを競技にすると決定
3. 色は「帳票・文具」方向 → **Stationery 8色**をトーン掃引付き提案書で承認(2026-08-24)
4. 技術スパイクで成立を実証(下記)。**着手前の最大リスク(RAC でインフロー展開が組めない)は解消済み**

### スパイクの結論(novi `spike/flatlay-inflow`・2026-08-24)

**成立ルートは「Popover の代替」ではなく「再配置」。** `UNSTABLE_portalContainer` でトリガー直下のフロー内コンテナへポータルさせ、inline の `position: absolute` を `static !important` で無効化すると、FocusScope・キーボード・コレクション・Escape・フォーカス復帰のすべてが RAC 本来の経路のまま、描画位置だけがフローに落ちる。Select / Menu / Dialog の3系で通し実測済み(押し下げ 109px と復帰、矢印 → Enter 選択、フォーカス復帰)。

捨てた2案も記録する(将来の再発明防止): 開時のみ ListBox をマウントすると Select のコレクションが空になり開かない。常時マウント + hidden はコレクションを保てるが、閉時に option が描画されず、フォーカス初期化とトリガーの keydown 分岐が Popover 前提で破綻する。

### 決定済みの値(変更は Ask first)

**Stationery** — トーン: light **L47 / C0.070**(天井 0.080)・dark **L75 / C0.060**(天井 0.130)。三部作で L 44/47/50 等間隔、C light 0.090/0.080/0.070・dark 0.090/0.075/0.060 の等差。48判定全 PASS(最小 5.85:1)。提案書: https://claude.ai/code/artifact/e2c064c1-49bb-4ed5-82f1-b444afa6aad1

| 色 | hue | 出自 | 相方(ダブルエントリー) |
|---|---|---|---|
| **Fieldbook**(既定) | 172 | 測量野帳の表紙の緑 | Eraser |
| Blueprint | 215 | 青焼き図面 | Manila(相互) |
| Carbon | 288 | カーボン複写紙 | Legalpad(相互) |
| Ribbon | 330 | タイプライターのインクリボン | Fieldbook |
| Eraser | 352 | ピンクの消しゴム | Pencil(相互) |
| Manila | 58 | マニラ封筒 | Blueprint(相互) |
| Legalpad | 98 | 黄色いリーガルパッド | Carbon(相互) |
| Pencil | 240(C 0.020 / dark 0.017) | 鉛筆の芯。無彩枠 | Eraser(相互) |

- **赤は意図的に入れない**: 校正の朱書きはエラー表示の道具 — 赤は意味色(danger)に予約。primary が danger と紛れる事故を世界観で説明する
- **中立の染まり方(第3方式)**: 地は染まらない紙(chroma 0)のまま、**罫線(`border` / `border-strong`)だけが選択色の hue を帯びる**(C 0.02〜0.03 帯)。border-strong は全 hue で 3:1 を実測クリア(4.10〜4.23:1)
- 既定が Fieldbook(緑)なのは、Ink(268)・Indigo(255)に続く3代連続の藍を避けるため(デザイン診断 B-2 の教訓)
- 色名はすべて英語。ローマ字和語は不可(2026-08-24 指示)

---

## Goals
- **G1**: 「z 軸を持たない」を機械検査可能な規律として実装する(`z-index` ゼロ・影ゼロ・浮く面ゼロ。例外は明文化された2つだけ)
- **G2**: 着手条件を満たす — **Modal(テイクオーバー)/ Select(インフロー押し下げ)/ Tabs(地続きタブ)の DOM 構造が Raster とも Tactile とも実際に違う**
- **G3**: 全契約(24)を実装し、slot 語彙・variant 語彙・公開 API を両テーマと完全に同一に保つ
- **G4**: Stationery 8色を 06 の枠組み(`data-novi-color` / フォールバック / CI 検査)に載せる
- **G5**: `UNSTABLE_portalContainer` 依存を core の unstable 封じ込め(ADR-07 と同じ手続き)で 1 箇所に閉じる
- **G6**: **タイポの声を持つ初のモデル** — `--novi-font-mono` を定義し、数値・ショートカット・ラベルの slot が実際に消費する
- **G7**: 3本目として v0.3 判断(architecture §7)の棚卸しを行い、結果を ADR に記録する

## Non-Goals
- **NG1**: 部分的な z 軸の許可(「小さい影なら」等)。例外は Modal(テイクオーバー)と Tooltip の2つのみで、以降増やさない
- **NG2**: 押し下げのドラッグ/スワイプ操作(Tactile NG6 と同根)
- **NG3**: シーズナル色・9色目の追加(06 NG2 踏襲)
- **NG4**: 縦書き・ルビ等の高度な和文組版(タイポの声は書体運用と数字の扱いまで)
- **NG5**: 仮想スクロール・大量 option の最適化(押し下げは有限の選択肢を前提とする。上限は design で規定)

---

## Flatlay デザイン言語(数値定義)

> 実値は design.md が所有し、**検査(T-02 相当)を通る値だけを採用する**。ここでは規律の形だけを固定する。

| 規律 | 値 |
|---|---|
| z-index | **全ソースで 0 件**(検査。例外なし — Modal も DOM 順で最前に置き z-index を使わない) |
| position | `fixed` / `absolute` 禁止。例外は `modal.styles.ts`(テイクオーバー)と `tooltip.styles.ts` のみ・理由コメント必須 |
| 影 | shadow トークンは全段 `0 0 #0000`(Tactile の教訓: `none` はリング合成を壊す)。`shadow-` クラスは変数経由のみ |
| 角丸 | **書類の直角**: none=0 / sm=2 / md=2 / lg=4 / full=9999(Avatar 等)。丸みは Raster(6/8/12)・Tactile(8/14/20)との第3の識別子 |
| 罫線 | 階層は罫線と地色と面積で作る。選択色で染まるのは罫線だけ |
| モーション | duration は1本(100ms)。**展開・格納はアニメーションなし(即時)** — 動きは押し下げそのものが語る |
| 押下 | scale / translate 不使用。**反転**(スタンプ: 面と文字が入れ替わる)で示す |
| タイポ | 数値・ショートカット・コード・ラベルは `--novi-font-mono` + `tabular-nums`。本文は `--novi-font-sans` |

---

## User Stories

### US-01: 開いても何も覆われない(本 Spec の存在理由)
**As a** 利用者, **I want** 展開された UI が他の内容を覆い隠さないでほしい, **so that** 画面の情報を見失わない。

**Acceptance Criteria**:
- **AC-01-1**: **Given** Select / Menu / Popover のトリガー, **When** 開く, **Then** 中身がトリガー直下のフローに展開され、**後続コンテンツの Y 座標が中身の高さぶん増加する**(Playwright 実測)。
- **AC-01-2**: **Given** 開いた状態, **When** 閉じる, **Then** 後続コンテンツの Y 座標が開く前と一致する。
- **AC-01-3**: **Given** 全 `*.styles.ts`, **When** 静的検査する, **Then** `z-index` の指定が 0 件である。
- **AC-01-4**(異常系): **Given** 検査スクリプト, **When** わざと `fixed` を badge.styles に置く, **Then** CI が落ちる(例外リスト外の検出)。

### US-02: Raster とも Tactile とも構造が違う(着手条件)
**As a** ドキュメント閲覧者, **I want** モデルを切り替えたら DOM 構造ごと変わってほしい, **so that** 「色と角丸だけの差」ではないと分かる。

**Acceptance Criteria**:
- **AC-02-1**: **Given** Modal, **When** 開く, **Then** 全画面テイクオーバー(viewport 全面)であり、中央パネル(Raster)とも下端シート(Tactile)とも `backdrop` / `panel` の配置が異なる。`closeButton` は**帳票のヘッダ行**(左上の戻る)に置かれ、3モデルで名前が同じまま位置が違う。
- **AC-02-2**: **Given** Select, **When** 開く, **Then** listbox がトリガー直下のフローに展開される(アンカー型でも viewport 下端固定でもない)。
- **AC-02-3**: **Given** Tabs, **When** 描画する, **Then** アクティブタブの下辺の罫線が消えて panel と地続きになる(`indicator` slot は**地続きの切れ目**として実体を持つ)。下線(Raster)とも塗りトラック(Tactile)とも異なる。
- **AC-02-4**: **Given** テーマ横断テスト, **When** 3モデルの Modal / Select / Tabs の DOM を比較する, **Then** 構造差が機械的に検証される(Tactile T-45 の拡張)。

### US-03: slot 契約を守る
**Acceptance Criteria**:
- **AC-03-1**: **Given** 全契約, **When** `testSlotContract` を流す, **Then** 必須 slot が `data-slot` 付きで出力される(24契約すべて)。
- **AC-03-2**: **Given** 任意 slot, **When** 語彙レビューする, **Then** 語彙外の slot 名を発明していない。
- **AC-03-3**: **Given** `classNames={{ <slot>: 'x' }}`, **When** 描画する, **Then** 該当要素に反映される。

### US-04: variant 語彙がすべて効く
**Acceptance Criteria**:
- **AC-04-1**: **Given** `solid | outline | soft | ghost | plain` × 6色, **When** 描画する, **Then** すべて視覚的に区別できるクラスが適用される(`variant-distinctness.test`)。
- **AC-04-2**: **Given** 押下, **When** `data-pressed`, **Then** 反転表現が適用され、`scale-*` / `translate-*` は使われない。

### US-05: キーボードだけで完結する
**Acceptance Criteria**:
- **AC-05-1**: **Given** Select, **When** トリガーで Enter/↓ → 矢印 → Enter, **Then** 選択が確定し、フォーカスがトリガーへ戻る(スパイクの通しを恒久化)。
- **AC-05-2**: **Given** 開いた展開, **When** Escape, **Then** 閉じてトリガーへフォーカスが戻り、押し下げが復帰する。
- **AC-05-3**: **Given** Modal(テイクオーバー), **When** 開く, **Then** フォーカスが内側に閉じ込められ、Escape で閉じる(RAC 担保)。

### US-06: 色を選べて、罫線だけが染まる
**Acceptance Criteria**:
- **AC-06-1**: **Given** `data-novi-color="carbon"`, **When** 描画する, **Then** primary が Carbon になり、`--novi-color-secondary` が Legalpad になる。
- **AC-06-2**: **Given** 色選択, **When** 中立トークンを検査する, **Then** `bg` / `subtle` / `fg` / `muted` は chroma 0 のまま、`border` / `border-strong` だけが選択色の hue(C 0.02〜0.03)を持つ。
- **AC-06-3**: **Given** 全8色 × light/dark, **When** コントラスト検査する, **Then** 提案書の48判定(地 4.5:1 / subtle 4.5:1 / 文字 4.5:1 / 色域内)+ border-strong 3:1 が CI で恒久化される。
- **AC-06-4**(異常系): **Given** `data-novi-color="ink"`(Raster の色), **When** 描画する, **Then** 既定 Fieldbook で描画される(06 G5 のフォールバック)。

### US-07: ダーク・拡張・IME・モーション低減(両テーマ踏襲)
**Acceptance Criteria**:
- **AC-07-1**: axe violations 0(light / dark)。
- **AC-07-2**: `tv({ extend })` で拡張できる(named export)。
- **AC-07-3**: Input / TextArea / Select / Menu は core の IME フックを経由し、変換確定 Enter が誤動作しない。
- **AC-07-4**: `prefers-reduced-motion` で全モーションが 0 になる(もともと展開は即時なので、対象は fade 系のみ)。

### US-08: 印刷で崩れない(z 軸なしの配当)
**As a** 帳票を扱う利用者, **I want** 画面をそのまま印刷したい, **so that** 印刷用の別実装が要らない。

**Acceptance Criteria**:
- **AC-08-1**: **Given** 展開を含むページ, **When** print エミュレーションで描画する, **Then** 展開中の内容がフロー内にあり、重なりによる欠落がない(視覚スナップショット1点)。

---

## Functional Requirements (EARS)

| ID | パターン | 要件 |
|----|---------|------|
| FR-01 | Ubiquitous | The theme SHALL implement all 24 contracts with identical public APIs, slot vocabulary, and variant vocabulary as raster / tactile. |
| FR-02 | Ubiquitous | The theme SHALL NOT use `z-index` anywhere in `*.styles.ts` (no exceptions; stacking is expressed by DOM order only). |
| FR-03 | Ubiquitous | The theme SHALL NOT use `position: fixed / absolute` except in `modal.styles.ts` (takeover) and `tooltip.styles.ts`, each with a reason comment, enforced by CI. |
| FR-04 | Ubiquitous | All shadow tokens SHALL be `0 0 #0000`; `shadow-` utilities SHALL only reference tokens. |
| FR-05 | Event-driven | When Select / Menu / Popover opens, the system SHALL render its content in document flow directly after the trigger, pushing subsequent content down; when it closes, layout SHALL return to the prior state. |
| FR-06 | Ubiquitous | Modal SHALL take over the full viewport without `z-index` (rendered last in DOM order); `backdrop` is the takeover ground, `panel` the content surface. |
| FR-07 | State-driven | While a color is selected, neutral tokens (`bg` / `subtle` / `fg` / `muted`) SHALL remain chroma 0 and only `border` / `border-strong` SHALL follow the selected hue within C 0.02–0.03. |
| FR-08 | Ubiquitous | The Stationery color set SHALL follow the spec 06 framework (`data-novi-color`, default fallback, CI contrast gates, `secondary` as the pair). |
| FR-09 | Unwanted | If `UNSTABLE_` identifiers appear outside `core/src/unstable/` (constants) and the single theme file that consumes them, then CI SHALL fail. |
| FR-10 | Ubiquitous | Numeric values, shortcuts, and code-like slots SHALL consume `--novi-font-mono` with `tabular-nums`; body text SHALL consume `--novi-font-sans`. |
| FR-11 | State-driven | While pressed, controls SHALL indicate state by inversion (surface/text swap), not by `scale` or `translate`. |
| FR-12 | Unwanted | If expansion/collapse is animated (height/max-height transitions), then the design-rules check SHALL fail (expansion is instant). |
| FR-13 | Ubiquitous | The theme SHALL follow shared cross-theme rules: `data-slot` on all slots, named-export `tv()` definitions, JSDoc examples, IME hooks, `'use client'` on the entry, `unbundle: true`. |

---

## Non-Functional Requirements

| カテゴリ | 要件 | 測定方法 |
|---------|------|---------|
| バンドル | Button 単体 gzip < 3KB / 初回 14KB / 全体 35KB(両テーマと同一予算) | size-limit |
| Accessibility | axe violations 0(light / dark)/ WCAG 2.2 AA | vitest-axe + 手動確認 |
| コントラスト | 48判定 + border-strong 3:1 の全通過 | tokens.test(T-02 相当) |
| レイアウト | 押し下げはユーザー操作起因のみ(load 時の自動展開なし)。CLS ≤ 0.1 を維持 | Lighthouse CI(docs) |
| カバレッジ | 80% | Vitest coverage |
| 型 | `tsc --noEmit` エラー 0 | typecheck |
| 印刷 | AC-08-1 のスナップショット 1 点 | Playwright(print media) |

---

## Constraints
- 決定済みの値(トーン・8色・相方・既定色・radius 階級)の変更は **Ask first**
- slot 語彙・variant 語彙・公開 API の変更は **Ask first**(全テーマ波及)
- core への追加は「`UNSTABLE_portalContainer` の定数封じ込め」のみ(ADR-07 の手続き)。それ以外の core 変更 0 行
- 例外(fixed / absolute / 浮き)は Modal・Tooltip の2つから増やさない(NG1)

---

## Open Questions

なし(着手可能)。

> 検討して解決済みの論点:
> - ~~RAC でインフロー展開が組めるか~~ → スパイクで成立(Background 参照)
> - ~~Modal をインライン確認パネルにするか~~ → 全画面テイクオーバー(2026-08-24 決定)
> - ~~赤系 primary と danger の近接~~ → 赤は入れない(意味色への予約として世界観で説明)
> - ~~Toast を sticky で滞留させるか~~ → しない。フロー挿入のみ(z 軸なしの純守。詳細は design ADR-F4)
> - ~~押し下げ展開をアニメするか~~ → しない(即時)。FR-12 で検査する

---

## Glossary

| 用語 | 意味 |
|------|------|
| 押し下げ | 展開された中身がフローに入り、後続コンテンツの位置が下がること |
| テイクオーバー | 浮かばずに画面全体を置き換える Modal の様式。z-index を使わず DOM 順で最前 |
| 地続きタブ | アクティブタブの下辺罫線が消えて panel と一体化する Tabs の様式(書類フォルダの耳) |
| Stationery | Flatlay のカラーセット。机の上の事務道具 8 色 |
| ダブルエントリー | 相方(差し色)の呼び名。複式簿記に由来 |
| 反転 | 押下表現。面と文字の色が入れ替わる(スタンプ) |
| インフロー再配置 | Popover を `UNSTABLE_portalContainer` でフロー内コンテナへポータルし `static !important` で座標指定を無効化する実装手法 |
