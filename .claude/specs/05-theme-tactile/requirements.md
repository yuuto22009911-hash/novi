# @novi-ui/tactile — Requirements

| 項目 | 値 |
|------|-----|
| Status | **Approved**（2026-09-09: Open Questions なし・実装 50/71 進行中のため更新） |
| Author | yuuto |
| Reviewer | yuuto |
| Last Updated | 2026-08-22 |
| Architecture | [../../architecture.md](../../architecture.md) |
| Depends on | [../02-theme-raster/requirements.md](../02-theme-raster/requirements.md)（T-41 の申し送り） |

> 本書中の MUST / MUST NOT / SHOULD / SHOULD NOT / MAY は RFC 2119 に従う。

---

## TL;DR
- **What**: Novi UI の2本目のテーマ。**タッチファースト**（指で触る前提）の美学で MVP 20 コンポーネント（23契約）を実装する。
- **Why**: 「テーマ差は色と角丸ではなく構造」という本プロジェクトの中心主張は、2本目が出るまで証明されていないため。
- **Success**: **`@novi-ui/core` を1行も変更せずに** 23契約すべてを実装し、Modal / Select / Tabs の3つで DOM 構造が Raster と実際に異なる。

---

## Background

### 現状の課題

Raster は完成した（20/20 コンポーネント・404テスト・0.2.0 公開済み）。しかし**テーマが1本しかない状態では、このライブラリの主張は何も検証されていない**。

[architecture.md §12](../../architecture.md) は、最も重大なリスクを次のように記録している。

| Risk | Impact |
|---|---|
| テーマ差が結局「色と角丸」に収束する | **致命** |

そして着手条件を明示している。

> 2本目の着手条件として「**Modal・Select・Tabs の3つで DOM 構造が実際に違うこと**」を必須にする。

本 Spec はこの条件を満たす設計になっており、着手可能である（design.md §「着手条件の充足」で3件を DOM レベルで示す）。

### なぜ「タッチファースト」を2本目にするのか

1. **机上検証を実装で回収できる**。[architecture.md §5](../../architecture.md) は Modal を2テーマ分書き下ろす際、比較用テーマ B として**下から出るボトムシート**（grabber / フッターのフルワイド閉じるボタン / `header` を描画しない）を既に設計している。2本目をこれにすれば、設計書の仮説がそのまま実装で検証される
2. **Raster の対極が明確**。Raster は「情報密度・ポインタ前提・**線**で面を切る」。Tactile は「操作の確実性・指前提・**影**で面を持ち上げる」。数値で正面から対立させられる
3. **a11y の別の側面を検査できる**。Raster が固めたのはコントラストとキーボード操作。Tactile はタップ領域（WCAG 2.5.5）・入力ズーム・セーフエリアという、**Raster では一度も検査されなかった軸**を持ち込む
4. **実務の需要が大きい**。LIFF / モバイル Web / PWA はいずれもタッチが第一入力で、Raster をそのまま載せると小さすぎる

### なぜ今やるのか

T-41 のレビューは「slot 語彙の変更は不要」と結論した。**ただしそれは1本での結論**であり、語彙が Raster に都合よく作られていただけである可能性を排除できていない。
2本目を別の構造で通して初めて、契約が「構造から独立している」と言える。

---

## Goals
- **G1**: MVP 20 コンポーネント（23契約）を実装し、全件が core の契約テストを通る
- **G2**: **core への差し戻しを 0 件にする**。必要が生じた時点で実装を止め、契約の穴として記録する（Raster では4件発生した）
- **G3**: Modal / Select / Tabs / Toast / Accordion の5つで Raster と DOM 構造が異なることを、**テーマ横断テストで固定する**
- **G4**: Tactile デザイン言語を**数値で**定義し、実装がそれに従っていることを機械的に検査可能にする
- **G5**: 全対話要素の実効タップ領域が **44×44px 以上**であることを、静的検査と実ブラウザ実測の2段で保証する
- **G6**: 1コンポーネント = 1PR を維持し、23契約が揃う前でも常に公開可能な状態を保つ
- **G7**: 2テーマで重複したコードを棚卸しし、[architecture.md §7](../../architecture.md) の3基準で core への引き上げ要否を判断する（v0.2 の判断）

