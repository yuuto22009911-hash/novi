# @novi-ui/flatlay — Implementation Tasks

| 項目 | 値 |
|------|-----|
| Status | **Approved** |
| Author | yuuto |
| Last Updated | 2026-08-26 |
| Requirements | [./requirements.md](./requirements.md) |
| Design | [./design.md](./design.md) |
| Blocked by | なし(スパイク成立済み・色は承認済み・着手条件は design.md で充足) |

> 各タスク完了時にチェック。受け入れ基準ID(AC-XX-X)または FR-XX で要件と対応付ける。
> **1コンポーネント = 1PR**。24契約が揃う前でも常に公開可能な状態を保つ。
>
> 実装順は Tactile と同じ思想: **着手条件の3つ(Modal / Select / Tabs)を Button の直後に作る**。
> ただし Flatlay はその前に **インフロー基盤(inflow.tsx)と core 封じ込め**が要る — スパイクの
> 製品化が Phase 1 に入っているのが両テーマとの違い。

---

## Phase 1: 土台

- [x] **T-01**: `packages/flatlay` 雛形。`package.json`(`repository` 宣言 / `sideEffects: false` / `publishConfig.access: public`)+ `tsdown.config.ts`(`unbundle: true`)+ `src/index.ts` 先頭に `'use client'` (1.5h) → NFR:バンドル, FR-13
- [x] **T-02**: **トークン検査を先に書く**。48判定(8色 × light/dark × 地・subtle・文字)+ 色域 + 罫線 chroma 帯域(0.02〜0.03)+ border-strong 3:1 + 中立 chroma 0 + 影が全段 `0 0 #0000` + radius 0/2/2/4 + duration 3値同一 + **反転押下(pressed の面/文字)のコントラスト** (3.5h) → AC-06-2, AC-06-3, FR-04, ADR-F3
- [x] **T-03**: `tokens.data.mjs` / `color-set.ts`(Stationery 決定値の転記)を確定し、生成器で `flatlay.css` / `flatlay.scoped.css` を出力。**罫線だけが色ごとに変わる出力**を生成器に実装 (3h) → FR-07, FR-08
- [x] **T-04**: `design-rules.data.mjs` + `check-design-rules.mjs`(design.md の表)。**変異テスト付き**(裸の `z-10` / `fixed` を badge に / `transition-[height]` / `sticky` をわざと置いて落ちることを検査) (3h) → AC-01-3, AC-01-4, FR-02, FR-03, FR-12
- [x] **T-05**: **core: `unstable/portal.ts`**(`INFLOW_PORTAL_PROP` 定数 + 型 + RAC 改名検知テスト)。core への変更はこの1ファイルのみ(Ask first 済み・ADR-F5) (1.5h) → FR-09, G5
- [x] **T-06**: **`styles/inflow.tsx`** — スパイクの InflowPopover を製品化(`isNonModal` / `static!` 系 / `INFLOW_PORTAL_PROP` 経由 / `scrollIntoView(nearest)`)。`UNSTABLE_` の直書きゼロを CI 検査に登録 (2.5h) → FR-05, FR-09
- [x] **T-07**: 共通断片(focus-ring 流用確認・mono 断片 `styles/mono.ts`)+ テスト基盤(5点セットヘルパ / testSlotContract / 横断検査の器) (2h) → AC-03-1, AC-04-1, FR-10
- [x] **T-08**: `.size-limit.json`(両テーマと同一予算)+ tree-shaking 検査 + カバレッジゲート 80% (1h) → NFR

## Phase 2: 基準パターンの確立

- [x] **T-09**: **Button 実装**。差分4点(罫線既定・mono 断片・反転押下・高さ 28/32/40) (3h) → FR-01, FR-10, FR-11
- [x] **T-10**: Button の5点セット + キーボード + `tv({ extend })` + **反転押下が pressed 解除で戻るテスト** (2h) → AC-04-2, AC-07-2
- [x] **T-11**: 基準パターンのレビューと固定(`packages/flatlay/README.md` に明記) (1h)

