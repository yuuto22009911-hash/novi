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
              {/* 印は行頭。回さず字を差し替える（FR-11） */}
              <span data-slot="indicator" className={s.indicator()} aria-hidden="true">
                {isExpanded ? '▾' : '▸'}
              </span>
              <span>{title}</span>
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
 * 折りたたみできる項目の集合。**Flatlay の主役**です。
 *
 * 他の展開系（Select / Menu / Popover）はここに合わせてフローへ降ろしました。
 * Accordion だけは最初からこの形だったので、直すところがありません。
 *
 * 開閉の印は行頭の `▸` / `▾`。回転（Tactile）ではなく字の差し替えです。
 * 高さのアニメーションも持たないので、開いた瞬間に後続がその場で下がります。
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