## Non-Goals
- **NG1**: MVP 20 以外のコンポーネント（DataTable / DatePicker / ComboBox / Slider / TagGroup）
- **NG2**: React Native 対応
- **NG3**: 3本目のテーマ
- **NG4**: アニメーションライブラリを使ったモーション（ADR-08）
- **NG5**: **テーマファクトリ（`createComponent(contract, impl)`）の導入**。architecture.md §7 では v0.3 の判断。本 Spec は引き上げ「判断」までを行い、抽象は作らない
- **NG6**: **シートのドラッグ開閉（スワイプで閉じる）**。RAC が担保しない領域で、Pointer Events・慣性・フォーカス復帰を自前で持つことになる。a11y を含めて設計しないと「マウスとキーボードでは閉じられないシート」が生まれる。別 Spec で起票する
- **NG7**: 触覚フィードバック（Vibration API）。iOS Safari が非対応で、対応環境でも設定で無効化されうるため、体験の前提にできない

---

## Tactile デザイン言語（数値定義）

「タッチファースト」を主観で運用すると必ずブレる。**すべて数値で固定する**（G4）。
右端は Raster の対応値で、**2本のテーマが数値の上で対立していること**を示す。

| 項目 | 規則 | 根拠 | Raster |
|---|---|---|---|
| ベースグリッド | 垂直リズムは **4px** の倍数。ブロック間余白は **8px** の倍数 | core のトークン規約。ここは共通 | 同じ |
| コンポーネント高さ | `sm` = 40px / `md` = 48px / `lg` = 56px | **最小段でもタップ下限を割らない**。`md` = 48px は Material の最小タッチ寸法 | 32 / 40 / 48 |
| タップターゲット | 対話要素の実効タップ領域は **最小 44×44px**（MUST） | WCAG 2.2 **AAA** (2.5.5) / Apple HIG 44pt / Material 48dp | 最小 24px（AA 準拠） |
| 一覧の行高 | 選択可能な行（`option` / `item`）は **最小 48px**（MUST） | 誤タップは一覧で最も起きる | 規定なし |
| 入力の文字サイズ | `input` / `textarea` の実効 `font-size` は **16px 以上**（MUST） | iOS Safari は 16px 未満でフォーカス時に自動ズームし、レイアウトが飛ぶ | 規定なし（`sm` は 14px） |
| タイポスケール | 13 / 15 / **17** / 21 / 26 / 32 / 40px（比率 ≒1.23） | 本文 17px は iOS の本文寸法。腕を伸ばした距離で読む前提 | 12 / 14 / **16** / 20 / 24 / 30 / 36 |
| 行送り | 本文 **1.6**、見出し **1.3** | 見出しも詰めすぎない | 1.6 / 1.25 |
| 角丸 | `sm` = 8 / `md` = 14 / `lg` = 20px / `full`。**`none` 以外は 8px 以上**（MUST） | 指で触れる面は角が丸い方が「押せる」と読まれる。`sm` が 8px なのは 24px 級の小部品（Checkbox の箱）が円に見えないための上限でもある | 6 / 8 / 12 |
| 影 | **面にも影を許可する**。ただし全値がトークン経由で、不透明度 **α ≤ 0.24**（MUST NOT exceed） | 階層は**持ち上がり**で作る。Raster は線で切る | 浮く層のみ・α ≤ 0.2 |
| 境界線 | **補助的にのみ使う**。既定は影と背景色差で分ける。使う場合は 1px（MUST NOT exceed） | Raster と正反対の分割原理 | 1px のみ・主たる分割手段 |
| 面の余白 | 対話要素の内側余白は水平 **16px 以上**（`sm` は 14px 可） | 指の接触面は視覚的な文字幅より広い | 12 / 16 / 20px |
| 画面端に固定する面 | `env(safe-area-inset-*)` を加算する（MUST） | ホームインジケータ・ノッチに隠れさせない | 該当なし |
| モーション | 出現 **260ms** / 消失 **200ms** / 微細な状態変化 **120ms** | 下から出る面は移動距離が長い。120ms では瞬間移動に見える | 全て 120ms |
| イージング | 出現は `--novi-ease-emphasized`（減速主体・オーバーシュートなし）、状態変化は `--novi-ease-standard` | 質量のある面が減速して止まる | `ease-standard` のみ |
| モーション種別 | `opacity` / `translate` に加え、**`scale` を押下フィードバックに限り許可**（0.96〜1.0、押下状態のみ）。`rotate` は Spinner と Accordion のシェブロンのみ | 指の下で沈む手応え。**装飾目的の `scale` は依然 MUST NOT** | `scale` 全面禁止・`rotate` は Spinner のみ |
| 彩度（中立色） | chroma **0.004 〜 0.02**（無彩色にしない・0 も 0.02 超も MUST NOT） | 温度のある灰。Raster の chroma 0 と数値で対立させる | **chroma 0**（厳密） |
| 彩度（意味色） | chroma **0 < c ≤ 0.19** | ADR-06 が全テーマに意味的6色を義務づけている | 同じ |
| 配置 | 主要操作は**画面下部**に置く（親指の可動域）。Modal のフッター・Select / Menu のシートは下端基準。**Toast は上端**（下端はシートとソフトウェアキーボードが占有するため） | 片手持ちで届く | 左揃え・上部基準（Toast は右下） |

