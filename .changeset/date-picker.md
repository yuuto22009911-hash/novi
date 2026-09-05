---
'@novi-ui/core': minor
'@novi-ui/raster': minor
'@novi-ui/tactile': minor
'@novi-ui/flatlay': minor
'@novi-ui/mcp': patch
---

DatePicker を追加（業務部品 5/5）

日付を入力する。年 / 月 / 日のマスに直接打つか、カレンダーを開いて選ぶ。
値は React Aria の `DateValue`（`@internationalized/date` の `CalendarDate`）で、
文字列や `Date` は受けない。`parseDate('2026-09-05')` で作る。Novi にランタイム
依存は増えない（ADR-B6）。`minValue` / `maxValue` / `isDateUnavailable` で選べない日を決める。

カレンダーは Raster では入力欄の隣に浮き、Tactile では画面下端のシート（升目 44px）、
Flatlay ではフロー内に展開して縦横の罫線で升目を切る。年月日のマスは
24px 四方を確保する（WCAG 2.2 target-size）。
