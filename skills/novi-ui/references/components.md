# Novi UI — component reference

Generated from the slot contracts (version 0.5.0). Props are identical across
`@novi-ui/raster`, `@novi-ui/tactile` and `@novi-ui/flatlay`; only the import package changes.

## Accordion

折りたたみできる項目の集合。

- Accessibility: 見出しは heading の中の button として提示され、Enter / Space で開閉する。 展開状態は `aria-expanded`、パネルとの対応は `aria-controls` で伝わる
- Keyboard: Enter / Space → 開閉; Tab → 見出しを順に移動
- Slots (`data-slot`): `root`, `item`, `heading`, `trigger`, `indicator`, `panel` (required: `root`, `item`, `heading`, `trigger`, `panel`)
- Docs: https://novi-42r.pages.dev/docs/components/accordion/

```tsx
<Accordion expandedKeys={open} onExpandedChange={setOpen}>
  <AccordionItem id="shipping" title="配送について">…</AccordionItem>
</Accordion>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `size` | `NoviSize` |  |  |
| `allowsMultipleExpanded` | `boolean` |  | 同時に複数を開けるようにする |
| `expandedKeys` | `string[]` |  |  |
| `defaultExpandedKeys` | `string[]` |  |  |
| `onExpandedChange` | `(keys: string[]) => void` |  |  |
| `isDisabled` | `boolean` |  |  |
| `disabledKeys` | `string[]` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof accordionSlots>` |  |  |

## Avatar

人や組織を表す画像。読み込みに失敗したら fallback を表示する。

- Accessibility: 画像が読めないときの頭文字表示には `role="img"` と `aria-label`（`name`）を与える。 `name` を省略すると誰を指すのか伝わらない
- Slots (`data-slot`): `root`, `image`, `fallback`, `badge` (required: `root`)
- Docs: https://novi-42r.pages.dev/docs/components/avatar/

```tsx
<Avatar src="/me.jpg" name="山本 太郎" />
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `radius` | `NoviRadius` |  |  |
| `src` | `string` |  |  |
| `name` | `string` |  | 画像の代替テキストと、fallback のイニシャル生成に使う |
| `fallback` | `ReactNode` |  | 画像がないときに表示する内容。未指定なら name のイニシャル |
| `badge` | `ReactNode` |  | 右下に重ねる小さな印。オンライン状態などに使う |
| `classNames` | `ClassNames<typeof avatarSlots>` |  |  |

## Badge

短いラベルで状態や分類を示す。

- Accessibility: `dot` は `aria-hidden`。色や点だけで状態を伝えず、必ずテキストでも読めるようにする
- Slots (`data-slot`): `root`, `dot`, `label` (required: `root`, `label`)
- Docs: https://novi-42r.pages.dev/docs/components/badge/

```tsx
<Badge color="success" variant="soft">公開中</Badge>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `size` | `NoviSize` |  |  |
| `color` | `NoviColor` |  |  |
| `radius` | `NoviRadius` |  |  |
| `withDot` | `boolean` |  | 先頭にドットを表示する |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof badgeSlots>` |  |  |

## Breadcrumbs

階層の中で現在どこにいるかを示す。

- Accessibility: `nav[aria-label]` として提示され、現在地は `aria-current="page"`。区切り記号は `aria-hidden`
- Keyboard: Tab → リンクを順に移動; Enter → 移動する
- Slots (`data-slot`): `root`, `list`, `item`, `link`, `separator`, `current` (required: `root`, `list`, `item`)
- Docs: https://novi-42r.pages.dev/docs/components/breadcrumbs/

```tsx
<Breadcrumbs>
  <Breadcrumb href="/">ホーム</Breadcrumb>
  <Breadcrumb href="/docs">ドキュメント</Breadcrumb>
  <Breadcrumb>Button</Breadcrumb>
</Breadcrumbs>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `separator` | `ReactNode` |  | 区切り文字。既定はテーマが決める |
| `isDisabled` | `boolean` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof breadcrumbsSlots>` |  |  |

## Button

ボタン。

- Accessibility: Enter / Space で発火する。`onPress` はマウス・タッチ・ペン・キーボードを統一的に扱う。 `isLoading` 中の spinner は `aria-hidden`
- Keyboard: Enter / Space → 押す
- Slots (`data-slot`): `root`, `startContent`, `label`, `endContent`, `spinner` (required: `root`, `label`)
- Docs: https://novi-42r.pages.dev/docs/components/button/

```tsx
<Button variant="solid" color="primary" onPress={() => save()}>
  保存
</Button>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `size` | `NoviSize` |  |  |
| `color` | `NoviColor` |  |  |
| `radius` | `NoviRadius` |  |  |
| `isDisabled` | `boolean` |  | 無効化する。`disabled` ではないので注意（React Aria 準拠） |
| `isLoading` | `boolean` |  | 読み込み中。spinner slot を描画し、操作を受け付けない |
| `type` | `'button' \| 'submit' \| 'reset'` |  |  |
| `onPress` | `() => void` |  | 押下時。`onClick` ではないので注意（タッチ・ペン・キーボードを統一的に扱う） |
| `startContent` | `ReactNode` |  |  |
| `endContent` | `ReactNode` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof buttonSlots>` |  |  |

## Card

情報のまとまりを囲む器。

- Accessibility: `onPress` を渡したときだけ button になり、Enter / Space で発火してフォーカスリングが付く。 渡さなければ非対話の器のままで、タブ順に入らない
- Keyboard: Enter / Space → 押す（`onPress` があるときだけフォーカスに入る）
- Slots (`data-slot`): `root`, `header`, `body`, `footer`, `image` (required: `root`, `body`)
- Docs: https://novi-42r.pages.dev/docs/components/card/

```tsx
<Card>
  <CardHeader>売上</CardHeader>
  <CardBody>¥1,240,000</CardBody>
