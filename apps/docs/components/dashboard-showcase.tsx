'use client'

import type { NoviColor } from '@novi-ui/core'
import { Fragment, type ReactNode, useState } from 'react'
import { useNoviTheme } from '../lib/theme-components'
import { Preview } from './preview'

/**
 * Raster で組んだ管理画面のショーケース。
 *
 * **「このライブラリを使うと何ができるか」を一目で伝えるための1枚。**
 * 個々のコンポーネントを並べたデモは各ページにあるが、それだけでは
 * 「組み上げたときにどう見えるか」が伝わらない。密度の高い実務画面こそ
 * Raster の得意分野なので、そこを最初に見せる。
 *
 * サイトの外枠がテーマに染まらないのは比較のための設計（ADR-D1）で、
 * 実際のアプリはここで見せているとおり Novi だけで組める。
 *
 * 画面は架空の受注管理サービス。数値もすべて架空だが、**内部の辻褄は合わせてある**
 * （カテゴリ別の合計 = 売上、売上 ÷ 注文数 = 平均注文単価）。
 * 桁が噛み合わない画面は見た瞬間に嘘だと分かり、ショーケースとして機能しない。
 */

const NAV = [
  { id: 'dashboard', label: 'ダッシュボード', badge: null },
  { id: 'orders', label: '注文', badge: '12' },
  { id: 'customers', label: '顧客', badge: null },
  { id: 'analytics', label: '分析', badge: null },
  { id: 'settings', label: '設定', badge: null },
] as const

const STATS = [
  { label: '売上', value: '¥4,182,900', delta: '+12.4%', tone: 'success' },
  { label: '注文数', value: '1,284', delta: '+3.2%', tone: 'success' },
  { label: '新規顧客', value: '312', delta: '−1.8%', tone: 'danger' },
  { label: '継続率', value: '94.2%', delta: '+0.6%', tone: 'success' },
] satisfies { label: string; value: string; delta: string; tone: NoviColor }[]

/** 月次の売上推移（相対値）。棒グラフは Raster の直線的な語彙とよく合う。 */
const TREND = [42, 58, 51, 64, 60, 78, 71, 86, 80, 94, 88, 100]

const PLANS = [
  { label: 'Enterprise', value: 62 },
  { label: 'Pro', value: 28 },
  { label: 'Free', value: 10 },
]

const ORDERS = [
  { id: 'NV-2418', name: '田中 美咲', status: '発送済み', tone: 'success', amount: '¥128,000' },
  { id: 'NV-2417', name: '佐藤 健', status: '処理中', tone: 'warning', amount: '¥42,500' },
  { id: 'NV-2416', name: '鈴木 陽子', status: '発送済み', tone: 'success', amount: '¥310,000' },
  { id: 'NV-2415', name: '高橋 直樹', status: '返品', tone: 'danger', amount: '¥8,900' },
  { id: 'NV-2414', name: '伊藤 彩', status: '処理中', tone: 'warning', amount: '¥76,400' },
] satisfies { id: string; name: string; status: string; tone: NoviColor; amount: string }[]

/** カテゴリ別の売上。合計は STATS の売上（¥4,182,900）と一致させてある。 */
const CATEGORIES = [
  { name: 'キッチン家電', amount: '¥1,624,000', share: '38.8%', delta: '+18.2%', tone: 'success' },
  { name: '生活雑貨', amount: '¥1,058,400', share: '25.3%', delta: '+6.4%', tone: 'success' },
  { name: 'インテリア', amount: '¥742,500', share: '17.8%', delta: '−2.1%', tone: 'danger' },
  { name: '文具', amount: '¥512,000', share: '12.2%', delta: '+9.7%', tone: 'success' },
  { name: 'その他', amount: '¥246,000', share: '5.9%', delta: '+1.3%', tone: 'success' },
] satisfies { name: string; amount: string; share: string; delta: string; tone: NoviColor }[]

/** 売上 ÷ 注文数 = ¥4,182,900 ÷ 1,284 ≈ ¥3,258。 */
const SALES_STATS = [
  { label: '平均単価', value: '¥3,258' },
  { label: '返品率', value: '1.8%' },
  { label: '粗利率', value: '42.6%' },
]

const CUSTOMERS = [
  { name: '田中 美咲', plan: 'Enterprise', total: '¥1,284,000', last: '8月18日', tone: 'primary' },
  { name: '鈴木 陽子', plan: 'Enterprise', total: '¥968,500', last: '8月17日', tone: 'primary' },
  { name: '佐藤 健', plan: 'Pro', total: '¥412,300', last: '8月18日', tone: 'secondary' },
  { name: '伊藤 彩', plan: 'Pro', total: '¥298,700', last: '8月15日', tone: 'secondary' },
  { name: '高橋 直樹', plan: 'Free', total: '¥86,400', last: '8月12日', tone: 'default' },
] satisfies { name: string; plan: string; total: string; last: string; tone: NoviColor }[]