> これらは design.md でトークンに落とし、**Lint 可能な形**（禁止 Tailwind クラスのリスト）にする。
> Raster と同じく `design-rules.data.mjs` を唯一の真実とし、CI 検査と AI 向け出力（llms.txt / MCP）が同じ定義を読む（[ADR-A6](../04-ai-integration/design.md)）。

---

## User Stories

### US-01: 指で確実に押せる
**As a** スマートフォンの利用者, **I want** 狙った要素を一度で押せてほしい, **so that** 拡大や押し直しをせずに操作が終わる。

**Acceptance Criteria**:
- **AC-01-1**: **Given** 全 `*.styles.ts`, **When** 寸法検査を実行する, **Then** 対話要素の root に 44px 未満の高さ指定が1件も存在しない。
- **AC-01-2**: **Given** 375×812 の実ブラウザで全コンポーネントのデモを描画, **When** 各対話要素のバウンディングボックスを測定する, **Then** 幅・高さともに **44px 以上**である。
- **AC-01-3**: **Given** Input / TextArea の入力要素, **When** 計算済み `font-size` を測定する, **Then** **16px 以上**である。
- **AC-01-4**: **Given** 任意のコンポーネント, **When** 高さを測定する, **Then** `sm`/`md`/`lg` がそれぞれ **40/48/56px** である。
- **AC-01-5**（異常系）: **Given** `size="sm"` の Checkbox の視覚的な箱が 24px, **When** タップ領域を測定する, **Then** 見た目とは独立に **44×44px 以上**である（視覚寸法とタップ寸法を分離できている）。

### US-02: Raster と構造が違う（本 Spec の存在理由）
**As a** ライブラリの利用者, **I want** テーマを切り替えたら見た目だけでなく**操作の組み立て方**が変わってほしい, **so that** 「1つのテーマに色を足しただけ」ではないことが実感できる。

