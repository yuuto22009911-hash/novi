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
  Popover,
  DatePicker as RACDatePicker,
  Text,
} from 'react-aria-components'
import { datePickerStyles } from './date-picker.styles'

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
      <rect x="2.5" y="3.5" width="11" height="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ChevronIcon({ direction }: { direction: 'prev' | 'next' }) {
  const d = direction === 'prev' ? 'M10 4l-4 4 4 4' : 'M6 4l4 4-4 4'
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * 日付を入力する。年 / 月 / 日のマスに直接打つか、カレンダーを開いて選ぶ。
 *
 * **カレンダーは画面下端のシートに出る**（Raster は入力欄の隣、Flatlay はフロー内）。
 * 升目は 44px で、親指で押せる。
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
                <ChevronIcon direction="prev" />
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
                <ChevronIcon direction="next" />
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
      </Popover>
    </RACDatePicker>
  )
}
