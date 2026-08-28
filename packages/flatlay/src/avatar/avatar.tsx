'use client'

import type { AvatarProps } from '@novi-ui/core'
import { useState } from 'react'
import { avatarStyles } from './avatar.styles'

/**
 * 表示名からイニシャルを作る。
 *
 * 日本語の氏名は空白で区切られないことが多いので、
 * 空白があれば各語の先頭、なければ先頭1文字を使う。
 */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return [...(parts[0] as string)][0] ?? ''
  return parts
    .slice(0, 2)
    .map((part) => [...part][0] ?? '')
    .join('')
}

/**
 * 人や組織を表す画像。読み込みに失敗したら fallback を表示する。
 *
 * Flatlay では枠だけが丸くなる（Radio と並ぶ `radius-full` の例外）。
 * `badge` は枠の外に浮かず、**内側の下端**に収まる。
 *
 * @example
 * <Avatar src="/me.jpg" name="山本 太郎" />
 */
export function Avatar({
  size,
  radius,
  src,
  name,
  fallback,
  badge,
  className,
  classNames,
  id,
}: AvatarProps) {
  const s = avatarStyles({ size, radius })
  const [failed, setFailed] = useState(false)
  const showImage = src !== undefined && src !== '' && !failed

  return (
    <span id={id} data-slot="root" className={s.root({ class: [className, classNames?.root] })}>
      {showImage ? (
        <img
          data-slot="image"
          className={s.image({ class: classNames?.image })}
          src={src}
          alt={name ?? ''}
          onError={() => setFailed(true)}
        />
      ) : (
        // 画像の代わりなので role="img" を与える。
        // これがないと aria-label が効かず、読み上げが「山太」のような
        // イニシャルだけになって氏名が伝わらない
        <span
          data-slot="fallback"
          className={s.fallback({ class: classNames?.fallback })}
          role="img"
          aria-label={name}
        >
          {fallback ?? (name !== undefined ? initialsOf(name) : null)}
        </span>
      )}

      {/* 画像と同じ升に重ねる。最後に置くことで上に描かれる（z-index は使わない） */}
      {badge !== undefined && (
        <span data-slot="badge" className={s.badge({ class: classNames?.badge })}>
          {badge}
        </span>
      )}
    </span>
  )
}
