'use client'

import { useNoviTheme } from '../lib/theme-components'
import type { ColorEntry } from './token-tables'

/**
 * 試着室。**選んだ染料を、本物のコンポーネントに着せて見せる。**
 *
 * 色見本（ColorCard）は染料そのものを見せるが、服に仕立てたときの発色は
 * 面積・隣り合う中立色・文字とのコントラストで決まる。アパレルの見本帳が
 * 生地見本の隣に着用写真を置くのと同じで、ここでは同じ一着を全色で着せ替える。
 *
 * ライブラリ本体を引き込む唯一の場所なので、呼び出し側は `lazy()` で読む。
 */
export default function FittingRoom({
  color,
  colorSet,
  onChange,
  theme,
}: {
  color: string
  colorSet: ColorEntry[]
  onChange: (id: string) => void
  theme: string
}) {
  const { Badge, Button, Card, CardBody, CardFooter, CardHeader, Input, Switch } = useNoviTheme()
  const entry = colorSet.find((c) => c.id === color) ?? colorSet[0]
  const pairName = colorSet.find((c) => c.id === entry?.pair)?.name ?? entry?.pair ?? ''

  const faces = [
    { scheme: undefined, label: 'LIGHT' },
    { scheme: 'dark', label: 'DARK' },
  ] as const

  return (
    <div id="fitting-room" className="flex flex-col gap-4 scroll-mt-24">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">試着</span>
          <span className="text-site-muted text-sm">{entry?.name} を着せています</span>
        </div>
        <fieldset aria-label="染料を選ぶ" className="m-0 flex min-w-0 flex-wrap gap-1 border-0 p-0">
          {colorSet.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={c.id === color}
              aria-label={c.name}
              title={c.name}
              onClick={() => onChange(c.id)}
              data-novi-theme={theme}
              data-novi-color={c.id}
              className="flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-site-fg focus-visible:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className={[
                  'size-7 rounded-full bg-[var(--novi-color-primary)] transition-transform',
                  c.id === color ? 'scale-100 ring-2 ring-site-fg ring-offset-2' : 'scale-90',
                ].join(' ')}
              />
            </button>
          ))}
        </fieldset>
      </div>

      <div className="grid gap-px border border-site-border bg-site-border sm:grid-cols-2">
        {faces.map((face) => (
          <div
            key={face.label}
            data-novi-theme={theme}
            data-novi-color={color}
            {...(face.scheme === undefined ? {} : { 'data-novi-scheme': face.scheme })}
            className="flex min-w-0 flex-col gap-3 bg-[var(--novi-color-bg)] p-4 text-[var(--novi-color-fg)]"
          >
            <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--novi-color-muted)]">
              {face.label}
            </span>
            <Card className="w-full">
              <CardHeader>注文 #1042</CardHeader>
              <CardBody>
                <div className="flex flex-col gap-[var(--novi-gap-stack)]">
                  <Input label="お届け先" defaultValue="東京都渋谷区神宮前 1-2-3" />
                  <Switch defaultSelected>ギフト包装</Switch>
                  <div className="flex flex-wrap gap-[var(--novi-gap-inline)]">
                    <Badge color="success" withDot>
                      支払い済み
                    </Badge>
                    <Badge color="secondary">相方 {pairName}</Badge>
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <div className="flex flex-wrap justify-end gap-[var(--novi-gap-inline)]">
                  <Button variant="outline">下書き保存</Button>
                  <Button color="primary">確定する</Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
