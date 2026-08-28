'use client'

import type { RadioGroupProps, RadioProps } from '@novi-ui/core'
import {
  FieldError,
  Label,
  Radio as RACRadio,
  RadioGroup as RACRadioGroup,
  Text,
} from 'react-aria-components'
import { radioGroupStyles, radioStyles } from './radio.styles'

/**
 * ラジオボタン。単体では使わず、必ず RadioGroup の中に置く。
 *
 * Flatlay では**円**で描く。Checkbox の 2px 角と形が違うことが
 * 「1つだけ」と「複数」の唯一の手がかりになる。
 *
 * @example
 * <Radio value="express">速達</Radio>
 */
export function Radio({
  value,
  size,
  color,
  isDisabled,
  description,
  children,
  className,
  classNames,
  id,
}: RadioProps) {
  const s = radioStyles({ size, color })

  return (
    <RACRadio
      id={id}
      value={value}
      isDisabled={isDisabled}
      data-slot="root"
      // control 側から選択状態を参照するために group を付ける
      className={`group ${s.root({ class: [className, classNames?.root] })}`}
    >
      {({ isSelected }) => (
        <>
          <span data-slot="control" className={s.control({ class: classNames?.control })}>
            {/* 円の中に字を置くと小さすぎて読めないので、印だけは面で持つ */}
            {isSelected && (
              <span
                aria-hidden="true"
                data-slot="indicator"
                className={s.indicator({ class: classNames?.indicator })}
              />
            )}
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
        </>
      )}
    </RACRadio>
  )
}

/**
 * ラジオボタンのグループ。矢印キーで項目間を移動できる。
 *
 * @example
 * <RadioGroup label="配送方法" value={method} onChange={setMethod}>
 *   <Radio value="standard">通常</Radio>
 *   <Radio value="express">速達</Radio>
 * </RadioGroup>
 */
export function RadioGroup({
  label,
  description,
  errorMessage,
  name,
  value,
  defaultValue,
  onChange,
  orientation,
  isDisabled,
  isReadOnly,
  isRequired,
  isInvalid,
  children,
  className,
  classNames,
  id,
}: RadioGroupProps) {
  const s = radioGroupStyles({ orientation })

  return (
    <RACRadioGroup
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      isInvalid={isInvalid}
      data-slot="root"
      className={s.root({ class: [className, classNames?.root] })}
    >
      {label !== undefined && (
        <Label data-slot="label" className={s.label({ class: classNames?.label })}>
          {label}
        </Label>
      )}

      <div data-slot="list" className={s.list({ class: classNames?.list })}>
        {children}
      </div>

      {description !== undefined && (
        <Text
          slot="description"
          data-slot="description"
          className={s.description({ class: classNames?.description })}
        >
          {description}
        </Text>
      )}

      <FieldError
        data-slot="errorMessage"
        className={s.errorMessage({ class: classNames?.errorMessage })}
      >
        {errorMessage}
      </FieldError>
    </RACRadioGroup>
  )
}
