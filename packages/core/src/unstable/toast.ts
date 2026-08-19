/**
 * 上流の不安定 API の唯一の入口。
 *
 * react-aria-components の Toast は 2026-08 時点でも `UNSTABLE_` 接頭辞のままで、
 * メンテナも「優先度が上がっておらず年内に外れる見込みはない」と述べている。
 *
 * **このファイル以外から `UNSTABLE_` を import してはならない。**
 * ここに閉じ込めておけば、上流が破壊的変更をしても修正はこの1ファイルで済む。
 * 違反は CI（`scripts/check-unstable-imports.mjs`）が検出する。
 *
 * 型（`ToastProps` など）は上流でも既に安定名なので、別名化せずそのまま再公開する。
 */

export type {
  QueuedToast,
  ToastListProps,
  ToastOptions,
  ToastProps,
  ToastRegionProps,
  ToastRegionRenderProps,
  ToastRenderProps,
  ToastState,
} from 'react-aria-components'
export {
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastList as ToastList,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as ToastRegion,
  UNSTABLE_ToastStateContext as ToastStateContext,
} from 'react-aria-components'