</Card>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `radius` | `NoviRadius` |  |  |
| `onPress` | `() => void` |  | 押せるカードにする。指定すると role とキーボード操作が付く |
| `isDisabled` | `boolean` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof cardSlots>` |  |  |

## Checkbox

チェックボックス。

- Accessibility: Space でトグルする。ラベルは入力と関連付けられ、ラベル文字の押下でも反応する
- Keyboard: Space → 切り替える
- Slots (`data-slot`): `root`, `control`, `indicator`, `label`, `description` (required: `root`, `control`)
- Docs: https://novi-42r.pages.dev/docs/components/checkbox/

```tsx
<Checkbox isSelected={agreed} onChange={setAgreed}>
  利用規約に同意する
</Checkbox>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `color` | `NoviColor` |  |  |
| `value` | `string` |  |  |
| `isSelected` | `boolean` |  | 選択状態。`checked` ではないので注意（React Aria 準拠） |
| `defaultSelected` | `boolean` |  |  |
| `onChange` | `(isSelected: boolean) => void` |  |  |
| `isIndeterminate` | `boolean` |  | 一部だけ選択されている状態 |
| `isDisabled` | `boolean` |  |  |
| `isReadOnly` | `boolean` |  |  |
| `isRequired` | `boolean` |  |  |
| `isInvalid` | `boolean` |  |  |
| `description` | `ReactNode` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof checkboxSlots>` |  |  |

## CheckboxGroup

チェックボックスのグループ。ラベル・エラーをまとめて扱う。

- Accessibility: group として提示され、`label` がグループ名になる。エラーはグループに対して1つ出し、 `aria-describedby` で各入力から参照される
- Keyboard: Tab → 項目を順に移動; Space → 切り替える
- Slots (`data-slot`): `root`, `label`, `list`, `description`, `errorMessage` (required: `root`, `list`)
- Docs: https://novi-42r.pages.dev/docs/components/checkboxgroup/

```tsx
<CheckboxGroup label="通知方法" value={ways} onChange={setWays}>
  <Checkbox value="email">メール</Checkbox>
  <Checkbox value="sms">SMS</Checkbox>
</CheckboxGroup>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `color` | `NoviColor` |  |  |
| `label` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  |  |
| `name` | `string` |  |  |
| `value` | `string[]` |  |  |
| `defaultValue` | `string[]` |  |  |
| `onChange` | `(value: string[]) => void` |  |  |
| `orientation` | `'horizontal' \| 'vertical'` |  |  |
| `isDisabled` | `boolean` |  |  |
| `isReadOnly` | `boolean` |  |  |
| `isRequired` | `boolean` |  |  |
| `isInvalid` | `boolean` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof checkboxGroupSlots>` |  |  |

## ColorPicker

テーマのカラーセットから1色を選ぶ。選んだ値を `data-novi-color` に渡すと配色が変わる。

**色の一覧はテーマが持っている。** Raster なら Print Inks、Tactile なら Textile Dyes が
既定で並ぶ。同じ `<ColorPicker />` がテーマによって違う染料を見せる。

- Accessibility: radiogroup として提示され、矢印キーで色を移動する。選択は色だけでなく `indicator` でも示す。各色には名前が読み上げられる
- Keyboard: ← → ↑ ↓ → 色を移動して選ぶ
- Slots (`data-slot`): `root`, `label`, `description`, `errorMessage`, `list`, `item`, `swatch`, `indicator`, `itemLabel` (required: `root`, `list`, `item`, `swatch`)
- Docs: https://novi-42r.pages.dev/docs/components/colorpicker/

```tsx
// 色 id を書かない。未指定ならテーマの既定色から始まる
const [color, setColor] = useState<string>()
return (
  <div data-novi-color={color}>
    <ColorPicker label="配色" onChange={setColor} />
  </div>
)
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `label` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  |  |
| `value` | `string` |  | 選択中の色の id。制御する場合に渡す |
| `defaultValue` | `string` |  | 非制御時の初期値。未指定ならテーマの既定色 |
| `onChange` | `(colorId: string) => void` |  |  |
| `colors` | `readonly NoviColorOption[]` |  | 並べる色。**省略時はテーマのカラーセット全色**。順序も含めてそのまま出す |
| `showLabels` | `boolean` |  | 色名を各スウォッチの下に出す。既定は false（スウォッチだけ並べる） |
| `isDisabled` | `boolean` |  |  |
| `isReadOnly` | `boolean` |  |  |
| `isRequired` | `boolean` |  |  |
| `isInvalid` | `boolean` |  |  |
| `name` | `string` |  |  |
| `classNames` | `ClassNames<typeof colorPickerSlots>` |  |  |

