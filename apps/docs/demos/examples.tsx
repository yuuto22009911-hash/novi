'use client'

import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { type ReactNode, useState } from 'react'
import { useNoviTheme } from '../lib/theme-components'

/**
 * 「例」の描画関数。`extras.ts` の `code` と対で保つ。
 *
 * 主デモ（`index.tsx`）と同じく、特定のテーマを import しない。
 * `useNoviTheme()` で解決するので、テーマを切り替えても JSX は変わらない。
 */

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

const Stack = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full max-w-sm flex-col gap-[var(--novi-gap-stack)]">{children}</div>
)

type Renderers = Record<string, () => ReactNode>

const button: Renderers = {
  colors: () => {
    const { Button } = useNoviTheme()
    return (
      <>
        <Button color="primary">保存</Button>
        <Button color="secondary">下書き</Button>
        <Button color="success">承認</Button>
        <Button color="warning">保留</Button>
        <Button color="danger">削除</Button>
      </>
    )
  },
  sizes: () => {
    const { Button } = useNoviTheme()
    return (
      <>
        <Button size="sm">小</Button>
        <Button size="md">中</Button>
        <Button size="lg">大</Button>
      </>
    )
  },
  states: () => {
    const { Button } = useNoviTheme()
    return (
      <>
        <Button color="primary" isLoading>
          送信中
        </Button>
        <Button isDisabled>編集できません</Button>
      </>
    )
  },
  content: () => {
    const { Button } = useNoviTheme()
    return (
      <>
        <Button startContent={<PlusIcon />}>追加</Button>
        <Button variant="outline" endContent={<ArrowIcon />}>
          次へ
        </Button>
      </>
    )
  },
}

const input: Renderers = {
  validation: () => {
    const { Input } = useNoviTheme()
    return (
      <Stack>
        <Input
          label="メールアドレス"
          type="email"
          defaultValue="taro@example"
          isInvalid
          errorMessage="@ 以降のドメインが足りません"
        />
      </Stack>
    )
  },
  content: () => {
    const { Input } = useNoviTheme()
    return (
      <Stack>
        <Input label="金額" startContent="¥" />
        <Input label="重さ" endContent="kg" />
      </Stack>
    )
  },
  states: () => {
    const { Input } = useNoviTheme()
    return (
      <Stack>
        <Input label="注文番号" defaultValue="#1042" isReadOnly />
        <Input label="クーポン" isDisabled description="会員登録後に使えます" />
      </Stack>
    )
  },
  sizes: () => {
    const { Input } = useNoviTheme()
    return (
      <Stack>
        <Input label="小" size="sm" />
        <Input label="中" size="md" />
        <Input label="大" size="lg" />
      </Stack>
    )
  },
}

const textarea: Renderers = {
  maxlength: () => {
    const { TextArea } = useNoviTheme()
    return (
      <Stack>
        <TextArea label="自己紹介" rows={4} maxLength={200} description="200 文字まで" />
      </Stack>
    )
  },
  validation: () => {
    const { TextArea } = useNoviTheme()
    return (
      <Stack>
        <TextArea label="理由" isRequired isInvalid errorMessage="理由を入力してください" />
      </Stack>
    )
  },
  states: () => {
    const { TextArea } = useNoviTheme()
    return (
      <Stack>
        <TextArea label="規約" rows={3} isReadOnly defaultValue="第1条 本規約は…" />
      </Stack>
    )
  },
}

