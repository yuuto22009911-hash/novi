'use client'

/**
 * クライアント側でしか動かないものをまとめたエントリ。
 *
 * `'use client'` はバンドル先頭へ持ち上がるため、これらをメインエントリに混ぜると
 * **パッケージ全体がクライアント専用**になり、RSC から型や slot 契約を import しただけで
 * クライアント境界が生まれてしまう。それを避けるためにエントリを分けている（ADR-C6）。
 *
 * 利用者はテーマ実装者のみ。アプリケーションコードから直接使うことは想定していない。
 */

export { type ImeSafeKeyProps, useImeSafeKeys } from '../hooks/use-ime-safe-keys'
export {
  INFLOW_PORTAL_PROP,
  type InflowPortalProps,
  InflowPortalProvider,
  inflowPortalProps,
} from '../unstable/portal'
export type {
  QueuedToast,
  ToastListProps,
  ToastOptions,
  ToastProps,
  ToastRegionProps,
  ToastRegionRenderProps,
  ToastRenderProps,
  ToastState,
} from '../unstable/toast'
export {
  Toast,
  ToastContent,
  ToastList,
  ToastQueue,
  ToastRegion,
  ToastStateContext,
} from '../unstable/toast'
