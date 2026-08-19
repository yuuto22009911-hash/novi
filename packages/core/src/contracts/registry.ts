import { accordionRequiredSlots, accordionSlots } from './accordion.contract'
import { avatarRequiredSlots, avatarSlots } from './avatar.contract'
import { badgeRequiredSlots, badgeSlots } from './badge.contract'
import { breadcrumbsRequiredSlots, breadcrumbsSlots } from './breadcrumbs.contract'
import { buttonRequiredSlots, buttonSlots } from './button.contract'
import { cardRequiredSlots, cardSlots } from './card.contract'
import {
  checkboxGroupRequiredSlots,
  checkboxGroupSlots,
  checkboxRequiredSlots,
  checkboxSlots,
} from './checkbox.contract'
import { inputRequiredSlots, inputSlots } from './input.contract'
import { menuRequiredSlots, menuSlots } from './menu.contract'
import { modalRequiredSlots, modalSlots } from './modal.contract'
import { popoverRequiredSlots, popoverSlots } from './popover.contract'
import {
  progressRequiredSlots,
  progressSlots,
  spinnerRequiredSlots,
  spinnerSlots,
} from './progress.contract'
import {
  radioGroupRequiredSlots,
  radioGroupSlots,
  radioRequiredSlots,
  radioSlots,
} from './radio.contract'
import { selectRequiredSlots, selectSlots } from './select.contract'
import { skeletonRequiredSlots, skeletonSlots } from './skeleton.contract'
import { switchRequiredSlots, switchSlots } from './switch.contract'
import { tabsRequiredSlots, tabsSlots } from './tabs.contract'
import { textareaRequiredSlots, textareaSlots } from './textarea.contract'
import { toastRequiredSlots, toastSlots } from './toast.contract'
import { tooltipRequiredSlots, tooltipSlots } from './tooltip.contract'

/** 1コンポーネント分の slot 契約。 */
export interface NoviContract {
  readonly slots: readonly string[]
  readonly required: readonly string[]
}

/**
 * 全 slot 契約の索引。
 *
 * 契約テストスイート・ドキュメントの slot 表・AI 向け出力の生成が
 * すべてここを唯一の情報源として読む。手書きの表を別に持たない。
 *
 * @example
 * const { slots, required } = NOVI_CONTRACTS.Modal
 */
export const NOVI_CONTRACTS = {
  Accordion: { slots: accordionSlots, required: accordionRequiredSlots },
  Avatar: { slots: avatarSlots, required: avatarRequiredSlots },
  Badge: { slots: badgeSlots, required: badgeRequiredSlots },
  Breadcrumbs: { slots: breadcrumbsSlots, required: breadcrumbsRequiredSlots },
  Button: { slots: buttonSlots, required: buttonRequiredSlots },
  Card: { slots: cardSlots, required: cardRequiredSlots },
  Checkbox: { slots: checkboxSlots, required: checkboxRequiredSlots },
  CheckboxGroup: { slots: checkboxGroupSlots, required: checkboxGroupRequiredSlots },
  Input: { slots: inputSlots, required: inputRequiredSlots },
  Menu: { slots: menuSlots, required: menuRequiredSlots },
  Modal: { slots: modalSlots, required: modalRequiredSlots },
  Popover: { slots: popoverSlots, required: popoverRequiredSlots },
  Progress: { slots: progressSlots, required: progressRequiredSlots },
  Radio: { slots: radioSlots, required: radioRequiredSlots },
  RadioGroup: { slots: radioGroupSlots, required: radioGroupRequiredSlots },
  Select: { slots: selectSlots, required: selectRequiredSlots },
  Skeleton: { slots: skeletonSlots, required: skeletonRequiredSlots },
  Spinner: { slots: spinnerSlots, required: spinnerRequiredSlots },
  Switch: { slots: switchSlots, required: switchRequiredSlots },
  Tabs: { slots: tabsSlots, required: tabsRequiredSlots },
  Textarea: { slots: textareaSlots, required: textareaRequiredSlots },
  Toast: { slots: toastSlots, required: toastRequiredSlots },
  Tooltip: { slots: tooltipSlots, required: tooltipRequiredSlots },
} as const satisfies Record<string, NoviContract>

export type NoviComponentName = keyof typeof NOVI_CONTRACTS

/**
 * MVP のコンポーネント数。
 *
 * 契約の数（23）とは一致しない。Checkbox/CheckboxGroup、Radio/RadioGroup、
 * Progress/Spinner はそれぞれ1コンポーネントとして数えるため。
 */
export const NOVI_MVP_COMPONENT_COUNT = 20
