'use client'

import type { CheckboxGroupProps, CheckboxProps } from '@novi-ui/core'
import {
  FieldError,
  Label,
  Checkbox as RACCheckbox,
  CheckboxGroup as RACCheckboxGroup,
  Text,
} from 'react-aria-components'
import { checkboxGroupStyles, checkboxStyles } from './checkbox.styles'

/**
 * チェックボックス。**2px 角の箱に等幅の印を入れる**。
 *
 * 印が図形ではなく文字なのは、帳票の記号が書くものだから（ADR-F7）。
 * 選ぶと箱が塗り潰され、印が地色で立つ。
 *
 * @example
 * <Checkbox isSelected={agreed} onChange={setAgreed}>
 *   利用規約に同意する
 * </Checkbox>
 */
export function Checkbox({
  size,
  color,
  value,
  isSelected,
  defaultSelected,
  onChange,
  isIndeterminate,
  isDisabled,
  isReadOnly,
  isRequired,
  isInvalid,
  description,
  children,
  className,
  classNames,
  id,
}: CheckboxProps) {
  const s = checkboxStyles({ size, color })

  return (
    <RACCheckbox
      id={id}
      value={value}
      isSelected={isSelected}
      defaultSelected={defaultSelected}
      onChange={onChange}
      isIndeterminate={isIndeterminate}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      isInvalid={isInvalid}
      data-slot="root"
      // control 側から選択状態を参照するために group を付ける
      className={`group ${s.root({ class: [className, classNames?.root] })}`}
    >
      {({ isSelected: selected, isIndeterminate: indeterminate }) => (
        <>
          <span data-slot="control" className={s.control({ class: classNames?.control })}>
            {(selected || indeterminate) && (
              <span
                aria-hidden="true"
                data-slot="indicator"
                className={s.indicator({ class: classNames?.indicator })}
              >
                {/* 一部だけ選ばれている状態は「まだ書き切っていない」ので横線 */}
                {indeterminate ? '−' : '✓'}
              </span>
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
    </RACCheckbox>
  )
}

/**
 * チェックボックスのグループ。ラベルとエラーをまとめて扱う。
 *
 * @example
 * <CheckboxGroup label="通知方法" value={ways} onChange={setWays}>
 *   <Checkbox value="email">メール</Checkbox>
 *   <Checkbox value="sms">SMS</Checkbox>
 * </CheckboxGroup>
 */
export function CheckboxGroup({
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
}: CheckboxGroupProps) {
  const s = checkboxGroupStyles({ orientation })

  return (
    <RACCheckboxGroup
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
    </RACCheckboxGroup>
  )
}