## ComboBox

文字を打って絞り込み、一覧から1つ選ぶ。選択肢が 20 件を超えるなら Select ではなくこちら。

絞り込みは入力文字を含む項目（大文字小文字・全角半角の差を吸収）。
IME 変換中の Enter と矢印キーは一覧に届かない（変換確定で誤選択しない）。

- Accessibility: 入力欄は `role="combobox"`、一覧は `role="listbox"`。ArrowDown で開いて項目を移動、 Enter で決定、Escape で閉じる。IME 変換中の Enter と矢印キーは抑制される。 `description` と `errorMessage` は `aria-describedby` で関連付く
- Keyboard: 文字を打つ → 絞り込んで開く; ↓ ↑ → 開いて項目を移動; Enter → 決定; Escape → 閉じる
- Slots (`data-slot`): `root`, `label`, `inputWrapper`, `input`, `trigger`, `icon`, `popover`, `listbox`, `option`, `description`, `errorMessage` (required: `root`, `inputWrapper`, `input`, `popover`, `listbox`, `option`)
- Docs: https://novi-42r.pages.dev/docs/components/combobox/

```tsx
<ComboBox label="都道府県" onSelectionChange={setPref}>
  <ComboBoxItem id="tokyo">東京都</ComboBoxItem>
  <ComboBoxItem id="osaka">大阪府</ComboBoxItem>
</ComboBox>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `size` | `NoviSize` |  |  |
| `radius` | `NoviRadius` |  |  |
| `label` | `ReactNode` |  |  |
| `placeholder` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  | `isInvalid` のときに表示する。色だけに頼らずテキストを必ず伴う（WCAG 1.4.1） |
| `name` | `string` |  |  |
| `selectedKey` | `string \| null` |  |  |
| `defaultSelectedKey` | `string` |  |  |
| `onSelectionChange` | `(key: string \| null) => void` |  |  |
| `inputValue` | `string` |  | 入力欄の文字列。制御したい場合に使う |
| `defaultInputValue` | `string` |  |  |
| `onInputChange` | `(value: string) => void` |  |  |
| `allowsCustomValue` | `boolean` |  | 一覧に無い文字列をそのまま値として残す。既定は選択肢に戻す |
| `menuTrigger` | `'focus' \| 'input' \| 'manual'` |  | 一覧を開くきっかけ。既定は `input`（文字を打つと開く） |
| `onOpenChange` | `(isOpen: boolean) => void` |  | 開閉の通知。開閉そのものは制御できない（React Aria の ComboBox は入力とキー操作から 開閉を導くため）。開きたいときは `menuTrigger="focus"` を使う |
| `onKeyDown` | `KeyboardEventHandler<HTMLInputElement>` |  | 入力欄のキー操作。**IME 変換中のキーはここに届かない**（テーマが core の `useImeSafeKeys` を通す）。 |
| `isDisabled` | `boolean` |  |  |
| `isReadOnly` | `boolean` |  |  |
| `isRequired` | `boolean` |  |  |
| `isInvalid` | `boolean` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof comboBoxSlots>` |  |  |

## DatePicker

日付を入力する。年 / 月 / 日のマスに直接打つか、カレンダーを開いて選ぶ。

値は React Aria の `DateValue`（`@internationalized/date` の `CalendarDate`）。
文字列や `Date` は受けない。`parseDate('2026-09-05')` で作る（ADR-B6）。

- Accessibility: 年 / 月 / 日の各マスは `spinbutton` で、矢印キーの上下で値が変わり、左右で隣のマスへ移る。 トリガーでカレンダーが開き、矢印キーで日を移動、Enter で決定、Escape で閉じる。 `minValue` / `maxValue` の外と `isDateUnavailable` の日は選べない。 `description` と `errorMessage` は `aria-describedby` で関連付く
- Keyboard: ↑ ↓ → マスの値を増減; ← → → 隣のマスへ; Backspace → マスを空にする; ← → ↑ ↓（カレンダー） → 日を移動; PageUp / PageDown（カレンダー） → 前後の月へ; Enter（カレンダー） → 日を決定; Escape → カレンダーを閉じる
- Slots (`data-slot`): `root`, `label`, `inputWrapper`, `dateInput`, `segment`, `trigger`, `icon`, `popover`, `calendar`, `calendarHeader`, `calendarTitle`, `prevButton`, `nextButton`, `calendarGrid`, `calendarCell`, `description`, `errorMessage` (required: `root`, `inputWrapper`, `dateInput`, `segment`, `trigger`, `popover`, `calendar`, `calendarGrid`, `calendarCell`)
- Docs: https://novi-42r.pages.dev/docs/components/datepicker/

