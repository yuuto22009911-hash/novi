'use client'

import type { SelectProps } from '@novi-ui/core'
import type { ReactNode } from 'react'
import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Select as RACSelect,
  SelectValue,
  Text,
} from 'react-aria-components'
import { InflowPopover } from '../styles/inflow'
import { optionMarkerClass, selectStyles } from './select.styles'

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
 * 選択済みの印は行頭の `▸`（両テーマはチェックマーク）。押下の反転と衝突しないよう、
 * 状態は記号で、押した瞬間は面の反転で示すという役割分担にしている。
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
 * 一覧から1つ選ぶ。**選択肢はトリガーの直後、フローの中に展開される**
 * （Raster は隣に浮き、Tactile は画面下端のシート）。
 *
 * 開くと後続が押し下げられるので、何かが隠れることが無い。
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
      // trigger 側から invalid / open を参照するために group を付ける
      className={`group ${s.root({ class: [className, classNames?.root] })}`}
    >
      {label !== undefined && (
        <Label data-slot="label" className={s.label({ class: classNames?.label })}>
          {label}
        </Label>
      )}

      <Button data-slot="trigger" className={s.trigger({ class: classNames?.trigger })}>
        <SelectValue data-slot="value" className={s.value({ class: classNames?.value })} />
        <span aria-hidden="true" data-slot="icon" className={s.icon({ class: classNames?.icon })}>
          {/* 回さずに差し替える。開いている間だけ字が反転する */}
          <span className="group-data-[open]:hidden">▾</span>
          <span className="hidden group-data-[open]:inline">▴</span>
        </span>
      </Button>

      {/* 展開部はトリガーの直後。ここに面が生えることで、description 以降が押し下がる */}
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
    </RACSelect>
  )
}
