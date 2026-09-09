# Tones & Colors — Requirements

| 項目 | 値 |
|------|-----|
| Status | **Approved**（色とトーンの値は 2026-08-22 に yuuto さん承認済み） |
| Author | yuuto |
| Reviewer | yuuto |
| Last Updated | 2026-08-22 |
| Architecture | [../../architecture.md](../../architecture.md) |
| Depends on | 02（Raster 実装済み）/ [05（Tactile）](../05-theme-tactile/requirements.md) — Phase B のみ |

> 本書中の MUST / MUST NOT / SHOULD / SHOULD NOT / MAY は RFC 2119 に従う。

---

## TL;DR
- **What**: 各モデル（テーマ）が**トーン**（L/C のレシピ）と**カラーセット**（8色）を持ち、Novi UI で作られたシステムが **`data-novi-color` 属性1つ**で色を選べる機能。
- **Why**: アパレル運営者が作る UI ライブラリの差別化を「色」で実体化するため。トーンイントーン配色（トーン固定・色相可変）の実装。
- **Success**: 全色 × 全モデル × light/dark の**全組み合わせが CI のコントラスト検査で保証**され、コンポーネント変更 **0 行**・core 変更 **0 行**で色切替が動く。

---

## Background

### 経緯（2026-08-22 の壁打ちで確定した設計）

1. 色を第一級の差別化軸にする方針を決定（機能面コンセプトのテーマは継続）
2. 「カラーウェイ = 染料 / テーマ = 生地」モデルを経て、**選ぶのは色でなくトーン**だと判明
3. トーンはモデルが所有し、色はモデルごとのセットとして**コンセプトから設計**する形に到達
4. 実測（sRGB 色域とコントラストの掃引）でトーンの成立範囲を確定し、両モデルの値を承認

### 中心となる知見（実測で確定）

> **サイズの測り方を途中で直した（Phase A 実装時）。** 当初 NFR を「CSS 増分 < 3 KB・raw」と書いたが、
> 生成される色定義は極めて反復的で raw 6.5 KB / gzip 543 B と 12 倍近い開きがある。
> CSS は圧縮して配信されるため raw で縛るのは測る対象の取り違えで、
> 02-theme-raster が「Button 単体 < 3KB」で同じ誤りを一度している。gzip での上限に改めた。

- **トーンの天井はコントラストではなく sRGB 色域が決める**。暗く鮮やかな黄・青緑は sRGB に存在しない
- **セットを絞ると天井が上がる**。Raster から Teal を外すと L44 の上限 C は 0.075 → 0.095
- **Tactile の L は 50 が実用上限**。律速は Peacock を `subtle` 面の文字色に使ったときで、L52 は余裕 0.1 未満・L54 以上は不成立（実装時の掃引で確定。承認時の掃引は `subtle` を含めていなかった）
- **8色前後に絞るから保証できる**。自由な hue ではコントラストを保証できないが、有限セットなら全組み合わせを検査で数え切れる

### 決定済みの値（本 Spec の中核。変更は Ask first）

**Raster — Print Inks（印刷インク）** トーン: light **L 44% / C 0.090**・dark **L 74% / C 0.090**

| 色 | hue | 出自 | 相方（2色刷り） |
|---|---|---|---|
| **Ink**（既定） | 268 | 万年筆の藍黒 | Brick |
| Prussian | 235 | 紺青 | Ochre |
| Forest | 160 | 製図インクの深緑 | Ochre |
| Olive | 125 | オリーブドラブ | Ink |
| Ochre | 70 | 黄土 | Prussian |
| Brick | 35 | 煉瓦の朱 | Ink |
| Bordeaux | 12 | ワインの澱 | Ochre |
| Graphite | 270（C 0.020 / dark 0.017） | 黒鉛。無彩枠 | Brick |

**Tactile — Textile Dyes（織物の染料）** トーン: light **L 50% / C 0.080**・dark **L 76% / C 0.075**

