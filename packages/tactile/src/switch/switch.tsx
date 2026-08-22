'use client'

import type { SwitchProps } from '@novi-ui/core'
import { Switch as RACSwitch } from 'react-aria-components'
import { switchStyles } from './switch.styles'

/**
 * オン / オフの切り替え。
 *
 * Raster では**矩形**で表示する（ADR-R3）。形が見慣れないぶん状態が読み取りにくいため、
 * ラベルの併記を強く推奨する。
 *
 * @example
 * <Switch isSelected={enabled} onChange={setEnabled}>
 *   メール通知を受け取る
 * </Switch>
 */
export function Switch({
  size,
  color,
  name,
  value,
  isSelected,
  defaultSelected,
  onChange,
  isDisabled,
  isReadOnly,
  description,
  children,
  className,
  classNames,
  id,
}: SwitchProps) {
  const s = switchStyles({ size, color })

  return (
    <RACSwitch
      id={id}
      name={name}
      value={value}
      isSelected={isSelected}
      defaultSelected={defaultSelected}
      onChange={onChange}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      data-slot="root"
      className={`group ${s.root({ class: [className, classNames?.root] })}`}
    >
      <span data-slot="track" className={s.track({ class: classNames?.track })}>
        <span data-slot="thumb" className={s.thumb({ class: classNames?.thumb })} />
      </span>

      {children !== undefined && (
        <span className="flex flex-col gap-0.5">
          <span data-slot="label" className={s.label({ class: classNames?.label })}>
            {children}
          </span>
          {description !== undefined && (
            <span
              data-slot="description"
              className={s.description({ class: classNames?.description })}
            >
              {description}
            </span>
          )}
        </span>
      )}
    </RACSwitch>
  )
}