**Acceptance Criteria**:
- **AC-02-1**: **Given** 同一 props の Modal を Raster と Tactile で描画, **When** `[data-slot="closeButton"]` の祖先を辿る, **Then** Raster では `[data-slot="header"]` の子孫、**Tactile では `[data-slot="footer"]` の子孫**である。
- **AC-02-2**: **Given** 同一 props の Select を開く, **When** `[data-slot="popover"]` の計算済みスタイルを比較する, **Then** Raster はトリガー基準に配置され、**Tactile は viewport 下端に張り付く**（`bottom` が 0 基準・幅が viewport 幅）。
- **AC-02-3**: **Given** 同一 props の Tabs, **When** `[data-slot="indicator"]` と `[data-slot="list"]` の関係を比較する, **Then** Raster では list 下辺の線、**Tactile では list の内側を移動する塗り面**である（list に背景色があり、indicator が兄弟として重なる）。
- **AC-02-4**: **Given** 任意のコンポーネント, **When** 両テーマの公開 props 型を比較する, **Then** **完全に同一**である（core の契約型をそのまま使っている）。
- **AC-02-5**（異常系）: **Given** Tactile の Modal, **When** Raster 向けに書かれた `classNames={{ header: 'x' }}` を渡す, **Then** 型エラーにならず、`header` を描画しない Tactile では**黙って無視される**（任意 slot の省略が利用者側を壊さない）。

### US-03: slot 契約を守る
**As a** テーマ作者, **I want** 自分の実装が core の契約から外れていないことを自動で保証したい, **so that** ドキュメントとテストがテーマ横断で成立し続ける。

**Acceptance Criteria**:
- **AC-03-1**: **Given** 23契約すべて, **When** `testSlotContract` を実行する, **Then** 全件が成功する。
- **AC-03-2**: **Given** 任意のコンポーネント, **When** DOM を走査する, **Then** 語彙外の `data-slot` が1つも存在しない。
- **AC-03-3**: **Given** `classNames={{ <slot>: 'x' }}` を渡す, **When** 描画する, **Then** その slot の要素にクラス `x` が付く。
- **AC-03-4**（異常系）: **Given** grabber のようなテーマ固有の装飾要素, **When** DOM を走査する, **Then** `data-slot` を持たず `aria-hidden="true"` である（装飾は slot にしない・[architecture.md §5](../../architecture.md)）。

### US-04: variant 語彙がすべて効く
**As a** エンドユーザー, **I want** ドキュメントに書かれた variant がすべて実際に効いてほしい, **so that** テーマを切り替えてもコードを書き換えずに済む。

**Acceptance Criteria**:
- **AC-04-1**: **Given** variant を持つ全コンポーネント, **When** `solid`/`outline`/`soft`/`ghost`/`plain` を順に指定する, **Then** それぞれ視覚的に異なるクラスが適用される。
- **AC-04-2**（異常系）: **Given** 同上, **When** `soft` の実装を削除する, **Then** TypeScript がコンパイルエラーを出す。
- **AC-04-3**: **Given** color を持つ全コンポーネント, **When** 意味的6色を指定する, **Then** すべてが対応するトークンを参照する。

### US-05: キーボードだけで操作できる
**As a** キーボード利用者 / スクリーンリーダー利用者, **I want** タッチ前提のテーマでもマウスなしで全機能を使いたい, **so that** 「モバイル向け」が支援技術の切り捨てにならない。

**Acceptance Criteria**:
- **AC-05-1**: **Given** 全コンポーネント（light / dark 両方）, **When** axe を実行する, **Then** violations が **0** である。
- **AC-05-2**: **Given** ボトムシート型の Modal / Select, **When** 開いた状態で Tab を押し続ける, **Then** フォーカスがシート内から出ない。
- **AC-05-3**: **Given** Modal / Popover / Menu / Select, **When** Escape を押す, **Then** 閉じてトリガーへフォーカスが戻る。
- **AC-05-4**: **Given** Menu / Select / Tabs / RadioGroup, **When** 矢印キーを押す, **Then** 項目間をフォーカスが移動する。
- **AC-05-5**: **Given** 任意の対話要素, **When** キーボードでフォーカスする, **Then** フォーカスリングが視認でき、コントラスト比 3:1 以上である。
- **AC-05-6**（異常系）: **Given** grabber を持つシート, **When** Tab でフォーカスを回す, **Then** grabber は**フォーカス順に現れない**（装飾要素であり、押しても何も起きないため）。

