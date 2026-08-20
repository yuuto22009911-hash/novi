import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviSize } from '../tokens'

/**
 * Breadcrumbs を構成する部位。
 *
 * `current` は現在地の項目。リンクにせず `aria-current="page"` を付ける。
 * `separator` は装飾なので支援技術には読ませない。
 */
export const breadcrumbsSlots = ['root', 'list', 'item', 'link', 'separator', 'current'] as const

export const breadcrumbsRequiredSlots = ['root', 'list', 'item'] as const

export type BreadcrumbsSlot = (typeof breadcrumbsSlots)[number]
export type BreadcrumbsRequiredSlot = (typeof breadcrumbsRequiredSlots)[number]

/**
 * 階層の中で現在どこにいるかを示す。
 *
 * @keywords パンくず 階層表示 現在地 breadcrumb breadcrumbs
 *
 * @a11y `nav[aria-label]` として提示され、現在地は `aria-current="page"`。区切り記号は `aria-hidden`
 *
 * @example
 * <Breadcrumbs>
 *   <Breadcrumb href="/">ホーム</Breadcrumb>
 *   <Breadcrumb href="/docs">ドキュメント</Breadcrumb>
 *   <Breadcrumb>Button</Breadcrumb>
 * </Breadcrumbs>
 */
export interface BreadcrumbsProps extends NoviBaseProps {
  size?: NoviSize
  /** 区切り文字。既定はテーマが決める */
  separator?: ReactNode
  isDisabled?: boolean
  children?: ReactNode
  classNames?: ClassNames<typeof breadcrumbsSlots>
}
