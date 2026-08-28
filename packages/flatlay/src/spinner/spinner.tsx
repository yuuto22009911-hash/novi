'use client'

import type { SpinnerProps } from '@novi-ui/core'
import { spinnerStyles } from './spinner.styles'

/**
 * 処理中であることを示す回転表示。
 *
 * `label` を渡すと画面にも表示される。渡さない場合も支援技術には
 * 「読み込み中」と伝わるようにしてある。
 *
 * @example
 * <Spinner label="読み込み中" />
 */
export function Spinner({ size, color, label, className, classNames, id }: SpinnerProps) {
  const s = spinnerStyles({ size, color })

  return (
    <span
      id={id}
      role="status"
      data-slot="root"
      className={s.root({ class: [className, classNames?.root] })}
    >
      {/* 線端は切り落とし（既定の butt）。丸めると製図の線ではなくなる */}
      <svg
        data-slot="circle"
        className={s.circle({ class: classNames?.circle })}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" />
      </svg>

      {label !== undefined ? (
        <span data-slot="label" className={s.label({ class: classNames?.label })}>
          {label}
        </span>
      ) : (
        <span className="sr-only">読み込み中</span>
      )}
    </span>
  )
}
