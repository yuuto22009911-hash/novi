'use client'

import type { ButtonProps } from '@novi-ui/core'
import { Button as RACButton } from 'react-aria-components'
import { buttonStyles } from './button.styles'

/**
 * ボタン。
 *
 * 押すと少し沈み、`solid` では影が消える。指で触れている手応えを返すため。
 * 実効タップ領域は視覚寸法と独立に 44px 以上を保つ。
 *
 * @example
 * <Button variant="solid" color="primary" onPress={() => save()}>
 *   保存
 * </Button>
 */
export function Button({
  variant,
  size,
  color,
  radius,
  isDisabled,
  isLoading,
  type = 'button',
  onPress,
  startContent,
  endContent,
  children,
  className,
  classNames,
  id,
}: ButtonProps) {
  const s = buttonStyles({ variant, size, color, radius })

  return (
    <RACButton
      id={id}
      type={type}
      // 読み込み中は押せないようにする。見た目だけ変えて押せる状態にしない
      isDisabled={isDisabled === true || isLoading === true}
      onPress={onPress}
      data-slot="root"
      data-loading={isLoading === true ? true : undefined}
      className={s.root({ class: [className, classNames?.root] })}
    >
      {isLoading === true && (
        <span
          data-slot="spinner"
          className={s.spinner({ class: classNames?.spinner })}
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
      )}

      {startContent !== undefined && (
        <span
          data-slot="startContent"
          className={s.startContent({ class: classNames?.startContent })}
        >
          {startContent}
        </span>
      )}

      <span data-slot="label" className={s.label({ class: classNames?.label })}>
        {children}
      </span>

      {endContent !== undefined && (
        <span data-slot="endContent" className={s.endContent({ class: classNames?.endContent })}>
          {endContent}
        </span>
      )}
    </RACButton>
  )
}
