# 09 業務部品（Business Components）— Requirements

| 項目 | 値 |
|------|-----|
| Status | **Implemented**（5 部品すべて main に入った 2026-09-05） |
| Author | yuuto / Claude |
| Last Updated | 2026-09-05 |
| Architecture | [../../architecture.md](../../architecture.md) |
| Depends on | 08 design-voice（余白・書体トークン）/ 3テーマ実装済み |

> 本書中の MUST / MUST NOT / SHOULD / SHOULD NOT / MAY は RFC 2119 に従う。

---

## TL;DR
- **What**: 業務画面の一覧と入力に要る5部品 — **NumberField / ComboBox / Pagination / DatePicker / Table** — を core の契約として追加し、3テーマすべてで実装する。
- **Why**: 棚卸し（reports/2026-09-02）で「実務資産」という目的1と直接矛盾する最大の欠落と判定された。19 項目中 ✅3。React Aria が Table / ComboBox / DatePicker / NumberField の挙動を持つので構造コストは低い。
- **Success**: 5契約が `NOVI_CONTRACTS` に載り、3テーマで 5点セットのテストと axe を通し、docs / llms / MCP に自動反映され、モバイル 375px で横スクロールしない。

---

## Scope

### In
| # | 部品 | RAC の土台 | 優先 |
|---|---|---|---|
| 1 | NumberField | `NumberField` | 1（最小。数量・単価） |
| 2 | ComboBox | `ComboBox` | 2（Select の双子。20件超の選択肢） |
| 3 | Pagination | なし（`Button` で組む） | 3（一覧に必須） |
| 4 | Table | `Table` 系 | 4（一覧本体。並べ替え） |
| 5 | DatePicker | `DatePicker` + `Calendar` | 5（**Open Question 1** 解決後） |

### Out
- Slider / Tag input / FileUpload / Command palette / Drawer（次の棚卸しで再判定）
- Table の仮想スクロール・列リサイズ・行内編集
- DatePicker の範囲選択（RangeCalendar）

---

## Functional Requirements（EARS）

### 共通
- **FR-00-1** (Ubiquitous) 各部品は core に slot 語彙・必須 slot・props 型を持ち、テーマは必須 slot を `data-slot` 付きで MUST 描画する。
- **FR-00-2** (Ubiquitous) props 名は React Aria の慣習に MUST 従う（`isDisabled` / `onSelectionChange` / `sortDescriptor`）。独自名を作らない。
- **FR-00-3** (Ubiquitous) テキスト入力を持つ部品（NumberField / ComboBox / DatePicker）は IME 変換中の Enter を確定・送信に MUST 使わない（core の `useImeSafeKeys` を通す）。
- **FR-00-4** (Ubiquitous) 各部品は `variant` / `size` / `radius` のうちテーマが解釈できる語彙を受け取り、`size` は MUST 実装する。
- **FR-00-5** (Unwanted) テーマは `@react-aria/*` / `@react-stately/*` / `UNSTABLE_*` を直接 import してはならない（MUST NOT）。

### NumberField
- **FR-01-1** (Event-driven) 利用者が ArrowUp / ArrowDown を押したとき、値は `step` ずつ MUST 増減する。
- **FR-01-2** (State-driven) `minValue` / `maxValue` が指定されている間、値はその範囲を MUST 超えない。
- **FR-01-3** (Optional) `formatOptions` が与えられた場合、表示は `Intl.NumberFormat` の書式（通貨・%・単位）に MUST 従う。
- **FR-01-4** (Ubiquitous) 増減ボタンは任意 slot（`decrement` / `increment`）とし、名前（aria-label）を MUST 持つ。
- **FR-01-5** (Event-driven) 入力欄が空になったとき `onChange` は `null` を MUST 返す（`NaN` を外に出さない）。

### ComboBox
- **FR-02-1** (Event-driven) 利用者が文字を入力したとき、一覧は入力に一致する項目に MUST 絞られる。
- **FR-02-2** (State-driven) IME 変換中の間、一覧の項目を Enter で MUST 確定しない。
- **FR-02-3** (Optional) `allowsCustomValue` の場合、一覧に無い入力値を MUST 保持する。
- **FR-02-4** (Ubiquitous) Flatlay では一覧は入力欄の直下にフロー内で MUST 展開する（Select と同じ規律）。