### US-06: ダークモードで破綻しない
**As a** エンドユーザー, **I want** ダークモードでも読めて操作できてほしい, **so that** 環境に関係なく使える。

**Acceptance Criteria**:
- **AC-06-1**: **Given** `data-novi-scheme="dark"`, **When** 全コンポーネントを描画する, **Then** 本文テキストのコントラスト比が **4.5:1 以上**である。
- **AC-06-2**: **Given** 同上, **When** 非テキスト要素（境界線・アイコン・インジケータ）を検査する, **Then** コントラスト比が **3:1 以上**である。
- **AC-06-3**（異常系）: **Given** ダークで影が見えないこと, **When** 浮いている面（シート・メニュー・トースト）の階層を検査する, **Then** 背景色差が **1.2:1 以上**あり、影だけに依存していない。
- **AC-06-4**: **Given** 同上, **When** 視覚回帰スナップショットを撮る, **Then** light との差分が意図した箇所のみである。

### US-07: スタイルを拡張できる
**As a** エンドユーザー, **I want** ライブラリのスタイルを自分のブランドに寄せたい, **so that** npm 配布でも「所有できない」不満がない。

**Acceptance Criteria**:
- **AC-07-1**: **Given** `import { buttonStyles } from '@novi-ui/tactile'`, **When** `tv({ extend: buttonStyles, slots: {...} })` を書く, **Then** 型エラーなく拡張でき、元の variant がすべて維持される。
- **AC-07-2**: **Given** 全コンポーネント, **When** 公開エクスポートを走査する, **Then** すべての `tv()` 定義が named export されている。
- **AC-07-3**: **Given** ユーザーが `--novi-color-primary` を上書きする, **When** 描画する, **Then** primary を使う全コンポーネントに反映される。
- **AC-07-4**（異常系）: **Given** 同一ページに Raster と Tactile の CSS が同居する, **When** `[data-novi-theme='tactile']` を指定する, **Then** Tactile のトークン値だけが効き、Raster の値が漏れない。

### US-08: 日本語入力で誤動作しない
**As a** 日本語ユーザー, **I want** 変換確定の Enter で意図しない操作が起きないでほしい, **so that** 入力途中で送信や選択が暴発しない。

**Acceptance Criteria**:
- **AC-08-1**: **Given** Input / TextArea / Menu, **When** IME 変換中に Enter を押す, **Then** 送信・選択・決定のいずれも発生しない。
- **AC-08-2**: **Given** 同上, **When** 変換確定後にもう一度 Enter を押す, **Then** 期待どおり動作する。

> Select のトリガーは `<button>` で編集可能要素ではないため、IME の変換イベントが発生しない。
> Raster の T-18 で実測して判明した（[02-theme-raster/tasks.md](../02-theme-raster/tasks.md) Phase 3 の注記）。使われないコードは足さない。

### US-09: モーション低減設定を尊重する
**As a** 前庭障害のあるユーザー, **I want** OS のモーション低減設定を尊重してほしい, **so that** 不快な動きが起きない。

**Acceptance Criteria**:
- **AC-09-1**: **Given** `prefers-reduced-motion: reduce`, **When** ボトムシートを開閉する, **Then** `translate` によるスライドが起きず、トランジション時間が 0ms になる。
- **AC-09-2**: **Given** 同上, **When** 対話要素を押下する, **Then** `scale` の沈み込みが発生しない。
- **AC-09-3**: **Given** 同上, **When** Spinner / Skeleton を描画する, **Then** ループアニメーションが停止または大幅に減衰する。

### US-10: 画面端とソフトウェアキーボードで壊れない
**As a** ノッチ付き端末の利用者, **I want** 画面下端の操作が隠れないでほしい, **so that** シートを閉じられなくなる事態が起きない。

