/**
 * overlay のポータル先を差し替えるための、上流の不安定 prop の唯一の入口。
 *
 * react-aria-components の Popover / Tooltip / ModalOverlay は、既定で
 * `document.body` へポータルする。これは「浮かせる」前提の設計で、z 軸を持たない
 * テーマ（Flatlay）では成立しない。開いた中身をトリガの直後に**フローで**置くには、
 * ポータル先をトリガ近傍の要素へ向け直す必要がある。それを受け取る prop が
 * `UNSTABLE_portalContainer` で、1.20 時点でも接頭辞が外れていない。
 *
 * **このファイル以外から `UNSTABLE_` を書いてはならない**（`unstable/toast.ts` と同じ規律）。
 * 上流が改名しても直すのはここ1箇所で済み、改名は `portal.test-d.ts` が型で検知する。
 * 違反は CI（`scripts/check-source-rules.mjs`）が拾う。
 */

/**
 * ポータル先を渡す prop 名。**文字列リテラルを直接書かず必ずこれを使う。**
 *
 * 定数にしてあるのは改名への備えというより、**書ける場所を1つに絞るため**。
 * 各テーマが個別に文字列を書くと、上流の改名時に何箇所直すべきかが分からなくなる。
 */
export const INFLOW_PORTAL_PROP = 'UNSTABLE_portalContainer' as const

/** overlay に渡せるポータル先の指定。spread して使う。 */
export type InflowPortalProps = { [INFLOW_PORTAL_PROP]?: Element }

/**
 * ポータル先を spread 可能な props にする。
 *
 * `null` を素通しできないのが理由。ref の初期値は `null` だが上流の型は
 * `Element | undefined` なので、変換をここで1度だけ行う。
 * 未確定（初回レンダー）のときは何も渡さず、上流の既定（body へのポータル）に委ねる。
 */
export function inflowPortalProps(container: Element | null | undefined): InflowPortalProps {
  return container === null || container === undefined ? {} : { [INFLOW_PORTAL_PROP]: container }
}

/**
 * ポータル先を**配下すべてに**向け直すプロバイダ。
 *
 * `UNSTABLE_portalContainer` を受け取らない overlay 用の口。Toast の region が
 * これで、prop を持たず常に `document.body` へポータルする。フローの帯として
 * 置きたいテーマ（Flatlay・ADR-F4）は、region を包んでポータル先を差し替える。
 *
 * 上流の名前は `UNSAFE_` 接頭辞つき。`UNSTABLE_` と同じくここが唯一の入口で、
 * **このファイル以外から `UNSAFE_` を書いてはならない。**
 *
 * `react-aria` を直接指しているのは、react-aria-components がこれを再公開して
 * いないため。react-aria-components の依存なので、解決は保証されている。
 */
export { UNSAFE_PortalProvider as InflowPortalProvider } from 'react-aria'