const checkbox: Renderers = {
  single: () => {
    const { Checkbox } = useNoviTheme()
    return (
      <Stack>
        <Checkbox defaultSelected>利用規約に同意する</Checkbox>
        <Checkbox description="配送のお知らせを受け取ります">メール通知</Checkbox>
      </Stack>
    )
  },
  validation: () => {
    const { Checkbox, CheckboxGroup } = useNoviTheme()
    return (
      <CheckboxGroup label="対象" isRequired isInvalid errorMessage="1 つ以上選んでください">
        <Checkbox value="tops">トップス</Checkbox>
        <Checkbox value="bottoms">ボトムス</Checkbox>
      </CheckboxGroup>
    )
  },
  indeterminate: () => {
    const { Checkbox } = useNoviTheme()
    return <Checkbox isIndeterminate>すべて選択</Checkbox>
  },
  horizontal: () => {
    const { Checkbox, CheckboxGroup } = useNoviTheme()
    return (
      <CheckboxGroup label="サイズ" orientation="horizontal" defaultValue={['m']}>
        <Checkbox value="s">S</Checkbox>
        <Checkbox value="m">M</Checkbox>
        <Checkbox value="l">L</Checkbox>
      </CheckboxGroup>
    )
  },
}

const radio: Renderers = {
  horizontal: () => {
    const { Radio, RadioGroup } = useNoviTheme()
    return (
      <RadioGroup label="サイズ" orientation="horizontal" defaultValue="m">
        <Radio value="s">S</Radio>
        <Radio value="m">M</Radio>
        <Radio value="l">L</Radio>
      </RadioGroup>
    )
  },
  disabled: () => {
    const { Radio, RadioGroup } = useNoviTheme()
    return (
      <RadioGroup label="色" defaultValue="ink">
        <Radio value="ink">インク</Radio>
        <Radio value="brick" isDisabled description="在庫切れ">
          ブリック
        </Radio>
      </RadioGroup>
    )
  },
  validation: () => {
    const { Radio, RadioGroup } = useNoviTheme()
    return (
      <RadioGroup label="支払い方法" isRequired isInvalid errorMessage="選んでください">
        <Radio value="card">カード</Radio>
        <Radio value="bank">振込</Radio>
      </RadioGroup>
    )
  },
}

const switchExamples: Renderers = {
  description: () => {
    const { Switch } = useNoviTheme()
    return (
      <Switch defaultSelected description="在庫が 5 点を切ったら通知します">
        在庫アラート
      </Switch>
    )
  },
  sizes: () => {
    const { Switch } = useNoviTheme()
    return (
      <Stack>
        <Switch size="sm">小</Switch>
        <Switch size="md">中</Switch>
        <Switch size="lg">大</Switch>
      </Stack>
    )
  },
  states: () => {
    const { Switch } = useNoviTheme()
    return (
      <Stack>
        <Switch isDisabled>プランの変更が必要です</Switch>
        <Switch isSelected isReadOnly>
          管理者が固定
        </Switch>
      </Stack>
    )
  },
}

const numberField: Renderers = {
  range: () => {
    const { NumberField } = useNoviTheme()
    return (
      <Stack>
        <NumberField label="購入数" defaultValue={2} minValue={1} maxValue={10} step={1} />
        <NumberField
          label="割引率"
          defaultValue={0.1}
          minValue={0}
          maxValue={1}
          step={0.05}
          formatOptions={{ style: 'percent' }}
        />
      </Stack>
    )
  },
  unit: () => {
    const { NumberField } = useNoviTheme()
    return (
      <Stack>
        <NumberField
          label="重さ"
          defaultValue={1.5}
          step={0.1}
          formatOptions={{ style: 'unit', unit: 'kilogram' }}
        />
      </Stack>
    )
  },
  validation: () => {
    const { NumberField } = useNoviTheme()
    return (
      <Stack>
        <NumberField
          label="数量"
          defaultValue={0}
          isInvalid
          errorMessage="1 以上を入力してください"
        />
        <NumberField
          label="単価"
          defaultValue={1200}
          isDisabled
          formatOptions={{ style: 'currency', currency: 'JPY' }}
        />
      </Stack>
    )
  },
}

