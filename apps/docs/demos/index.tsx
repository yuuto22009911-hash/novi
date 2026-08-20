'use client'

import { useState } from 'react'
import { useNoviTheme } from '../lib/theme-components'

/**
 * 全コンポーネントのデモ。
 *
 * **どのデモも特定のテーマを import していない。**
 * `useNoviTheme()` でコンポーネントを解決するため、
 * テーマを切り替えても JSX は1文字も変わらない（AC-01-4）。
 * これがこのサイト最大の見せ場になっている。
 *
 * 直接 import した瞬間そのデモは切替に追従しなくなるため、CI で検査している。
 */

function ButtonDemo() {
  const { Button } = useNoviTheme()
  return (
    <>
      <Button variant="solid" color="primary">
        保存
      </Button>
      <Button variant="outline">キャンセル</Button>
      <Button variant="soft">下書き</Button>
      <Button variant="ghost">戻る</Button>
      <Button variant="plain">詳細</Button>
    </>
  )
}

function InputDemo() {
  const { Input } = useNoviTheme()
  return (
    <div className="w-full max-w-sm">
      <Input label="メールアドレス" type="email" isRequired description="ログインに使用します" />
    </div>
  )
}

function TextAreaDemo() {
  const { TextArea } = useNoviTheme()
  return (
    <div className="w-full max-w-sm">
      <TextArea label="備考" rows={3} description="500文字まで" />
    </div>
  )
}

function CheckboxDemo() {
  const { Checkbox, CheckboxGroup } = useNoviTheme()
  return (
    <CheckboxGroup label="通知方法" defaultValue={['email']}>
      <Checkbox value="email">メール</Checkbox>
      <Checkbox value="sms">SMS</Checkbox>
    </CheckboxGroup>
  )
}

function RadioDemo() {
  const { Radio, RadioGroup } = useNoviTheme()
  return (
    <RadioGroup label="配送方法" defaultValue="standard">
      <Radio value="standard">通常</Radio>
      <Radio value="express" description="翌日到着">
        速達
      </Radio>
    </RadioGroup>
  )
}

function SwitchDemo() {
  const { Switch } = useNoviTheme()
  return <Switch defaultSelected>メール通知を受け取る</Switch>
}

function SelectDemo() {
  const { Select, SelectItem } = useNoviTheme()
  return (
    <div className="w-full max-w-xs">
      <Select label="都道府県">
        <SelectItem id="tokyo">東京都</SelectItem>
        <SelectItem id="osaka">大阪府</SelectItem>
        <SelectItem id="kyoto">京都府</SelectItem>
      </Select>
    </div>
  )
}

function CardDemo() {
  const { Card, CardBody, CardFooter, CardHeader } = useNoviTheme()
  return (
    <Card className="w-full max-w-xs">
      <CardHeader>売上</CardHeader>
      <CardBody>¥1,240,000</CardBody>
      <CardFooter>前月比 +12%</CardFooter>
    </Card>
  )
}

function BadgeDemo() {
  const { Badge } = useNoviTheme()
  return (
    <>
      <Badge color="success" withDot>
        公開中
      </Badge>
      <Badge color="warning">下書き</Badge>
      <Badge color="danger" variant="outline">
        停止
      </Badge>
    </>
  )
}

function AvatarDemo() {
  const { Avatar } = useNoviTheme()
  return (
    <>
      <Avatar name="小島 佑翔" />
      <Avatar name="Ada Lovelace" size="lg" />
      <Avatar name="設定" radius="none" />
    </>
  )
}

function ProgressDemo() {
  const { Progress } = useNoviTheme()
  return (
    <div className="w-full max-w-sm">
      <Progress label="アップロード中" value={62} showValueLabel />
    </div>
  )
}

function SpinnerDemo() {
  const { Spinner } = useNoviTheme()
  return <Spinner label="読み込み中" />
}