```tsx
<DatePicker label="出荷日" value={date} onChange={setDate} minValue={today} />
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `size` | `NoviSize` |  |  |
| `radius` | `NoviRadius` |  |  |
| `label` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  | `isInvalid` のときに表示する。色だけに頼らずテキストを必ず伴う（WCAG 1.4.1） |
| `name` | `string` |  |  |
| `value` | `DateValue \| null` |  | `@internationalized/date` の `CalendarDate`。未入力は `null` |
| `defaultValue` | `DateValue` |  |  |
| `onChange` | `(value: DateValue \| null) => void` |  |  |
| `minValue` | `DateValue` |  | この日より前は選べない |
| `maxValue` | `DateValue` |  | この日より後は選べない |
| `isDateUnavailable` | `(date: DateValue) => boolean` |  | 選べない日を個別に決める（定休日など） |
| `placeholderValue` | `DateValue` |  | 未入力のとき、カレンダーが最初に開く月と、マスに薄く出る値 |
| `isOpen` | `boolean` |  | 開閉状態。制御したい場合に使う |
| `defaultOpen` | `boolean` |  |  |
| `onOpenChange` | `(isOpen: boolean) => void` |  |  |
| `isDisabled` | `boolean` |  |  |
| `isReadOnly` | `boolean` |  |  |
| `isRequired` | `boolean` |  |  |
| `isInvalid` | `boolean` |  |  |
| `classNames` | `ClassNames<typeof datePickerSlots>` |  |  |

## Input

1行テキスト入力。

IME 変換中の Enter は core の `useImeSafeKeys` により抑制される。

- Accessibility: `label` は必須。`description` と `errorMessage` は `aria-describedby` で関連付く。 IME 変換中の Enter は抑制されるため、変換確定が送信に化けない
- Keyboard: Enter → フォームを送信（IME 変換中は送信しない）; Tab → 次の欄へ
- Slots (`data-slot`): `root`, `label`, `inputWrapper`, `input`, `startContent`, `endContent`, `description`, `errorMessage` (required: `root`, `inputWrapper`, `input`)
- Docs: https://novi-42r.pages.dev/docs/components/input/

```tsx
<Input
  label="メールアドレス"
  type="email"
  isRequired
  description="ログインに使用します"
/>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `size` | `NoviSize` |  |  |
| `radius` | `NoviRadius` |  |  |
| `label` | `ReactNode` |  |  |
| `placeholder` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  | `isInvalid` のときに表示する。色だけに頼らずテキストを必ず伴う（WCAG 1.4.1） |
| `type` | `'text' \| 'email' \| 'password' \| 'search' \| 'tel' \| 'url'` |  |  |
| `name` | `string` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onChange` | `(value: string) => void` |  |  |
| `onKeyDown` | `KeyboardEventHandler<HTMLInputElement>` |  | キー操作。**IME 変換中のキーはここに届かない**（テーマが core の `useImeSafeKeys` を通す）。 変換確定の Enter で送信が暴発する事故を、利用側が意識せずに防げる。 |
| `isDisabled` | `boolean` |  |  |
| `isReadOnly` | `boolean` |  |  |
| `isRequired` | `boolean` |  |  |
| `isInvalid` | `boolean` |  |  |
| `startContent` | `ReactNode` |  |  |
| `endContent` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof inputSlots>` |  |  |

## Menu

トリガーから開く操作の一覧。矢印キーで移動、Escape で閉じる。

IME 変換中の Enter は core の `useImeSafeKeys` により抑制される。

- Accessibility: 矢印キーで移動、Enter で決定、Escape で閉じる。開いている間はメニュー外を読み上げ対象から外す。 IME 変換中の Enter は抑制される
- Keyboard: Enter / Space / ↓（トリガー） → 開く; ↑ ↓ → 項目を移動; Enter → 決定; Escape → 閉じる
- Slots (`data-slot`): `trigger`, `popover`, `list`, `item`, `itemLabel`, `itemDescription`, `itemShortcut`, `separator`, `section`, `sectionLabel` (required: `trigger`, `popover`, `list`, `item`)
- Docs: https://novi-42r.pages.dev/docs/components/menu/

```tsx
<Menu onAction={(key) => run(key)}>
  <Button>操作</Button>
  <MenuItem id="rename">名前を変更</MenuItem>
  <MenuItem id="delete">削除</MenuItem>
</Menu>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `placement` | `NoviPlacement` |  |  |
| `offset` | `number` |  |  |
| `isOpen` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `onOpenChange` | `(isOpen: boolean) => void` |  |  |
| `onAction` | `(key: string) => void` |  | 項目が選ばれたとき。id が渡る |
| `isDisabled` | `boolean` |  |  |
| `disabledKeys` | `string[]` |  | 選択不可にする項目の id |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof menuSlots>` |  |  |

## Modal

モーダルダイアログ。開いている間フォーカスは内側に閉じ込められ、Escape で閉じる。

- Accessibility: 開いている間フォーカスは内側に閉じ込められ、Escape で閉じる （`isKeyboardDismissDisabled` で無効化できる）。閉じるボタンには `aria-label` がある
- Keyboard: Tab / Shift+Tab → 中の要素を巡回（外へ出ない）; Escape → 閉じる
- Slots (`data-slot`): `backdrop`, `panel`, `header`, `title`, `closeButton`, `body`, `footer` (required: `backdrop`, `panel`, `body`)
- Docs: https://novi-42r.pages.dev/docs/components/modal/

