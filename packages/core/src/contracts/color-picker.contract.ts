import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviSize } from '../tokens'

/**
 * ColorPicker を構成する部位。
 *
 * `swatch` が色そのものを見せる面、`indicator` が選択中であることを示す印。
 * 色だけで選択状態を伝えると、色覚特性によっては区別できない（WCAG 1.4.1）。
 */
export const colorPickerSlots = [
  'root',
  'label',
  'description',
  'errorMessage',
  'list',
  'item',
  'swatch',
  'indicator',
  'itemLabel',
] as const

export const colorPickerRequiredSlots = ['root', 'list', 'item', 'swatch'] as const

export type ColorPickerSlot = (typeof colorPickerSlots)[number]
export type ColorPickerRequiredSlot = (typeof colorPickerRequiredSlots)[number]

/**
 * カラーセットの1色。**テーマが自分のセットを持つ**ため、利用側は普通は渡さない。
 *
 * `id` が `data-novi-color` に入る値、`name` が人に見せる名前。
 */
export interface NoviColorOption {
  /** `data-novi-color` に指定する値（`ink` / `indigo` など） */
  readonly id: string
  /** 表示名（`Ink` / `Indigo` など） */
  readonly name: string
  /** 由来や用途の一言。ツールチップや説明に使う */
  readonly description?: string
}

/**
 * テーマのカラーセットから1色を選ぶ。選んだ値を `data-novi-color` に渡すと配色が変わる。
 *
 * **色の一覧はテーマが持っている。** Raster なら Print Inks、Tactile なら Textile Dyes が
 * 既定で並ぶ。同じ `<ColorPicker />` がテーマによって違う染料を見せる。
 *
 * @keywords カラー選択 色を選ぶ 配色 カラーピッカー テーマカラー colorpicker swatch
 *
 * @a11y radiogroup として提示され、矢印キーで色を移動する。選択は色だけでなく
 * `indicator` でも示す。各色には名前が読み上げられる
 *
 * @example
 * const [color, setColor] = useState('ink')
 * return (
 *   <div data-novi-color={color}>
 *     <ColorPicker label="配色" value={color} onChange={setColor} />
 *   </div>
 * )
 */
export interface ColorPickerProps extends NoviBaseProps {
  size?: NoviSize
  label?: ReactNode
  description?: ReactNode
  errorMessage?: ReactNode
  /** 選択中の色の id。制御する場合に渡す */
  value?: string
  /** 非制御時の初期値。未指定ならテーマの既定色 */
  defaultValue?: string
  onChange?: (colorId: string) => void
  /** 並べる色。**省略時はテーマのカラーセット全色**。順序も含めてそのまま出す */
  colors?: readonly NoviColorOption[]
  /** 色名を各スウォッチの下に出す。既定は false（スウォッチだけ並べる） */
  showLabels?: boolean
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  name?: string
  classNames?: ClassNames<typeof colorPickerSlots>
}