function SkeletonDemo() {
  const { Skeleton } = useNoviTheme()
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

function ModalDemo() {
  const { Button, Modal, ModalBody, ModalFooter, ModalTitle } = useNoviTheme()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button onPress={() => setIsOpen(true)}>ダイアログを開く</Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalTitle>削除しますか</ModalTitle>
        <ModalBody>この操作は取り消せません。</ModalBody>
        <ModalFooter>
          <Button variant="outline" onPress={() => setIsOpen(false)}>
            キャンセル
          </Button>
          <Button color="danger" onPress={() => setIsOpen(false)}>
            削除
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

function PopoverDemo() {
  const { Button, Popover, PopoverContent } = useNoviTheme()
  return (
    <Popover>
      <Button variant="outline">詳細</Button>
      <PopoverContent>ここに補足を書く</PopoverContent>
    </Popover>
  )
}

function TooltipDemo() {
  const { Button, Tooltip } = useNoviTheme()
  return (
    <Tooltip content="クリップボードにコピーします">
      <Button variant="outline">複製</Button>
    </Tooltip>
  )
}

function MenuDemo() {
  const { Button, Menu, MenuItem, MenuSeparator } = useNoviTheme()
  return (
    <Menu>
      <Button variant="outline">操作</Button>
      <MenuItem id="rename" shortcut="⌘R">
        名前を変更
      </MenuItem>
      <MenuItem id="duplicate" shortcut="⌘D">
        複製
      </MenuItem>
      <MenuSeparator />
      <MenuItem id="delete">削除</MenuItem>
    </Menu>
  )
}

function TabsDemo() {
  const { TabContent, TabItem, TabItems, Tabs } = useNoviTheme()
  return (
    <Tabs className="w-full">
      <TabItems>
        <TabItem id="profile">プロフィール</TabItem>
        <TabItem id="settings">設定</TabItem>
      </TabItems>
      <TabContent id="profile">プロフィールの中身</TabContent>
      <TabContent id="settings">設定の中身</TabContent>
    </Tabs>
  )
}

function AccordionDemo() {
  const { Accordion, AccordionItem } = useNoviTheme()
  return (
    <Accordion className="w-full max-w-md" defaultExpandedKeys={['shipping']}>
      <AccordionItem id="shipping" title="配送について">
        3営業日以内に発送します。
      </AccordionItem>
      <AccordionItem id="returns" title="返品について">
        到着後7日以内にご連絡ください。
      </AccordionItem>
    </Accordion>
  )
}

function BreadcrumbsDemo() {
  const { Breadcrumb, Breadcrumbs } = useNoviTheme()
  return (
    <Breadcrumbs>
      <Breadcrumb href="/">ホーム</Breadcrumb>
      <Breadcrumb href="/docs">ドキュメント</Breadcrumb>
      <Breadcrumb>Button</Breadcrumb>
    </Breadcrumbs>
  )
}

function ToastDemo() {
  const { Button, NoviToastRegion, createToastQueue } = useNoviTheme()
  const [queue] = useState(() => createToastQueue())
  return (
    <>
      <Button
        onPress={() =>
          queue.add(
            { title: '保存しました', description: '変更が反映されています' },
            { timeout: 4000 },
          )
        }
      >
        通知を出す
      </Button>
      <NoviToastRegion queue={queue} />
    </>
  )
}

/** slug → デモの描画関数。 */
export const DEMO_RENDERERS: Record<string, () => React.ReactNode> = {
  button: () => <ButtonDemo />,
  input: () => <InputDemo />,
  textarea: () => <TextAreaDemo />,
  checkbox: () => <CheckboxDemo />,
  radio: () => <RadioDemo />,
  switch: () => <SwitchDemo />,
  select: () => <SelectDemo />,
  card: () => <CardDemo />,
  badge: () => <BadgeDemo />,
  avatar: () => <AvatarDemo />,
  progress: () => <ProgressDemo />,
  spinner: () => <SpinnerDemo />,
  skeleton: () => <SkeletonDemo />,
  modal: () => <ModalDemo />,
  popover: () => <PopoverDemo />,
  tooltip: () => <TooltipDemo />,
  menu: () => <MenuDemo />,
  tabs: () => <TabsDemo />,
  accordion: () => <AccordionDemo />,
  breadcrumbs: () => <BreadcrumbsDemo />,
  toast: () => <ToastDemo />,
}
