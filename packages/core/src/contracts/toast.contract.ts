import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviColor, NoviRadius } from '../tokens'

/**
 * Toast を構成する部位。
 *
 * `region` は画面に固定される入れ物、`root` は1件分。
 * 上流の React Aria では Toast がまだ `UNSTABLE_` 接頭辞のままなので、
 * その import は core の `src/unstable/` に封じ込め、テーマからは安定名だけを使う。
 */
export const toastSlots = [
  'region',
  'root',
  'icon',
  'content',
  'title',
  'description',
  'closeButton',
  'action',
] as const

export const toastRequiredSlots = ['region', 'root', 'content'] as const

export type ToastSlot = (typeof toastSlots)[number]
export type ToastRequiredSlot = (typeof toastRequiredSlots)[number]

/**
 * 一時的な通知。
 *
 * 操作に必須の情報を置かない。自動で消えるため、読み落とすと取り返しがつかない。
 * `prefers-reduced-motion` が有効なときは出入りのアニメーションを行わない。
 *
 * @example
 * toast.add({ title: '保存しました', color: 'success' })
 */
export interface ToastProps extends NoviBaseProps {
  color?: NoviColor
  radius?: NoviRadius
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  /** 補助操作。「元に戻す」など */
  action?: ReactNode
  /** 自動で閉じるまでのミリ秒。省略すると自動で閉じない */
  timeout?: number
  onClose?: () => void
  classNames?: ClassNames<typeof toastSlots>
}
