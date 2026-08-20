import { Button, Card, CardBody, CardHeader } from '@novi-ui/raster'

// slot ごとにクラスを足す。variant のクラスを上書きしたいときもこれを使う。
export function WideSaveButton() {
  return (
    <Button
      color="primary"
      classNames={{
        root: 'w-full justify-between',
        label: 'tracking-wide',
      }}
    >
      保存
    </Button>
  )
}

// どの slot があるかは各コンポーネントのページの slot 表にある。
export function TightCard() {
  return (
    <Card classNames={{ header: 'pb-1', body: 'pt-1' }}>
      <CardHeader>売上</CardHeader>
      <CardBody>¥1,240,000</CardBody>
    </Card>
  )
}