const comboBox: Renderers = {
  custom: () => {
    const { ComboBox, ComboBoxItem } = useNoviTheme()
    return (
      <Stack>
        <ComboBox label="タグ" allowsCustomValue placeholder="新しいタグも入力できます">
          <ComboBoxItem id="new">新作</ComboBoxItem>
          <ComboBoxItem id="sale">セール</ComboBoxItem>
          <ComboBoxItem id="limited">限定</ComboBoxItem>
        </ComboBox>
      </Stack>
    )
  },
  focus: () => {
    const { ComboBox, ComboBoxItem } = useNoviTheme()
    return (
      <Stack>
        <ComboBox label="担当者" menuTrigger="focus">
          <ComboBoxItem id="yamada">山田</ComboBoxItem>
          <ComboBoxItem id="sato">佐藤</ComboBoxItem>
          <ComboBoxItem id="suzuki">鈴木</ComboBoxItem>
        </ComboBox>
      </Stack>
    )
  },
  validation: () => {
    const { ComboBox, ComboBoxItem } = useNoviTheme()
    return (
      <Stack>
        <ComboBox label="仕入先" isRequired isInvalid errorMessage="一覧から選んでください">
          <ComboBoxItem id="a">A 商事</ComboBoxItem>
          <ComboBoxItem id="b">B 産業</ComboBoxItem>
        </ComboBox>
      </Stack>
    )
  },
}

const datePicker: Renderers = {
  range: () => {
    const { DatePicker } = useNoviTheme()
    return (
      <Stack>
        <DatePicker
          label="納期"
          minValue={parseDate('2026-09-10')}
          maxValue={parseDate('2026-09-30')}
          description="9月10日〜30日"
        />
      </Stack>
    )
  },
  unavailable: () => {
    const { DatePicker } = useNoviTheme()
    return (
      <Stack>
        <DatePicker
          label="来店日"
          defaultValue={parseDate('2026-09-07')}
          isDateUnavailable={(date) => date.toDate(getLocalTimeZone()).getDay() === 0}
          description="日曜定休"
        />
      </Stack>
    )
  },
  validation: () => {
    const { DatePicker } = useNoviTheme()
    return (
      <Stack>
        <DatePicker label="出荷日" isRequired isInvalid errorMessage="出荷日を選んでください" />
      </Stack>
    )
  },
}

const select: Renderers = {
  validation: () => {
    const { Select, SelectItem } = useNoviTheme()
    return (
      <Stack>
        <Select
          label="配送方法"
          description="離島は速達を選べません"
          isRequired
          isInvalid
          errorMessage="選んでください"
        >
          <SelectItem id="standard">通常</SelectItem>
          <SelectItem id="express">速達</SelectItem>
        </Select>
      </Stack>
    )
  },
  disabled: () => {
    const { Select, SelectItem } = useNoviTheme()
    return (
      <Stack>
        <Select label="サイズ" defaultSelectedKey="m">
          <SelectItem id="s">S</SelectItem>
          <SelectItem id="m">M</SelectItem>
          <SelectItem id="l" isDisabled>
            L（在庫切れ）
          </SelectItem>
        </Select>
      </Stack>
    )
  },
  sizes: () => {
    const { Select, SelectItem } = useNoviTheme()
    return (
      <Stack>
        <Select label="小" size="sm">
          <SelectItem id="a">A</SelectItem>
        </Select>
        <Select label="中" size="md">
          <SelectItem id="a">A</SelectItem>
        </Select>
        <Select label="大" size="lg">
          <SelectItem id="a">A</SelectItem>
        </Select>
      </Stack>
    )
  },
}

const pagination: Renderers = {
  sizes: () => {
    const { Pagination } = useNoviTheme()
    return (
      <div className="flex flex-col gap-[var(--novi-gap-stack)]">
        <Pagination total={8} defaultPage={3} size="sm" />
        <Pagination total={8} defaultPage={3} size="md" />
        <Pagination total={8} defaultPage={3} size="lg" />
      </div>
    )
  },
  siblings: () => {
    const { Pagination } = useNoviTheme()
    return (
      <div className="w-full overflow-x-auto">
        <Pagination total={30} defaultPage={15} siblingCount={2} boundaryCount={2} />
      </div>
    )
  },
  disabled: () => {
    const { Pagination } = useNoviTheme()
    return <Pagination total={12} defaultPage={5} isDisabled />
  },
}