> **T-09〜T-11 が終わるまで他のコンポーネントに着手しない。**

## Phase 3: 着手条件の3つ(本 Spec の核心)

- [x] **T-12**: **Modal = 全画面テイクオーバー**。z-index なし(DOM 順)・overlay は紙色・header 左端の「← 戻る」closeButton・size は行長解釈 (4h) → AC-02-1, FR-06, ADR-F2
- [x] **T-13**: **Select = インフロー押し下げ**。inflow.tsx 経由・行高28・`▸` 選択表示・スパイクのキーボード通しをテストに恒久化 (4h) → AC-01-1, AC-02-2, AC-05-1
- [x] **T-14**: 押し下げ実測テスト(開で後続 Y 増・閉で復帰・viewport 外なら scrollIntoView) (2h) → AC-01-1, AC-01-2
- [x] **T-15**: **Tabs = 地続きタブ**。`-mb-px` + 下辺罫線の切れ目(indicator)・panel 上辺罫線 (3h) → AC-02-3
- [x] **T-16**: **3モデル構造差の横断検査**(Tactile T-45 の拡張。Modal/Select/Tabs の DOM 比較) (2h) → AC-02-4

> T-16 の「flatlay-probe ページを削除」は取り下げた。スパイクの残骸として消す前提だったが、
> T-14 の押し下げ実測(`e2e/inflow.spec.ts` 7件)がこのページを恒久の計測台として使っている。
> jsdom では測れない検査を捨てることになるので残す。`robots: noindex` + ナビ非掲載で
> 公開面には出ない。

> T-14 で実寸を測って初めて出た2件。どちらも jsdom では見えなかった。
> - 上流がインラインで書く `z-index: 100000` が残っていた → リセットに `z-auto!` を追加
> - 非モーダル Popover はスクロールで閉じる（`useCloseOnScroll`）。自前の追従スクロールが
>   自分を閉じ、さらに指の下でページが動いて誤選択まで起きていた →
>   スクロール由来の `close` を捨て、追従はポインタを離してから行う

## Phase 4: 入力系(残り)

- [x] **T-17**: Input / TextArea(罫線の枠・mono ラベル・IME フック) (3h) → AC-07-3
- [x] **T-18**: Checkbox / CheckboxGroup(2px 角の箱・チェックは `✓` mono) (2.5h)
- [x] **T-19**: Radio / RadioGroup(円は full 例外・選択 `▸` との使い分けを docs 注記) (2.5h)
- [x] **T-20**: Switch(矩形トラック 28×14・反転押下) (2.5h) → FR-11

> T-20 でつまみの動かし方を変えた。両テーマは `translate-x` で滑らせているが、
> Flatlay は transform を全面禁止している(FR-11)。`justify-start` /
> `group-data-[selected]:justify-end` の入れ替えで左右を即座に行き来させる。
> 滑走はレールの上をモノが動く表現で、押し下げに transition を付けないのと同根。
- [x] **T-21**: ColorPicker(Stationery 8色が既定で並ぶ。見本帳=方眼を罫線で / 選択は枠の反転) (3h) → FR-08

## Phase 5: 表示系

- [x] **T-22**: Card(罫線の枠・header/footer 罫線区切り・影なし) (2h)
- [x] **T-23**: Badge(2px 角・mono ラベル)/ Avatar(full 例外) (2.5h)

> T-23 で Avatar の badge の置き方を変えた。両テーマは `absolute` で枠の外へ
> 貼り出しているが、Flatlay の `position` 例外は Modal と Tooltip の2つで凍結
> してある(NG1)。`[grid-area:1/1]` で画像と同じ升に重ね、`self-end` で枠の
> 内側の下端に収める。重なりの順序は DOM 順だけが決めており、badge を最後の子に
> 置くことで上に描かれる。`ring-*` も box-shadow の実体を持つので使わない。
- [x] **T-24**: Progress(トラック2px・数値 mono)/ Spinner(rotate 例外)/ Skeleton(opacity パルス) (3h)

