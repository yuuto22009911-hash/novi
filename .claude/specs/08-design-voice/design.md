# spec 08 — Design Voice（余白とタイポをテーマの所有物にする）

Status: **Draft**
起票: 2026-09-01

本書のキーワード **MUST / MUST NOT / SHOULD / SHOULD NOT / MAY** は RFC 2119 に従う。

---

## 1. TL;DR

Novi の3モデルは**差が radius / height / shadow の3軸に集中しており、余白とタイポが1つも個性に使われていない**。
本 spec は「余白」と「タイポの声」をテーマの所有物にし、3モデルの支配軸を分ける。

- 公開 API（slot 契約 / variant 語彙 / prop 名）は**一切変えない**。破壊的変更なし。
- 色値・コントラスト検査には**触れない**。48判定は不変。
- webfont は**入れない**（perf 予算と、利用側へのフォント DL 強制を避けるため）。

---

## 2. 背景（診断）

実測（2026-09-01）:

| | Raster | Tactile | Flatlay |
|---|---|---|---|
| radius sm/md/lg | 6/8/12 | 8/14/20 | 2/2/4 |
| height sm/md/lg | 32/40/48 | 40/48/56 | 28/32/40 |
| **Card の padding** | `px-4 py-3 / px-4 py-4 / px-4 py-3` | **同一** | **同一** |
| `var(--novi-space-*)` の消費 | **0件** | 0件 | 0件 |
| `var(--novi-font-*)` の消費 | **0件** | 0件 | 0件 |
| tracking / leading の所有 | なし（core 固定） | なし | なし |

**問題 P-1**: 余白がテーマの所有物でない。padding は各 `*.styles.ts` に Tailwind クラス直書きで、3モデルほぼ同値。
**問題 P-2**: 余白の「比」がない。Card は header `py-3` / body `py-4` / footer `py-3` ＝ グループ内とグループ間の間隔比が実質 1:1。近接の法則が働かず「詰まって見える」。
**問題 P-3**: タイポが system-ui 一択・tracking と leading が core 固定で、3モデルとも同じ声で喋っている。

---

## 3. 決定

### ADR-D1: 余白は「意味付きトークン」でテーマが所有する（MUST）

core が語彙を持ち、各テーマが値を持つ。コンポーネントは `var()` 経由でのみ消費する。

生の `--novi-space-1..16` は**残す**（利用者の逃げ口・後方互換）。新語彙はその上位の意味レイヤ。

| トークン | 意味 |
|---|---|
| `--novi-pad-surface-x` | 面（Card / Modal / Popover / Menu / Toast）の左右 |
| `--novi-pad-surface-y` | 面の上下 |
| `--novi-pad-control-x-sm/md/lg` | コントロール（Button / Input / Select）の左右 |
| `--novi-gap-inline` | 行内（アイコン ↔ ラベル） |
| `--novi-gap-stack` | 縦に積む同格の要素間 |
| `--novi-gap-section` | 面の中の区画間 |

**過剰抽象化に当たらない根拠**: 3テーマ × 21コンポーネントで重複が確定済み（YAGNI の3回ルールを満たす）。
**ADR-09（ファクトリ不採用）と矛盾しない**: あれは *構造* を共通化しないという決定。これは *トークン* の話。

### ADR-D2: タイポの声もテーマが所有する（MUST）

| トークン | 意味 |
|---|---|
| `--novi-font-heading` | 見出しの書体（family） |
| `--novi-tracking-tight` | 見出しの字送り |
| `--novi-tracking-normal` | 本文・UI ラベルの字送り |
| `--novi-leading-body` | 本文の行送り（core にあるがテーマが上書きする） |
| `--novi-leading-heading` | 見出しの行送り（同上） |
| `--novi-numeric` | `font-variant-numeric` の値 |

### ADR-D3: webfont は導入しない（MUST NOT）

理由は2つ。
1. perf 予算が閾値ぎわ（LCP 2500ms / TBT 200ms）。
2. UI ライブラリが利用側にフォント DL を強制すべきでない。

個性は **tracking / leading / numeric / スケール比 / Flatlay の mono 見出し**で作る。これらは 0 バイト・クロスプラットフォームで安定する。
利用者が独自書体を使う経路は `--novi-font-sans` / `--novi-font-mono` / `--novi-font-heading` の上書き1点に集約する。

### ADR-D4: 各モデルは「支配軸」を1本だけ持つ（MUST）

差が1軸に集中していると読めない。**複数の軸が同じ方向に揃っている**ことが個性の条件。

| | Raster | Tactile | Flatlay |
|---|---|---|---|
| コンセプト | 格子 | 触覚 | z軸なし・帳票 |
| **支配軸** | **寸法の規律** | **面積** | **罫線と行** |
| 余白の性格 | すべて 4px グリッドに乗る | 最大。内小・外大の比を強く取る | 余白を「行の高さ」で取る |
| 見出し | sans / tracking を締める | sans / tracking ほぼ 0 | **mono** |
| 数字 | `tabular-nums` | `normal`（文章に馴染む） | `tabular-nums slashed-zero` |

### ADR-D5: control heights と text スケールは変えない（MUST NOT）

`raster-tokens.test.ts` がタップ領域と 8px グリッドで固定しており、変えるとアクセシビリティの根拠が動く。
余白の増量は **padding と gap だけ**で行う。

---

## 4. トークンの値（確定値）

### 4.1 余白

