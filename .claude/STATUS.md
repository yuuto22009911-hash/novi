# Novi UI — 現在地

> セッションをまたいで作業を継続するための引き継ぎ。
> 詳細な設計判断は [architecture.md](./architecture.md) と各 spec の ADR にある。

| 項目 | 値 |
|------|-----|
| Last Updated | 2026-09-06 |
| 実装リポジトリ | `~/github/novi` → https://github.com/yuuto22009911-hash/novi |
| 公開サイト | https://novi-42r.pages.dev |
| npm | `@novi-ui/core@0.6.0` / `@novi-ui/raster@0.8.1` / `@novi-ui/tactile@0.6.0` / `@novi-ui/flatlay@0.5.0` / `@novi-ui/mcp@0.1.6` |

---

## 完成しているもの

| パッケージ | 状態 |
|---|---|
| `@novi-ui/core` | 35/40 タスク・**218テスト**・**0.2.0 公開済み**・**ColorPicker 契約を追加**（24契約） |
| `@novi-ui/raster` | 41/43 タスク・**21 コンポーネント**（+ ColorPicker）・464テスト・**0.4.0 公開済み** |
| `@novi-ui/mcp` | **33/33 タスク完了**・53テスト・0.1.1 公開済み（4ツールを公開版で実接続確認） |
| `apps/docs` | 39/41 タスク・**28ページ静的エクスポート**・Cloudflare Pages 公開済み |
| `@novi-ui/tactile` | **50/51 タスク・477テスト**・24契約実装済み・docs / llms / MCP 統合済み・タッチ実測 e2e・**0.3.0 公開済み** |
| `@novi-ui/flatlay` | **T-01〜T-39 完了・837テスト**・24契約実装済み・カバレッジ 99.57%・視覚回帰の基準 45 枚・**0.2.0 公開済み**（spec 07。z 軸なし・テイクオーバー・フロー内展開） |

### 品質ゲート（すべて CI で自動実行）

```
lint             Biome + 設計制約5件 + 手書きAPI検査3件
typecheck        6パッケージ
test             1206件（core 218 + raster 464 + tactile 471 + mcp 53）+ カバレッジゲート
build            4パッケージ
check:dist       exports実在 / RSC安全 / use client / access public / tree-shaking
                 + MCP の env・FS・network 遮断検査
size             size-limit
browser          188件（axe 48 + 視覚回帰 88 + タッチ実測 18 + モバイル 12 + テーマ切替 8 + IME 8
                 + safe-area 4 + 実効スタイル 2）
perf             Lighthouse 3 URL × 5回。中央値で判定、TBT のみ最良値（ランナーのノイズ対策）
accuracy         25件（型エラー0 / 禁止クラス0）**手動実行。CI では回さない**（ADR-A5）
```

### リリース

`main` へ push → Changesets が version PR → マージで **OIDC 自動公開**。
OTP もブラウザ認証も不要。provenance が自動で付く。

```bash
pnpm changeset   # 変更を記録してコミット・push するだけ
```

**version PR をマージする前に `pnpm accuracy` を手動実行する**（CI では回さない・ADR-A5）。

3パッケージとも Trusted Publisher 設定済みで、version PR の自動作成も有効。
**push → version PR 自動生成 → マージで自動公開**が全経路つながっている。
2026-08-23 に core 0.2.0 / raster 0.4.0 / tactile 0.2.0 を同経路で公開した。

### 2026-09-01〜02 の変更（spec 08 design-voice + 公開面）

- **余白と書体をテーマ所有に**（PR #20 / spec 08）。core が `NOVI_PAD_TOKENS` / `NOVI_GAP_TOKENS` / `NOVI_TRACKING_TOKENS` と `font.heading` / `font.numeric` / `leading.*` を所有し、各テーマが値を与える。design rule `raw-spacing` が生の余白ユーティリティを禁止。ホームに3モデル並置（`theme-triptych.tsx`）
- **perf ゲートの TBT 閾値を 200 → 300ms**（PR #22）。最良値でも 202ms に張り付いていたため
- **公開面の穴埋め**（`chore/public-surface`）: LICENSE 同梱 / favicon・OGP / README にテーマ 2 本を追加 / Tailwind v4 必須を明記して peer 宣言 / はじめにページに theme・scheme・color 属性 / MCP の同梱データ再生成 + core・テーマの changeset に mcp を要求する lint 検査
- 棚卸しレポート: `reports/2026-09-02-strengths-and-issues.md`

