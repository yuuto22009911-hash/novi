'use client'

import type { TextareaProps } from '@novi-ui/core'
import { useImeSafeKeys } from '@novi-ui/core/client'
import {
  FieldError,
  Group,
  Label,
  TextArea as RACTextArea,
  Text,
  TextField,
} from 'react-aria-components'
import { textareaStyles } from './textarea.styles'

/**
 * 複数行テキスト入力。
 *
 * `onKeyDown` は IME 変換中のキーを受け取らない。
 * 横方向のリサイズは許可しない（レイアウトが崩れるため）。
 *
 * @example
 * <TextArea label="備考" rows={4} maxLength={500} />
 */
export function TextArea({
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
  onKeyDown,
  rows = 3,
  maxLength,
  isDisabled,
  isReadOnly,
  isRequired,
  isInvalid,
  className,
  classNames,
  id,
}: TextareaProps) {
  const s = textareaStyles({ variant, size, radius })
  const keyProps = useImeSafeKeys<HTMLTextAreaElement>(onKeyDown)

  return (
    <TextField
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

      <Group
        data-slot="inputWrapper"
        className={s.inputWrapper({ class: classNames?.inputWrapper })}
      >
        <RACTextArea
          data-slot="textarea"
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={s.textarea({ class: classNames?.textarea })}
          {...keyProps}
        />
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
    </TextField>
  )
}
