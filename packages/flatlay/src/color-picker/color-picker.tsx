'use client'

import type { ColorPickerProps, NoviColorOption } from '@novi-ui/core'
import {
  FieldError,
  Label,
  Radio as RACRadio,
  RadioGroup as RACRadioGroup,
  Text,
} from 'react-aria-components'
import { DEFAULT_COLOR_ID, FLATLAY_COLOR_SET } from '../tokens/color-set'
import { colorPickerStyles } from './color-picker.styles'

/**
 * Flatlay のカラーセット（Stationery）。**利用側が色値を書かなくてよい**ように既定で並ぶ。
 *
 * ここが `colors` prop の既定値になる。同じ `<ColorPicker />` でも
 * Raster では Print Inks、Tactile では Textile Dyes が出る。色はモデルの持ち物で、共通ではない。
 *
 * **赤が無いのは欠落ではなく決定**。校正の朱書きはエラーの道具なので danger に予約している。
 */
export const COLOR_OPTIONS: readonly NoviColorOption[] = FLATLAY_COLOR_SET.map(
  ({ id, name, description }) => ({ id, name, description }),
)

/**
 * テーマのカラーセットから1色を選ぶ。選んだ値を `data-novi-color` に渡すと配色が変わる。
 *
 * Flatlay では**方眼に貼った色見本**として並ぶ。升目の罫線が見本の枠を兼ね、
 * 選ぶと升目の地が紙からインクに反転する。
 *
 * @example
 * // 色 id を書かない。未指定ならテーマの既定色（Fieldbook）から始まる
 * const [color, setColor] = useState<string>()
 * return (
 *   <div data-novi-color={color}>
 *     <ColorPicker label="配色" onChange={setColor} />
 *   </div>
 * )
 */
export function ColorPicker({
  size,
  label,
  description,
  errorMessage,
  value,
  defaultValue = DEFAULT_COLOR_ID,
  onChange,
  colors = COLOR_OPTIONS,
  showLabels = false,
  isDisabled,
  isReadOnly,
  isRequired,
  isInvalid,
  name,
  className,
  classNames,
  id,
}: ColorPickerProps) {
  const s = colorPickerStyles({ size })

  return (
    <RACRadioGroup
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
        {colors.map((color) => (
          <RACRadio
            key={color.id}
            value={color.id}
            // スウォッチは色の面でしかない。名前を持たせないと読み上げが「ラジオボタン」で終わる
            aria-label={color.name}
            data-slot="item"
            className={`group ${s.item({ class: classNames?.item })}`}
          >
            {({ isSelected }) => (
              <>
                {/*
                  色の解決は生成 CSS の `--novi-swatch-*` に委ねる。実装は色値を持たない。
                  `data-novi-color` を置く形は採れない — テーマ宣言ごと切り替わってしまい、
                  ライト / ダークの選択からも外れる（06 の申し送り）。
                */}
                <span
                  data-slot="swatch"
                  style={{
                    background: `var(--novi-swatch-${color.id})`,
                    color: `var(--novi-swatch-${color.id}-fg)`,
                  }}
                  className={s.swatch({ class: classNames?.swatch })}
                >
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      data-slot="indicator"
                      className={s.indicator({ class: classNames?.indicator })}
                    >
                      ✓
                    </span>
                  )}
                </span>

                {showLabels && (
                  <span
                    data-slot="itemLabel"
                    className={s.itemLabel({ class: classNames?.itemLabel })}
                  >
                    {color.name}
                  </span>
                )}
              </>
            )}
          </RACRadio>
        ))}
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

      {errorMessage !== undefined && (
        <FieldError
          data-slot="errorMessage"
          className={s.errorMessage({ class: classNames?.errorMessage })}
        >
          {errorMessage}
        </FieldError>
      )}
    </RACRadioGroup>
  )
}
