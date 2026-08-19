'use client'

import type { InputProps } from '@novi-ui/core'
import { useImeSafeKeys } from '@novi-ui/core/client'
import { FieldError, Group, Label, Input as RACInput, Text, TextField } from 'react-aria-components'
import { inputStyles } from './input.styles'

/**
 * 1行テキスト入力。
 *
 * `onKeyDown` は IME 変換中のキーを受け取らない。
 * 日本語の変換確定 Enter で送信が暴発する事故を、利用側が意識せずに防げる。
 *
 * @example
 * <Input
 *   label="メールアドレス"
 *   type="email"
 *   isRequired
 *   description="ログインに使用します"
 * />
 */
export function Input({
  variant,
  size,
  radius,
  label,
  placeholder,
  description,
  errorMessage,
  type = 'text',
  name,
  value,
  defaultValue,
  onChange,
  onKeyDown,
  isDisabled,
  isReadOnly,
  isRequired,
  isInvalid,
  startContent,
  endContent,
  className,
  classNames,
  id,
}: InputProps) {
  const s = inputStyles({ variant, size, radius })
  const keyProps = useImeSafeKeys<HTMLInputElement>(onKeyDown)

  return (
    <TextField
      id={id}
      name={name}
      type={type}
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

      <Group
        data-slot="inputWrapper"
        className={s.inputWrapper({ class: classNames?.inputWrapper })}
      >
        {startContent !== undefined && (
          <span
            data-slot="startContent"
            className={s.startContent({ class: classNames?.startContent })}
          >
            {startContent}
          </span>
        )}

        <RACInput
          data-slot="input"
          placeholder={placeholder}
          className={s.input({ class: classNames?.input })}
          {...keyProps}
        />

        {endContent !== undefined && (
          <span data-slot="endContent" className={s.endContent({ class: classNames?.endContent })}>
            {endContent}
          </span>
        )}
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

      {/* 色だけに頼らずテキストを必ず伴う（WCAG 1.4.1） */}
      <FieldError
        data-slot="errorMessage"
        className={s.errorMessage({ class: classNames?.errorMessage })}
      >
        {errorMessage}
      </FieldError>
    </TextField>
  )
}