```tsx
<Modal isOpen={isOpen} onOpenChange={setIsOpen} size="md">
  <ModalTitle>削除しますか</ModalTitle>
  <ModalBody>この操作は取り消せません。</ModalBody>
</Modal>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize \| 'full'` |  |  |
| `radius` | `NoviRadius` |  |  |
| `isOpen` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `onOpenChange` | `(isOpen: boolean) => void` |  |  |
| `isDismissable` | `boolean` |  | 背景クリックで閉じられるようにする |
| `isKeyboardDismissDisabled` | `boolean` |  | Escape で閉じるのを無効にする |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof modalSlots>` |  |  |

## NumberField

数値の入力。矢印キーと増減ボタンで `step` ずつ刻み、`Intl.NumberFormat` の書式（通貨・%・単位）で表示する。

空欄は `NaN` ではなく `null` として `onChange` に渡す（ADR-B2）。

- Accessibility: `label` は必須。ArrowUp / ArrowDown で `step` ずつ増減し、`minValue` / `maxValue` で止まる。 増減ボタンは名前を持つ。`description` と `errorMessage` は `aria-describedby` で関連付く。 IME 変換中の Enter は抑制される
- Keyboard: ↑ ↓ → `step` ずつ増減; PageUp / PageDown → 大きく増減; Home / End → 最小 / 最大へ
- Slots (`data-slot`): `root`, `label`, `inputWrapper`, `input`, `decrement`, `increment`, `description`, `errorMessage` (required: `root`, `inputWrapper`, `input`)
- Docs: https://novi-42r.pages.dev/docs/components/numberfield/

```tsx
<NumberField
  label="数量"
  defaultValue={1}
  minValue={0}
  step={1}
/>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `size` | `NoviSize` |  |  |
| `radius` | `NoviRadius` |  |  |
| `label` | `ReactNode` |  |  |
| `placeholder` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  | `isInvalid` のときに表示する。色だけに頼らずテキストを必ず伴う（WCAG 1.4.1） |
| `name` | `string` |  |  |
| `value` | `number \| null` |  | 空欄は `null`。`NaN` は使わない |
| `defaultValue` | `number` |  |  |
| `onChange` | `(value: number \| null) => void` |  | 空欄になったときは `null` を受け取る |
| `minValue` | `number` |  |  |
| `maxValue` | `number` |  |  |
| `step` | `number` |  | 矢印キーと増減ボタンの刻み。既定は 1 |
| `formatOptions` | `Intl.NumberFormatOptions` |  | 表示の書式。`Intl.NumberFormat` のオプションをそのまま渡す。 @example { style: 'currency', currency: 'JPY' } { style: 'percent' } { style: 'unit', unit: 'kilogram' } |
| `onKeyDown` | `KeyboardEventHandler<HTMLInputElement>` |  | キー操作。**IME 変換中のキーはここに届かない**（テーマが core の `useImeSafeKeys` を通す）。 |
| `isDisabled` | `boolean` |  |  |
| `isReadOnly` | `boolean` |  |  |
| `isRequired` | `boolean` |  |  |
| `isInvalid` | `boolean` |  |  |
| `classNames` | `ClassNames<typeof numberFieldSlots>` |  |  |

## Pagination

一覧のページを移動する。現在ページは `aria-current` で示し、先頭と末尾のあいだが空くときだけ省略記号で詰める。

並べる数列は core の `paginationRange`（`@novi-ui/core/client`）が決め、マスの総数は
ページによらず一定なので、進めても幅が揺れない。

- Accessibility: 根要素は `nav` で名前を持つ（既定「ページ送り」）。現在ページは `aria-current="page"`。 前へ / 次へは端で無効になる。省略記号は読み上げの対象にしない。 各ボタンは Tab で辿れ、Enter / Space で押せる
- Keyboard: Tab → ボタンを順に移動; Enter / Space → そのページへ
- Slots (`data-slot`): `root`, `list`, `item`, `prev`, `next`, `ellipsis` (required: `root`, `list`, `item`, `prev`, `next`)
- Docs: https://novi-42r.pages.dev/docs/components/pagination/

```tsx
<Pagination total={10} page={page} onChange={setPage} />
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `radius` | `NoviRadius` |  |  |
| `total` | `number` | yes | 総ページ数 |
| `page` | `number` |  | 現在のページ（1 始まり）。制御したい場合に使う |
| `defaultPage` | `number` |  |  |
| `onChange` | `(page: number) => void` |  |  |
| `siblingCount` | `number` |  | 現在ページの両隣に出す数。既定は 1 |
| `boundaryCount` | `number` |  | 先頭と末尾に必ず出す数。既定は 1 |
| `isDisabled` | `boolean` |  |  |
| `classNames` | `ClassNames<typeof paginationSlots>` |  |  |

## Popover

トリガーに紐づいて浮かぶ小さな面。Escape で閉じてトリガーへフォーカスが戻る。

- Accessibility: Escape で閉じ、フォーカスはトリガーへ戻る
- Keyboard: Enter / Space（トリガー） → 開く; Escape → 閉じてトリガーへ戻る
- Slots (`data-slot`): `root`, `arrow`, `content` (required: `root`, `content`)
- Docs: https://novi-42r.pages.dev/docs/components/popover/

```tsx
<Popover placement="bottom">
  <Button>詳細</Button>
  <PopoverContent>ここに補足を書く</PopoverContent>
