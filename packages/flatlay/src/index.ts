'use client'

/**
 * Flatlay テーマの公開エントリ。
 *
 * `'use client'` は**このファイルに必要**。バンドラは import 先のファイルに書かれた
 * ディレクティブを成果物へ引き上げないため、エントリ自身に置かないと消える（ADR-R6）。
 * CI（`scripts/check-dist-rules.mjs`）がこれを検査している。
 *
 * 契約は Phase 2 以降で 1 コンポーネント = 1 PR で足していく（specs/07-theme-flatlay/tasks.md）。
 */

export { Button, type ButtonStyleProps, buttonStyles } from './button'
export {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardImage,
  type CardStyleProps,
  cardStyles,
} from './card'
export {
  Checkbox,
  CheckboxGroup,
  type CheckboxGroupStyleProps,
  type CheckboxStyleProps,
  checkboxGroupStyles,
  checkboxStyles,
} from './checkbox'
export {
  COLOR_OPTIONS,
  ColorPicker,
  type ColorPickerStyleProps,
  colorPickerStyles,
} from './color-picker'
export { Input, type InputStyleProps, inputStyles } from './input'
export {
  Modal,
  ModalBody,
  ModalFooter,
  type ModalStyleProps,
  ModalTitle,
  modalStyles,
} from './modal'
export {
  Radio,
  RadioGroup,
  type RadioGroupStyleProps,
  type RadioStyleProps,
  radioGroupStyles,
  radioStyles,
} from './radio'
export {
  Select,
  SelectItem,
  type SelectItemProps,
  type SelectStyleProps,
  selectStyles,
} from './select'
export { Switch, type SwitchStyleProps, switchStyles } from './switch'
export {
  TabContent,
  TabItem,
  TabItems,
  Tabs,
  type TabsStyleProps,
  tabsStyles,
} from './tabs'
export { TextArea, type TextareaStyleProps, textareaStyles } from './textarea'
