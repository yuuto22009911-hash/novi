'use client'

import type { AccordionProps } from '@novi-ui/core'
import type { ReactNode } from 'react'
import {
  Button,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
} from 'react-aria-components'
import { accordionStyles } from './accordion.styles'

/** 開閉を示す記号。回転させず `+` と `−` の線で描く。 */
function Indicator({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="0.875em" height="0.875em" fill="none" aria-hidden="true">
      <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" />
      {!isExpanded && <path d="M8 3v10" stroke="currentColor" strokeWidth="1.5" />}
    </svg>
  )
}

export interface AccordionItemProps {
  id: string
  title: ReactNode
  isDisabled?: boolean
  children?: ReactNode
  className?: string
}

/**
 * Accordion の項目。
 *
 * @example
 * <AccordionItem id="shipping" title="配送について">…</AccordionItem>
 */
export function AccordionItem({ id, title, isDisabled, children, className }: AccordionItemProps) {
  const s = accordionStyles()

  return (
    <Disclosure
      id={id}
      isDisabled={isDisabled}
      data-slot="item"
      className={s.item({ class: className })}
    >
      {({ isExpanded }) => (
        <>
          <Heading data-slot="heading" className={s.heading()}>
            <Button slot="trigger" data-slot="trigger" className={s.trigger()}>
              <span>{title}</span>
              <span data-slot="indicator" className={s.indicator()}>
                <Indicator isExpanded={isExpanded} />
              </span>
            </Button>
          </Heading>
          <DisclosurePanel data-slot="panel" className={s.panel()}>
            {children}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}

/**
 * 折りたたみできる項目の集合。
 *
 * 開閉の記号は `+` / `−` の線で示す。三角矢印の回転は使わない。
 *
 * @example
 * <Accordion allowsMultipleExpanded>
 *   <AccordionItem id="shipping" title="配送について">…</AccordionItem>
 * </Accordion>
 */
export function Accordion({
  variant,
  size,
  allowsMultipleExpanded,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  isDisabled,
  children,
  className,
  classNames,
  id,
}: AccordionProps) {
  const s = accordionStyles({ variant, size })

  return (
    <DisclosureGroup
      id={id}
      allowsMultipleExpanded={allowsMultipleExpanded}
      expandedKeys={expandedKeys}
      defaultExpandedKeys={defaultExpandedKeys}
      onExpandedChange={(keys) => onExpandedChange?.([...keys].map(String))}
      isDisabled={isDisabled}
      data-slot="root"
      className={s.root({ class: [className, classNames?.root] })}
    >
      {children}
    </DisclosureGroup>
  )
}
