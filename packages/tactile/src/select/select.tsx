'use client'

import type { SelectProps } from '@novi-ui/core'
import type { ReactNode } from 'react'
import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as RACSelect,
  SelectValue,
  Text,
} from 'react-aria-components'
import { selectStyles } from './select.styles'

/** 開閉を示す記号。上下の山で「下から出る/しまう」方向を示す。 */
function TriggerIcon() {
  return (
    <svg viewBox="0 0 16 16" width="0.9em" height="0.9em" fill="none" aria-hidden="true">
      <path d="M5 6.5L8 3.5l3 3M5 9.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** 選択済みの印。シートでは行が大きいぶん、選択状態を明示しないと見失う。 */
function SelectedIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

export interface SelectItemProps {
  /** 選択値。`onSelectionChange` に渡る */
  id: string
  isDisabled?: boolean
  children?: ReactNode
  className?: string
}

/**
 * Select の選択肢。`Select` の子として置く。
 *
 * @example
 * <SelectItem id="tokyo">東京都</SelectItem>
 */
export function SelectItem({ id, isDisabled, children, className }: SelectItemProps) {
  return (
    <ListBoxItem
      id={id}
      isDisabled={isDisabled}
      textValue={typeof children === 'string' ? children : undefined}
      data-slot="option"
      className={className ?? selectStyles().option()}
    >
      {({ isSelected }) => (
        <>
          <span className="truncate">{children}</span>
          {isSelected && (
            <span className="shrink-0 text-[var(--novi-color-primary)]">
              <SelectedIcon />
            </span>
          )}
        </>
      )}
    </ListBoxItem>
  )
}

/**
 * 一覧から1つ選ぶ。**選択肢は画面下端から出るシート**で表示される（Raster はトリガーの隣）。
 * 矢印キーで移動、Escape で閉じてトリガーへフォーカスが戻る。
 *
 * トリガーは `<button>` で編集可能要素ではないため IME の変換は発生しない。
 * テキスト入力を伴う選択が必要な場合は ComboBox を使う（MVP の対象外）。
 *
 * @example
 * <Select label="都道府県" selectedKey={pref} onSelectionChange={setPref}>
 *   <SelectItem id="tokyo">東京都</SelectItem>
 *   <SelectItem id="osaka">大阪府</SelectItem>
 * </Select>
 */
export function Select({
  variant,
  size,
  radius,
  label,
  placeholder = '選択してください',
  description,
  errorMessage,
  name,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDisabled,
  isRequired,
  isInvalid,
  children,
  className,
  classNames,
  id,
}: SelectProps) {
  const s = selectStyles({ variant, size, radius })

  return (
    <RACSelect
      id={id}
      name={name}
      selectedKey={selectedKey}
      defaultSelectedKey={defaultSelectedKey}
      onSelectionChange={(key) => onSelectionChange?.(key === null ? null : String(key))}
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isDisabled={isDisabled}
      isRequired={isRequired}
      isInvalid={isInvalid}
      placeholder={placeholder}
      data-slot="root"
      // trigger 側から invalid 状態を参照するために group を付ける
      className={`group ${s.root({ class: [className, classNames?.root] })}`}
    >
      {label !== undefined && (
        <Label data-slot="label" className={s.label({ class: classNames?.label })}>
          {label}
        </Label>
      )}

      <Button data-slot="trigger" className={s.trigger({ class: classNames?.trigger })}>
        <SelectValue data-slot="value" className={s.value({ class: classNames?.value })} />
        <span data-slot="icon" className={s.icon({ class: classNames?.icon })}>
          <TriggerIcon />
        </span>
      </Button>

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
    </RACSelect>
  )
}
