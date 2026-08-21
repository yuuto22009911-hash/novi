'use client'

import type { NoviColor } from '@novi-ui/core'
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
 * 画面は架空の受注管理サービス。数値もすべて架空。
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
const TREND = [
  { month: '1月', value: 42 },
  { month: '2月', value: 58 },
  { month: '3月', value: 51 },
  { month: '4月', value: 64 },
  { month: '5月', value: 60 },
  { month: '6月', value: 78 },
  { month: '7月', value: 71 },
  { month: '8月', value: 86 },
  { month: '9月', value: 80 },
  { month: '10月', value: 94 },
  { month: '11月', value: 88 },
  { month: '12月', value: 100 },
]

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

export function DashboardShowcase() {
  const {
    Avatar,
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
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

  return (
    <Preview className="items-stretch p-0 sm:p-0">
      <div className="flex w-full min-w-0">
        {/* サイドバー。狭い画面では畳む（上部のタブとパンくずで現在地は伝わる） */}
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
            <Avatar size="sm" name="小島 佑翔" />
            <span className="text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]">
              小島 佑翔
            </span>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          {/* 画面ヘッダー: 見出し / 検索 / 期間 / 操作 */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[length:var(--novi-text-lg)] font-medium text-[var(--novi-color-fg)]">
                ダッシュボード
              </span>
              <span className="text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]">
                2026年8月 · 前月比
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-40">
                <Input size="sm" aria-label="注文を検索" placeholder="注文を検索" />
              </div>
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

          <Tabs size="sm" defaultSelectedKey="overview">
            <TabItems>
              <TabItem id="overview">概要</TabItem>
              <TabItem id="sales">売上</TabItem>
              <TabItem id="customers">顧客</TabItem>
            </TabItems>

            <TabContent id="overview">
              <div className="flex flex-col gap-4 pt-4">
                {/* 指標カード */}
                {/* 列数の閾値は実測で決めた。¥4,182,900 は 24px で 109px 必要で、
                    2列にできるのは 640px 以上（それ未満だと内容幅が 105px を切って必ず欠ける）。
                    指標は読めることが最優先なので、狭いうちは素直に1列にする */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {STATS.map((stat) => (
                    <Card key={stat.label}>
                      <CardBody>
                        <div className="flex flex-col gap-1">
                          <span className="text-[length:var(--novi-text-xs)] text-[var(--novi-color-muted)]">
                            {stat.label}
                          </span>
                          <span className="text-[length:var(--novi-text-xl)] font-medium tabular-nums text-[var(--novi-color-fg)]">
                            {stat.value}
                          </span>
                          <div>
                            <Badge size="sm" variant="soft" color={stat.tone}>
                              {stat.delta}
                            </Badge>
                          </div>
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
                        aria-label="売上推移。1月の42から12月の100まで、途中の増減を挟みながら右肩上がり。"
                        className="flex h-32 items-end gap-1"
                      >
                        {TREND.map((point) => (
                          <div
                            key={point.month}
                            style={{ height: `${point.value}%` }}
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

                  {/* プラン構成 */}
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

                {/* 明細。Novi に表コンポーネントは無いので、素の table を
                    トークンで整える。実際の利用でもこう書くことになる */}
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
                    <section
                      aria-label="最近の注文"
                      // biome-ignore lint/a11y/noNoninteractiveTabindex: スクロール領域は WCAG 2.1.1 によりキーボードで読めるようにする必要がある
                      tabIndex={0}
                      className="overflow-x-auto"
                    >
                      <table className="w-full border-collapse text-[length:var(--novi-text-sm)]">
                        <caption className="sr-only">最近の注文5件</caption>
                        <thead>
                          <tr className="border-b border-[var(--novi-color-border)] text-left">
                            {['顧客', '注文番号', '状態', '金額'].map((head) => (
                              <th
                                key={head}
                                scope="col"
                                className="py-2 pr-4 font-medium whitespace-nowrap text-[var(--novi-color-muted)]"
                              >
                                {head}
                              </th>
                            ))}
                            <th scope="col" className="py-2">
                              <span className="sr-only">操作</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ORDERS.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-[var(--novi-color-border)]"
                            >
                              <td className="py-2 pr-4">
                                <div className="flex items-center gap-2 whitespace-nowrap">
                                  <Avatar size="sm" name={order.name} />
                                  <span className="text-[var(--novi-color-fg)]">{order.name}</span>
                                </div>
                              </td>
                              <td className="py-2 pr-4 font-mono text-[length:var(--novi-text-xs)] whitespace-nowrap text-[var(--novi-color-muted)]">
                                {order.id}
                              </td>
                              <td className="py-2 pr-4">
                                <Badge size="sm" variant="soft" color={order.tone} withDot>
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="py-2 pr-4 whitespace-nowrap tabular-nums text-[var(--novi-color-fg)]">
                                {order.amount}
                              </td>
                              <td className="py-2 text-right">
                                <Button variant="plain" size="sm">
                                  詳細
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>
                  </CardBody>
                </Card>
              </div>
            </TabContent>

            <TabContent id="sales">
              <p className="pt-4 text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]">
                タブを切り替えても、書いてあるコードは同じ props のままです。
              </p>
            </TabContent>

            <TabContent id="customers">
              <p className="pt-4 text-[length:var(--novi-text-sm)] text-[var(--novi-color-muted)]">
                顧客の一覧をここに置きます。
              </p>
            </TabContent>
          </Tabs>
        </div>
      </div>
    </Preview>
  )
}