---

### 2026-09-03〜06 の変更（棚卸しレポートの消化 + 業務部品 + AI 配布物）

棚卸しレポート [reports/2026-09-02-strengths-and-issues.md](./reports/2026-09-02-strengths-and-issues.md) 由来の項目は**全件完了**。

- **導線**: ホーム最上段を Modal 三連に（PR #25）/ Lookbook に試着室（#26・`fitting-room.tsx` を lazy 読み込み）/ Why Novi = `/docs/why/`（#27）/ 英語入口 = `README.en.md` + `/en/` + `llms-en.txt` の3本だけ（#28。全訳はしない方針）
- **業務部品 5/5**（spec 09・1部品 = 1PR）: NumberField（#29）/ ComboBox（#31）/ Pagination（#32）/ Table（#33）/ DatePicker（#36・値は `DateValue`）。3テーマすべてに実装。サイトは**ライト固定**に（#35。Novi UI 自体のダークは維持、プレビューはヘッダーで切替）
- **AI 配布物**（#37）: 利用者向け Skill `skills/novi-ui/` + shadcn 互換レジストリ `/r/*.json`。Release 時に Skill を再生成（#43）
- **docs の厚み**（#38 / #39）: 各コンポーネントに例（`demos/extras.ts` + `demos/examples.tsx`）・Do/Don't・キーボード操作表（契約 JSDoc の `@keyboard` → IR `keyboard[]` → ページ / llms-full / Skill / MCP）
- **Raster のアニメーション修正**（#44・raster 0.8.1）: `modal / popover / menu / toast` の `novi-fade-in` と `progress` の `novi-indeterminate` が **`@keyframes` 未定義のまま出荷されていた**（下記 #34 は tactile 側にしか反映されていなかった）。生成 CSS に keyframes を出力し、参照↔定義の突き合わせ検査を追加
- **accuracy の復旧**（#46）: 業務部品 5 つに指示文が無く、`pnpm accuracy` が 0.6.0 公開以降**実行不能**だった。指示文を足し、raw-spacing 規則（9/1）より前に生成された 4 件も再生成して **32/32 合格**
- 公開: 9/3（core 0.4.1 系）→ 9/5（core 0.5.0 系）→ 9/6（core 0.6.0 系）→ 9/6（raster 0.8.1 / mcp 0.1.6）

**Lighthouse の LCP ゲート（2500ms）は version PR のマージのような無関係なコミットでも落ちることがある**（2711ms）。再実行で通る。TBT と同じノイズ。

---

## 残っている作業

### 人の操作が必要（私では完了できない）

| タスク | 内容 |
|---|---|
| **tactile T-50** | **実機確認**。**iOS Safari は 2026-08-23 に完了**（iPhone 17 Pro / iOS 26.4・下記 #39 / #41 を発見して修正）。**残りは Android Chrome のみ**（作業環境に端末が無い）。手順は [T-50-実機確認手順.md](./specs/05-theme-tactile/T-50-実機確認手順.md) |
| **core T-18 / raster T-39** | **IME 実機確認**。**macOS と iOS Safari は 2026-08-22 に確認済み**（変換確定の Enter がハンドラに届かず、確定後の Enter は届く）。iOS は `compositionend` の後に keydown が来る環境で、AC-03-4 が想定していた挙動差そのもの。残りは **Windows Chrome + MS-IME** のみ。<br>手順つきの計測ページ: https://novi-42r.pages.dev/ime-probe/ |

### 私が進められる