</Popover>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `radius` | `NoviRadius` |  |  |
| `placement` | `NoviPlacement` |  |  |
| `offset` | `number` |  |  |
| `isOpen` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `onOpenChange` | `(isOpen: boolean) => void` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof popoverSlots>` |  |  |

## Progress

進捗の表示。`value` を省略すると不確定（indeterminate）表示になる。

`prefers-reduced-motion` が有効なときはアニメーションを停止する。

- Accessibility: progressbar として現在値・最小値・最大値を伝える。`label` を省略すると何の進捗か分からない
- Slots (`data-slot`): `root`, `label`, `track`, `indicator`, `valueLabel` (required: `root`, `track`, `indicator`)
- Docs: https://novi-42r.pages.dev/docs/components/progress/

```tsx
<Progress label="アップロード中" value={62} />
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `color` | `NoviColor` |  |  |
| `label` | `ReactNode` |  |  |
| `value` | `number` |  | 省略すると不確定表示になる |
| `minValue` | `number` |  |  |
| `maxValue` | `number` |  |  |
| `showValueLabel` | `boolean` |  | 数値ラベルを表示する |
| `classNames` | `ClassNames<typeof progressSlots>` |  |  |

## Radio

ラジオボタン。単体では使わず、必ず RadioGroup の中に置く。

- Accessibility: 単体では意味を持たない。必ず RadioGroup の中に置く
- Slots (`data-slot`): `root`, `control`, `indicator`, `label`, `description` (required: `root`, `control`)
- Docs: https://novi-42r.pages.dev/docs/components/radio/

```tsx
<Radio value="express">速達</Radio>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `value` | `string` | yes | グループ内で一意の値。必須 |
| `size` | `NoviSize` |  |  |
| `color` | `NoviColor` |  |  |
| `isDisabled` | `boolean` |  |  |
| `description` | `ReactNode` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof radioSlots>` |  |  |

## RadioGroup

ラジオボタンのグループ。矢印キーで項目間を移動できる。

- Accessibility: radiogroup として提示され、矢印キーで項目間を移動する。Tab はグループ単位で出入りする
- Keyboard: ↑ ↓ ← → → 項目を移動して選ぶ; Tab → グループの外へ
- Slots (`data-slot`): `root`, `label`, `list`, `description`, `errorMessage` (required: `root`, `list`)
- Docs: https://novi-42r.pages.dev/docs/components/radiogroup/

```tsx
<RadioGroup label="配送方法" value={method} onChange={setMethod}>
  <Radio value="standard">通常</Radio>
  <Radio value="express">速達</Radio>
</RadioGroup>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `color` | `NoviColor` |  |  |
| `label` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  |  |
| `name` | `string` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onChange` | `(value: string) => void` |  |  |
| `orientation` | `'horizontal' \| 'vertical'` |  |  |
| `isDisabled` | `boolean` |  |  |
| `isReadOnly` | `boolean` |  |  |
| `isRequired` | `boolean` |  |  |
| `isInvalid` | `boolean` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof radioGroupSlots>` |  |  |

## Select

一覧から1つ選ぶ。矢印キーで移動、Escape で閉じてトリガーへフォーカスが戻る。

IME 変換中の Enter は core の `useImeSafeKeys` により抑制される。

- Accessibility: 矢印キーで移動、Enter で決定、Escape で閉じてトリガーへフォーカスが戻る。 IME 変換中の Enter は抑制されるため、変換確定で誤決定しない
- Keyboard: Enter / Space / ↓ → 開く; ↑ ↓ → 項目を移動; Enter → 決定; Escape → 閉じてトリガーへ戻る; 文字 → 頭文字の項目へ飛ぶ
- Slots (`data-slot`): `root`, `label`, `trigger`, `value`, `icon`, `popover`, `listbox`, `option`, `description`, `errorMessage` (required: `root`, `trigger`, `value`, `popover`, `listbox`, `option`)
- Docs: https://novi-42r.pages.dev/docs/components/select/

```tsx
<Select label="都道府県" selectedKey={pref} onSelectionChange={setPref}>
  <SelectItem id="tokyo">東京都</SelectItem>
  <SelectItem id="osaka">大阪府</SelectItem>
</Select>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `size` | `NoviSize` |  |  |
| `radius` | `NoviRadius` |  |  |
| `label` | `ReactNode` |  |  |
| `placeholder` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  |  |
| `name` | `string` |  |  |
| `selectedKey` | `string \| null` |  |  |
| `defaultSelectedKey` | `string` |  |  |
| `onSelectionChange` | `(key: string \| null) => void` |  |  |
| `isOpen` | `boolean` |  | 開閉状態。制御したい場合に使う |
| `defaultOpen` | `boolean` |  |  |
| `onOpenChange` | `(isOpen: boolean) => void` |  |  |
| `isDisabled` | `boolean` |  |  |
| `isRequired` | `boolean` |  |  |
| `isInvalid` | `boolean` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof selectSlots>` |  |  |

## Skeleton

読み込み中の場所取り。

支援技術には読ませない（`aria-hidden`）。読み込み状態は Spinner か live region で伝える。
`prefers-reduced-motion` が有効なときはアニメーションを減衰させる。

- Accessibility: `aria-hidden` で支援技術には読ませない。読み込み中であることは Spinner か live region で別に伝える
- Slots (`data-slot`): `root` (required: `root`)
- Docs: https://novi-42r.pages.dev/docs/components/skeleton/

```tsx
<Skeleton className="h-4 w-40" />
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `radius` | `NoviRadius` |  |  |
| `classNames` | `ClassNames<typeof skeletonSlots>` |  |  |