> **light の L は 54 → 50 に訂正した（2026-08-22・spec 05 実装時）。** 承認時の掃引が
> `subtle` 面を対象に含めておらず、L54 では Peacock を `soft` variant の文字色に使ったときに
> 4.35:1 と基準を割る。律速は常に Peacock/`subtle` で、L52 でも余裕が 0.1 を切る。
> L50 なら 4.93 で、Raster（L44）との差 6 ポイントもトーンの識別子として十分に機能する。

| 色 | hue | 出自 | 相方（バイカラー） |
|---|---|---|---|
| **Indigo**（既定） | 255 | 藍 | Saffron |
| Peacock | 200 | 孔雀の青緑 | Madder |
| Sage | 148 | セージの葉 | Cochineal |
| Saffron | 78 | サフラン | Indigo |
| Madder | 28 | 茜 | Peacock |
| Cochineal | 5 | コチニール | Sage |
| Mauve | 315 | 史上初の合成染料 | Sage |
| Greige | 80（C 0.022 / dark 0.018） | 生機。無彩枠 | Indigo |

- 2セットで **hue の重複はゼロ**。入れない色がモデルの性格を作る（Raster に紫・青緑・ピンクは無い）
- **中立色の染まり方はモデルの性質**: Raster は染まらない（chroma 0 のまま）。Tactile は選んだ色の hue に染まる（C 0.004〜0.02 帯・ADR-T6）
- 検証の記録: 各48判定（8色 × 2スキーム × 3条件）の全通過を提案書 Artifact 内で実計算済み。CI はこれを恒久化する（T-02）

---

## Goals
- **G1**: 上記決定値を `tokens.data.mjs` / `colors.data.mjs` に写し、CSS・IR・検査が同じ定義から出る状態にする
- **G2**: `data-novi-color` 属性1つで色が切り替わる（Provider 不要・RSC 安全・JS 不要）
- **G3**: **コンポーネント変更 0 行・core 変更 0 行**で実現する
- **G4**: 全色 × 全モデル × light/dark のコントラストと色域を CI が保証する（提案時の48判定の恒久化）
- **G5**: 存在しない色名が指定されたとき、そのモデルの既定色に**確実にフォールバック**する
- **G6**: docs に色選択 UI を載せ、llms.txt / MCP が色の語彙を説明する

## Non-Goals
- **NG1**: 自由な hue の受け付け（検査で保証できない。`--novi-color-*` の手動上書きという既存の逃げ道は残る）
- **NG2**: シーズナルドロップ（定番のみ・決定済み）
- **NG3**: 実在商品との紐付け・事業名の公表（審美眼のみ・決定済み）
- **NG4**: 意味色（success / warning / danger）の色替え（後述 FR-08）
- **NG5**: 3本目以降のモデルのセット定義（作る時にそのモデルの Spec で行う）

---

## User Stories

### US-01: 利用側システムが色を選べる
**As a** Novi UI で管理画面を作る開発者, **I want** ブランドに合う色を属性1つで選びたい, **so that** CSS を書かずに配色が完成する。

**Acceptance Criteria**:
- **AC-01-1**: **Given** `<html data-novi-theme="raster" data-novi-color="brick">`, **When** 描画する, **Then** primary が Brick（oklch(44% 0.09 35)）になり、全コンポーネントに反映される。
- **AC-01-2**: **Given** `data-novi-color` 未指定, **When** 描画する, **Then** そのモデルの既定色（Raster=Ink / Tactile=Indigo）になる。
- **AC-01-3**: **Given** 実行中に属性を書き換える, **When** 切り替える, **Then** 再レンダリングなしで色が変わる。
- **AC-01-4**（異常系）: **Given** `data-novi-color="peacock"`（Tactile の色）を Raster で指定, **When** 描画する, **Then** Raster の既定色 Ink で描画される（未知の色名 = 上書きなし = 既定。G5）。