const CUSTOMER_STATS = [
  { label: '総顧客数', value: '3,847' },
  { label: '今月の新規', value: '312' },
  { label: '継続率', value: '94.2%' },
]

interface Column {
  key: string
  label: string
  /** 数値列。桁を揃えるために tabular-nums を効かせる */
  numeric?: boolean
}

interface RowData {
  key: string
  cells: Record<string, ReactNode>
  action?: ReactNode
}

/**
 * 一覧。**広い画面では表、狭い画面では1件1ブロックに組み替える。**
 *
 * 横スクロールする表はスマホで読めない。実際 375px では幅 412px の表が
 * 211px の枠に押し込まれ、状態バッジが途中で切れていた。
 * 列を縦に積めば、指で横に送らなくても全部の値がそのまま読める。
 *
 * Novi に表コンポーネントは無いので素の table をトークンで整える。
 * 利用者が書くときも同じ形になる。
 */
function RecordTable({
  label,
  columns,
  rows,
}: {
  label: string
  columns: Column[]
  rows: RowData[]
}) {
  const [head, ...rest] = columns
  if (head === undefined) return null

  const hasAction = rows.some((row) => row.action !== undefined)

  return (
    <>
      <table className="hidden w-full border-collapse text-[length:var(--novi-text-sm)] sm:table">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr className="border-b border-[var(--novi-color-border)] text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="py-2 pr-4 font-medium whitespace-nowrap text-[var(--novi-color-muted)]"
              >
                {column.label}
              </th>
            ))}
            {hasAction && (
              <th scope="col" className="py-2">
                <span className="sr-only">操作</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className="border-b border-[var(--novi-color-border)] last:border-b-0"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={[
                    'py-2 pr-4 whitespace-nowrap text-[var(--novi-color-fg)]',
                    column.numeric ? 'tabular-nums' : '',
                  ].join(' ')}
                >
                  {row.cells[column.key]}
                </td>
              ))}
              {hasAction && <td className="py-2 text-right">{row.action}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      <ul aria-label={label} className="flex flex-col sm:hidden">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex flex-col gap-2 border-b border-[var(--novi-color-border)] py-3 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 text-[length:var(--novi-text-sm)] text-[var(--novi-color-fg)]">
                {row.cells[head.key]}
              </div>
              {row.action}
            </div>
            {/* ラベル列を揃えて1行1項目にする。折り返し任せにすると
                行ごとに改行位置が変わり、同じ形の記録が違う形に見える */}
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 text-[length:var(--novi-text-xs)]">
              {rest.map((column) => (
                <Fragment key={column.key}>
                  <dt className="text-[var(--novi-color-muted)]">{column.label}</dt>
                  <dd
                    className={[
                      'text-[var(--novi-color-fg)]',
                      column.numeric ? 'tabular-nums' : '',
                    ].join(' ')}
                  >
                    {row.cells[column.key]}
                  </dd>
                </Fragment>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}

/**
 * タブごとの文脈を足す補助指標。
 *
 * 狭い画面では3列にせず、1行1項目でラベルと値を左右に振る。
 * 320px で3列にすると1列あたり 80px 台になり、¥3,258 すら収まらない。
 */
function MiniStats({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-3 sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline justify-between gap-3 border-b border-[var(--novi-color-border)] pb-2 sm:flex-col sm:items-start sm:gap-0.5 sm:border-b-0 sm:border-l sm:pb-0 sm:pl-3"
        >
          <dt className="text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]">
            {item.label}
          </dt>
          <dd className="text-[length:var(--novi-text-lg)] font-medium tabular-nums text-[var(--novi-color-fg)]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function DashboardShowcase() {
  const {
    Avatar,
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    ColorPicker,
    COLOR_OPTIONS,
    Input,
    Menu,
    MenuItem,
    MenuSeparator,
    Progress,
    Select,
    SelectItem,
    TabContent,
    TabItem,
    TabItems,
    Tabs,
  } = useNoviTheme()

  /**
   * 画面の配色。**テーマを切り替えると選択肢ごと入れ替わる**ので、
   * 前のテーマの色 id（Raster の `ink` など）が残らないよう既定へ戻す。
   */
  const [color, setColor] = useState(COLOR_OPTIONS[0]?.id)
  const known = COLOR_OPTIONS.some((option) => option.id === color)
  const activeColor = known ? color : COLOR_OPTIONS[0]?.id

  const detail = (
    <Button variant="plain" size="sm">
      詳細
    </Button>
  )

  return (
    <Preview className="items-stretch p-0 sm:p-0" color={activeColor}>
      <div className="flex w-full min-w-0">
        {/* サイドバー。狭い画面では畳み、代わりに本文側の1行でアプリ名を出す */}
        <aside className="hidden w-44 shrink-0 flex-col justify-between border-r border-[var(--novi-color-border)] p-4 md:flex">
          <div className="flex flex-col gap-4">
            <span className="text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]">
              Novi Commerce
            </span>
            <nav aria-label="管理メニュー">
              <ul className="flex flex-col gap-0.5">
                {NAV.map((item, i) => (
                  <li key={item.id}>
                    <Button
                      variant={i === 0 ? 'soft' : 'plain'}
                      size="sm"
                      classNames={{ root: 'w-full justify-start gap-2' }}
                      endContent={
                        item.badge === null ? undefined : (
                          <Badge size="sm" variant="outline">
                            {item.badge}
                          </Badge>
                        )
                      }
                    >
                      {item.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--novi-color-border)] pt-4">
            <Avatar size="sm" name="山本 太郎" />
            <span className="text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]">
              山本 太郎
            </span>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-3 sm:p-4">
          {/* サイドバーが出ない幅ではアプリ名がどこにも無くなる。ここで補う */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--novi-color-border)] pb-3 md:hidden">
            <span className="text-[length:var(--novi-text-sm)] font-medium text-[var(--novi-color-fg)]">
              Novi Commerce
            </span>
            <Avatar size="sm" name="山本 太郎" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[length:var(--novi-text-lg)] font-medium text-[var(--novi-color-fg)]">
                ダッシュボード
              </span>
              <span className="text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]">
                2026年8月 · 前月比
              </span>
            </div>

            {/* 狭い画面では検索に1行を与え、期間と操作を並べる。
                3つを折り返しに任せると、エクスポートだけが下に落ちて据わりが悪い */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input size="sm" aria-label="注文を検索" placeholder="注文を検索" />
              <div className="flex items-center gap-2">
                <Select size="sm" aria-label="期間" defaultSelectedKey="monthly">
                  <SelectItem id="daily">日次</SelectItem>
                  <SelectItem id="monthly">月次</SelectItem>
                  <SelectItem id="yearly">年次</SelectItem>
                </Select>
                <Button size="sm" color="primary">
                  エクスポート
                </Button>
              </div>
            </div>
          </div>

          {/*
            画面の配色を選ばせる。**色名を1つも書いていない**のに、
            Raster では Print Inks、Tactile では Textile Dyes が並ぶ。
            選択は Preview の `data-novi-color` に渡るので、この画面全体が染まる。
          */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--novi-color-border)] pb-3">
            <ColorPicker
              size="sm"
              aria-label="画面の配色"
              value={activeColor}
              onChange={setColor}
            />
            <span className="text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]">
              配色はこの画面だけに効く
            </span>
          </div>

          <Tabs size="sm" defaultSelectedKey="overview">
            <TabItems>
              <TabItem id="overview">概要</TabItem>
              <TabItem id="sales">売上</TabItem>
              <TabItem id="customers">顧客</TabItem>
            </TabItems>

            <TabContent id="overview">
              <div className="flex flex-col gap-3 pt-4">
                {/* 列数の閾値は実測で決めた。¥4,182,900 は 24px で 109px 必要で、
                    2列にできるのは 640px 以上（それ未満だと内容幅が 105px を切って必ず欠ける）。
                    指標は読めることが最優先なので、狭いうちは素直に1列にする */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {STATS.map((stat) => (
                    <Card key={stat.label}>
                      <CardBody>
                        <div className="flex flex-col gap-1">
                          {/* ラベルと増減を1行に畳む。縦に3段積むと狭い画面で間延びする */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]">
                              {stat.label}
                            </span>
                            <Badge size="sm" variant="soft" color={stat.tone}>
                              {stat.delta}
                            </Badge>
                          </div>
                          <span className="text-[length:var(--novi-text-xl)] font-medium tabular-nums text-[var(--novi-color-fg)]">
                            {stat.value}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[3fr_2fr]">
                  {/* 売上推移。棒だけで作る。曲線も影も使わない */}
                  <Card>
                    <CardHeader>売上推移</CardHeader>
                    <CardBody>
                      <div
                        role="img"
                        aria-label="売上推移。1月を 42 として12月の 100 まで、途中の増減を挟みながら右肩上がり。"
                        className="flex h-32 items-end gap-1"
                      >
                        {TREND.map((value, i) => (
                          <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: 月次の並び順そのものが識別子
                            key={i}
                            style={{ height: `${value}%` }}
                            className="min-w-0 flex-1 bg-[var(--novi-color-primary)]"
                          />
                        ))}
                      </div>
                      <div
                        aria-hidden="true"
                        className="flex justify-between pt-2 text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]"
                      >
                        <span>1月</span>
                        <span>6月</span>
                        <span>12月</span>
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>プラン別の売上構成</CardHeader>
                    <CardBody>
                      <div className="flex flex-col gap-4">
                        {PLANS.map((plan) => (
                          <Progress
                            key={plan.label}
                            size="sm"
                            label={plan.label}
                            value={plan.value}
                            showValueLabel
                          />
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <span>最近の注文</span>
                      <Menu>
                        <Button variant="outline" size="sm">
                          操作
                        </Button>
                        <MenuItem id="export">CSV を書き出す</MenuItem>
                        <MenuItem id="print">印刷する</MenuItem>
                        <MenuSeparator />
                        <MenuItem id="archive">まとめてアーカイブ</MenuItem>
                      </Menu>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <RecordTable
                      label="最近の注文"
                      columns={[
                        { key: 'name', label: '顧客' },
                        { key: 'id', label: '注文番号' },
                        { key: 'status', label: '状態' },
                        { key: 'amount', label: '金額', numeric: true },
                      ]}
                      rows={ORDERS.map((order) => ({
                        key: order.id,
                        action: detail,
                        cells: {
                          name: (
                            <div className="flex items-center gap-2">
                              <Avatar size="sm" name={order.name} />
                              <span>{order.name}</span>
                            </div>
                          ),
                          id: (
                            <span className="font-mono text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]">
                              {order.id}
                            </span>
                          ),
                          status: (
                            <Badge size="sm" variant="soft" color={order.tone} withDot>
                              {order.status}
                            </Badge>
                          ),
                          amount: order.amount,
                        },
                      }))}
                    />
                  </CardBody>
                </Card>
              </div>
            </TabContent>

            <TabContent id="sales">
              <div className="flex flex-col gap-3 pt-4">
                <MiniStats items={SALES_STATS} />
                <Card>
                  <CardHeader>カテゴリ別の売上</CardHeader>
                  <CardBody>
                    <RecordTable
                      label="カテゴリ別の売上"
                      columns={[
                        { key: 'name', label: 'カテゴリ' },
                        { key: 'amount', label: '売上', numeric: true },
                        { key: 'share', label: '構成比', numeric: true },
                        { key: 'delta', label: '前月比' },
                      ]}
                      rows={CATEGORIES.map((category) => ({
                        key: category.name,
                        cells: {
                          name: category.name,
                          amount: category.amount,
                          share: (
                            <span className="text-[var(--novi-color-muted)]">{category.share}</span>
                          ),
                          delta: (
                            <Badge size="sm" variant="soft" color={category.tone}>
                              {category.delta}
                            </Badge>
                          ),
                        },
                      }))}
                    />
                  </CardBody>
                </Card>
              </div>
            </TabContent>

            <TabContent id="customers">
              <div className="flex flex-col gap-3 pt-4">
                <MiniStats items={CUSTOMER_STATS} />
                <Card>
                  <CardHeader>購入額の上位</CardHeader>
                  <CardBody>
                    <RecordTable
                      label="購入額の上位"
                      columns={[
                        { key: 'name', label: '顧客' },
                        { key: 'plan', label: 'プラン' },
                        { key: 'total', label: '累計購入', numeric: true },
                        { key: 'last', label: '最終購入' },
                      ]}
                      rows={CUSTOMERS.map((customer) => ({
                        key: customer.name,
                        action: detail,
                        cells: {
                          name: (
                            <div className="flex items-center gap-2">
                              <Avatar size="sm" name={customer.name} />
                              <span>{customer.name}</span>
                            </div>
                          ),
                          plan: (
                            <Badge size="sm" variant="outline" color={customer.tone}>
                              {customer.plan}
                            </Badge>
                          ),
                          total: customer.total,
                          last: (
                            <span className="text-[var(--novi-color-muted)]">{customer.last}</span>
                          ),
                        },
                      }))}
                    />
                  </CardBody>
                </Card>
              </div>
            </TabContent>
          </Tabs>
        </div>
      </div>
    </Preview>
  )
}
