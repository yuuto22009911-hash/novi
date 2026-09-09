# 09 業務部品 — Design

| 項目 | 値 |
|------|-----|
| Status | Approved |
| Last Updated | 2026-09-05 |

## slot 語彙（core が所有。太字 = 必須）

| 部品 | slots |
|---|---|
| NumberField | **root**, label, **inputWrapper**, **input**, decrement, increment, description, errorMessage |
| ComboBox | **root**, label, **inputWrapper**, **input**, trigger, icon, **popover**, **listbox**, **option**, description, errorMessage |
| Pagination | **root**, **list**, **item**, **prev**, **next**, ellipsis |
| Table | **root**, **header**, **column**, sortIcon, **body**, **row**, **cell**, selectionCell, empty |
| DatePicker | **root**, label, **inputWrapper**, **dateInput**, **segment**, **trigger**, icon, **popover**, **calendar**, calendarHeader, calendarTitle, prevButton, nextButton, **calendarGrid**, **calendarCell**, description, errorMessage |

## ADR

- **ADR-B1 NumberField の増減ボタンは任意 slot。** 矢印キーで同じ操作ができるので構造上は必須でない。テーマは位置を自由に決める（Raster: 右端に縦2段、Tactile: 左右に 44px、Flatlay: 右端に罫線で区切った等幅の `−` `+`）。3テーマで DOM 順が違う3例目。
- **ADR-B2 `NaN` を外に出さない。** RAC の NumberField は空を `NaN` で表す。Novi は `null` に正規化する（`value: number | null`）。JSON に載らない `NaN` を業務コードに渡さない。
- **ADR-B3 ComboBox は Select の双子。** slot 語彙は Select + `inputWrapper` / `input`。`trigger` は任意（Flatlay は入力欄だけで開く）。フィルタは RAC 既定（contains）で、`defaultFilter` は露出しない（AI が独自実装を書く誘因になる）。
- **ADR-B4 Pagination は RAC を使わない唯一の部品。** `nav > ul > li > Button` で組み、現在地は `aria-current="page"`。省略は `ellipsis` slot（`aria-hidden`）。ページ番号の計算は core の純関数 `paginationRange(page, total, {siblingCount, boundaryCount})` に置き、3テーマが共有する（見た目でなく数列の計算なので core に置いてよい。core に CSS は増えない）。
- **ADR-B5 Table は RAC の合成 API をそのまま出す。** `Table / TableHeader / Column / TableBody / Row / Cell` をテーマごとに export し、データ駆動の `items` も RAC 経由で使える。モバイルでは**表は横スクロールする**（狭い画面で列を隠す判断はアプリ側。ダッシュボードデモがその例）。
- **ADR-B6 DatePicker は Open Question 1 の決定後に着手。** 決定内容は requirements.md に追記する。

## テーマごとの解釈（着手時に確定）

| 部品 | Raster | Tactile | Flatlay |
|---|---|---|---|
| NumberField | 入力欄の右に細い `−` `+`（1px 線） | 左右に 44px の面 | 右端の罫線セルに等幅 `−` `+` |
| ComboBox | 隣に浮く一覧 | 画面下端のシート | フロー内展開（Select と同じ） |
| Pagination | 数字だけの並び。現在地は下線 | 面のあるボタン。現在地は塗り | 罫線の帳票。現在地は反転 |
| Table | 1px の横罫のみ | 行に面と余白 | 縦横の罫線（帳票） |
