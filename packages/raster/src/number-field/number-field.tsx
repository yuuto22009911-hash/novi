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

function MinusIcon() {
  return (
    <svg viewBox="0 0 16 16" width="0.75em" height="0.75em" fill="none" aria-hidden="true">
      <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" width="0.75em" height="0.75em" fill="none" aria-hidden="true">
      <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * 数値の入力。矢印キーと増減ボタンで `step` ずつ刻む。
 *
 * 増減ボタンは入力欄の右に並ぶ（Tactile は左右、Flatlay は罫線のセル）。
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
          <MinusIcon />
        </Button>
        <Button
          slot="increment"
          data-slot="increment"
          className={s.increment({ class: classNames?.increment })}
        >
          <PlusIcon />
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
