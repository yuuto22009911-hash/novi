'use client'

import { themeComponentsFor } from '../lib/theme-components'
import { THEME_NAMES, type ThemeName, themeRegistry } from '../lib/theme-registry'
import { Preview } from './preview'

/**
 * 3モデルを同時に並べる。
 *
 * 切替でしか比べられないと、読者は前の見た目を記憶と照合することになり、
 * 違いが「角丸が違う」程度にしか残らない。**同じ視野に入れると、
 * 余白・字送り・書体の差が一目で読める**。ここが個性の説明になる。
 *
 * 各テーマを名前で直接引くため、ヘッダーのテーマ切替には追従しない。
 * それが目的の画面なので例外的に許す（`themeComponentsFor` の注記を参照）。
 */
function ThemeCard({ name }: { name: ThemeName }) {
  const { Badge, Button, Card, CardBody, CardFooter, CardHeader } = themeComponentsFor(name)
  const meta = themeRegistry[name]

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <span className="font-medium text-sm">{meta.label}</span>
        <span className="text-site-muted text-xs">{meta.description}</span>
      </div>

      <Preview bare theme={name} className="items-stretch">
        <Card className="w-full">
          <CardHeader>今月の売上</CardHeader>
          <CardBody>
            <div className="flex flex-col gap-[var(--novi-gap-stack)]">
              <div className="flex items-baseline gap-[var(--novi-gap-inline)]">
                <span className="text-[length:var(--novi-text-2xl)] [font-variant-numeric:var(--novi-font-numeric)]">
                  1,240,800
                </span>
                <span className="text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]">
                  円
                </span>
              </div>
              <div>
                <Badge color="success" withDot>
                  前月比 +12%
                </Badge>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <Button color="primary" size="sm">
              明細を見る
            </Button>
          </CardFooter>
        </Card>
      </Preview>
    </div>
  )
}

export function ThemeTriptych() {
  return (
    <div className="grid gap-8 sm:grid-cols-3">
      {THEME_NAMES.map((name) => (
        <ThemeCard key={name} name={name} />
      ))}
    </div>
  )
}