**Acceptance Criteria**:
- **AC-10-1**: **Given** `env(safe-area-inset-bottom)` が 34px の環境, **When** ボトムシートを開く, **Then** フッターのボタン下端とシート下端の間に **34px 以上**の余白がある。
- **AC-10-2**: **Given** 縦 100% を占めるシート, **When** ビューポート高を測定する, **Then** `vh` ではなく `dvh` を基準にしており、アドレスバーの伸縮で見切れない。
- **AC-10-3**（異常系）: **Given** safe-area が 0 の環境（デスクトップ）, **When** 同じシートを描画する, **Then** 余分な空白が生じない（`env()` の第2引数で 0 にフォールバックする）。

---

## Functional Requirements (EARS)

| ID | パターン | 要件 |
|----|---------|------|
| FR-01 | Ubiquitous | The system SHALL implement all 20 MVP components (23 contracts) listed in architecture.md §6. |
| FR-02 | Ubiquitous | The system SHALL emit `data-slot="<name>"` on every element corresponding to a slot in the contract. |
| FR-03 | Ubiquitous | The system SHALL implement every value of `NOVI_VARIANTS` on every component that accepts `variant`. |
| FR-04 | Ubiquitous | The system SHALL named-export every `tv()` definition so consumers can extend it via `tv({ extend })`. |
| FR-05 | Ubiquitous | The system SHALL accept a `classNames` prop keyed by slot name on every component. |
| FR-06 | Ubiquitous | The system SHALL reference colors, radii, shadows, and durations only through `--novi-*` custom properties, never literal values. |
| FR-07 | Ubiquitous | The system SHALL give every interactive element an effective pointer target of at least 44×44 CSS pixels. |
| FR-08 | Ubiquitous | The system SHALL render text-entry controls at a computed font-size of at least 16 CSS pixels. |
| FR-09 | Ubiquitous | The system SHALL NOT use `scale` transforms outside a pressed state, `rotate` outside Spinner and Accordion, border widths above 1px, shadow alpha above 0.24, or non-`none` radii below 8px. |
| FR-10 | Event-driven | When a key event occurs during IME composition on a text-entry component, the system SHALL suppress the associated action. |
| FR-11 | State-driven | While `prefers-reduced-motion: reduce` is active, the system SHALL render transitions with 0ms duration and omit press-scale feedback. |
| FR-12 | State-driven | While the root has `data-novi-scheme="dark"`, the system SHALL maintain 4.5:1 text contrast, 3:1 non-text contrast, and 1.2:1 surface separation for floating layers. |
| FR-13 | State-driven | While a surface is anchored to a viewport edge, the system SHALL add the corresponding `env(safe-area-inset-*)` value to its padding, defaulting to 0. |
| FR-14 | Unwanted | If a component emits a `data-slot` value outside its contract vocabulary, then the contract test SHALL fail. |
| FR-15 | Unwanted | If a component's source uses a prohibited utility class, then CI SHALL fail. |
| FR-16 | Unwanted | If implementing a component requires a change to `@novi-ui/core`, then work on that component SHALL stop and the gap SHALL be recorded as a contract defect rather than worked around. |
| FR-17 | Optional | Where a component has no natural use for an optional slot, the system MAY omit that slot. |
| FR-18 | Ubiquitous | The system SHALL provide a JSDoc usage example for every exported component, and every example SHALL reference only real exports. |

---

## Non-Functional Requirements