### Pagination
- **FR-03-1** (Ubiquitous) 現在ページは `aria-current="page"` を MUST 持ち、色だけで区別しない。
- **FR-03-2** (Event-driven) 前へ / 次へを押したとき `onChange` に新しいページ番号を MUST 渡す。端では MUST 無効化する。
- **FR-03-3** (State-driven) 総ページ数が `siblingCount` と `boundaryCount` で収まらない間、省略記号を MUST 出す。
- **FR-03-4** (Ubiquitous) 根要素は `nav` で `aria-label` を MUST 持つ。

### Table
- **FR-04-1** (Ubiquitous) 根要素は `aria-label` を MUST 持ち、行・列はキーボードで MUST 移動できる（RAC の grid 規約）。
- **FR-04-2** (Event-driven) 並べ替え可能な列見出しを押したとき `onSortChange` に `sortDescriptor` を MUST 渡し、`aria-sort` を MUST 更新する。
- **FR-04-3** (Optional) `selectionMode` が与えられた場合、選択セルを MUST 描画する。
- **FR-04-4** (State-driven) 行が 0 件の間、`renderEmptyState` の内容を MUST 描画する。

### DatePicker
- **FR-05-1** (Ubiquitous) 日付は年 / 月 / 日のセグメントで MUST 入力できる（`DateInput` + `DateSegment`）。
- **FR-05-2** (Event-driven) トリガーを押したときカレンダーが開き、矢印キーで日を MUST 移動できる。
- **FR-05-3** (Ubiquitous) Flatlay ではカレンダーは入力欄の直下にフロー内で MUST 展開する。
- **FR-05-4** (Ubiquitous) 値の型は **Open Question 1** の決定に従う。

---

## Non-Functional
| 項目 | 値 |
|---|---|
| a11y | axe violations 0（3テーマ × light/dark） |
| テスト | 各部品 × 各テーマで 5点セット + キーボード操作テスト |
| モバイル | 375px で横スクロール 0px。Table は狭い画面で横スクロール**する**（表そのものの性質）が、ページはしない |
| バンドル | 各テーマの `size-limit` 全体上限 35KB を維持。超えるなら上限の見直しを changeset に記録 |
| 視覚回帰 | 新規 slug 分の基準を Linux（update-snapshots.yml）で生成 |

---

## Acceptance Criteria（Given-When-Then）

- **AC-01-1** Given `<NumberField defaultValue={1} step={1} minValue={0} />`, When ArrowDown を2回押す, Then 値は 0 で止まり `onChange` は 0 を最後に受け取る。
- **AC-01-2** Given 値 1 の欄, When 全削除する, Then `onChange` は `null` を受け取る。
- **AC-02-1** Given 3件の項目, When 「東」と入力する, Then 一覧は「東京都」だけになる。
- **AC-02-2** Given 変換中, When Enter, Then 選択は変わらない。
- **AC-03-1** Given `total=10 page=1`, When 「前へ」を押す, Then 何も起きない（無効）。「次へ」を押す, Then `onChange(2)`。
- **AC-03-2** Given `total=10 page=5 siblingCount=1`, When 描画, Then `1 … 4 5 6 … 10` の並びになる。
- **AC-04-1** Given 並べ替え可能な列, When 見出しを押す, Then `onSortChange({column, direction:'ascending'})` が呼ばれ、もう一度押すと `descending`。
- **AC-04-2** Given 0 行, When 描画, Then `renderEmptyState` が表示される。
- **AC-05-1** Given 開いたカレンダー, When ArrowRight, Then フォーカスが翌日に移る。
- **AC-05-2**（異常系）Given 最小日より前の日, When 選ぼうとする, Then 選べず `isInvalid` にならない（そもそも選択不可）。

---

## Open Questions

1. **決定（2026-09-05・yuuto「A」）: (a) `DateValue` をそのまま受ける。** Novi にランタイム依存は増えない。利用者は `@internationalized/date` を入れて `parseDate('2026-09-05')` で値を作る（React Aria の慣習）。
   - 元の問い: **DatePicker の値の型。** RAC は `@internationalized/date` の `CalendarDate` を使う。(a) そのまま `DateValue` を受ける（利用者が `@internationalized/date` を自分で入れる。RAC の慣習）/ (b) ISO 文字列を受け、テーマ内で `parseDate` する（**ランタイム依存の追加 = Ask first**）。→ **決まるまで DatePicker は着手しない。** 他4部品は影響なし。
