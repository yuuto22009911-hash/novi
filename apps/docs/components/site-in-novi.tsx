'use client'

import { useNoviTheme } from '../lib/theme-components'
import { Preview } from './preview'

/**
 * このサイト自身の UI を Novi だけで組み直したミニチュア（T-28 / ADR-D1 の補償）。
 *
 * サイトの外枠がテーマに染まらないのは、比較対象を明確にするための設計であって
 * （ADR-D1）、Novi でサイトが作れないからではない。その誤解をここで1つ潰す。
 *
 * 中身は上のページで実際に見ているもの（ヘッダー・パンくず・タブ・props 表）の再現。
 * テーマを切り替えると、この「サイト」も丸ごと別の見た目になる。
 */
export function SiteInNovi() {
  const {
    Badge,
    Breadcrumb,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Select,
    SelectItem,
    TabContent,
    TabItem,
    TabItems,
    Tabs,
  } = useNoviTheme()

  return (
    <Preview className="items-stretch">
      <div className="flex w-full flex-col">
        {/* ヘッダー。実物と同じ構成: サイト名 / ナビ / テーマ選択 */}
        <header className="flex items-center justify-between gap-4 border-b border-[var(--novi-color-border)] pb-3">
          <span className="font-medium text-[var(--novi-color-fg)]">Novi UI</span>
          <nav aria-label="ミニチュアのナビゲーション" className="flex items-center gap-1">
            <Button variant="plain" size="sm">
              はじめに
            </Button>
            <Button variant="plain" size="sm">
              コンポーネント
            </Button>
            <Select aria-label="テーマ" defaultSelectedKey="raster" size="sm">
              <SelectItem id="raster">Raster</SelectItem>
            </Select>
          </nav>
        </header>

        {/* コンポーネントページの再現 */}
        <div className="flex flex-col gap-4 pt-4">
          <Breadcrumbs size="sm">
            <Breadcrumb>ホーム</Breadcrumb>
            <Breadcrumb>コンポーネント</Breadcrumb>
            <Breadcrumb>Button</Breadcrumb>
          </Breadcrumbs>

          <div className="flex items-center gap-2">
            <span className="text-xl font-medium text-[var(--novi-color-fg)]">Button</span>
            <Badge variant="soft" color="success" size="sm">
              安定
            </Badge>
          </div>

          <Tabs defaultSelectedKey="demo" size="sm">
            <TabItems>
              <TabItem id="demo">デモ</TabItem>
              <TabItem id="props">Props</TabItem>
              <TabItem id="a11y">アクセシビリティ</TabItem>
            </TabItems>
            <TabContent id="demo">
              <Card>
                <CardBody>
                  <div className="flex flex-wrap gap-2">
                    <Button color="primary">保存</Button>
                    <Button variant="outline">キャンセル</Button>
                  </div>
                </CardBody>
              </Card>
            </TabContent>
            <TabContent id="props">
              <p className="text-sm text-[var(--novi-color-muted)]">
                props 表は契約から生成されます。
              </p>
            </TabContent>
            <TabContent id="a11y">
              <p className="text-sm text-[var(--novi-color-muted)]">Enter / Space で発火します。</p>
            </TabContent>
          </Tabs>
        </div>
      </div>
    </Preview>
  )
}