## Spinner

処理中であることを示す回転表示。

`prefers-reduced-motion` が有効なときは回転を止める。

- Accessibility: `role="status"` で読み込み中を伝える。図形は `aria-hidden` で、`label` が読み上げ文になる
- Slots (`data-slot`): `root`, `circle`, `label` (required: `root`, `circle`)
- Docs: https://novi-42r.pages.dev/docs/components/spinner/

```tsx
<Spinner label="読み込み中" />
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `color` | `NoviColor` |  |  |
| `label` | `ReactNode` |  | 視覚的に表示するか、支援技術向けにのみ読ませるラベル |
| `classNames` | `ClassNames<typeof spinnerSlots>` |  |  |

## Switch

オン / オフの切り替え。

状態が形状だけで伝わりにくいテーマもあるため、ラベルの併記を推奨する。

- Accessibility: Space で切り替える。状態は `aria-checked` で伝わるが、色と形だけに依存せずラベルを併記する
- Keyboard: Space → 切り替える
- Slots (`data-slot`): `root`, `track`, `thumb`, `label`, `description` (required: `root`, `track`, `thumb`)
- Docs: https://novi-42r.pages.dev/docs/components/switch/

```tsx
<Switch isSelected={enabled} onChange={setEnabled}>
  メール通知を受け取る
</Switch>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `color` | `NoviColor` |  |  |
| `name` | `string` |  |  |
| `value` | `string` |  |  |
| `isSelected` | `boolean` |  |  |
| `defaultSelected` | `boolean` |  |  |
| `onChange` | `(isSelected: boolean) => void` |  |  |
| `isDisabled` | `boolean` |  |  |
| `isReadOnly` | `boolean` |  |  |
| `description` | `ReactNode` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof switchSlots>` |  |  |

## Table

一覧を行と列で見せる。見出しを押して並べ替え、行を押して選ぶ。矢印キーで行と列を移動できる。

`Table > TableHeader > TableColumn` と `TableBody > TableRow > TableCell` で組む。
少なくとも 1 列を `isRowHeader` にすると、支援技術が行を名前で読める。
狭い画面では**表そのものが横にスクロールする**。列を隠すかどうかはアプリの判断（ADR-B5）。

- Accessibility: 根要素は `role="grid"` で `aria-label` を持つ。並べ替えできる見出しは `aria-sort` を持ち、 Enter / Space で切り替わる。行は矢印キーで移動でき、`selectionMode` があれば Space で選べる。 行が 0 件のときは `renderEmptyState` の内容が本体に出る
- Keyboard: ↑ ↓ ← → → 行とセルを移動; Home / End → 行頭 / 行末へ; Space → 行を選ぶ（`selectionMode` があるとき）; Enter / Space（見出し） → 並べ替え
- Slots (`data-slot`): `root`, `header`, `column`, `sortIcon`, `body`, `row`, `cell`, `empty` (required: `root`, `header`, `column`, `body`, `row`, `cell`)
- Docs: https://novi-42r.pages.dev/docs/components/table/

```tsx
<Table aria-label="注文一覧" sortDescriptor={sort} onSortChange={setSort}>
  <TableHeader>
    <TableColumn id="no" isRowHeader>注文番号</TableColumn>
    <TableColumn id="amount" allowsSorting align="end">金額</TableColumn>
  </TableHeader>
  <TableBody>
    <TableRow id="1042">
      <TableCell>#1042</TableCell>
      <TableCell align="end">¥12,800</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `size` | `NoviSize` |  |  |
| `sortDescriptor` | `TableSortDescriptor` |  | 並べ替えの状態。制御したい場合に使う |
| `onSortChange` | `(descriptor: TableSortDescriptor) => void` |  |  |
| `selectionMode` | `'none' \| 'single' \| 'multiple'` |  | 行の選び方。`single` / `multiple` では行を押すと選ばれる（チェックボックスは出さない）。 既定は `none` |
| `selectedKeys` | `'all' \| Iterable<string>` |  | 選ばれている行の `id`。制御したい場合に使う。`'all'` は全行 |
| `defaultSelectedKeys` | `'all' \| Iterable<string>` |  |  |
| `onSelectionChange` | `(keys: 'all' \| Set<string>) => void` |  |  |
| `disabledKeys` | `Iterable<string>` |  |  |
| `onRowAction` | `(key: string) => void` |  | 行を押したときの動作（選択とは別）。詳細へ移るなど |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof tableSlots>` |  |  |

## Tabs

同じ階層の内容を切り替える。矢印キーでタブ間を移動できる。

- Accessibility: 矢印キーでタブ間を移動し、Tab キーはパネルへ移る。選択中のタブは `aria-selected`
- Keyboard: ← →（縦は ↑ ↓） → タブを移動して選ぶ; Home / End → 最初 / 最後のタブへ; Tab → パネルの中へ
- Slots (`data-slot`): `root`, `list`, `tab`, `indicator`, `panel` (required: `root`, `list`, `tab`, `panel`)
- Docs: https://novi-42r.pages.dev/docs/components/tabs/

```tsx
<Tabs selectedKey={tab} onSelectionChange={setTab}>
  <TabItems>
    <TabItem id="profile">プロフィール</TabItem>
    <TabItem id="settings">設定</TabItem>
  </TabItems>
  <TabContent id="profile">プロフィールの中身</TabContent>
  <TabContent id="settings">設定の中身</TabContent>
