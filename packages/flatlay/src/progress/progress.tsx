'use client'

import type { ProgressProps } from '@novi-ui/core'
import { Label, ProgressBar } from 'react-aria-components'
import { progressStyles } from './progress.styles'

/**
 * 進捗の表示。`value` を省略すると不確定（indeterminate）表示になる。
 *
 * Flatlay の進捗は**引かれていく罫線**で、面が伸びるのではなく線が引かれる。
 * `prefers-reduced-motion` が有効なときは不確定表示の点滅を止める。
 *
 * @example
 * <Progress label="アップロード中" value={62} showValueLabel />
 */
export function Progress({
  size,
  color,
  label,
  value,
  minValue = 0,
  maxValue = 100,
  showValueLabel,
  className,
  classNames,
  id,
}: ProgressProps) {
  const isIndeterminate = value === undefined
  const s = progressStyles({ size, color, isIndeterminate })

  return (
    <ProgressBar
      id={id}
      value={value}
      minValue={minValue}
      maxValue={maxValue}
      isIndeterminate={isIndeterminate}
      data-slot="root"
      className={s.root({ class: [className, classNames?.root] })}
    >
      {({ percentage, valueText }) => (
        <>
          {(label !== undefined || showValueLabel === true) && (
            <span className="flex items-baseline justify-between gap-[var(--novi-gap-inline)]">
              {label !== undefined && (
                <Label data-slot="label" className={s.label({ class: classNames?.label })}>
                  {label}
                </Label>
              )}
              {showValueLabel === true && !isIndeterminate && (
                <span
                  data-slot="valueLabel"
                  className={s.valueLabel({ class: classNames?.valueLabel })}
                >
                  {valueText}
                </span>
              )}
            </span>
          )}

          <span data-slot="track" className={s.track({ class: classNames?.track })}>
            <span
              data-slot="indicator"
              className={s.indicator({ class: classNames?.indicator })}
              style={isIndeterminate ? undefined : { width: `${percentage ?? 0}%` }}
            />
          </span>
        </>
      )}
    </ProgressBar>
  )
}
