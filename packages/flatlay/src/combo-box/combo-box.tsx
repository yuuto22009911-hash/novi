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
  ComboBox as RACComboBox,
  Text,
} from 'react-aria-components'
import { InflowPopover } from '../styles/inflow'
import { comboBoxStyles, optionMarkerClass } from './combo-box.styles'

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
 * 選択済みの印は行頭の `▸`（Select と同じ）。
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
      {({ isSelected }) => (
        <>
          <span aria-hidden="true" className={optionMarkerClass}>
            {isSelected ? '▸' : ''}
          </span>
          <span className="truncate">{children}</span>
        </>
      )}
    </ListBoxItem>
  )
}

/**
 * 文字を打って絞り込み、一覧から1つ選ぶ。
 * **一覧は入力欄の直後、フローの中に展開される**（Raster は隣に浮き、Tactile は画面下端のシート）。
 *
 * 開くと後続が押し下げられるので、何かが隠れることが無い。打つたびに絞られて
 * 一覧の高さが変わり、その分だけ後続が上下する。それが帳票の挙動。
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
      // trigger 側から open を参照するために group を付ける
      className={`group ${s.root({ class: [className, classNames?.root] })}`}
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
          <span aria-hidden="true" data-slot="icon" className={s.icon({ class: classNames?.icon })}>
            {/* 回さずに差し替える。開いている間だけ字が反転する */}
            <span className="group-data-[open]:hidden">▾</span>
            <span className="hidden group-data-[open]:inline">▴</span>
          </span>
        </Button>
      </Group>

      {/* 展開部は入力欄の直後。ここに面が生えることで、description 以降が押し下がる */}
      <InflowPopover dataSlot="popover" className={s.popover({ class: classNames?.popover })}>
        <ListBox data-slot="listbox" className={s.listbox({ class: classNames?.listbox })}>
          {children}
        </ListBox>
      </InflowPopover>

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
    </RACComboBox>
  )
}
