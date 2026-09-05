'use client'

import type { DatePickerProps } from '@novi-ui/core'
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateSegment,
  Dialog,
  FieldError,
  Group,
  Heading,
  Label,
  DatePicker as RACDatePicker,
  Text,
} from 'react-aria-components'
import { InflowPopover } from '../styles/inflow'
import { datePickerStyles } from './date-picker.styles'

function CalendarIcon() {
  // 図形ではなく活字。帳票の語彙は記号であって図形ではない（ADR-F7）
  return <span aria-hidden="true">▦</span>
}

/**
 * 日付を入力する。年 / 月 / 日のマスに直接打つか、カレンダーを開いて選ぶ。
 *
 * **カレンダーは入力欄の直後、フローの中に展開される**（Raster は隣に浮き、Tactile は画面下端のシート）。
 * 開くと後続が押し下げられ、升目は縦横の罫線で切られる。
 * 値は `@internationalized/date` の `CalendarDate`（ADR-B6）。
 *
 * @example
 * <DatePicker label="出荷日" value={date} onChange={setDate} minValue={today} />
 */
export function DatePicker({
  variant,
  size,
  radius,
  label,
  description,
  errorMessage,
  name,
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  isDateUnavailable,
  placeholderValue,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDisabled,
  isReadOnly,
  isRequired,
  isInvalid,
  className,
  classNames,
  id,
}: DatePickerProps) {
  const s = datePickerStyles({ variant, size, radius })

  return (
    <RACDatePicker
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      minValue={minValue}
      maxValue={maxValue}
      isDateUnavailable={isDateUnavailable}
      placeholderValue={placeholderValue}
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      isInvalid={isInvalid}
      granularity="day"
      data-slot="root"
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
        <DateInput data-slot="dateInput" className={s.dateInput({ class: classNames?.dateInput })}>
          {(segment) => (
            <DateSegment
              segment={segment}
              data-slot="segment"
              className={s.segment({ class: classNames?.segment })}
            />
          )}
        </DateInput>
        <Button data-slot="trigger" className={s.trigger({ class: classNames?.trigger })}>
          <span data-slot="icon" className={s.icon({ class: classNames?.icon })}>
            <CalendarIcon />
          </span>
        </Button>
      </Group>

      {/* 展開部は入力欄の直後。ここに面が生えることで、description 以降が押し下がる */}
      <InflowPopover dataSlot="popover" className={s.popover({ class: classNames?.popover })}>
        <Dialog className="outline-none">
          <Calendar data-slot="calendar" className={s.calendar({ class: classNames?.calendar })}>
            <header
              data-slot="calendarHeader"
              className={s.calendarHeader({ class: classNames?.calendarHeader })}
            >
              <Button
                slot="previous"
                data-slot="prevButton"
                className={s.prevButton({ class: classNames?.prevButton })}
              >
                <span aria-hidden="true">‹</span>
              </Button>
              <Heading
                data-slot="calendarTitle"
                className={s.calendarTitle({ class: classNames?.calendarTitle })}
              />
              <Button
                slot="next"
                data-slot="nextButton"
                className={s.nextButton({ class: classNames?.nextButton })}
              >
                <span aria-hidden="true">›</span>
              </Button>
            </header>
            <CalendarGrid
              data-slot="calendarGrid"
              className={s.calendarGrid({ class: classNames?.calendarGrid })}
            >
              {(date) => (
                <CalendarCell
                  date={date}
                  data-slot="calendarCell"
                  className={s.calendarCell({ class: classNames?.calendarCell })}
                />
              )}
            </CalendarGrid>
          </Calendar>
        </Dialog>
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
    </RACDatePicker>
  )
}