| トークン | Raster | Tactile | Flatlay |
|---|---|---|---|
| `pad-surface-x` | `20px` | `28px` | `20px` |
| `pad-surface-y` | `16px` | `24px` | `14px` |
| `pad-control-x-sm` | `12px` | `16px` | `10px` |
| `pad-control-x-md` | `16px` | `20px` | `12px` |
| `pad-control-x-lg` | `20px` | `24px` | `16px` |
| `gap-inline` | `8px` | `10px` | `8px` |
| `gap-stack` | `16px` | `20px` | `12px` |
| `gap-section` | `24px` | `32px` | `24px` |

**余白のコントラスト（グループ間 ÷ グループ内）**: Raster 1.5 / Tactile 1.6 / Flatlay 2.0。
現状はすべて実質 1.0。ここを 1.5 以上にすることが「余白多め」の実体である。

### 4.2 タイポ

| トークン | Raster | Tactile | Flatlay |
|---|---|---|---|
| `font-heading` | `var(--novi-font-sans)` | `var(--novi-font-sans)` | `var(--novi-font-mono)` |
| `tracking-tight` | `-0.014em` | `-0.006em` | `0em` |
| `tracking-normal` | `0em` | `0.006em` | `0.01em` |
| `leading-body` | `1.6` | `1.75` | `1.7` |
| `leading-heading` | `1.2` | `1.3` | `1.35` |
| `numeric` | `tabular-nums` | `normal` | `tabular-nums slashed-zero` |

---

## 5. 機能要件（EARS）

- **FR-D1**（Ubiquitous）システムは、`--novi-pad-*` と `--novi-gap-*` の全トークンを各テーマの CSS に出力 MUST。
- **FR-D2**（Ubiquitous）システムは、`--novi-font-heading` / `--novi-tracking-*` / `--novi-numeric` を各テーマの CSS に出力 MUST。
- **FR-D3**（Ubiquitous）面を持つコンポーネント（Card / Modal / Popover / Menu / Select / Accordion / Toast / Tabs）は、内側の padding を `var(--novi-pad-surface-*)` 経由で指定 MUST。
- **FR-D4**（Ubiquitous）Button / Input / Textarea / Select のトリガーは、左右 padding を `var(--novi-pad-control-x-*)` 経由で指定 MUST。
- **FR-D5**（Ubiquitous）アイコンとラベルを横に並べる箇所は `var(--novi-gap-inline)` を使用 MUST。
- **FR-D6**（Ubiquitous）見出し（Modal.title / Card.header / Accordion.trigger）は `var(--novi-font-heading)` と `var(--novi-tracking-tight)` を使用 MUST。
- **FR-D7**（Unwanted）検査は、`*.styles.ts` に生の padding / gap ユーティリティ（`p-4` 等）が**面とコントロールの主要箇所に**残っていた場合、失敗 MUST。
  - 例外: アイコンの微小インセット（`p-0.5` / `px-1.5` 等、8px 未満）は対象外とする。
- **FR-D8**（Ubiquitous）テーマは core の語彙 `NOVI_PAD_TOKENS` / `NOVI_TYPE_TOKENS` を**全件**実装 MUST（型で保証）。

---

## 6. 受け入れ基準（Given-When-Then）

- **AC-D1-1**（正常系）Given 3テーマの CSS が生成済み、When `--novi-pad-surface-y` を読む、Then Raster 16 / Tactile 24 / Flatlay 14 が返る。
- **AC-D1-2**（異常系）Given テーマが `pad-surface-x` の定義を欠く、When `pnpm typecheck` を実行、Then 型エラーで落ちる。
- **AC-D2-1**（正常系）Given Flatlay を選択、When Modal のタイトルの `font-family` を読む、Then mono スタックが返る。
- **AC-D2-2**（正常系）Given 3テーマ、When Card の header と body の垂直余白比を計算、Then すべて 1.0 より大きい。
- **AC-D3-1**（正常系）Given 全テーマ、When `check:design` を実行、Then FR-D7 の違反が 0 件。
- **AC-D3-2**（異常系）Given `card.styles.ts` の `py` を生の `py-3` に戻す、When `check:design` を実行、Then 該当行を指して失敗する。
- **AC-D4-1**（正常系）Given 既存の視覚回帰以外の全テスト、When `pnpm turbo run test --concurrency=1`、Then 全緑。
- **AC-D4-2**（正常系）Given 公開 API、When `public-api.test.ts` を実行、Then 差分なし（破壊的変更なし）。

---

## 7. 非機能要件

- **NFR-D1** CSS の増分は 1テーマあたり gzip **+400 B 以内**。
- **NFR-D2** Lighthouse: LCP ≤ 2500ms / TBT ≤ 200ms / CLS ≤ 0.1 を維持。
- **NFR-D3** 公開 API の破壊的変更 **0 件**。
- **NFR-D4** コントラスト 48判定は**不変**（色に触れないため）。

---

## 8. 影響と手順

| 影響 | 対応 |
|---|---|
| 視覚回帰の基準 | **全枚数が差分になる。** `update-snapshots.yml` を Linux で dispatch して撮り直す |
| `llms-full.txt` | 新トークンを載せる（`generate-llms-txt.mjs` の CONVENTIONS も更新） |
| accuracy 27件 | トークン追加後に再実行して穴を確認 |
| changeset | 3テーマ + core が minor。**必ず入れる**（無いと main マージで publish が走る） |

## 9. Open Questions

なし（着手可）。

## 10. やらないこと

- control heights / text スケールの変更（ADR-D5）
- 色値・カラーセットの変更
- webfont の導入（ADR-D3）
- コンポーネント構造の共通化（ADR-09 を維持）