> T-24 で不確定 Progress の表現を変えた。両テーマは細い帯を `translate` で往復
> させているが、Flatlay は transform を持たない(FR-11)。全幅の線を引いたまま
> `animate-pulse` で濃さを脈打たせる。Skeleton の既定 radius も両テーマの `sm`
> から `none` にした。場所取りは記入前の空欄なので中身の角丸を先取りしない。

## Phase 6: オーバーレイ / ナビ系(残り)

- [x] **T-25**: Menu = インフロー押し下げ(`itemShortcut` を mono 右端で主役化) (3h) → FR-05, FR-10

> T-25 は Select の `InflowPopover` をそのまま再利用できた。スパイクで潰した2案
> （開いた時だけマウント / 常時マウントして hidden）を通っている実装なので、
> Menu 側で新しい判断は要らなかった。`placement` / `offset` は受け取るが効かない。
- [x] **T-26**: Popover = インフロー注記面 (2h) → FR-05

> T-26 は展開部（Select / Menu）と地の色で役割を分けた。一覧の続きは紙と同じ地（`bg`）、
> 注記は一段落とした地（`subtle`）。`arrow` は `hidden`（浮いていないので指す先が無い）。
> テストで面を掴むときは `[data-novi-inflow] [data-slot="root"]` まで降りること
> （トリガーの Button も `data-slot="root"` を持つため、素で引くと Button を掴む）。
- [x] **T-27**: Tooltip(例外2号・absolute・理由コメント)+ docs 注記 (2h) → ADR-F6

> T-27 で `position` の例外は2つ揃って凍結（Modal / Tooltip）。3つ目を足すときは
> 「z 軸を持たない」という主張そのものの見直しになる。Tooltip だけ `placement` /
> `offset` が**効く**（他の展開系は受け取るが効かない）ので README に明記した。
- [x] **T-28**: Toast = フロー挿入の帯(sticky 禁止・region 配置の推奨を docs に) (3h) → ADR-F4

> T-28 で判明: 上流の `ToastRegion` は `UNSTABLE_portalContainer` を**持たず**、
> 必ず `document.body` へポータルする。差し替え口は `UNSAFE_PortalProvider`（context）
> だけなので、core の `unstable/portal.ts` に `InflowPortalProvider` として追加し、
> `check-source-rules.mjs` の検査を `UNSTABLE_` から `UNSAFE_` にも広げた。
> あわせて core の peer に `react-aria` を足している（RAC の依存なので解決は保証済み）。
> FR-14 の「Provider を export しない」は**利用者に mount を強いる Provider**の話なので、
> テストの主張をその通りに書き直した（public-api.test.ts）。
- [x] **T-29**: Accordion(`▸/▾` mono・回転なし)/ Breadcrumbs(セパレータ `/` mono) (3h)

> 申し送り9: **Accordion は Flatlay の主役**。「開く = 場所を取る」を素で満たしていた
> 唯一のコンポーネントで、他の overlay をインフロー化して辿り着いた形に最初から居る。
> 印は行頭に置き `w-[1ch]` で幅を固定した（開閉で見出しの開始位置がずれない）。
> 右端（Raster / Tactile）だと見出しの長さで位置が変わり、列として縦に読めない。
> `solid` と `soft` は地色が同じため Flatlay では同じ見え方になる（README に明記）。
>
> 申し送り10: Breadcrumbs のリンクは**既定で下線**を持つ（Raster は hover 時のみ）。
> 現在地は色を変えず `font-medium` だけで示す。区切りは各項目が自分の前に描画し、
> 先頭だけ CSS で隠す（親で children を加工すると RAC の `<ol> > <li>` が壊れる）。
>
> 検証: flatlay 805 tests / 29 files 緑、design-rules 9 ルール違反なし（例外は5ファイルのまま）、
> source-rules / dist-rules 全緑、size 12.49 / 12.12 / **21.36** kB（上限 14 / 14 / 35 kB）。
> **Phase 6 完了。浮くのは Modal と Tooltip の2つで凍結。**

## Phase 7: パッケージ検収

