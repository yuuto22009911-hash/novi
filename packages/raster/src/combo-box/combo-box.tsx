'use client'

import type { ComboBoxProps } from '@novi-ui/core'
import { useImeSafeKeys } from '@novi-ui/core/client'
import type { ReactNode } from 'react'
import {
  Button,
  FieldError,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  ComboBox as RACComboBox,
  Text,
} from 'react-aria-components'
import { comboBoxStyles } from './combo-box.styles'

/** 開閉を示す記号。Select と同じ上下の線。 */
function TriggerIcon() {
  return (
    <svg viewBox="0 0 16 16" width="0.75em" height="0.75em" fill="none" aria-hidden="true">
      <path d="M4 6.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export interface ComboBoxItemProps {
  /** 選択値。`onSelectionChange` に渡る */
  id: string
  isDisabled?: boolean
  children?: ReactNode
  className?: string
}

/**
 * ComboBox の選択肢。`ComboBox` の子として置く。
 *
 * 絞り込みは文字列の子に対して働く。要素を子にするときは `textValue` に相当する
 * 文字列を持てないため、絞り込みの対象にならない。
 *
 * @example
 * <ComboBoxItem id="tokyo">東京都</ComboBoxItem>
 */
export function ComboBoxItem({ id, isDisabled, children, className }: ComboBoxItemProps) {
  return (
    <ListBoxItem
      id={id}
      isDisabled={isDisabled}
      textValue={typeof children === 'string' ? children : undefined}
      data-slot="option"
      className={className ?? comboBoxStyles().option()}
    >
      {children}
    </ListBoxItem>
  )
}

/**
 * 文字を打って絞り込み、一覧から1つ選ぶ。
 *
 * 一覧は入力欄の隣に浮く（Tactile は画面下端のシート、Flatlay はフロー内に展開）。
 * IME 変換中の Enter と矢印キーは一覧に届かず、変換確定で誤選択しない。
 *
 * @example
 * <ComboBox label="都道府県" onSelectionChange={setPref}>
 *   <ComboBoxItem id="tokyo">東京都</ComboBoxItem>
 *   <ComboBoxItem id="osaka">大阪府</ComboBoxItem>
 * </ComboBox>
 */
export function ComboBox({
  variant,
  size,
  radius,
  label,
  placeholder,
  description,
  errorMessage,
  name,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  inputValue,
  defaultInputValue,
  onInputChange,
  allowsCustomValue,
  menuTrigger,
  onOpenChange,
  onKeyDown,
  isDisabled,
  isReadOnly,
  isRequired,
  isInvalid,
  children,
  className,
  classNames,
  id,
}: ComboBoxProps) {
  const s = comboBoxStyles({ variant, size, radius })
  const keyProps = useImeSafeKeys<HTMLInputElement>(onKeyDown)

  return (
    <RACComboBox
      id={id}
      name={name}
      selectedKey={selectedKey}
      defaultSelectedKey={defaultSelectedKey}
      onSelectionChange={(key) => onSelectionChange?.(key === null ? null : String(key))}
      inputValue={inputValue}
      defaultInputValue={defaultInputValue}
      onInputChange={onInputChange}
      allowsCustomValue={allowsCustomValue}
      menuTrigger={menuTrigger}
      onOpenChange={onOpenChange}
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
        <Button data-slot="trigger" className={s.trigger({ class: classNames?.trigger })}>
          <span data-slot="icon" className={s.icon({ class: classNames?.icon })}>
            <TriggerIcon />
          </span>
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

      <Popover data-slot="popover" className={s.popover({ class: classNames?.popover })}>
        <ListBox data-slot="listbox" className={s.listbox({ class: classNames?.listbox })}>
          {children}
        </ListBox>
      </Popover>
    </RACComboBox>
  )
}
