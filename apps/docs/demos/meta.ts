/**
 * デモのメタデータ。**描画関数を含まないプレーンなデータ。**
 *
 * `'use client'` を付けたファイルをサーバコンポーネントから import すると
 * 実体ではなくクライアント参照が返り、`generateStaticParams` などで使えない。
 * データと描画を分けておくことでどちらからも読める。
 */

export interface DemoMeta {
  /** 契約名。props / slot 表と対応する */
  component: string
  /** 見出し */
  title: string
  /** 使い分けの注意。ここだけが手書き */
  note: string
  /** コード例に載せる import 名 */
  imports: string[]
  /** コード例に表示するソース */
  code: string
}

export const DEMO_META: DemoMeta[] = [
  {
    component: 'Button',
    title: 'Button',
    note: '押した結果が同じ画面で完結するなら Button、別ページへ移るならリンクを使う。',
    imports: ['Button'],
    code: `<Button variant="solid" color="primary">保存</Button>
<Button variant="outline">キャンセル</Button>`,
  },
  {
    component: 'Input',
    title: 'Input',
    note: 'プレースホルダをラベル代わりにしない。入力すると消えて何の欄か分からなくなる。',
    imports: ['Input'],
    code: `<Input label="メールアドレス" type="email" isRequired description="ログインに使用します" />`,
  },
  {
    component: 'Textarea',
    title: 'TextArea',
    note: '文字数制限があるなら description に残り数を出す。送信してから怒られるのは最悪の体験。',
    imports: ['TextArea'],
    code: `<TextArea label="備考" rows={3} description="500文字まで" />`,
  },
  {
    component: 'CheckboxGroup',
    title: 'Checkbox',
    note: '複数選べるなら Checkbox、1つだけなら Radio。形が違うので利用者は見た目で判別できる。',
    imports: ['Checkbox', 'CheckboxGroup'],
    code: `<CheckboxGroup label="通知方法" defaultValue={['email']}>
  <Checkbox value="email">メール</Checkbox>
  <Checkbox value="sms">SMS</Checkbox>
</CheckboxGroup>`,
  },
  {
    component: 'RadioGroup',
    title: 'Radio',
    note: '選択肢が5つを超えるなら Select を検討する。並べると縦に長くなりすぎる。',
    imports: ['Radio', 'RadioGroup'],
    code: `<RadioGroup label="配送方法" defaultValue="standard">
  <Radio value="standard">通常</Radio>
  <Radio value="express" description="翌日到着">速達</Radio>
</RadioGroup>`,
  },
  {
    component: 'Switch',
    title: 'Switch',
    note: '即座に効く設定に使う。保存ボタンが必要なものは Checkbox にする。Raster では矩形で表示されるため、状態のラベル併記を強く推奨する。',
    imports: ['Switch'],
    code: `<Switch defaultSelected>メール通知を受け取る</Switch>`,
  },
  {
    component: 'NumberField',
    title: 'NumberField',
    note: '数量・単価・個数など「増減する数」に使う。電話番号や郵便番号は数字でも数値ではないので Input を使う。',
    imports: ['NumberField'],
    code: `<NumberField label="数量" defaultValue={1} minValue={0} step={1} />
<NumberField
  label="単価"
  defaultValue={1200}
  formatOptions={{ style: 'currency', currency: 'JPY' }}
/>`,
  },
  {
    component: 'ComboBox',
    title: 'ComboBox',
    note: '選択肢が 20 件を超えるならこちら。値が決まっていて自由入力を許したくないなら Select、一覧に無い値も受けるなら allowsCustomValue。',
    imports: ['ComboBox', 'ComboBoxItem'],
    code: `<ComboBox label="都道府県">
  <ComboBoxItem id="hokkaido">北海道</ComboBoxItem>
  <ComboBoxItem id="tokyo">東京都</ComboBoxItem>
  <ComboBoxItem id="osaka">大阪府</ComboBoxItem>
  <ComboBoxItem id="fukuoka">福岡県</ComboBoxItem>
</ComboBox>`,
  },
  {
    component: 'Select',
    title: 'Select',
    note: '選択肢が 20 件を超えたら、文字で絞り込める ComboBox を使う。Select は全部を目で追える数まで。',
    imports: ['Select', 'SelectItem'],
    code: `<Select label="都道府県">
  <SelectItem id="tokyo">東京都</SelectItem>
  <SelectItem id="osaka">大阪府</SelectItem>
</Select>`,
  },
  {
    component: 'Pagination',
    title: 'Pagination',
    note: '一覧は 1 画面で読み切れる件数で切る。無限スクロールは読み終わりが分からず、業務の一覧では戻れないことが嫌われる。',
    imports: ['Pagination'],
    code: `<Pagination total={12} defaultPage={5} />`,
  },
  {
    component: 'Card',
    title: 'Card',
    note: 'カード全体を押せるようにするなら onPress を渡す。中にボタンを置くと押し分けが曖昧になる。',
    imports: ['Card', 'CardBody', 'CardFooter', 'CardHeader'],
    code: `<Card>
  <CardHeader>売上</CardHeader>
  <CardBody>¥1,240,000</CardBody>
  <CardFooter>前月比 +12%</CardFooter>
</Card>`,
  },
  {
    component: 'Badge',
    title: 'Badge',
    note: '色だけで意味を伝えない。success と danger は色覚特性によって区別できない。必ず文言を伴わせる。',
    imports: ['Badge'],
    code: `<Badge color="success" withDot>公開中</Badge>
<Badge color="danger" variant="outline">停止</Badge>`,
  },
  {
    component: 'Avatar',
    title: 'Avatar',
    note: 'name を必ず渡す。画像が無いときのイニシャルと、読み上げ時の氏名の両方に使われる。',
    imports: ['Avatar'],
    code: `<Avatar name="山本 太郎" />
<Avatar name="Ada Lovelace" size="lg" />`,
  },
  {
    component: 'Progress',
    title: 'Progress',
    note: '所要時間が読めるなら value を渡す。読めないなら省略して不確定表示にする。嘘の進捗は信頼を損なう。',
    imports: ['Progress'],
    code: `<Progress label="アップロード中" value={62} showValueLabel />`,
  },
  {
    component: 'Spinner',
    title: 'Spinner',
    note: '1秒以内に終わる処理には出さない。ちらついて逆に遅く感じる。',
    imports: ['Spinner'],
    code: `<Spinner label="読み込み中" />`,
  },
  {
    component: 'Skeleton',
    title: 'Skeleton',
    note: '最終的なレイアウトと同じ大きさにする。読み込み後にガタつくと Skeleton の意味がない。',
    imports: ['Skeleton'],
    code: `<Skeleton className="h-4 w-40" />
<Skeleton className="h-4 w-full" />`,
  },
  {
    component: 'Modal',
    title: 'Modal',
    note: '作業を中断させる重さがある。確認や入力が本当に必要なときだけ使い、通知には Toast を使う。',
    imports: ['Button', 'Modal', 'ModalBody', 'ModalFooter', 'ModalTitle'],
    code: `<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
  <ModalTitle>削除しますか</ModalTitle>
  <ModalBody>この操作は取り消せません。</ModalBody>
  <ModalFooter>
    <Button variant="outline" onPress={() => setIsOpen(false)}>キャンセル</Button>
    <Button color="danger" onPress={() => setIsOpen(false)}>削除</Button>
  </ModalFooter>
</Modal>`,
  },
  {
    component: 'Popover',
    title: 'Popover',
    note: '中に入力欄や操作を置ける。読むだけの補足なら Tooltip の方が軽い。',
    imports: ['Button', 'Popover', 'PopoverContent'],
    code: `<Popover>
  <Button variant="outline">詳細</Button>
  <PopoverContent>ここに補足を書く</PopoverContent>
</Popover>`,
  },
  {
    component: 'Tooltip',
    title: 'Tooltip',
    note: 'ツールチップだけに情報を置かない。触れないと読めないため、操作に必須の情報は本文かラベルに書く。',
    imports: ['Button', 'Tooltip'],
    code: `<Tooltip content="クリップボードにコピーします">
  <Button variant="outline">複製</Button>
</Tooltip>`,
  },
  {
    component: 'Menu',
    title: 'Menu',
    note: '主要な操作は画面に出す。Menu に隠すのは頻度の低い操作だけにする。',
    imports: ['Button', 'Menu', 'MenuItem', 'MenuSeparator'],
    code: `<Menu>
  <Button variant="outline">操作</Button>
  <MenuItem id="rename" shortcut="⌘R">名前を変更</MenuItem>
  <MenuSeparator />
  <MenuItem id="delete">削除</MenuItem>
</Menu>`,
  },
  {
    component: 'Tabs',
    title: 'Tabs',
    note: '内容が対等な場合に使う。手順のように順序があるものには使わない。',
    imports: ['TabContent', 'TabItem', 'TabItems', 'Tabs'],
    code: `<Tabs>
  <TabItems>
    <TabItem id="profile">プロフィール</TabItem>
    <TabItem id="settings">設定</TabItem>
  </TabItems>
  <TabContent id="profile">プロフィールの中身</TabContent>
  <TabContent id="settings">設定の中身</TabContent>
</Tabs>`,
  },
  {
    component: 'Accordion',
    title: 'Accordion',
    note: '検索で見つけたい情報は隠さない。折りたたむと Ctrl+F で見つからなくなる。',
    imports: ['Accordion', 'AccordionItem'],
    code: `<Accordion defaultExpandedKeys={['shipping']}>
  <AccordionItem id="shipping" title="配送について">3営業日以内に発送します。</AccordionItem>
  <AccordionItem id="returns" title="返品について">到着後7日以内にご連絡ください。</AccordionItem>
</Accordion>`,
  },
  {
    component: 'Breadcrumbs',
    title: 'Breadcrumbs',
    note: '階層が2段以下なら不要。href を省いた最後の項目が現在地になる。',
    imports: ['Breadcrumb', 'Breadcrumbs'],
    code: `<Breadcrumbs>
  <Breadcrumb href="/">ホーム</Breadcrumb>
  <Breadcrumb href="/docs">ドキュメント</Breadcrumb>
  <Breadcrumb>Button</Breadcrumb>
</Breadcrumbs>`,
  },
  {
    component: 'ColorPicker',
    title: 'ColorPicker',
    note: '色の一覧はモデルが持つ。同じコードでも Raster では Print Inks、Tactile では Textile Dyes が並ぶ。',
    imports: ['ColorPicker'],
    code: `// 色 id を書かない。未指定ならモデルの既定色から始まる
const [color, setColor] = useState<string>()

<div data-novi-color={color}>
  <ColorPicker label="配色" onChange={setColor} showLabels />
</div>`,
  },
  {
    component: 'Toast',
    title: 'Toast',
    note: '操作に必須の情報を置かない。自動で消えるため、読み落とすと取り返しがつかない。',
    imports: ['Button', 'NoviToastRegion', 'createToastQueue'],
    code: `const queue = createToastQueue()

<Button onPress={() => queue.add({ title: '保存しました' }, { timeout: 4000 })}>
  通知を出す
</Button>
<NoviToastRegion queue={queue} />`,
  },
]

export const DEMO_SLUGS = DEMO_META.map((d) => d.title.toLowerCase())

export function findDemoMeta(slug: string): DemoMeta | undefined {
  return DEMO_META.find((d) => d.title.toLowerCase() === slug)
}