- [x] **T-30**: 全24契約の slot 語彙レビュー(Raster T-41 / Tactile T-49 と同形式)。語彙の過不足・未描画 slot の意図確認 (2h) → AC-03-2

> **結論: 3本目でも語彙の追加・削除・差し戻しは 0。**（Raster T-41 / Tactile T-49 に続き3回連続）
> Flatlay は z 軸を捨てるという**最も過激な構造変更**を入れたテーマで、
> Popover / Select / Menu / Toast をインフローに、Modal を全画面に作り替えたが、
> それでも `slots` を1つも足していない。**契約が構造から独立している証拠がこれで揃った。**
>
> 語彙外の slot を発明していないことは、各コンポーネントの `testSlotContract` が
> `unknown` を毎回検査しているため CI で保証済み（AC-02-3・24契約すべて緑）。
>
> **未描画 slot の棚卸し（3テーマ横串）**
>
> | slot | Raster | Tactile | Flatlay | 判断 |
> |---|---|---|---|---|
> | `Popover.arrow` / `Tooltip.arrow` | 未描画 | 未描画 | 未描画(`hidden`) | **3/3 で一度も描かれていない** |
> | `Toast.icon` | 未描画 | 未描画 | 未描画(定義のみ) | **3/3 で一度も描かれていない** |
> | `Tabs.indicator` | 未描画 | **描画**(セグメンテッドの面) | 未描画(罫線の切れ目が印) | 1/3。語彙として正当 |
> | `Modal.header` | 描画 | 未描画 | 描画 | 2/3。任意 slot として正当 |
>
> `Tabs.indicator` と `Modal.header` は「テーマによって要る/要らない」が分かれた例で、
> 任意 slot という仕組みがまさに効いている。一方 **`arrow` と `Toast.icon` は
> 3本作って一度も使われなかった**。v0.3 の棚卸し（T-39）で削除を検討するが、
> **slot 語彙の削除は Ask first のため、ここでは提案に留めて実施しない。**
>
> 付随修正: `registry.ts` の JSDoc が「契約の数（23）」のままだった（ColorPicker 追加後は 24）。
> 数は `registry.test.ts` が検査しているので実害は無いが、読み手を誤らせるので直した。
- [x] **T-31**: 横断検査(variant-distinctness / coverage / 反転コントラスト)全通過 + axe light/dark 全通過 (2h) → AC-04-1, AC-07-1

> **axe を回すには flatlay が docs に載っている必要があるので、T-33 / T-34 を先に済ませた。**
> 依存の向きが tasks.md の並び（T-30〜T-32 → T-33〜T-37）と逆だった箇所。
>
> - variant-distinctness: 既に `cross-cutting.test.ts` にあり全緑。
> - **coverage: 検査が形だけだった**。「実装数が 0 でない」しか見ておらず、契約が揃った今も
>   抜けを検出できない。Raster と同じ「契約名 → 公開名」の対応表に置き換え、
>   24 契約すべてに実装があることを主張させた（Tactile も同じ形だけの検査のままなので、
>   直すなら別 PR）。
> - 反転コントラスト: `flatlay-tokens.test.ts` の「反転押下のコントラスト（ADR-F3）」で既に担保。
> - **axe: 既定テーマ（raster）しか回っていなかった**。同じ DOM でも配色と構造はテーマごとに
>   違い、とくに Flatlay は overlay をインフローに置き換えていて重なりの前提が他の2本と異なる。
>   `THEME_NAMES` を回す形に変え、**flatlay / tactile とも 22 デモ × light/dark = 44 件で violations 0**。
>
> Raster の `surface-contrast.test.ts`（背景を持つ slot は文字色も持つ）は flatlay に移植して
> **いない**。同じ検査を当てると ColorPicker の `item` が偽陽性になるため（反転時の文字色を
> 隣の `itemLabel` が `group-data-[selected]:` で持っており、ソースを slot 単位で見る
> ヒューリスティックには見えない）。実ブラウザの axe が本番の検査で、そちらは全緑。

- [x] **T-32**: **印刷スナップショット**(展開を含むページを print media で1点) (1.5h) → AC-08-1

