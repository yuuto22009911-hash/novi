/**
 * コンポーネントページの「例」と「使い分け」。**描画関数を含まないプレーンなデータ。**
 *
 * `meta.ts` の主デモに加えて、variant / size / 状態（無効・エラー・読み込み）を見せる。
 * `code` は `examples.tsx` の描画関数と対で保ち、import 文だけをテーマ切替で掛け替える。
 *
 * ここに書いてよいのは**判断**（いつ使う・いつ使わない）だけ。props や slot の説明は
 * 生成物（props 表 / llms.txt）とズレるので書かない（`pnpm check:handwritten` の趣旨）。
 */

export interface DemoExample {
  /** slug 内で一意。`examples.tsx` の描画関数のキー */
  id: string
  title: string
  /** この例で見せたいこと。1 文 */
  note?: string
  /** コード例に載せる import 名。省略時は主デモと同じ */
  imports?: string[]
  code: string
}

export interface DemoExtras {
  examples: DemoExample[]
  /** こうする */
  dos: string[]
  /** こうしない */
  donts: string[]
}

export const DEMO_EXTRAS: Record<string, DemoExtras> = {
  Button: {
    examples: [
      {
        id: 'colors',
        title: '色',
        note: 'primary は 1 画面に 1 つ。danger は取り消せない操作にだけ使う。',
        code: `<Button color="primary">保存</Button>
<Button color="secondary">下書き</Button>
<Button color="success">承認</Button>
<Button color="warning">保留</Button>
<Button color="danger">削除</Button>`,
      },
      {
        id: 'sizes',
        title: '大きさ',
        note: '同じ行に並べるボタンは同じ size にする。高さが揃わないと視線が上下する。',
        code: `<Button size="sm">小</Button>
<Button size="md">中</Button>
<Button size="lg">大</Button>`,
      },
      {
        id: 'states',
        title: '無効と読み込み中',
        note: '押した後に結果を待つなら isLoading。押せない理由が分かるなら isDisabled より説明を添える。',
        code: `<Button color="primary" isLoading>送信中</Button>
<Button isDisabled>編集できません</Button>`,
      },
      {
        id: 'content',
        title: 'アイコン付き',
        note: 'アイコンは文字の補助。アイコンだけのボタンには aria-label を付ける。',
        code: `<Button startContent={<PlusIcon />}>追加</Button>
<Button variant="outline" endContent={<ArrowIcon />}>次へ</Button>`,
      },
    ],
    dos: [
      '主操作を 1 つだけ primary にする。残りは outline / ghost で従属させる',
      '文言は動詞で終える（「保存」「削除」）。「OK」「はい」は何が起きるか分からない',
      '取り消せない操作は danger にし、Modal で確認を挟む',
    ],
    donts: [
      '別ページへ移る操作にボタンを使わない。リンクを使う（右クリックで開ける、履歴に残る）',
      '同じ行に primary を 2 つ並べない。どちらが主か決めきれていない印',
      '読み込み中に isDisabled だけで済ませない。何を待っているかは isLoading が示す',
    ],
  },

  Input: {
    examples: [
      {
        id: 'validation',
        title: 'エラー表示',
        note: 'エラーは色だけでなく文で示す。errorMessage は isInvalid のときだけ出る。',
        code: `<Input
  label="メールアドレス"
  type="email"
  defaultValue="taro@example"
  isInvalid
  errorMessage="@ 以降のドメインが足りません"
/>`,
      },
      {
        id: 'content',
        title: '前後の飾り',
        note: '単位や記号は入力の外に置く。値の一部にすると数値として扱えなくなる。',
        code: `<Input label="金額" startContent="¥" />
<Input label="重さ" endContent="kg" />`,
      },
      {
        id: 'states',
        title: '読み取り専用と無効',
        note: '値を見せたいだけなら isReadOnly。isDisabled は「今は関係ない」項目に。',
        code: `<Input label="注文番号" defaultValue="#1042" isReadOnly />
<Input label="クーポン" isDisabled description="会員登録後に使えます" />`,
      },
      {
        id: 'sizes',
        title: '大きさ',
        code: `<Input label="小" size="sm" />
<Input label="中" size="md" />
<Input label="大" size="lg" />`,
      },
    ],
    dos: [
      'label を必ず付ける。プレースホルダは例を示すだけに使う',
      'type を正しく選ぶ（email / tel / url）。スマホのキーボードが変わる',
      'エラーは入力欄の直下に、何を直せばよいかを書く',
    ],
    donts: [
      'プレースホルダをラベル代わりにしない。入力すると消える',
      '数値の入力に Input を使わない。数量や金額は NumberField、電話番号や郵便番号は Input',
      'エラーを色だけで示さない。色弱の利用者に伝わらない',
    ],
  },

  Textarea: {
    examples: [
      {
        id: 'maxlength',
        title: '文字数の上限',
        note: 'maxLength は入力を止める。description で上限を先に伝える。',
        code: `<TextArea label="自己紹介" rows={4} maxLength={200} description="200 文字まで" />`,
      },
      {
        id: 'validation',
        title: 'エラー表示',
        code: `<TextArea label="理由" isRequired isInvalid errorMessage="理由を入力してください" />`,
      },
      {
        id: 'states',
        title: '読み取り専用',
        code: `<TextArea label="規約" rows={3} isReadOnly defaultValue="第1条 本規約は…" />`,
      },
    ],
    dos: [
      'rows で最初の高さを決める。書く量の目安になる',
      '上限があるなら description で先に伝える',
    ],
    donts: [
      '1 行で足りる項目に TextArea を使わない。Input にする',
      '送信してから文字数超過を怒らない',
    ],
  },

  CheckboxGroup: {
    examples: [
      {
        id: 'single',
        title: '単体',
        note: '同意や設定の 1 項目は CheckboxGroup に入れず単体で置く。',
        imports: ['Checkbox'],
        code: `<Checkbox defaultSelected>利用規約に同意する</Checkbox>
<Checkbox description="配送のお知らせを受け取ります">メール通知</Checkbox>`,
      },
      {
        id: 'validation',
        title: '必須とエラー',
        code: `<CheckboxGroup label="対象" isRequired isInvalid errorMessage="1 つ以上選んでください">
  <Checkbox value="tops">トップス</Checkbox>
  <Checkbox value="bottoms">ボトムス</Checkbox>
</CheckboxGroup>`,
      },
      {
        id: 'indeterminate',
        title: '一部選択',
        note: '「すべて選択」の親は、子が一部だけ選ばれているとき isIndeterminate にする。',
        imports: ['Checkbox'],
        code: `<Checkbox isIndeterminate>すべて選択</Checkbox>`,
      },
      {
        id: 'horizontal',
        title: '横並び',
        code: `<CheckboxGroup label="サイズ" orientation="horizontal" defaultValue={['m']}>
  <Checkbox value="s">S</Checkbox>
  <Checkbox value="m">M</Checkbox>
  <Checkbox value="l">L</Checkbox>
</CheckboxGroup>`,
      },
    ],
    dos: [
      '複数選べるときに使う。1 つだけなら Radio',
      '親子の一括選択は isIndeterminate で「一部」を表す',
    ],
    donts: [
      '「オン / オフ」の即時切替に Checkbox を使わない。保存ボタンを待たず効くなら Switch',
      '選択肢が 10 を超える群を Checkbox で並べない。ComboBox か Table の選択にする',
    ],
  },

  RadioGroup: {
    examples: [
      {
        id: 'horizontal',
        title: '横並び',
        note: '選択肢が短く 3 つ程度なら横に並べられる。',
        code: `<RadioGroup label="サイズ" orientation="horizontal" defaultValue="m">
  <Radio value="s">S</Radio>
  <Radio value="m">M</Radio>
  <Radio value="l">L</Radio>
</RadioGroup>`,
      },
      {
        id: 'disabled',
        title: '選べない選択肢',
        note: '在庫切れなど、あることは示すが選ばせない項目は個別に isDisabled。',
        code: `<RadioGroup label="色" defaultValue="ink">
  <Radio value="ink">インク</Radio>
  <Radio value="brick" isDisabled description="在庫切れ">
    ブリック
  </Radio>
</RadioGroup>`,
      },
      {
        id: 'validation',
        title: '必須とエラー',
        code: `<RadioGroup label="支払い方法" isRequired isInvalid errorMessage="選んでください">
  <Radio value="card">カード</Radio>
  <Radio value="bank">振込</Radio>
</RadioGroup>`,
      },
    ],
    dos: [
      '2〜5 個の排他的な選択肢に使う。全部が一度に見える',
      '既定値を置く。未選択のまま送られる事故が減る',
    ],
    donts: [
      '1 つだけの Radio を置かない。オン / オフなら Checkbox か Switch',
      '選択肢が 6 つを超えたら Select か ComboBox にする',
    ],
  },

  Switch: {
    examples: [
      {
        id: 'description',
        title: '説明付き',
        note: 'オンにすると何が起きるかを description で書く。',
        code: `<Switch defaultSelected description="在庫が 5 点を切ったら通知します">
  在庫アラート
</Switch>`,
      },
      {
        id: 'sizes',
        title: '大きさ',
        code: `<Switch size="sm">小</Switch>
<Switch size="md">中</Switch>
<Switch size="lg">大</Switch>`,
      },
      {
        id: 'states',
        title: '無効',
        code: `<Switch isDisabled>プランの変更が必要です</Switch>
<Switch isSelected isReadOnly>管理者が固定</Switch>`,
      },
    ],
    dos: [
      '切り替えた瞬間に効く設定に使う（保存ボタンを待たない）',
      'ラベルは状態でなく対象を書く（「メール通知」であって「オン」ではない）',
    ],
    donts: [
      'フォームの中で保存ボタンを待つ項目に使わない。Checkbox にする',
      '「はい / いいえ」の質問に使わない。Radio にする',
    ],
  },

  NumberField: {
    examples: [
      {
        id: 'range',
        title: '範囲と刻み',
        note: 'minValue / maxValue で止まり、step で刻む。範囲外を打っても丸められる。',
        code: `<NumberField label="購入数" defaultValue={2} minValue={1} maxValue={10} step={1} />
<NumberField label="割引率" defaultValue={0.1} minValue={0} maxValue={1} step={0.05} formatOptions={{ style: 'percent' }} />`,
      },
      {
        id: 'unit',
        title: '単位付き',
        code: `<NumberField label="重さ" defaultValue={1.5} step={0.1} formatOptions={{ style: 'unit', unit: 'kilogram' }} />`,
      },
      {
        id: 'validation',
        title: 'エラーと無効',
        code: `<NumberField label="数量" defaultValue={0} isInvalid errorMessage="1 以上を入力してください" />
<NumberField label="単価" defaultValue={1200} isDisabled formatOptions={{ style: 'currency', currency: 'JPY' }} />`,
      },
    ],
    dos: [
      '数量・金額・割合のように増減する数に使う',
      '通貨や % は formatOptions で付ける。文字列に含めない',
    ],
    donts: [
      '電話番号・郵便番号・注文番号に使わない。数字だが数値ではない。Input にする',
      '空欄を 0 として扱わない。onChange は null を渡す',
    ],
  },

  ComboBox: {
    examples: [
      {
        id: 'custom',
        title: '一覧に無い値も受ける',
        note: 'タグや品番のように新しい値が生まれる欄は allowsCustomValue。',
        code: `<ComboBox label="タグ" allowsCustomValue placeholder="新しいタグも入力できます">
  <ComboBoxItem id="new">新作</ComboBoxItem>
  <ComboBoxItem id="sale">セール</ComboBoxItem>
  <ComboBoxItem id="limited">限定</ComboBoxItem>
</ComboBox>`,
      },
      {
        id: 'focus',
        title: 'フォーカスで開く',
        note: '選択肢を先に見せたいなら menuTrigger="focus"。',
        code: `<ComboBox label="担当者" menuTrigger="focus">
  <ComboBoxItem id="yamada">山田</ComboBoxItem>
  <ComboBoxItem id="sato">佐藤</ComboBoxItem>
  <ComboBoxItem id="suzuki">鈴木</ComboBoxItem>
</ComboBox>`,
      },
      {
        id: 'validation',
        title: 'エラー表示',
        code: `<ComboBox label="仕入先" isRequired isInvalid errorMessage="一覧から選んでください">
  <ComboBoxItem id="a">A 商事</ComboBoxItem>
  <ComboBoxItem id="b">B 産業</ComboBoxItem>
</ComboBox>`,
      },
    ],
    dos: [
      '選択肢が 20 を超えるときに使う。文字で絞れる',
      '一覧に無い値を受けるかどうかを先に決める（allowsCustomValue）',
    ],
    donts: [
      '選択肢が 5 つしかない欄に使わない。Select の方が全部見える',
      '一覧に無い値を黙って捨てない。受けないなら errorMessage で伝える',
    ],
  },

  DatePicker: {
    examples: [
      {
        id: 'range',
        title: '選べる範囲',
        note: 'minValue / maxValue の外は薄くなり押せない。今日を基準にするなら today(getLocalTimeZone())。',
        code: `<DatePicker
  label="納期"
  minValue={parseDate('2026-09-10')}
  maxValue={parseDate('2026-09-30')}
  description="9月10日〜30日"
/>`,
      },
      {
        id: 'unavailable',
        title: '定休日を除く',
        note: '日曜日など、範囲内でも選ばせない日は isDateUnavailable で個別に決める。',
        code: `<DatePicker
  label="来店日"
  defaultValue={parseDate('2026-09-07')}
  isDateUnavailable={(date) => date.toDate(getLocalTimeZone()).getDay() === 0}
  description="日曜定休"
/>`,
      },
      {
        id: 'validation',
        title: 'エラー表示',
        code: `<DatePicker label="出荷日" isRequired isInvalid errorMessage="出荷日を選んでください" />`,
      },
    ],
    dos: [
      '値は parseDate() で作る。文字列や Date を渡さない',
      '選べない期間があるなら minValue / maxValue / isDateUnavailable で先に止める',
    ],
    donts: [
      '生年月日のように遠い過去を選ばせる欄にカレンダーを頼らない。マスに直接打てることを案内する',
      '期間（開始〜終了）を DatePicker 2 つで表すとき、終了 < 開始 を許さない',
    ],
  },

  Select: {
    examples: [
      {
        id: 'validation',
        title: '説明とエラー',
        code: `<Select label="配送方法" description="離島は速達を選べません" isRequired isInvalid errorMessage="選んでください">
  <SelectItem id="standard">通常</SelectItem>
  <SelectItem id="express">速達</SelectItem>
</Select>`,
      },
      {
        id: 'disabled',
        title: '選べない項目',
        code: `<Select label="サイズ" defaultSelectedKey="m">
  <SelectItem id="s">S</SelectItem>
  <SelectItem id="m">M</SelectItem>
  <SelectItem id="l" isDisabled>L（在庫切れ）</SelectItem>
</Select>`,
      },
      {
        id: 'sizes',
        title: '大きさ',
        code: `<Select label="小" size="sm"><SelectItem id="a">A</SelectItem></Select>
<Select label="中" size="md"><SelectItem id="a">A</SelectItem></Select>
<Select label="大" size="lg"><SelectItem id="a">A</SelectItem></Select>`,
      },
    ],
    dos: [
      '5〜20 個の選択肢に使う。全部見えて、文字は打たせない',
      '在庫切れは消さず isDisabled で残す。無いことが分かる',
    ],
    donts: [
      '選択肢が 20 を超えたら使わない。ComboBox にする',
      '2〜4 個の選択肢に使わない。Radio の方が押す回数が少ない',
    ],
  },

  Pagination: {
    examples: [
      {
        id: 'sizes',
        title: '大きさ',
        code: `<Pagination total={8} defaultPage={3} size="sm" />
<Pagination total={8} defaultPage={3} size="md" />
<Pagination total={8} defaultPage={3} size="lg" />`,
      },
      {
        id: 'siblings',
        title: '両隣を広げる',
        note: 'siblingCount を増やすと省略記号が減る。幅は増える。',
        code: `<Pagination total={30} defaultPage={15} siblingCount={2} boundaryCount={2} />`,
      },
      {
        id: 'disabled',
        title: '読み込み中は止める',
        code: `<Pagination total={12} defaultPage={5} isDisabled />`,
      },
    ],
    dos: [
      '1 ページを読み切れる件数（20〜50 件）で切る',
      '現在のページを URL に載せる。戻る・共有ができる',
    ],
    donts: [
      '無限スクロールと併用しない。読み終わりが分からなくなる',
      '総ページ数が 1 のときに表示しない',
    ],
  },

  Table: {
    examples: [
      {
        id: 'selection',
        title: '行の選択',
        note: 'selectionMode="single" で行を押すと選ばれる。チェックボックス列は出ない。',
        code: `<Table aria-label="担当者" selectionMode="single" defaultSelectedKeys={['2']}>
  <TableHeader>
    <TableColumn id="name" isRowHeader>氏名</TableColumn>
    <TableColumn id="role">役割</TableColumn>
  </TableHeader>
  <TableBody>
    <TableRow id="1"><TableCell>山田 花子</TableCell><TableCell>店長</TableCell></TableRow>
    <TableRow id="2"><TableCell>佐藤 健</TableCell><TableCell>販売</TableCell></TableRow>
    <TableRow id="3"><TableCell>鈴木 一郎</TableCell><TableCell>在庫</TableCell></TableRow>
  </TableBody>
</Table>`,
      },
      {
        id: 'empty',
        title: '0 件',
        note: '行が無いときは renderEmptyState の内容が出る。次の行動を書く。',
        code: `<Table aria-label="返品一覧">
  <TableHeader>
    <TableColumn id="no" isRowHeader>返品番号</TableColumn>
    <TableColumn id="reason">理由</TableColumn>
  </TableHeader>
  <TableBody renderEmptyState={() => '返品はありません。注文一覧から登録できます'}>
    {[]}
  </TableBody>
</Table>`,
      },
      {
        id: 'sizes',
        title: '詰めた表',
        note: '一覧性を優先するなら size="sm"。',
        code: `<Table aria-label="在庫" size="sm">
  <TableHeader>
    <TableColumn id="sku" isRowHeader>SKU</TableColumn>
    <TableColumn id="qty" align="end">在庫</TableColumn>
  </TableHeader>
  <TableBody>
    <TableRow id="a"><TableCell>TS-001-M</TableCell><TableCell align="end">12</TableCell></TableRow>
    <TableRow id="b"><TableCell>TS-001-L</TableCell><TableCell align="end">3</TableCell></TableRow>
  </TableBody>
</Table>`,
      },
    ],
    dos: [
      'aria-label と isRowHeader の列を必ず付ける。行が名前で読める',
      '数値の列は align="end"。桁が揃う',
      'overflow-x-auto の枠で包む。表がスクロールし、ページはしない',
    ],
    donts: [
      '列が 5 つを超える表をスマホでそのまま出さない。1 件 1 ブロックに組み替える',
      '行の選択とリンクを同じ行に混ぜない。どちらが起きるか分からない',
    ],
  },

  Card: {
    examples: [
      {
        id: 'image',
        title: '画像付き',
        code: `<Card>
  <CardImage src="/og.png" alt="" />
  <CardHeader>秋の新作</CardHeader>
  <CardBody>ウールのコート 3 型を追加しました。</CardBody>
</Card>`,
      },
      {
        id: 'pressable',
        title: '押せるカード',
        note: 'onPress を渡すとカード全体が 1 つのボタンになる。中にボタンを置かない。',
        code: `<Card onPress={() => open('1042')}>
  <CardHeader>注文 #1042</CardHeader>
  <CardBody>山田 花子 · ¥12,800</CardBody>
</Card>`,
      },
      {
        id: 'variants',
        title: 'variant',
        code: `<Card variant="solid"><CardBody>solid</CardBody></Card>
<Card variant="outline"><CardBody>outline</CardBody></Card>
<Card variant="soft"><CardBody>soft</CardBody></Card>`,
      },
    ],
    dos: ['1 枚に 1 つの主題。見出し・本文・操作の順に置く', '一覧に並べるなら同じ高さに揃える'],
    donts: [
      '押せるカードの中にボタンを置かない。押し分けが曖昧になる',
      'カードの中にカードを入れない。面が重なって階層が読めなくなる',
    ],
  },

  Badge: {
    examples: [
      {
        id: 'colors',
        title: '意味色',
        note: '状態を表す色は 4 つで足りる。増やすと意味が薄れる。',
        code: `<Badge color="success" withDot>公開中</Badge>
<Badge color="warning" withDot>審査中</Badge>
<Badge color="danger" withDot>停止</Badge>
<Badge color="default">下書き</Badge>`,
      },
      {
        id: 'variants',
        title: 'variant',
        code: `<Badge variant="solid" color="primary">solid</Badge>
<Badge variant="soft" color="primary">soft</Badge>
<Badge variant="outline" color="primary">outline</Badge>`,
      },
      {
        id: 'sizes',
        title: '大きさ',
        code: `<Badge size="sm">小</Badge>
<Badge size="md">中</Badge>
<Badge size="lg">大</Badge>`,
      },
    ],
    dos: ['状態か分類を 1 語で示す', '同じ意味には同じ色を使い続ける'],
    donts: ['Badge を押せるようにしない。押すならボタン', '文を入れない。2 語を超えたら本文に書く'],
  },

  Avatar: {
    examples: [
      {
        id: 'image',
        title: '画像',
        note: '画像が読めないときは name の頭文字に落ちる。',
        code: `<Avatar src="/apple-touch-icon.png" name="Novi" />
<Avatar src="/missing.png" name="山本 太郎" />`,
      },
      {
        id: 'sizes',
        title: '大きさ',
        code: `<Avatar name="山本 太郎" size="sm" />
<Avatar name="山本 太郎" size="md" />
<Avatar name="山本 太郎" size="lg" />`,
      },
      {
        id: 'badge',
        title: '状態の印',
        code: `<Avatar name="山本 太郎" badge={<Badge color="success" size="sm" withDot>在席</Badge>} />`,
      },
    ],
    dos: ['name を必ず渡す。画像が無いときの頭文字と読み上げに使われる'],
    donts: ['装飾目的で人以外に使わない。会社や商品はロゴやサムネイルで'],
  },

  Progress: {
    examples: [
      {
        id: 'colors',
        title: '色',
        code: `<Progress label="在庫の消化" value={80} color="warning" showValueLabel />
<Progress label="容量" value={95} color="danger" showValueLabel />`,
      },
      {
        id: 'range',
        title: '範囲を変える',
        note: '件数の進捗は maxValue に総数を入れる。',
        code: `<Progress label="出荷処理" value={38} maxValue={120} showValueLabel />`,
      },
      {
        id: 'sizes',
        title: '大きさ',
        code: `<Progress label="小" value={40} size="sm" />
<Progress label="大" value={40} size="lg" />`,
      },
    ],
    dos: ['終わりが分かる処理に使う。分からないなら Spinner', 'label で何の進捗かを書く'],
    donts: ['数十秒以上かかる処理で止まったままにしない。途中経過を更新する'],
  },

  Spinner: {
    examples: [
      {
        id: 'sizes',
        title: '大きさ',
        code: `<Spinner size="sm" label="読み込み中" />
<Spinner size="md" label="読み込み中" />
<Spinner size="lg" label="読み込み中" />`,
      },
      {
        id: 'colors',
        title: '色',
        code: `<Spinner color="primary" label="送信中" />
<Spinner color="danger" label="削除中" />`,
      },
    ],
    dos: ['1 秒以内に終わらない処理に出す', 'ボタンの中で待つなら Button の isLoading を使う'],
    donts: ['画面全体を Spinner で覆わない。何が待たされているかが分からなくなる'],
  },

  Skeleton: {
    examples: [
      {
        id: 'card',
        title: 'カードの骨組み',
        note: '読み込み後と同じ大きさに組む。差があると読み込み完了で画面が跳ねる。',
        code: `<div className="flex items-center gap-[var(--novi-gap-inline)]">
  <Skeleton className="size-10" radius="full" />
  <div className="flex flex-col gap-2">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
</div>`,
      },
    ],
    dos: ['読み込み後のレイアウトと同じ形で置く'],
    donts: ['0.3 秒で終わる読み込みに出さない。ちらつく'],
  },

  Modal: {
    examples: [
      {
        id: 'sizes',
        title: '大きさ',
        note: 'Raster は幅、Tactile はシートの高さ、Flatlay は本文の行長として解釈される。',
        code: `<Modal size="sm" isOpen={isOpen} onOpenChange={setIsOpen}>
  <ModalTitle>小さな確認</ModalTitle>
  <ModalBody>はい / いいえで済む内容。</ModalBody>
</Modal>`,
      },
      {
        id: 'form',
        title: 'フォームを入れる',
        note: '入力を伴うなら閉じる操作を明示する。外側クリックで閉じると入力が消える。',
        code: `<Modal isOpen={isOpen} onOpenChange={setIsOpen} isDismissable={false}>
  <ModalTitle>住所を編集</ModalTitle>
  <ModalBody>
    <Input label="郵便番号" />
    <Input label="住所" />
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onPress={() => setIsOpen(false)}>キャンセル</Button>
    <Button color="primary" onPress={() => setIsOpen(false)}>保存</Button>
  </ModalFooter>
</Modal>`,
      },
    ],
    dos: [
      '取り消せない操作の確認、または 1 画面で完結する短い入力に使う',
      'タイトルは質問か動作で書く（「削除しますか」）',
    ],
    donts: [
      '長いフォームを入れない。ページにする',
      'Modal の上に Modal を重ねない。Flatlay では表現できない',
    ],
  },

  Popover: {
    examples: [
      {
        id: 'placement',
        title: '出る向き',
        note: 'Flatlay では向きに関係なくフロー内に展開される。',
        code: `<Popover placement="bottom">
  <Button variant="outline">下に出す</Button>
  <PopoverContent>補足の文章</PopoverContent>
</Popover>
<Popover placement="right">
  <Button variant="outline">右に出す</Button>
  <PopoverContent>補足の文章</PopoverContent>
</Popover>`,
      },
      {
        id: 'rich',
        title: '中に操作を置く',
        code: `<Popover>
  <Button variant="outline">絞り込み</Button>
  <PopoverContent>
    <CheckboxGroup label="状態" defaultValue={['open']}>
      <Checkbox value="open">公開中</Checkbox>
      <Checkbox value="draft">下書き</Checkbox>
    </CheckboxGroup>
  </PopoverContent>
</Popover>`,
      },
    ],
    dos: ['トリガーに関係する短い補足や小さな操作に使う'],
    donts: [
      'ホバーで出さない。押して出す（Tooltip と混同しない）',
      '必ず読ませたい内容を入れない。Modal にする',
    ],
  },

  Tooltip: {
    examples: [
      {
        id: 'placement',
        title: '出る向き',
        code: `<Tooltip content="上に出る" placement="top"><Button variant="outline">上</Button></Tooltip>
<Tooltip content="下に出る" placement="bottom"><Button variant="outline">下</Button></Tooltip>`,
      },
      {
        id: 'icon',
        title: 'アイコンボタンの名前',
        note: 'アイコンだけのボタンは Tooltip で名前を見せる。aria-label も別に付ける。',
        code: `<Tooltip content="複製">
  <Button variant="ghost" aria-label="複製"><CopyIcon /></Button>
</Tooltip>`,
      },
    ],
    dos: ['アイコンだけのボタンの名前や、短い補足に使う', 'delay で出るまでの間を調整する'],
    donts: [
      '操作に必要な情報を Tooltip にだけ書かない。タッチ端末では出ない',
      'Tooltip の中にリンクやボタンを置かない。押せない',
    ],
  },

  Menu: {
    examples: [
      {
        id: 'sections',
        title: '見出しで分ける',
        code: `<Menu>
  <Button variant="outline">注文の操作</Button>
  <MenuSection title="この注文">
    <MenuItem id="print">納品書を印刷</MenuItem>
    <MenuItem id="ship">出荷済みにする</MenuItem>
  </MenuSection>
  <MenuSection title="危険な操作">
    <MenuItem id="cancel" description="在庫が戻ります">キャンセル</MenuItem>
  </MenuSection>
</Menu>`,
      },
      {
        id: 'disabled',
        title: '押せない項目',
        note: '条件が揃わない操作は消さず isDisabled で残す。あることが分かる。',
        code: `<Menu disabledKeys={['refund']}>
  <Button variant="outline">操作</Button>
  <MenuItem id="edit">編集</MenuItem>
  <MenuItem id="refund" description="出荷後は返金できません">返金</MenuItem>
</Menu>`,
      },
    ],
    dos: ['3 つ以上の関連する操作をまとめるときに使う', '危険な操作は末尾に置き、区切り線で離す'],
    donts: [
      '1 つしか項目が無いメニューを作らない。ボタンにする',
      'ナビゲーション（ページ移動）を Menu にしない。リンクの一覧にする',
    ],
  },

  Tabs: {
    examples: [
      {
        id: 'disabled',
        title: '選べないタブ',
        code: `<Tabs disabledKeys={['reviews']}>
  <TabItems>
    <TabItem id="detail">詳細</TabItem>
    <TabItem id="reviews">レビュー（準備中）</TabItem>
  </TabItems>
  <TabContent id="detail">商品の詳細</TabContent>
  <TabContent id="reviews">レビュー</TabContent>
</Tabs>`,
      },
      {
        id: 'vertical',
        title: '縦に並べる',
        note: 'タブが 5 つを超えるか、ラベルが長いなら縦。',
        code: `<Tabs orientation="vertical">
  <TabItems>
    <TabItem id="general">基本情報</TabItem>
    <TabItem id="shipping">配送</TabItem>
    <TabItem id="payment">支払い</TabItem>
  </TabItems>
  <TabContent id="general">基本情報の中身</TabContent>
  <TabContent id="shipping">配送の中身</TabContent>
  <TabContent id="payment">支払いの中身</TabContent>
</Tabs>`,
      },
    ],
    dos: ['同じ対象の別の面を切り替えるときに使う（商品の「詳細」と「レビュー」）'],
    donts: [
      '手順（1 → 2 → 3）に使わない。順番があるならステップ表示にする',
      'タブの中身が空のタブを出さない。消すか isDisabled にする',
    ],
  },

  Accordion: {
    examples: [
      {
        id: 'multiple',
        title: '複数を同時に開く',
        note: '比較させたいなら allowsMultipleExpanded。FAQ は 1 つずつで足りる。',
        code: `<Accordion allowsMultipleExpanded defaultExpandedKeys={['size', 'care']}>
  <AccordionItem id="size" title="サイズ">着丈 68 / 身幅 52</AccordionItem>
  <AccordionItem id="care" title="お手入れ">洗濯機可（ネット使用）</AccordionItem>
  <AccordionItem id="material" title="素材">綿 100%</AccordionItem>
</Accordion>`,
      },
      {
        id: 'disabled',
        title: '開けない項目',
        code: `<Accordion defaultExpandedKeys={['a']}>
  <AccordionItem id="a" title="今月の売上">¥1,240,000</AccordionItem>
  <AccordionItem id="b" title="来月の予測（集計中）" isDisabled>—</AccordionItem>
</Accordion>`,
      },
    ],
    dos: ['読まなくても先に進める補足（FAQ・仕様）に使う'],
    donts: ['必ず読ませる内容を畳まない', 'フォームの必須項目を Accordion の中に隠さない'],
  },

  Breadcrumbs: {
    examples: [
      {
        id: 'separator',
        title: '区切りを変える',
        code: `<Breadcrumbs separator="/">
  <Breadcrumb href="/">ホーム</Breadcrumb>
  <Breadcrumb href="/orders">注文</Breadcrumb>
  <Breadcrumb>#1042</Breadcrumb>
</Breadcrumbs>`,
      },
      {
        id: 'sizes',
        title: '大きさ',
        code: `<Breadcrumbs size="sm">
  <Breadcrumb href="/">ホーム</Breadcrumb>
  <Breadcrumb>設定</Breadcrumb>
</Breadcrumbs>`,
      },
    ],
    dos: ['階層が 3 段以上あるページに置く。最後の項目は現在地でリンクにしない'],
    donts: ['履歴（来た道）を表さない。構造上の位置を表す', 'トップページに置かない'],
  },

  ColorPicker: {
    examples: [
      {
        id: 'validation',
        title: '必須とエラー',
        code: `<ColorPicker label="ブランド色" isRequired isInvalid errorMessage="色を選んでください" />`,
      },
      {
        id: 'disabled',
        title: '無効',
        code: `<ColorPicker label="配色" defaultValue={COLOR_OPTIONS[0]?.id} isDisabled />`,
      },
    ],
    dos: ['選択肢はテーマの 8 色に任せる。自前の色を足さない（検査の外に出る）'],
    donts: ['自由な色相を入力させない。コントラストが保証できなくなる'],
  },

  Toast: {
    examples: [
      {
        id: 'colors',
        title: '意味色',
        note: '成功は短く消す。失敗は timeout を長くするか消さない。',
        imports: ['Button', 'NoviToastRegion', 'createToastQueue'],
        code: `queue.add({ title: '保存しました', color: 'success' }, { timeout: 3000 })
queue.add({ title: '保存できませんでした', description: '通信を確認してください', color: 'danger' })`,
      },
      {
        id: 'action',
        title: '取り消し付き',
        imports: ['Button', 'NoviToastRegion', 'createToastQueue'],
        code: `queue.add(
  { title: '削除しました', action: <Button size="sm" variant="ghost">元に戻す</Button> },
  { timeout: 8000 },
)`,
      },
    ],
    dos: [
      '結果の報告に使う（保存した・削除した）',
      '取り消せる操作には action で「元に戻す」を付ける',
    ],
    donts: [
      '確認や入力を求めない。Modal にする',
      '同じ内容を連打で積まない。前の通知を閉じてから出す',
    ],
  },
}
