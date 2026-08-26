'use client'

import type { NoviColor } from '@novi-ui/core'
// UNSTABLE_ / UNSAFE_ には触れない。core が安定名で再公開したものだけを使う（ADR-07 / ADR-F5）
import {
  InflowPortalProvider,
  type QueuedToast,
  Toast,
  ToastContent,
  ToastQueue,
  ToastRegion,
} from '@novi-ui/core/client'
import { type ReactNode, useCallback, useState } from 'react'
import { Button, Text } from 'react-aria-components'
import { closeGlyphClass, toastStyles } from './toast.styles'

/** 1件分の通知内容。 */
export interface NoviToast {
  title?: ReactNode
  description?: ReactNode
  color?: NoviColor
  /** 補助操作。「元に戻す」など */
  action?: ReactNode
}

/**
 * 通知のキュー。アプリで1つ作って使い回す。
 *
 * 上流の React Aria では Toast がまだ不安定な API のため、
 * core が安定名で再公開したものを経由している。
 *
 * @example
 * export const toast = createToastQueue()
 * toast.add({ title: '保存しました', color: 'success' }, { timeout: 4000 })
 */
export function createToastQueue() {
  return new ToastQueue<NoviToast>({ maxVisibleToasts: 4 })
}

/** 通知1件分の行。 */
function ToastRow({ toast }: { toast: QueuedToast<NoviToast> }) {
  const s = toastStyles({ color: toast.content.color })

  return (
    <Toast toast={toast} data-slot="root" className={s.root()}>
      <ToastContent data-slot="content" className={s.content()}>
        {toast.content.title !== undefined && (
          <Text slot="title" data-slot="title" className={s.title()}>
            {toast.content.title}
          </Text>
        )}
        {toast.content.description !== undefined && (
          <Text slot="description" data-slot="description" className={s.description()}>
            {toast.content.description}
          </Text>
        )}
      </ToastContent>

      {toast.content.action !== undefined && (
        <span data-slot="action" className={s.action()}>
          {toast.content.action}
        </span>
      )}

      {/* 閉じるは記号そのもの。SVG ではなく文字なのは帳票の語彙だから（ADR-F7） */}
      <Button slot="close" data-slot="closeButton" className={s.closeButton()} aria-label="閉じる">
        <span aria-hidden="true" className={closeGlyphClass}>
          ✕
        </span>
      </Button>
    </Toast>
  )
}

/**
 * 通知の帯。**アプリの先頭（ヘッダの直下あたり）に置く**。
 *
 * 浮かないので、置いた場所がそのまま表示位置になります。通知が出ると帯が生えて
 * 後続が押し下がり、閉じると元に戻ります。スクロールすれば流れて見えなくなります
 * （`sticky` も使いません。滞留も重なりだからです・ADR-F4）。
 *
 * そのため、**見落とすと困る確認は Toast に置かないこと**。
 * 取り返しのつかない操作の確認は Modal（テイクオーバー）を使ってください。
 *
 * @example
 * <body>
 *   <Header />
 *   <NoviToastRegion queue={toast} />
 *   <main>…</main>
 * </body>
 */
export function NoviToastRegion({
  queue,
  className,
}: {
  queue: ReturnType<typeof createToastQueue>
  className?: string
}) {
  // 上流の region は prop を持たず必ず body へポータルする。
  // ここで置き場所を差し替えて、生えるのが「この位置」になるようにする（ADR-F4）
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const getContainer = useCallback(() => container, [container])

  return (
    <div ref={setContainer} data-novi-inflow="">
      {container !== null && (
        <InflowPortalProvider getContainer={getContainer}>
          <ToastRegion
            queue={queue}
            data-slot="region"
            className={toastStyles().region({ class: className })}
          >
            {({ toast }) => <ToastRow toast={toast} />}
          </ToastRegion>
        </InflowPortalProvider>
      )}
    </div>
  )
}