### US-02: トーンがモデルの識別子として機能する
**As a** エンドユーザー, **I want** モデルを切り替えたら同系統の色でも発色が変わってほしい, **so that** モデルの性格が色からも伝わる。

**Acceptance Criteria**:
- **AC-02-1**: **Given** Raster の任意の色, **When** primary の oklch を検査する, **Then** L=44%・C=0.090（Graphite を除く）である。
- **AC-02-2**: **Given** Tactile の任意の色, **When** 同上, **Then** L=50%・C=0.080（Greige を除く）である。
- **AC-02-3**: **Given** Tactile で色を切り替える, **When** 中立色トークンを検査する, **Then** すべて選択色の hue を持ち、chroma が 0.004〜0.02 帯にある。
- **AC-02-4**: **Given** Raster で色を切り替える, **When** 同上, **Then** 中立色の chroma は 0 のまま変わらない。

### US-03: どの組み合わせでも壊れない
**As a** アクセシビリティ責任者, **I want** どの色を選んでも基準を満たしてほしい, **so that** 色選択を利用者に開放できる。

**Acceptance Criteria**:
- **AC-03-1**: **Given** 全モデル × 全色 × light/dark, **When** コントラスト検査を実行する, **Then** primary は地に対して 4.5:1 以上（Tactile は**染まった地**に対して測る）。
- **AC-03-2**: **Given** 同上, **When** primary 面上の文字を検査する, **Then** 4.5:1 以上。
- **AC-03-3**: **Given** 同上, **When** sRGB 変換する, **Then** 全チャンネルが [0,1] に収まる（色域内）。
- **AC-03-4**（異常系・変異）: **Given** 検査スクリプト, **When** わざと Raster に hue 200 / C 0.10 の色を足す, **Then** CI が落ちる（掃引で確認済みの域外値を検出できる）。

### US-04: 相方（差し色）が組で付いてくる
**As a** デザインに自信のない開発者, **I want** 差し色まで考えたくない, **so that** 選んだ色に合う差し色が自動で付く。

**Acceptance Criteria**:
- **AC-04-1**: **Given** 任意の色を選択, **When** `--novi-color-secondary` を検査する, **Then** その色の相方（決定値の表）の値になっている。
- **AC-04-2**: **Given** 相方, **When** その値を検査する, **Then** 同じセット内の色の値と一致する（新しい未検査色が存在しない）。

### US-05: AI が色の語彙を知っている
**As a** AI にコードを書かせる開発者, **I want** AI が正しい色名を使ってほしい, **so that** 存在しない色名で silent フォールバックが起きない。

**Acceptance Criteria**:
- **AC-05-1**: **Given** llms.txt / MCP の `get_design_rules`, **When** モデル名を渡す, **Then** そのモデルの色名一覧・トーン値・既定色・フォールバック規則が返る。
- **AC-05-2**: **Given** accuracy のプロンプト, **When** 「Raster で赤系にして」と指示する, **Then** 生成コードが `data-novi-color="brick"` か `"bordeaux"` を使う（存在しない色名を発明しない）。

---

## Functional Requirements (EARS)

