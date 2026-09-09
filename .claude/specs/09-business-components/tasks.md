# 09 業務部品 — Tasks

| 項目 | 値 |
|------|-----|
| Status | **Implemented**（5/5 完了 2026-09-05） |
| Last Updated | 2026-09-05 |

1部品 = 1PR。各 PR は core 契約 + 3テーマ + テスト + docs デモ + 横断検査登録 + README の数値更新を含む。

## T-01 NumberField（FR-01-*, AC-01-*）— **完了 2026-09-05（PR #29）**
- [x] core: `number-field.contract.ts` / registry / registry.test（POST_MVP + EXPECTED）/ architecture §6 行
- [x] raster / tactile / flatlay: styles / tsx / test 5点セット + 矢印キー / min-max / null 正規化
- [x] 横断: variant-distinctness / coverage（raster は手書き表、tactile / flatlay は自動走査 + タッチ寸法 / 行の階級の表）
- [x] docs: demos meta + index
- [x] README 数値（root / en / core / mcp）
- [x] 視覚回帰の基準（update-snapshots.yml → bot コミットは CI を起動しないので `--amend --reset-author` して push）
- 学び: RAC は値を `step` の倍数に揃える（1 から step 2 で上げると 2）。増減ボタンはフィールドのラベルでも labelledby されるので、テストは `getByRole('textbox', { name })` で引く

## T-02 ComboBox（FR-02-*, AC-02-*）— **完了 2026-09-05（PR #31）**
- [x] 同上 + IME テスト + Flatlay inflow + mobile e2e（展開しても横スクロールしない）
- 学び: RAC の ComboBox は `isOpen` / `defaultOpen` を持たない（開閉は入力とキー操作から導く）。slot 契約テストは開いてから `baseElement` を見る
- 学び: RAC の `useKeyboard` は `isComposing` しか見ない。core の `useImeSafeKeys` に `onKeyDownCapture` を足して、変換中のキーを同じ要素の RAC ハンドラにも渡さないようにした（keyCode 229 / compositionend 直後も抑制）。core の分岐カバレッジ 90% を割ったので後方互換経路のテストを追加

## T-03 Pagination（FR-03-*, AC-03-*）— **完了 2026-09-05（PR #32）**
- [x] core: `paginationRange` 純関数 + テスト（ADR-B4）。**main エントリは関数を持てない**（RSC 安全の検査）ので `@novi-ui/core/client` に置いた
- [x] 同上
- 学び: RAC Button は `aria-current` を forward する（実測）。省略記号の key は添字でなく「直前の数字」。横余白は `--novi-pad-control-x-sm`（raw-spacing）

## T-04 Table（FR-04-*, AC-04-*）— **完了 2026-09-05（PR #33）**
- [x] 同上 + 並べ替え / 空状態 / 選択（`selectionBehavior="replace"` 固定。チェックボックス列なし）
- 学び: RAC の Table は `id` を受け取らない。面を持つ行は文字色も持つ（surface-contrast）。MCP の検索テスト「table は tab に当たらない」は Table 実装で成立しなくなるので差し替えた
- 視覚回帰: `flatlay-combobox-dark.png` が run ごとに 1 バイト揺れる（5856↔5857）。判定は通っているが、揺れが続くなら閾値か対象を見直す

## T-05 DatePicker（FR-05-*, AC-05-*）— **完了 2026-09-05（PR #36）**
- [x] Open Question 1 の決定（(a) `DateValue` をそのまま受ける）を requirements に追記してから着手
- 学び: `DateValue` は react-aria-components が型として export している（core は型だけ import）。テストとデモの `parseDate` のため `@internationalized/date` を devDependency に。axe の `target-size` が年月日のマス（24px 未満）を検出したので `min-w-6 min-h-6`。カレンダーの日は前後の月のはみ出しも描かれるので、テストは月名込みで引く。MCP の「未実装の例」を FileUpload に差し替え