</Tabs>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `size` | `NoviSize` |  |  |
| `orientation` | `'horizontal' \| 'vertical'` |  |  |
| `selectedKey` | `string` |  |  |
| `defaultSelectedKey` | `string` |  |  |
| `onSelectionChange` | `(key: string) => void` |  |  |
| `isDisabled` | `boolean` |  |  |
| `disabledKeys` | `string[]` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof tabsSlots>` |  |  |

## TextArea

複数行テキスト入力。

- Accessibility: `label` は必須。`description` と `errorMessage` は `aria-describedby` で関連付く。 改行が入る入力のため Enter では送信しない
- Keyboard: Enter → 改行; Tab → 次の欄へ
- Slots (`data-slot`): `root`, `label`, `inputWrapper`, `textarea`, `description`, `errorMessage` (required: `root`, `inputWrapper`, `textarea`)
- Docs: https://novi-42r.pages.dev/docs/components/textarea/

```tsx
<TextArea label="備考" rows={4} maxLength={500} />
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `NoviVariant` |  |  |
| `size` | `NoviSize` |  |  |
| `radius` | `NoviRadius` |  |  |
| `label` | `ReactNode` |  |  |
| `placeholder` | `string` |  |  |
| `description` | `ReactNode` |  |  |
| `errorMessage` | `ReactNode` |  |  |
| `name` | `string` |  |  |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `onChange` | `(value: string) => void` |  |  |
| `onKeyDown` | `KeyboardEventHandler<HTMLTextAreaElement>` |  | キー操作。**IME 変換中のキーはここに届かない**（`useImeSafeKeys` を経由する）。 |
| `rows` | `number` |  |  |
| `maxLength` | `number` |  |  |
| `isDisabled` | `boolean` |  |  |
| `isReadOnly` | `boolean` |  |  |
| `isRequired` | `boolean` |  |  |
| `isInvalid` | `boolean` |  |  |
| `classNames` | `ClassNames<typeof textareaSlots>` |  |  |

## NoviToastRegion

一時的な通知。

操作に必須の情報を置かない。自動で消えるため、読み落とすと取り返しがつかない。
`prefers-reduced-motion` が有効なときは出入りのアニメーションを行わない。

- Accessibility: live region として読み上げられる。閉じるボタンには `aria-label` がある
- Keyboard: Tab → 通知の中のボタンへ; Enter / Space（閉じる） → 通知を閉じる
- Slots (`data-slot`): `region`, `root`, `icon`, `content`, `title`, `description`, `closeButton`, `action` (required: `region`, `root`, `content`)
- Docs: https://novi-42r.pages.dev/docs/components/toast/

```tsx
// キューはアプリで1つ作って使い回す
const queue = createToastQueue()

<Button onPress={() => queue.add({ title: '保存しました', color: 'success' }, { timeout: 4000 })}>
  保存
</Button>
<NoviToastRegion queue={queue} />
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `color` | `NoviColor` |  |  |
| `radius` | `NoviRadius` |  |  |
| `title` | `ReactNode` |  |  |
| `description` | `ReactNode` |  |  |
| `icon` | `ReactNode` |  |  |
| `action` | `ReactNode` |  | 補助操作。「元に戻す」など |
| `timeout` | `number` |  | 自動で閉じるまでのミリ秒。省略すると自動で閉じない |
| `onClose` | `() => void` |  |  |
| `classNames` | `ClassNames<typeof toastSlots>` |  |  |

## Tooltip

要素の補足説明。ホバーとフォーカスの両方で開く。

ツールチップだけに情報を置かない。触れないと読めないため、
操作に必須の情報は本文かラベルに書く。

- Accessibility: ホバーとフォーカスの両方で開く。触れないと読めないため、操作に必須の情報は置かない
- Keyboard: Tab（フォーカス） → 表示; Escape → 隠す
- Slots (`data-slot`): `root`, `arrow`, `content` (required: `root`, `content`)
- Docs: https://novi-42r.pages.dev/docs/components/tooltip/

```tsx
<Tooltip content="コピーする">
  <Button>複製</Button>
</Tooltip>
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `content` | `ReactNode` |  |  |
| `placement` | `NoviPlacement` |  |  |
| `offset` | `number` |  |  |
| `delay` | `number` |  | 開くまでの遅延（ミリ秒） |
| `isOpen` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `onOpenChange` | `(isOpen: boolean) => void` |  |  |
| `isDisabled` | `boolean` |  |  |
| `children` | `ReactNode` |  |  |
| `classNames` | `ClassNames<typeof tooltipSlots>` |  |  |
