'use client'

import type { CardProps } from '@novi-ui/core'
import type { ImgHTMLAttributes, ReactNode } from 'react'
import { Button } from 'react-aria-components'
import { cardStyles } from './card.styles'

interface PartProps {
  children?: ReactNode
  className?: string
}

/**
 * Card の見出し部分。下端が境界線で仕切られる。
 *
 * @example
 * <CardHeader>売上</CardHeader>
 */
export function CardHeader({ children, className }: PartProps) {
  return (
    <div data-slot="header" className={cardStyles().header({ class: className })}>
      {children}
    </div>
  )
}

/**
 * Card の本体。
 *
 * @example
 * <CardBody>¥1,240,000</CardBody>
 */
export function CardBody({ children, className }: PartProps) {
  return (
    <div data-slot="body" className={cardStyles().body({ class: className })}>
      {children}
    </div>
  )
}

/**
 * Card の脚部。上端が境界線で仕切られる。
 *
 * @example
 * <CardFooter>前月比 +12%</CardFooter>
 */
export function CardFooter({ children, className }: PartProps) {
  return (
    <div data-slot="footer" className={cardStyles().footer({ class: className })}>
      {children}
    </div>
  )
}

/**
 * Card の上部に置く画像。
 *
 * @example
 * <CardImage src="/thumb.jpg" alt="" />
 */
export function CardImage({ className, alt = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      alt={alt}
      data-slot="image"
      className={cardStyles().image({ class: className })}
    />
  )
}

/**
 * 情報のまとまりを囲む器。
 *
 * 影は使わず、1px の境界線と余白だけで面を作る。
 * `onPress` を渡すと押せるカードになり、キーボード操作とフォーカスリングが付く。
 *
 * @example
 * <Card>
 *   <CardHeader>売上</CardHeader>
 *   <CardBody>¥1,240,000</CardBody>
 * </Card>
 */
export function Card({
  variant,
  radius,
  onPress,
  isDisabled,
  children,
  className,
  classNames,
  id,
}: CardProps) {
  const isPressable = onPress !== undefined
  const s = cardStyles({ variant, radius, isPressable })
  const rootClass = s.root({ class: [className, classNames?.root] })

  if (isPressable) {
    return (
      <Button
        id={id}
        onPress={onPress}
        isDisabled={isDisabled}
        data-slot="root"
        className={rootClass}
      >
        {children}
      </Button>
    )
  }

  return (
    <div id={id} data-slot="root" className={rootClass}>
      {children}
    </div>
  )
}
