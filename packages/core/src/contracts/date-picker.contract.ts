import type { ReactNode } from 'react'
import type { DateValue } from 'react-aria-components'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius, NoviSize, NoviVariant } from '../tokens'

export type { DateValue }

/**
 * DatePicker を構成する部位。
 *
 * `inputWrapper` は枠、`dateInput` は年 / 月 / 日の入力欄、`segment` はその 1 マス、
 * `trigger` はカレンダーを開くボタン。`popover` は開いた時の外枠、`calendar` はその中身で、
 * `calendarHeader`（月送り）と `calendarGrid`（日の升目）を持つ。
 */
export const datePickerSlots = [
  'root',
  'label',
  'inputWrapper',
  'dateInput',
  'segment',
  'trigger',
  'icon',
  'popover',
  'calendar',
  'calendarHeader',
  'calendarTitle',
  'prevButton',
  'nextButton',
  'calendarGrid',
  'calendarCell',
  'description',
  'errorMessage',
] as const

export const datePickerRequiredSlots = [
  'root',
  'inputWrapper',
  'dateInput',
  'segment',
  'trigger',
  'popover',
  'calendar',
  'calendarGrid',
  'calendarCell',
] as const

export type DatePickerSlot = (typeof datePickerSlots)[number]
export type DatePickerRequiredSlot = (typeof datePickerRequiredSlots)[number]

/**
 * 日付を入力する。年 / 月 / 日のマスに直接打つか、カレンダーを開いて選ぶ。
 *
 * 値は React Aria の `DateValue`（`@internationalized/date` の `CalendarDate`）。
 * 文字列や `Date` は受けない。`parseDate('2026-09-05')` で作る（ADR-B6）。
 *
 * @keywords 日付 日付入力 日付選択 カレンダー 出荷日 納期 期日 date datepicker calendar
 *
 * @a11y 年 / 月 / 日の各マスは `spinbutton` で、矢印キーの上下で値が変わり、左右で隣のマスへ移る。
 * トリガーでカレンダーが開き、矢印キーで日を移動、Enter で決定、Escape で閉じる。
 * `minValue` / `maxValue` の外と `isDateUnavailable` の日は選べない。
 * `description` と `errorMessage` は `aria-describedby` で関連付く
 *
 * @example
 * <DatePicker label="出荷日" value={date} onChange={setDate} minValue={today} />
 */
export interface DatePickerProps extends NoviBaseProps {
  variant?: NoviVariant
  size?: NoviSize
  radius?: NoviRadius
  label?: ReactNode
  description?: ReactNode
  /** `isInvalid` のときに表示する。色だけに頼らずテキストを必ず伴う（WCAG 1.4.1） */
  errorMessage?: ReactNode
  name?: string
  /** `@internationalized/date` の `CalendarDate`。未入力は `null` */
  value?: DateValue | null
  defaultValue?: DateValue
  onChange?: (value: DateValue | null) => void
  /** この日より前は選べない */
  minValue?: DateValue
  /** この日より後は選べない */
  maxValue?: DateValue
  /** 選べない日を個別に決める（定休日など） */
  isDateUnavailable?: (date: DateValue) => boolean
  /** 未入力のとき、カレンダーが最初に開く月と、マスに薄く出る値 */
  placeholderValue?: DateValue
  /** 開閉状態。制御したい場合に使う */
  isOpen?: boolean
  defaultOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  classNames?: ClassNames<typeof datePickerSlots>
}