> `visual-regression.spec.ts` に置いた。基準を撮り直すワークフロー（update-snapshots.yml）が
> **このファイルしか回していない**ため、別ファイルにすると基準が永久に更新されない。
>
> ピクセル比較の前に「展開部の下辺 <= 後続の上辺」を print メディア下で実測している。
> 浮いた実装に戻すとここが逆転して落ちるので、**基準画像が無くても原理は守られる**。
> 手元（macOS）で生成された基準は破棄した。判定と同じ Linux で撮る規律（STATUS #29 / #30）。
>
> 実測の見た目も確認済み: 展開（S / M / L）が紙面のフロー内に載り、「後続」がその下に
> 押し下がっている。重なりも欠落もない。**z 軸を捨てたことの配当がそのまま出た。**

## Phase 8: docs / AI 統合(Tactile design.md の登録点一覧に対応)

- [x] **T-33**: theme-registry(メタ1行)/ theme-components(import 1行)/ scoped.css 読み込み (1.5h)

> scoped.css の読み込みと `@source` は既に配線済みだった。足したのは registry のメタ1件と
> theme-components の import 1行、それと Lookbook の `SET_INFO`（Stationery の一文）だけ。
> 視覚回帰・axe・theme-switching はいずれも `THEME_NAMES` を回すので、登録した時点で対象に入る。

- [x] **T-34**: IR 登録(`themes.flatlay`・designRules・tokenTypes・colorSet)→ llms.txt / MCP / Lookbook に自動反映されることを確認 (2h) → FR-08

> `generate-component-index.mjs` の `THEME_SOURCES` に1件足すだけ（宣言どおり）。
> 検証: IR の `themes.flatlay` が tactile と同じキー構成（cssVariables / designRules /
> defaultColor / tone / colorSet）で生成され、24 契約すべてが `implementedBy` に flatlay を含む。
> llms.txt 8278 → 10060 B（上限 20000 B）、llms-full.txt 36356 → 39608 B。MCP 53 → **57 tests 緑**。
- [x] **T-35**: `/docs/themes/flatlay/` テーマ紹介ページ(z 軸なしの規律・赤の不在・ダブルエントリー・「動き」節) (3h)

> raster / tactile と同じ骨格（NumericRules / TokenTable / ProhibitedRules + 例外）に、
> Flatlay 固有の4節を足した: 影は全段が透明 / 赤がありません / 差し色が組で付いてきます /
> 動きは1本しかありません。最後に「印刷しても欠けません」を置いて、T-32 の検査と本文を繋げた。
>
> **`Preview` に `theme` を足した**（既定はヘッダー追従のまま）。追従のままだと
> 「罫線だけが染まる」の根拠として出す見本が、raster を選んでいる読者には
> **無彩の罫線**として出て主張の反証になる。raster / tactile のページと
> `ColorSwatches` も自分のテーマに固定した（tactile のページは以前から
> 既定の raster の値を見せていた）。
>
> サイト全体の axe に `/docs/themes/{tactile,flatlay}/` を追加。raster しか見ておらず、
> **tactile のテーマ紹介ページは一度も検査されていなかった**。7 パス緑。
>
> 副産物: T-29 で Accordion / Breadcrumbs の節を挿入したとき、挿入位置に指定した
> `### タブとパネルが地続きになります（Tabs）` と `### 進捗は罫線が引かれていきます（Progress）`
> の見出し行ごと置き換えてしまっていた。別コミット（f7818a2）で復旧。

- [x] **T-36**: 視覚回帰 / mobile / theme-switching e2e に flatlay を追加(基準は Linux ワークフローで生成) (2h)

