'use client'

import type { NumberFieldProps } from '@novi-ui/core'
import { useImeSafeKeys } from '@novi-ui/core/client'
import {
  Button,
  FieldError,
  Group,
  Input,
  Label,
  NumberField as RACNumberField,
  Text,
} from 'react-aria-components'
import { numberFieldStyles } from './number-field.styles'

/**
 * 数値の入力。矢印キーと増減ボタンで `step` ずつ刻む。
 *
 * 数値は右詰めの等幅で、**増減は右端の罫線セルに `−` `+` の活字**で置く。
 * 帳票の金額欄と同じ読み方になる（Raster は細い線、Tactile は左右の面）。
 * 空欄は `NaN` ではなく `null` で `onChange` に渡す（ADR-B2）。
 *
 * @example
 * <NumberField label="数量" defaultValue={1} minValue={0} step={1} />
 */
export function NumberField({
  variant,
  size,
  radius,
  label,
  placeholder,
  description,
  errorMessage,
  name,
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  step,
  formatOptions,
  onKeyDown,
  isDisabled,
  isReadOnly,
  isRequired,
  isInvalid,
  className,
  classNames,
  id,
}: NumberFieldProps) {
  const s = numberFieldStyles({ variant, size, radius })
  const keyProps = useImeSafeKeys<HTMLInputElement>(onKeyDown)

  return (
    <RACNumberField
      id={id}
      name={name}
      // RAC は空欄を NaN で表す。外には出さない（ADR-B2）
      value={value === null ? Number.NaN : value}
      defaultValue={defaultValue}
      onChange={(next) => onChange?.(Number.isNaN(next) ? null : next)}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      formatOptions={formatOptions}
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

      <Group
        data-slot="inputWrapper"
        className={s.inputWrapper({ class: classNames?.inputWrapper })}
      >
        <Input
          data-slot="input"
          placeholder={placeholder}
          className={s.input({ class: classNames?.input })}
          {...keyProps}
        />
        <Button
          slot="decrement"
          data-slot="decrement"
          className={s.decrement({ class: classNames?.decrement })}
        >
          <span aria-hidden="true">−</span>
        </Button>
        <Button
          slot="increment"
          data-slot="increment"
          className={s.increment({ class: classNames?.increment })}
        >
          <span aria-hidden="true">+</span>
        </Button>
      </Group>

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
    </RACNumberField>
  )
}