| タスク | 内容 |
|---|---|
| **視覚回帰のフレーク** | `flatlay-combobox-dark` の基準画像が 1 バイト揺れる。未着手 |
| **AI 向け文書の穴**（accuracy 生成時にエージェントが「文書に無いので推測した」と報告） | `ComboBoxItem` / `TableHeader` 等サブコンポーネントの import 元が使用例にしか出ない / DatePicker で「今日」を作る `today()` / `getLocalTimeZone()` と `DateValue` の import 元が未記載 / Skeleton の props 表に `className` が無いのに例は `className` を使う。直すのは `generate-llms-txt.mjs` の `CONVENTIONS` 側 |
| **ローカル `pnpm lint` の警告** | tactile のテスト 4 本に未使用 import、`generate-registry.mjs` の計算キー。CI は warning 扱いで通るが、手元で目につく |
| **次の方向性** | 棚卸しレポートの項目は全て消化。新しいテーマ・機能は要相談 |

---

## 実装で判明し、設計書に反映した重要事項

新しいテーマやコンポーネントを作る前に、これらは必ず読むこと。
**いずれもテストが全部通っている状態で潜んでいた**種類の問題。

| # | 内容 | 記録先 |
|---|---|---|
| 39 | **影のトークンに `none` を混ぜると、リングごと消える**。Tailwind の `ring-*` は `box-shadow` に合成されるため、`--novi-shadow-none: none` を併記した瞬間に `box-shadow: <ring>, none` という不正値になり、**宣言全体が破棄される**。Tactile の `outline` variant（Input / TextArea の既定）がこれで境界線を完全に失い、**入力欄がどこにあるか分からない状態で公開されていた**。ライト・ダーク両方。単体テストはクラス文字列しか見ず、視覚回帰は基準画像も同じ壊れた状態で撮られていたため、442テスト全部が緑のまま通っていた。実機（iOS Safari）で初めて見えた。影を持たせない意図は**透明な影 `0 0 #0000`** で表す（Tailwind の `shadow-none` と同じ形） | tactile-tokens.ts / effective-styles.spec.ts |
| 42 | **色見本は `data-novi-color` では作れない**。ColorPicker のスウォッチに色を持たせようとして、上書きセレクタを「テーマルートの子孫」にも効かせたところ、**ページ全体が最後に選んだ色で塗られた**。docs は FOUC 対策で `<html>` にもテーマを宣言しており（`layout.tsx` の initScript）、`[data-novi-theme='x'][data-novi-scheme='dark'] [data-novi-color='y']` が html を起点に全子孫へ効いてしまう。スウォッチ自身に `data-novi-theme` を置く形も不可で、その要素でライト / ダークの分岐が再評価され、色見本だけがページの選択から外れる。**色ごとの値を独立した変数（`--novi-swatch-<id>`）としてテーマルートで宣言する**のが解。スウォッチは自分の色だけを参照し、スキームは親の宣言が決める。axe の色コントラスト違反（2.08:1）で気づいた | theme-css.mjs / color-picker.tsx |
| 41 | **既定値でしか動かない検査は、何も検査していない**。safe-area の受け入れ基準（AC-10-1）は「34px の環境で 34px 以上あく」だったのに、検査は inset が **0 の環境でしか走っていなかった**。0 では `env()` の第2引数が効くだけで、**加算そのものが一度も実行されない**。結果、左右の inset を足し忘れたまま横向きで Modal / Select / Menu / Toast の文字がノッチに潜っていた。CDP の `Emulation.setSafeAreaInsetsOverride` で inset を注入すれば、実機と同じ経路（`env()` が非 0 を返す）で検査できる。**T-50 の実機確認で「iOS Safari のブラウザモードでは inset が常に 0」と分かったこと自体が、実機に頼れない領域があることの証拠**でもある | safe-area.spec.ts |
| 40 | **`maxDiffPixelRatio` は面積が大きいほど鈍る**。#39 で 1px の枠が消えたとき、Input（888×156）は検出できたが **TextArea（888×228）は同じ欠陥で通った**。消えた線のピクセル数はほぼ同じでも、分母が 1.5 倍なので比率が閾値（0.01）を下回る。**比率で見る検査は、大きいコンポーネントほど甘い**。線の有無のような構造の変化は、画像ではなく計算済みスタイルで見る | visual-regression.spec.ts / effective-styles.spec.ts |
| 1 | **core の CSS リセットが利用者のユーティリティを壊していた**。`@layer` 順序は詳細度に優先するため `:where(button){color:inherit}` が `text-[...]` に勝ち、コントラスト 2.84 になっていた。リセットは `box-sizing` だけに留める | core の `generate-base-css.mjs` |
| 2 | **背景を設定する面は文字色も設定する**。Card がダークでコントラスト 1.07（ほぼ不可視）だった。9箇所修正し `surface-contrast.test.ts` で固定 | raster |
| 3 | **1ファイルにバンドルすると tree-shaking が効かない**。`sideEffects: false` はファイル単位でしか効かず、`tv()` 呼び出しが全部残る。`unbundle: true` で 21.7KB → 3.9KB | ADR-R7 |
| 4 | **契約テストは `baseElement` を見る**。オーバーレイ5種は portal に描画されるため `container` だと必須 slot が全部欠落扱いになる | 01-core/design.md |
| 5 | **slot 定義は `satisfies`**。型注釈だと任意 slot が呼べなくなる | ADR-R5 |
| 6 | **`'use client'` はエントリ自身に置く**。import 先のディレクティブは成果物に残らない | ADR-R6 |
| 7 | **`tv({ extend, base })` は効かない**。slot ベースでは `slots` を使う。variant を上書きしたいときは `classNames` | architecture.md §9.3 |
| 8 | **`variant` は最後に宣言**。先に書くと `size` のクラスに負けて2つの variant が同一になる | raster |
| 9 | **Node は `.node-version` に集約**。tsdown が `^22.18.0 \|\| >=24.11.0` を要求。`engines` を実態に合わせないと古い Node を許してしまう | ADR-D5 |
| 10 | **docs は turbo 経由でビルド**。IR 生成がビルド済み core を読むため依存順序が要る | ADR-D6 |
| 11 | **`pnpm publish` を使う**（`npm publish` / `changeset publish` ではなく）。`workspace:*` が置換されず壊れたパッケージが公開される | steering.md |
| 12 | **CI で `npm install -g npm@latest` をしない**。npm 自身が壊れる。pnpm 11 は OIDC にネイティブ対応 | release.yml |
| 19 | **provenance は `repository` の宣言を要求する**。無いと publish の瞬間に 422 で落ちる（`repository.url is ""`）。ビルドもテストも通るため publish するまで気づけない。`check-dist-rules.mjs` で検査する | check:dist |
| 20 | **OIDC の Trusted Publishing は新規パッケージ名には使えない**。設定にパッケージの存在が要るため、token 交換が 404 になる。名前の初回だけ手で公開し、その後 Trusted Publisher を設定する | T-33 |
| 21 | **docs のコード例も型検査の対象にする**。ページに文字列で書くと契約の `@example` と同じことが起きる。`apps/docs/samples/*.tsx` に実ファイルとして置き、ページはそれを読んで表示する。`pnpm typecheck` が拾う | docs T-23 |
| 28 | **ノイズの大きい指標を絶対値でゲートにしない**。TBT は同一マシン・同一ページで 24〜565ms とぶれ、共有ランナーでは中央値でも閾値をまたぐ（207.5ms で CI が落ちた）。閾値を緩めず「最良値で見る」に変えた。一番速く走れたときですら遅いなら、それはノイズではなく退行 | lighthouserc.json |
| 38 | **未公開パッケージがワークスペースにあると、main への全マージで Release が落ちる**。`pnpm publish -r` が未公開のものを publish しようとし、Trusted Publisher の無い名前では OIDC の token 交換が通らない。**5回連続で失敗していたのに、リリース目的の push でなかったため誰も見ていなかった**。公開すれば直る（実際に直った）が、新パッケージを追加してから初回公開までの間は Release が赤くなり続ける | Release ワークフロー |
| 37 | **重複していても引き上げてはいけない**。2テーマの `.tsx` は 16/20 が完全一致だが、それは共通だからではなく**2本ともたまたま同じ構造を選んだだけ**。core に上げた瞬間、3本目はその判断に従うしかなくなる。構造差を作った4つ（modal 71% / tabs 90% / select 91% / button 98%）の一致率が低いのは正常で、**100% はまだ差を作る必要がなかったという意味しかない** | architecture.md §7 |
| 36 | **AI 向け出力はテーマごとに分ける**。llms.txt がデザイン規則を Raster 固定で出しており、Tactile を使う AI に「影は禁止」と伝えていた。規則はテーマの美学そのもので共通ではない。import 行も「最初のテーマ」固定で、両方にあるコンポーネントが片方でしか使えないように読めていた | generate-llms-txt.mjs |
| 35 | **生成物を読むタスクは turbo に依存を宣言する**。IR 生成が全テーマの dist を読むようになったのに `generate` に `dependsOn` が無く、**手元は既にビルド済みで通り CI だけが落ちた**。クリーンなチェックアウトでしか再現しない | turbo.json |
| 34 | **参照しただけのアニメーションは無音で効かない**。Raster の modal / popover / menu / toast は `animate-[novi-fade-in_…]` を参照しながら、`@keyframes novi-fade-in` がリポジトリのどこにも無かった。参照だけでは何も起きず、**静止画としては正しい**ためテストも視覚回帰も気づけない。モーションはテーマの美学なので、参照する側と定義する側を同じ生成 CSS に置き、「参照した animation 名が定義されているか」を検査に加えた | tactile / raster の theme-css.mjs（raster は #44 で修正・2026-09-06） |
| 33 | **`npx --yes <pkg>` を並列で走らせない**。tree-shaking 検査が毎回ダウンロードを試みており、テーマが2本になって並列実行された瞬間に npx のキャッシュ書き込みが競合して CI が落ちた。手元では1本ずつ動かすので再現しない。devDependency の実体を直接叩く | check-treeshaking.mjs |
| 32 | **掃引の対象を1面でも落とすと、通ったはずの値が通らない**。Tactile のトーンを承認したときの掃引が `subtle` 面を含めておらず、L54 では `soft` variant の文字色が 4.35:1 と基準割れしていた。実装時に検査を先に書いて発覚し L50 へ訂正。**律速は常に一番不利な地**（Peacock/`subtle`）で、地が複数あるなら全部を掃引に入れる | tactile-tokens.test.ts |
| 29 | **緩すぎる許容差の検査も、壊しても通る**。視覚回帰の `threshold` が既定 0.2 のままで、primary を別の色に差し替えても「差分 0 ピクセル」と判定されていた。ADR-R8（角丸 0→12px・hue 転回・影の追加）が基準を1枚も更新せずに CI を通っていたのが証拠。`maxDiffPixelRatio` を締めても効かない（そもそも差分として数えられていない）。`threshold: 0.05` にして基準を更新し、色を戻すと落ちることを変異で確認した | visual-regression.spec.ts |
| 30 | **基準は判定するのと同じ環境で作る**。#29 で閾値を締めた瞬間、CI（Linux）が5件落ちた。基準を手元（macOS）で撮っていたためで、環境差は元からあり緩い閾値が隠していた。**環境差（比 0.02）と本物の色変更（比 0.03）は近すぎて閾値では分離できない**。Actions の「視覚回帰の基準を更新」で Linux 上で撮り直す運用にした（開発者に Docker を要求しない） | update-snapshots.yml |
| 31 | **失敗時の成果物アップロードが一度も機能していなかった**。`if: failure()` の path が `.playwright` を指していたが、CI は `reporter: 'github'` で HTML を出さないためこのディレクトリは存在しない。`gh run download` が「no valid artifacts」と答えて初めて気づいた。実際に撮れた画像は `test-results` に出る | ci.yml |
| 27 | **観測点を間違えた検査は、壊しても通る**。IME の e2e で「DOM の keydown の `isComposing`」を見ていたが、ブラウザは変換中の keydown にも `isComposing: true` を立てて配信するため、抑制の有無で結果が変わらなかった。抑制を外しても通ることで気づいた。正しい観測点は**テーマの `onKeyDown` に届いた回数** | e2e/ime.spec.ts |
| 26 | **「レガシーに見える」は分解すると直せる**。原因は矩形・平板なオーバーレイ・hue 250 の青・泥色 warning・濃い境界線の5つで、どれも「ミニマル」の帰結ではなかった。旧美学はテスト9件が固定していたので、テストごと新設計に書き換えた（ADR-R8。ADR-R1 / R3 を廃止） | 02 design.md |
| 25 | **375px だけ見ても足りない**。320px で補助指標が、375px で別タブの数値が欠けた。タブは全状態を見ないと既定タブ以外の破綻に気づけない。横スクロールする表はスマホで読めないため、狭い画面では1件1ブロックに組み替える（ラベル列を揃えないと行ごとに改行位置が変わって不揃いに見える） | dashboard-showcase |
| 24 | **モバイルは別途検査しないと壊れる**。デスクトップのテストが全部通った状態で、375px ではヘッダーが縦書きに潰れ、デモが見切れ、コンポーネントナビが存在しなかった。grid の子は内容の最小幅より縮まない（`min-w-0` 必須）。Playwright の `devices[]` プリセットは `defaultBrowserType` を含み、spread すると CI に無いブラウザで起動しようとする | mobile.spec.ts |
| 23 | **テーマ実装の import を layout の依存から外す**。`theme-registry` の `import * as raster` が layout 経由で全ページに入り、デモの無いページまで 900KB 読んでいた。メタ情報（registry）と実装（theme-components）を分離して 564KB へ（−37%）。残りは React + Next の床 | docs T-38 |
| 22 | **CSS 変数名の作り方も1箇所に置く**。`raster.css` を出力しているのは生成器の中のロジックで、docs から参照できなかった。`tokens.data.mjs` に切り出し、CSS と IR が同じ定義から出る。ドキュメントの変数名がズレると、利用者の上書きが黙って効かなくなる | docs T-23 |
| 13 | **AI に説明する規則と CI が落とす規則を同じ定義から出す**。禁止クラスは検査スクリプトの中にしかなく IR から参照できなかった。`design-rules.data.mjs` に切り出し、検査と llms.txt / MCP が同じものを読む | ADR-A6 |
| 14 | **Markdown の表に型を書くと `\|` が表を壊す**。`'button' \| 'submit'` が列区切りとして解釈されていた。生成側でエスケープする | llms 生成器 |
| 15 | **型名のままでは AI が値を知れない**。`variant?: NoviVariant` だけでは何が通るか分からない。IR に `tokenTypes` を持たせ、docs の props 表・llms・MCP の3箇所が同じ展開を引く | IR |
| 16 | **日本語の検索は部分一致では当たらない**。「一覧から選ぶ」は「一覧から1つ選ばせたい」に文字列として現れない。意味の核が順番に現れるかで見る。英語は逆に語境界で縛らないと `tab` が `table` に当たる | ADR-A7 |
| 17 | **JSDoc の `@example` は誰も型検査していなかった**。Tabs の例が `<Tab>` / `<TabPanel>` を使っていたが実体は `TabItem` / `TabContent`。テストが全部通ったまま npm と docs に出ていた。例は AI が最も忠実に真似る部分で、間違っていると全員が同じ間違いをする。IR 生成時に「例が実在する export だけを使っているか」を検査する | 生成器 |
| 18 | **精度回帰テストは実際に不整合を見つけた**。22件中2件が不合格（上の #17 と、Toast の例が `toast` の作り方を示していなかった）。「AI 向けドキュメントが十分か」は書いた本人には判断できない | accuracy/ |

---

## 検証の原則（このプロジェクトで繰り返し効いた）

- **測る対象を間違えない**。バンドルサイズは dist のファイルサイズではなく「消費者が取り込む量」。tree-shaking は metafile で確認する
- **テストは変異させて確かめる**。わざと壊して落ちることを確認していない検査は、通っていても意味がない
- **jsdom では足りないものがある**。axe・カラースキームのカスケード・ホバーはブラウザでしか検証できない
- **推測せず実物を読む**。RAC のどのコンポーネントがどの `data-*` を出すかは型定義を読んで初めて分かる
