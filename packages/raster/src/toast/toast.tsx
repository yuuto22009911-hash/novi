'use client'

import type { NoviColor } from '@novi-ui/core'
// UNSTABLE_ には触れない。core が安定名で再公開したものだけを使う（ADR-07）
import { Toast, ToastContent, ToastQueue, ToastRegion } from '@novi-ui/core/client'
import type { ReactNode } from 'react'
import { Button, Text } from 'react-aria-components'
import { toastStyles } from './toast.styles'

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

/**
 * 通知の表示領域。アプリのルート付近に1つ置く。
 *
 * 操作に必須の情報を Toast に置かないこと。自動で消えるため読み落とすと取り返しがつかない。
 *
 * @example
 * <NoviToastRegion queue={toast} />
 */
export function NoviToastRegion({
  queue,
  className,
}: {
  queue: ReturnType<typeof createToastQueue>
  className?: string
}) {
  return (
    <ToastRegion
      queue={queue}
      data-slot="region"
      className={toastStyles().region({ class: className })}
    >
      {({ toast }) => {
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

            <Button
              slot="close"
              data-slot="closeButton"
              className={s.closeButton()}
              aria-label="閉じる"
            >
              <svg
                viewBox="0 0 16 16"
                width="0.875em"
                height="0.875em"
                fill="none"
                aria-hidden="true"
              >
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </Button>
          </Toast>
        )
      }}
    </ToastRegion>
  )
}