const table: Renderers = {
  selection: () => {
    const { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } = useNoviTheme()
    return (
      <div className="w-full overflow-x-auto">
        <Table aria-label="担当者" selectionMode="single" defaultSelectedKeys={['2']}>
          <TableHeader>
            <TableColumn id="name" isRowHeader>
              氏名
            </TableColumn>
            <TableColumn id="role">役割</TableColumn>
          </TableHeader>
          <TableBody>
            <TableRow id="1">
              <TableCell>山田 花子</TableCell>
              <TableCell>店長</TableCell>
            </TableRow>
            <TableRow id="2">
              <TableCell>佐藤 健</TableCell>
              <TableCell>販売</TableCell>
            </TableRow>
            <TableRow id="3">
              <TableCell>鈴木 一郎</TableCell>
              <TableCell>在庫</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  },
  empty: () => {
    const { Table, TableBody, TableColumn, TableHeader } = useNoviTheme()
    return (
      <div className="w-full overflow-x-auto">
        <Table aria-label="返品一覧">
          <TableHeader>
            <TableColumn id="no" isRowHeader>
              返品番号
            </TableColumn>
            <TableColumn id="reason">理由</TableColumn>
          </TableHeader>
          <TableBody renderEmptyState={() => '返品はありません。注文一覧から登録できます'}>
            {[]}
          </TableBody>
        </Table>
      </div>
    )
  },
  sizes: () => {
    const { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } = useNoviTheme()
    return (
      <div className="w-full overflow-x-auto">
        <Table aria-label="在庫" size="sm">
          <TableHeader>
            <TableColumn id="sku" isRowHeader>
              SKU
            </TableColumn>
            <TableColumn id="qty" align="end">
              在庫
            </TableColumn>
          </TableHeader>
          <TableBody>
            <TableRow id="a">
              <TableCell>TS-001-M</TableCell>
              <TableCell align="end">12</TableCell>
            </TableRow>
            <TableRow id="b">
              <TableCell>TS-001-L</TableCell>
              <TableCell align="end">3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  },
}

const card: Renderers = {
  image: () => {
    const { Card, CardBody, CardHeader, CardImage } = useNoviTheme()
    return (
      <Card className="w-full max-w-xs">
        <CardImage src="/og.png" alt="" />
        <CardHeader>秋の新作</CardHeader>
        <CardBody>ウールのコート 3 型を追加しました。</CardBody>
      </Card>
    )
  },
  pressable: () => {
    const { Card, CardBody, CardHeader } = useNoviTheme()
    return (
      <Card className="w-full max-w-xs" onPress={() => {}}>
        <CardHeader>注文 #1042</CardHeader>
        <CardBody>山田 花子 · ¥12,800</CardBody>
      </Card>
    )
  },
  variants: () => {
    const { Card, CardBody } = useNoviTheme()
    return (
      <>
        <Card variant="solid">
          <CardBody>solid</CardBody>
        </Card>
        <Card variant="outline">
          <CardBody>outline</CardBody>
        </Card>
        <Card variant="soft">
          <CardBody>soft</CardBody>
        </Card>
      </>
    )
  },
}

const badge: Renderers = {
  colors: () => {
    const { Badge } = useNoviTheme()
    return (
      <>
        <Badge color="success" withDot>
          公開中
        </Badge>
        <Badge color="warning" withDot>
          審査中
        </Badge>
        <Badge color="danger" withDot>
          停止
        </Badge>
        <Badge color="default">下書き</Badge>
      </>
    )
  },
  variants: () => {
    const { Badge } = useNoviTheme()
    return (
      <>
        <Badge variant="solid" color="primary">
          solid
        </Badge>
        <Badge variant="soft" color="primary">
          soft
        </Badge>
        <Badge variant="outline" color="primary">
          outline
        </Badge>
      </>
    )
  },
  sizes: () => {
    const { Badge } = useNoviTheme()
    return (
      <>
        <Badge size="sm">小</Badge>
        <Badge size="md">中</Badge>
        <Badge size="lg">大</Badge>
      </>
    )
  },
}

const avatar: Renderers = {
  image: () => {
    const { Avatar } = useNoviTheme()
    return (
      <>
        <Avatar src="/apple-touch-icon.png" name="Novi" />
        <Avatar src="/missing.png" name="山本 太郎" />
      </>
    )
  },
  sizes: () => {
    const { Avatar } = useNoviTheme()
    return (
      <>
        <Avatar name="山本 太郎" size="sm" />
        <Avatar name="山本 太郎" size="md" />
        <Avatar name="山本 太郎" size="lg" />
      </>
    )
  },
  badge: () => {
    const { Avatar, Badge } = useNoviTheme()
    return (
      <Avatar
        name="山本 太郎"
        badge={
          <Badge color="success" size="sm" withDot>
            在席
          </Badge>
        }
      />
    )
  },
}

const progress: Renderers = {
  colors: () => {
    const { Progress } = useNoviTheme()
    return (
      <Stack>
        <Progress label="在庫の消化" value={80} color="warning" showValueLabel />
        <Progress label="容量" value={95} color="danger" showValueLabel />
      </Stack>
    )
  },
  range: () => {
    const { Progress } = useNoviTheme()
    return (
      <Stack>
        <Progress label="出荷処理" value={38} maxValue={120} showValueLabel />
      </Stack>
    )
  },
  sizes: () => {
    const { Progress } = useNoviTheme()
    return (
      <Stack>
        <Progress label="小" value={40} size="sm" />
        <Progress label="大" value={40} size="lg" />
      </Stack>
    )
  },
}

const spinner: Renderers = {
  sizes: () => {
    const { Spinner } = useNoviTheme()
    return (
      <>
        <Spinner size="sm" label="読み込み中" />
        <Spinner size="md" label="読み込み中" />
        <Spinner size="lg" label="読み込み中" />
      </>
    )
  },
  colors: () => {
    const { Spinner } = useNoviTheme()
    return (
      <>
        <Spinner color="primary" label="送信中" />
        <Spinner color="danger" label="削除中" />
      </>
    )
  },
}

const skeleton: Renderers = {
  card: () => {
    const { Skeleton } = useNoviTheme()
    return (
      <div className="flex items-center gap-[var(--novi-gap-inline)]">
        <Skeleton className="size-10" radius="full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    )
  },
}

function ModalSizes() {
  const { Button, Modal, ModalBody, ModalTitle } = useNoviTheme()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onPress={() => setIsOpen(true)}>
        小さな確認を開く
      </Button>
      <Modal size="sm" isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalTitle>小さな確認</ModalTitle>
        <ModalBody>はい / いいえで済む内容。</ModalBody>
      </Modal>
    </>
  )
}

function ModalForm() {
  const { Button, Input, Modal, ModalBody, ModalFooter, ModalTitle } = useNoviTheme()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onPress={() => setIsOpen(true)}>
        住所を編集
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen} isDismissable={false}>
        <ModalTitle>住所を編集</ModalTitle>
        <ModalBody>
          <div className="flex flex-col gap-[var(--novi-gap-stack)]">
            <Input label="郵便番号" />
            <Input label="住所" />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onPress={() => setIsOpen(false)}>
            キャンセル
          </Button>
          <Button color="primary" onPress={() => setIsOpen(false)}>
            保存
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

const modal: Renderers = {
  sizes: () => <ModalSizes />,
  form: () => <ModalForm />,
}

const popover: Renderers = {
  placement: () => {
    const { Button, Popover, PopoverContent } = useNoviTheme()
    return (
      <>
        <Popover placement="bottom">
          <Button variant="outline">下に出す</Button>
          <PopoverContent>補足の文章</PopoverContent>
        </Popover>
        <Popover placement="right">
          <Button variant="outline">右に出す</Button>
          <PopoverContent>補足の文章</PopoverContent>
        </Popover>
      </>
    )
  },
  rich: () => {
    const { Button, Checkbox, CheckboxGroup, Popover, PopoverContent } = useNoviTheme()
    return (
      <Popover>
        <Button variant="outline">絞り込み</Button>
        <PopoverContent>
          <CheckboxGroup label="状態" defaultValue={['open']}>
            <Checkbox value="open">公開中</Checkbox>
            <Checkbox value="draft">下書き</Checkbox>
          </CheckboxGroup>
        </PopoverContent>
      </Popover>
    )
  },
}

const tooltip: Renderers = {
  placement: () => {
    const { Button, Tooltip } = useNoviTheme()
    return (
      <>
        <Tooltip content="上に出る" placement="top">
          <Button variant="outline">上</Button>
        </Tooltip>
        <Tooltip content="下に出る" placement="bottom">
          <Button variant="outline">下</Button>
        </Tooltip>
      </>
    )
  },
  icon: () => {
    const { Button, Tooltip } = useNoviTheme()
    return (
      <Tooltip content="複製">
        <Button variant="ghost">
          <CopyIcon />
          <span className="sr-only">複製</span>
        </Button>
      </Tooltip>
    )
  },
}

const menu: Renderers = {
  sections: () => {
    const { Button, Menu, MenuItem, MenuSection } = useNoviTheme()
    return (
      <Menu>
        <Button variant="outline">注文の操作</Button>
        <MenuSection title="この注文">
          <MenuItem id="print">納品書を印刷</MenuItem>
          <MenuItem id="ship">出荷済みにする</MenuItem>
        </MenuSection>
        <MenuSection title="危険な操作">
          <MenuItem id="cancel" description="在庫が戻ります">
            キャンセル
          </MenuItem>
        </MenuSection>
      </Menu>
    )
  },
  disabled: () => {
    const { Button, Menu, MenuItem } = useNoviTheme()
    return (
      <Menu disabledKeys={['refund']}>
        <Button variant="outline">操作</Button>
        <MenuItem id="edit">編集</MenuItem>
        <MenuItem id="refund" description="出荷後は返金できません">
          返金
        </MenuItem>
      </Menu>
    )
  },
}

const tabs: Renderers = {
  disabled: () => {
    const { TabContent, TabItem, TabItems, Tabs } = useNoviTheme()
    return (
      <Tabs className="w-full" disabledKeys={['reviews']}>
        <TabItems>
          <TabItem id="detail">詳細</TabItem>
          <TabItem id="reviews">レビュー（準備中）</TabItem>
        </TabItems>
        <TabContent id="detail">商品の詳細</TabContent>
        <TabContent id="reviews">レビュー</TabContent>
      </Tabs>
    )
  },
  vertical: () => {
    const { TabContent, TabItem, TabItems, Tabs } = useNoviTheme()
    return (
      <Tabs className="w-full" orientation="vertical">
        <TabItems>
          <TabItem id="general">基本情報</TabItem>
          <TabItem id="shipping">配送</TabItem>
          <TabItem id="payment">支払い</TabItem>
        </TabItems>
        <TabContent id="general">基本情報の中身</TabContent>
        <TabContent id="shipping">配送の中身</TabContent>
        <TabContent id="payment">支払いの中身</TabContent>
      </Tabs>
    )
  },
}

const accordion: Renderers = {
  multiple: () => {
    const { Accordion, AccordionItem } = useNoviTheme()
    return (
      <Accordion
        className="w-full max-w-md"
        allowsMultipleExpanded
        defaultExpandedKeys={['size', 'care']}
      >
        <AccordionItem id="size" title="サイズ">
          着丈 68 / 身幅 52
        </AccordionItem>
        <AccordionItem id="care" title="お手入れ">
          洗濯機可（ネット使用）
        </AccordionItem>
        <AccordionItem id="material" title="素材">
          綿 100%
        </AccordionItem>
      </Accordion>
    )
  },
  disabled: () => {
    const { Accordion, AccordionItem } = useNoviTheme()
    return (
      <Accordion className="w-full max-w-md" defaultExpandedKeys={['a']}>
        <AccordionItem id="a" title="今月の売上">
          ¥1,240,000
        </AccordionItem>
        <AccordionItem id="b" title="来月の予測（集計中）" isDisabled>
          —
        </AccordionItem>
      </Accordion>
    )
  },
}

const breadcrumbs: Renderers = {
  separator: () => {
    const { Breadcrumb, Breadcrumbs } = useNoviTheme()
    return (
      <Breadcrumbs separator="/">
        <Breadcrumb href="/">ホーム</Breadcrumb>
        <Breadcrumb href="/orders">注文</Breadcrumb>
        <Breadcrumb>#1042</Breadcrumb>
      </Breadcrumbs>
    )
  },
  sizes: () => {
    const { Breadcrumb, Breadcrumbs } = useNoviTheme()
    return (
      <Breadcrumbs size="sm">
        <Breadcrumb href="/">ホーム</Breadcrumb>
        <Breadcrumb>設定</Breadcrumb>
      </Breadcrumbs>
    )
  },
}

const colorPicker: Renderers = {
  validation: () => {
    const { ColorPicker } = useNoviTheme()
    return <ColorPicker label="ブランド色" isRequired isInvalid errorMessage="色を選んでください" />
  },
  disabled: () => {
    const { ColorPicker, COLOR_OPTIONS } = useNoviTheme()
    return <ColorPicker label="配色" defaultValue={COLOR_OPTIONS[0]?.id} isDisabled />
  },
}

function ToastColors() {
  const { Button, NoviToastRegion, createToastQueue } = useNoviTheme()
  const [queue] = useState(() => createToastQueue())
  return (
    <>
      <Button
        variant="outline"
        onPress={() => queue.add({ title: '保存しました', color: 'success' }, { timeout: 3000 })}
      >
        成功
      </Button>
      <Button
        variant="outline"
        onPress={() =>
          queue.add({
            title: '保存できませんでした',
            description: '通信を確認してください',
            color: 'danger',
          })
        }
      >
        失敗
      </Button>
      <NoviToastRegion queue={queue} />
    </>
  )
}

function ToastAction() {
  const { Button, NoviToastRegion, createToastQueue } = useNoviTheme()
  const [queue] = useState(() => createToastQueue())
  return (
    <>
      <Button
        variant="outline"
        onPress={() =>
          queue.add(
            {
              title: '削除しました',
              action: (
                <Button size="sm" variant="ghost">
                  元に戻す
                </Button>
              ),
            },
            { timeout: 8000 },
          )
        }
      >
        削除して通知
      </Button>
      <NoviToastRegion queue={queue} />
    </>
  )
}

const toast: Renderers = {
  colors: () => <ToastColors />,
  action: () => <ToastAction />,
}

/** slug → 例 id → 描画関数。 */
export const EXAMPLE_RENDERERS: Record<string, Renderers> = {
  button,
  input,
  textarea,
  checkbox,
  radio,
  switch: switchExamples,
  numberfield: numberField,
  combobox: comboBox,
  datepicker: datePicker,
  select,
  pagination,
  table,
  card,
  badge,
  avatar,
  progress,
  spinner,
  skeleton,
  modal,
  popover,
  tooltip,
  menu,
  tabs,
  accordion,
  breadcrumbs,
  colorpicker: colorPicker,
  toast,
}