> 視覚回帰と axe は `THEME_NAMES` を回すので T-33 の登録で対象に入っている。
> ここで足したのは残り2本。
>
> **mobile**: 375px で Select を開いた状態の横溢れを3テーマで見る。浮くもの
> （raster / tactile）は画面外に出れば済むが、**フローに入る flatlay は親の幅を
> 超えるとページごと横スクロールする**。一覧の在り処がテーマで違う
> （body へポータル / プレビュー内）ので、探すのはページ全体から。
> `/docs/themes/flatlay/` も横溢れの対象に追加（4列の比較表と8色の一覧を持つ）。
>
> **theme-switching**: AC-01-4（テーマを替えても JSX は変わらない）を raster でしか
> 見ていなかった。3テーマを回し、import 行以外が**完全一致**することを固定した。
>
> 基準画像は Linux ワークフローで生成した（**手元の macOS では撮らない**・STATUS #29 / #30）。
> flatlay 45 枚（22 デモ × light/dark + `flatlay-print-expanded.png`）が入り、133 passed。
> 既存の変更は `textarea-dark.png` の 4 バイトのみ。
>
> **1回目は Linux 側でビルドから落ちた。** `@novi-ui/mcp` の依存に flatlay が無く、
> turbo の `^build` が flatlay を先に建てないまま component-index の生成が走っていた。
> 手元は前回の dist が残るぶん常に成功し、**dist を消した CI だけが落ちる**種類の漏れ。
> `rm -rf packages/*/dist .turbo` で再現させてから直した（7f605b5）。
>
> なお1回目の dispatch は 6 時間 40 分 queued のままジョブが生成されず、
> cancel も「completed」と拒否された（GitHub 側で stuck）。投げ直しで解決。
- [x] **T-37**: accuracy をテーマ指定で実行(flatlay 指定時に flatlay の import が出るか) (1.5h)