| カテゴリ | 要件 | 測定方法 |
|---------|------|---------|
| バンドル | 初回コスト（共有ランタイム + Button 1個）**< 14 KB**、パッケージ全体（23契約）**< 35 KB**。`sideEffects: false` / tree-shakable | size-limit（Raster と同一の budget） |
| tree-shaking | `dist/` からの取り込みが Button 単体で **< 5 KB** | バンドラの metafile（`check-treeshaking.mjs`） |
| Accessibility | axe violations **0**、WCAG 2.2 **AA** 準拠。タップ領域のみ **AAA (2.5.5)** を満たす | vitest-axe + Playwright + axe-core |
| コントラスト | 本文 4.5:1 / 非テキスト 3:1 / 浮く面の背景色差 1.2:1（light・dark 両方） | 自動コントラスト検査 |
| 型 | `tsc --noEmit` エラー **0**（strict） | `pnpm typecheck` |
| カバレッジ | **80%** 以上 | Vitest coverage |
| 視覚回帰 | 20 コンポーネント × light/dark のスナップショットを保持（Raster の42枚に加えて） | Playwright |
| モバイル検査 | 320px / 375px の2幅で横スクロール 0・タップ領域 44px を検査 | `e2e/mobile.spec.ts` |
| SSR | 全コンポーネントが RSC 環境で import 時にエラーを出さない | docs サイトで検証 |
| 対応環境 | Chrome / Safari / Edge / Firefox 最新2、**iOS 17+ / Android 13+ を第一級**とする | Playwright + 実機 |
| ビルド時間 | < 30s | `pnpm build --filter=@novi-ui/tactile` |
| core への変更 | **0 行**（G2）。発生した場合は Open Questions に記録し、原因を design.md へ追記する | `git diff --stat packages/core` |

---

## Constraints
- `@novi-ui/core` の slot 語彙を変更しないこと。不足が判明した場合は **Ask first**（全テーマに波及するため）
- ランタイム依存は `tailwind-variants` のみ。追加は **Ask first**
- 1コンポーネント = 1PR を維持する（G6）
- `UNSTABLE_` 接頭辞の API を直接 import しない（core 経由のみ）
- **Raster の実装を書き換えないこと**。共通化したくなっても、G7 の棚卸しが終わるまで手を付けない（想像で作った抽象は必ず外れる・architecture.md §7）
- **`packages/raster/scripts/` を共有しない**。検査スクリプトは規律そのものが違うため、テーマごとに持つ

---

## Open Questions

なし（着手可能）。

> 検討して解決済みの論点:
> - ~~2本目を「装飾的テーマ（グラデーション / ネオモーフィズム）」にすべきか~~ → しない。それこそ「色と角丸の差」に収束する。着手条件（Modal/Select/Tabs の DOM 差）を満たせない
> - ~~シートのドラッグ開閉を MVP に入れるか~~ → 入れない（NG6）。RAC 非担保の領域で、キーボード利用者への代替経路を含めて設計する必要がある
> - ~~grabber を slot 語彙に追加するか~~ → 追加しない。architecture.md §5 が「テーマ固有の装飾要素は slot にしない」と既に決めている。`aria-hidden` の装飾として描く（AC-03-4 / AC-05-6）
> - ~~タップ領域 44px を core の契約にすべきか~~ → しない。Raster は情報密度が価値であり、AA の 24px で正しい。**寸法はテーマの美学に属する**
> - ~~中立色に chroma を持たせると Raster の「chroma 0」検査と矛盾しないか~~ → しない。検査はテーマごとに持つ（`design-rules.data.mjs` はパッケージ内）
> - ~~本文 17px はデスクトップで大きすぎないか~~ → 大きい。それが意図。Tactile はデスクトップ最適ではない。デスクトップ密度が要るなら Raster を選ぶ、が2テーマ体制の答えになる

---

## Glossary

| 用語 | 意味 |
|------|------|
| Tactile | 本テーマ名。ラテン語 *tactilis*「触れられる」から。Raster が Rastersystem 由来であるのと同じ作り方 |
| ボトムシート | 画面下端から現れ、下端に張り付いたまま表示される面。Modal と Select がこの形を採る |
| grabber | シート上端の短い横線。**装飾**であり、`data-slot` を持たず `aria-hidden` にする（ドラッグは NG6） |
| セグメンテッドコントロール | 塗られたトラックの内側を、選択中を示す面が移動する形の Tabs |
| 実効タップ領域 | 視覚的な大きさではなく、実際にポインタ入力を受け付ける領域の大きさ |
| safe-area | ノッチ・ホームインジケータに occluded されない領域。`env(safe-area-inset-*)` で得る |
| 着手条件 | architecture.md §12 が定めた「Modal・Select・Tabs の3つで DOM 構造が実際に違うこと」 |
