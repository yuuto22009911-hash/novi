'use client'

import { useNoviTheme } from '../lib/theme-components'
import { CodeExample } from './code-example'
import { Preview } from './preview'

const CODE = `<Card>
  <CardHeader>アカウント設定</CardHeader>
  <CardBody>
    <Input label="表示名" defaultValue="山本 太郎" />
    <Switch defaultSelected>メール通知を受け取る</Switch>
    <Badge color="success" withDot>有効</Badge>
  </CardBody>
  <CardFooter>
    <Button variant="outline">キャンセル</Button>
    <Button color="primary">保存</Button>
  </CardFooter>
</Card>`

/**
 * トップの対比デモ。
 *
 * **スクロールなしで「テーマを切り替えられる」ことが伝わる**位置に置く（AC-05-3）。
 * 同じ JSX が別の見た目になる、という一点だけを示す。
 */
export function HeroPreview() {
  const { Badge, Button, Card, CardBody, CardFooter, CardHeader, Input, Switch } = useNoviTheme()

  return (
    // grid の子は既定で内容の最小幅より縮めない。コード例の1行が長いと
    // 列ごと広がって画面からはみ出すため、min-w-0 で明示的に縮められるようにする
    <div className="grid gap-4 *:min-w-0 lg:grid-cols-2">
      <Preview bare className="items-stretch">
        <Card className="w-full">
          <CardHeader>アカウント設定</CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <Input label="表示名" defaultValue="山本 太郎" />
              <Switch defaultSelected>メール通知を受け取る</Switch>
              <div>
                <Badge color="success" withDot>
                  有効
                </Badge>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <div className="flex justify-end gap-2">
              <Button variant="outline">キャンセル</Button>
              <Button color="primary">保存</Button>
            </div>
          </CardFooter>
        </Card>
      </Preview>

      <CodeExample
        code={CODE}
        imports={[
          'Badge',
          'Button',
          'Card',
          'CardBody',
          'CardFooter',
          'CardHeader',
          'Input',
          'Switch',
        ]}
      />
    </div>
  )
}