| ID | パターン | 要件 |
|----|---------|------|
| FR-01 | Ubiquitous | The system SHALL define each model's tone (L/C recipe) and color set (8 named colors with paired accents) in that model's `tokens.data.mjs` / `colors.data.mjs`, from which CSS, IR, and tests are generated. |
| FR-02 | Ubiquitous | The system SHALL apply the selected color via the `data-novi-color` attribute on the theme root, with values being kebab-case color names. |
| FR-03 | Ubiquitous | The system SHALL ship all color definitions inside the theme's existing CSS files (`<theme>.css` / `<theme>.scoped.css`); no additional import SHALL be required. |
| FR-04 | Ubiquitous | The system SHALL keep component source and `@novi-ui/core` unchanged (0 lines) for this feature. |
| FR-05 | State-driven | While no `data-novi-color` is set or an unknown name is set, the system SHALL render the model's default color (Raster=ink, Tactile=indigo). |
| FR-06 | State-driven | While a color is selected on Tactile, the system SHALL derive all neutral tokens from the selected color's hue within the chroma band 0.004–0.02. |
| FR-07 | State-driven | While a color is selected on Raster, the system SHALL keep neutral tokens at chroma 0. |
| FR-08 | Unwanted | If a color selection changes `success` / `warning` / `danger` tokens, then the token test SHALL fail (semantic colors stay theme-fixed for recognizability). |
| FR-09 | Unwanted | If any generated color value falls outside sRGB or below the contrast floors (4.5:1 text on ground, 4.5:1 text on face), then CI SHALL fail. |
| FR-10 | Ubiquitous | The system SHALL expose each color's paired accent as `--novi-color-secondary` (and `-fg`), reusing another color of the same set. |
| FR-11 | Ubiquitous | The system SHALL document color vocabulary, tone values, defaults, and the fallback rule in IR → docs props / llms.txt / MCP from the same data files. |
| FR-12 | Optional | The docs site MAY persist the visitor's color choice per model (same pattern as theme/scheme). |

---

## Non-Functional Requirements

| カテゴリ | 要件 | 測定方法 |
|---------|------|---------|
| サイズ | 色定義追加による CSS 増分 **< 1 KB**（テーマあたり・**gzip**） | 生成 CSS の実測（Raster 実績: +543 B / raw では +6.5 KB） |
| バンドル | JS 増分 **0 B**（機能は CSS のみ） | size-limit 差分 |
| コントラスト | AC-03 の全組み合わせ通過 | `colors.test`（新設・T-02） |
| 切替 | 属性書き換えから再描画不要（reflow のみ） | e2e で計測不要（CSS の性質）・動作確認のみ |
| SSR / RSC | 属性はサーバレンダリング可能・Provider 不要 | docs で検証 |
| core への変更 | **0 行** | `git diff --stat packages/core` |
| コンポーネントへの変更 | **0 行**（`*.styles.ts` / `*.tsx`） | `git diff --stat` |

---

## Constraints
- 決定済みの値（トーン・色・相方・既定色）の変更は **Ask first**
- セットへの色の追加・削除は **Ask first**（検査対象の全組み合わせが変わるため）
- `pnpm publish` / Trusted Publishing / changeset の既存リリース規約に従う
- Raster の既定 primary が indigo (C 0.18) → Ink (C 0.090) に変わるのは**意図した破壊的変更**。0.x の minor で出し、視覚回帰の基準を全更新する（ADR-R8 と同じ手続き）

---

## Open Questions

なし（着手可能）。

> 検討して解決済みの論点:
> - ~~属性名~~ → `data-novi-color`。`data-novi-theme` / `data-novi-scheme` と同列（ADR-C05）
> - ~~フォールバックの実装~~ → CSS の性質で自動。未知の色名はどのセレクタにも一致せず、テーマ既定値が生きる（ADR-C02）
> - ~~実行時に hue を合成するか、事前計算するか~~ → 事前計算（ADR-C02）
> - ~~相方をどの語彙に載せるか~~ → `secondary`（ADR-C03。語彙は不変・ADR-06 を守る）
> - ~~共通8色 vs モデル別セット~~ → モデル別（2026-08-22 決定。ADR-C01）

---

## Glossary

| 用語 | 意味 |
|------|------|
| トーン | モデルが所有する primary の L / C レシピ（light / dark 各1組）+ 中立色の染まり方 |
| カラーセット | モデルごとに8色。名前・hue・相方を持つ。Print Inks / Textile Dyes |
| 相方 | その色の差し色。同じセット内の別の色（2色刷り / バイカラー） |
| 既定色 | `data-novi-color` 未指定時の色。Raster=Ink / Tactile=Indigo |
| 染まる生地 | 中立色が選択色の hue を帯びる性質（Tactile）。Raster は染まらない紙 |
| 天井 | あるセット・ある L で全色が3条件を通る最大の C。sRGB 色域が主に決める |
