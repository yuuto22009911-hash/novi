'use client'

import type { MenuProps } from '@novi-ui/core'
import type { ReactNode } from 'react'
import {
  Header,
  MenuItem,
  MenuTrigger,
  Popover,
  Menu as RACMenu,
  MenuSection as RACMenuSection,
  Separator,
} from 'react-aria-components'
import { menuStyles } from './menu.styles'

export interface MenuItemProps {
  /** 選ばれたときに `onAction` へ渡る値 */
  id: string
  isDisabled?: boolean
  /** 補足説明。項目名だけで足りないときに使う */
  description?: ReactNode
  /** キーボードショートカットの表示。桁が揃うよう等幅数字にしている */
  shortcut?: ReactNode
  children?: ReactNode
  className?: string
}

/**
 * Menu の項目。
 *
 * @example
 * <MenuItem id="rename" shortcut="⌘R">名前を変更</MenuItem>
 */
export function MenuItemComponent({
  id,
  isDisabled,
  description,
  shortcut,
  children,
  className,
}: MenuItemProps) {
  const s = menuStyles()

  return (
    <MenuItem
      id={id}
      isDisabled={isDisabled}
      textValue={typeof children === 'string' ? children : undefined}
      data-slot="item"
      className={s.item({ class: className })}
    >
      <span className="flex flex-col min-w-0">
        <span data-slot="itemLabel" className={s.itemLabel()}>
          {children}
        </span>
        {description !== undefined && (
          <span data-slot="itemDescription" className={s.itemDescription()}>
            {description}
          </span>
        )}
      </span>
      {shortcut !== undefined && (
        <span data-slot="itemShortcut" className={s.itemShortcut()}>
          {shortcut}
        </span>
      )}
    </MenuItem>
  )
}

/**
 * Menu の区切り線。
 *
 * @example
 * <MenuSeparator />
 */
export function MenuSeparator({ className }: { className?: string }) {
  return (
    <Separator data-slot="separator" className={menuStyles().separator({ class: className })} />
  )
}

/**
 * Menu の見出し付きグループ。項目が多いときに種類でまとめる。
 *
 * 語彙に `section` / `sectionLabel` があるのに実装がなく、
 * T-41 の slot 語彙レビューで漏れが判明したもの。
 *
 * @example
 * <MenuSection title="ファイル">
 *   <MenuItem id="rename">名前を変更</MenuItem>
 * </MenuSection>
 */
export function MenuSection({
  title,
  children,
  className,
}: {
  title: ReactNode
  children?: ReactNode
  className?: string
}) {
  const s = menuStyles()

  return (
    <RACMenuSection data-slot="section" className={s.section({ class: className })}>
      <Header data-slot="sectionLabel" className={s.sectionLabel()}>
        {title}
      </Header>
      {children}
    </RACMenuSection>
  )
}

/**
 * トリガーから開く操作の一覧。矢印キーで移動、Escape で閉じる。
 *
 * 最初の子要素がトリガーになる。残りが項目として扱われる。
 *
 * @example
 * <Menu onAction={(key) => run(key)}>
 *   <Button>操作</Button>
 *   <MenuItem id="rename">名前を変更</MenuItem>
 *   <MenuItem id="delete">削除</MenuItem>
 * </Menu>
 */
export function Menu({
  placement = 'bottom',
  offset = 4,
  isOpen,
  defaultOpen,
  onOpenChange,
  onAction,
  disabledKeys,
  children,
  className,
  classNames,
  id,
}: MenuProps) {
  const s = menuStyles()
  const items = Array.isArray(children) ? children : [children]
  const [trigger, ...rest] = items

  return (
    <MenuTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <span data-slot="trigger" className={s.trigger({ class: classNames?.trigger })}>
        {trigger}
      </span>
      <Popover
        placement={placement}
        offset={offset}
        data-slot="popover"
        className={s.popover({ class: [className, classNames?.popover] })}
      >
        {/* RAC の Popover は id を受け取らないため Menu 本体に付ける */}
        <RACMenu
          id={id}
          data-slot="list"
          className={s.list({ class: classNames?.list })}
          onAction={(key) => onAction?.(String(key))}
          disabledKeys={disabledKeys}
        >
          {rest}
        </RACMenu>
      </Popover>
    </MenuTrigger>
  )
}