> `pnpm accuracy --theme=flatlay` を追加。指定すると **import 先の不一致を不合格にする**。
> テーマを指名したのに既定の Raster が返る失敗は、型も禁止クラスも通ってしまうぶん
> 最も気づきにくい。禁止クラスの規則は**実際に import したテーマ**のものを当てる
> （指定側の規則で見ると別テーマのコードに無関係な違反が並び、本当の失敗が埋もれる）。
> `RULES_BY_THEME` に flatlay も登録（未登録だと raster の規則で判定していた）。
>
> **llms.txt の色名一覧で Flatlay の行が空だった。** テーマ名の配列（`['raster','tactile']`）を
> 手で持ち、色定義のモジュールを直接 import していたのが原因。IR から読むよう変えた。
> AI に「青焼き図面の青」を指定しても `blueprint` という名前がどこにも書かれていない状態で、
> **テーマ指定の試験を作ろうとして初めて見つかった**。
>
> 指示文を2件追加（`theme-flatlay-inflow` / `theme-flatlay-color`）。tactile の2件に倣い
> テーマ名は書かず「重なりを作らない」「紙に印刷して配る」と性格で指す。
> **生成物はまだ無い。** LLM 呼び出しはリリース前の手動手順（ADR-A5）なので、
> `pnpm accuracy` は未生成2件で落ちる状態。CI では回らないため影響はない。
>
> ハーネス自体は fixture で検証済み（flatlay を import した1件が ✓、raster の24件が
> `[theme] @novi-ui/raster を import している` で ✗）。検証に使った2件は消した
> （**偽の合格として残ると試験が嘘になる**）。その過程で既存の生成物
> `button.tsx` / `badge.tsx` を上書きしてしまい、この2件も未生成に戻っている。
>
> **生成完了（2026-08-29）。** 未生成だった4件（`button` / `badge` /
> `theme-flatlay-inflow` / `theme-flatlay-color`）を、`llms-full.txt` だけを読ませた
> サブエージェント4体で生成した。**リポジトリのコードは読ませていない**（利用者と同じ条件）。
> `pnpm accuracy` は **27 件全合格**。テーマ指名も 4/4 正解で、flatlay の2件は
> 「重なりを作らない」「開いた選択肢が他の内容に重ならない」という性格の記述だけから
> `@novi-ui/flatlay` を引けている。
>
> **合格したまま見つかった穴が1つ。** `theme-flatlay-color` の担当が
> 「Flatlay の色 id 一覧は `llms-full.txt` に載っていない。`blueprint` は
> 『青焼き図面の青』からの推定」と報告した。推定が当たったので試験は通ったが、
> **知らない色名は壊れず既定色に落ちるだけ**なので、外れても誰も気づかない。
> 色名一覧は short（`llms.txt`）にしか出ていなかった。PR
> [#19](https://github.com/yuuto22009911-hash/novi/pull/19) で full にも出すよう直し、
> 再生成して「推測ではなく一覧から引いた」に変わることを確認した。
> README の「不合格なら生成物ではなく `llms.txt` を直す」ループの、**合格したまま直す版**。

## Phase 9: リリースと v0.3 の判断

- [x] **T-38**: 初回手動 publish → Trusted Publisher 設定 → 以降 OIDC (1h)

> **PR #16 のマージで flatlay@0.0.0 が自動公開される寸前だった。** Release ワークフローは
> changesets の「changeset があれば version PR、無ければ publish」に従う。#16 に changeset が
> 1つも無かったため publish 側に進んだ。core / raster / tactile は既存バージョンと同じで
> skip されるが、**flatlay だけは npm 未登録なので 0.0.0 のまま公開される**。
> publish ステップの手前でキャンセルし、npm 未登録（404）を確認した。
>
> PR #17 で changeset を追加し、Release が version PR を作る側に戻ることを実測で確認した
> （**PR #18 `chore: release packages`** が生成され、npm は 404 のまま）。
> version は core 0.2.0→0.3.0 / **flatlay 0.0.0→0.1.0** / mcp 0.1.1→0.1.2 /
> raster 0.4.0→0.4.1 / tactile 0.2.0→0.2.1。
>
> **PR #18 をマージすると changeset が消費され、次の main push で publish が走る。**
> つまり #18 のマージが実質的な公開の引き金。ここが T-38 の判断点。
>
> **#18 をマージして publish が走った（2026-08-28）。既存3本は成功、flatlay だけ失敗。**
>
> | パッケージ | 結果 |
> |---|---|
> | `@novi-ui/core@0.3.0` | 公開成功（OIDC） |
> | `@novi-ui/raster@0.4.1` | 公開成功（OIDC） |
> | `@novi-ui/tactile@0.2.1` | 公開成功（OIDC） |
> | `@novi-ui/flatlay@0.1.0` | **失敗** `Skipped OIDC: ERR_PNPM_AUTH_TOKEN_EXCHANGE 404` → `E404 PUT` |
> | `@novi-ui/mcp@0.1.2` | 未公開（flatlay で `publish -r` が止まったため） |
>
> **Trusted Publisher は npm 上に存在するパッケージにしか設定できない。** 未登録の
> flatlay には設定しようがなく、OIDC のトークン交換が 404 になる。これが T-38 の
> 「初回手動 publish → Trusted Publisher 設定 → 以降 OIDC」という順序の理由そのもの。
>
> **`publish -r` は依存順に回り、mcp は flatlay の後。** つまり flatlay を通さない限り
> mcp も永久に公開されない。再実行しても同じ場所で止まる。
>
> **完了（2026-08-29）。** 上の4手順をこの順で実施した:
> 1. `npm login`（ユーザー本人）
> 2. `pnpm --filter @novi-ui/flatlay publish --access public --no-git-checks` → `flatlay@0.1.0`
> 3. npmjs.com の flatlay → Settings → Trusted Publisher に `yuuto22009911-hash/novi` /
>    `release.yml` / Environment 空欄 / Allowed actions は **`npm publish` のみ**を登録
>    （`npm stage publish` は release.yml が使わないので最小権限で外す）
> 4. Release を `workflow_dispatch` で再実行（run 33263734056）→ 全ステップ緑
>
> | パッケージ | npm 上の最終バージョン |
> |---|---|
> | `@novi-ui/core` | 0.3.0 |
> | `@novi-ui/raster` | 0.4.1 |
> | `@novi-ui/tactile` | 0.2.1 |
> | `@novi-ui/flatlay` | **0.1.0** |
> | `@novi-ui/mcp` | **0.1.2** |
>
> 以降 5 パッケージすべてが OIDC 経路に乗る。**次に新パッケージを足すときも同じ順序が要る**
> （未登録パッケージには Trusted Publisher を設定できないため、初回だけ手動 publish）。
- [x] **T-39**: **v0.3 の棚卸し(G7)**。3本の `.tsx` 一致率を実測し、architecture §7 の基準(3本一致・スタイル非含有・構造の自由を奪わない)で引き上げ可否を判定。結果を ADR として architecture.md に追記 (3h) → G7

> 一致率は**空行を除いた行の LCS × 2 ÷ 行数合計**で測った。この式で v0.2 の数値が
> 再現する（button 97.9% / select 90.4% / modal 72.6%）ので、2本目との比較が成立する。
>
> **3本完全一致は 21 件中 skeleton の1件だけ。** 2本の時点で 16 件あった 100% 一致が、
> 3本目を書いただけで 1 件に落ちた。とくに v0.2 が「引き上げるとしてもこれらに限る」と
> 名指しした popover / toast が **55.0% / 49.5%** で全体の最下位2つになった。
> 浮かせるかどうかという美学の判断が、そのまま構造の差になっている。
>
> 残った skeleton も引き上げない。引き上げるには `skeletonStyles` を外から渡す形しかなく、
> それは §7 が避けてきたファクトリそのもの。1件の重複のために構造の自由を手放すことになる。
>
> 結論を**ファクトリ不採用の恒久決定（ADR-09）**として architecture.md に追記し、
> §7 の段階表の v0.3 行も更新した。「一致率が上がっても再判定しない」を明記している
> （高い一致率は "共通だ" ではなく "まだ差を作る必要が無かった" の意味しか持たないため）。
>
> 付随: T-30 が挙げた未使用 slot（`arrow` / `Toast.icon`）は3本とも描かなかったことを
> 確認して §7 に記録した。**削除は公開 API の破壊的変更なので実施しない**（Ask first）。
> tactile の Popover に残っていた「Raster では〜」というコピペ由来の JSDoc も直した。

---

## Dependencies

```
T-01 → T-02 → T-03 → T-04
T-05 → T-06(inflow は core 定数に依存)
T-06, T-09〜T-11 → T-12〜T-16(着手条件)→ 以降の全コンポーネント
T-30〜T-32 → T-33〜T-37 → T-38 → T-39
```

## Definition of Done(全項目チェックで完了)

- [x] 24契約すべて実装・5点セット全通過・カバレッジ 80%（flatlay 99.57 / 93.02 / 100 / 100）
- [x] `z-index` 0 件・`fixed`/`absolute` は例外2ファイルのみ・影トークン全段 `0 0 #0000`(CI)
- [x] 押し下げ実測(開閉で後続 Y が増減)と3モデル構造差の横断検査が緑
- [x] 48判定 + 罫線染まり + 反転押下コントラストが CI で恒久化
- [x] `UNSTABLE_` の出現が core/unstable と inflow.tsx のみ(CI)
- [x] docs / IR / llms.txt / MCP / Lookbook / accuracy / 視覚回帰に登録済み
- [x] v0.3 棚卸しの ADR が architecture.md に追記済み

> **全タスク完了（T-38 の publish 含む）。** PR [#16](https://github.com/yuuto22009911-hash/novi/pull/16)
> / [#17](https://github.com/yuuto22009911-hash/novi/pull/17) / [#18](https://github.com/yuuto22009911-hash/novi/pull/18)
> はいずれもマージ済み、npm 公開も完了。
> 手元の全ゲート: 2047 tests / typecheck 10 パッケージ / lint / check:source / カバレッジ
> 全パッケージ 98〜100% がすべて緑。視覚回帰の基準は Linux で 133 passed。
>
> **手元で `pnpm test` を並列で回すと color-picker が 5 秒でタイムアウトすることがある。**
> 単体では 2.37 秒で、`--concurrency=1` なら全緑。3本目でテストが 830 件に増えたぶん
> CPU の食い合いが顕在化した。CI（専有ランナー）で再現するかは要観測。
