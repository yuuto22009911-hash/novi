import { Button, buttonStyles } from '@novi-ui/raster'
import { tv } from 'tailwind-variants'

// slot ベースの定義では `base` は効かない。**必ず `slots` を使う。**
export const wideButtonStyles = tv({
  extend: buttonStyles,
  slots: {
    root: 'w-full justify-between',
  },
})

// 拡張した styles は自分で呼び、結果を classNames に渡す。
export function WideButton() {
  const s = wideButtonStyles({ size: 'lg' })

  return (
    <Button size="lg" classNames={{ root: s.root() }}>
      続ける
    </Button>
  )
}
