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

/** チェック記号。三角矢印や塗りつぶしではなく 1px の線で描く（Raster の規律）。 */
function CheckMark({ isIndeterminate }: { isIndeterminate: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="0.75em" height="0.75em" fill="none" aria-hidden="true">
      {isIndeterminate ? (
        <path d="M3 8h10" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d="M2.5 8.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  )
}

/**
 * チェックボックス。
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
              <span data-slot="indicator" className={s.indicator({ class: classNames?.indicator })}>
                <CheckMark isIndeterminate={indeterminate} />
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
