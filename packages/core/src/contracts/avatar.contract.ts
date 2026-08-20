import type { ReactNode } from 'react'
import type { NoviBaseProps } from '../props'
import type { ClassNames } from '../slots'
import type { NoviRadius, NoviSize } from '../tokens'

/** Avatar を構成する部位。`badge` はオンライン状態などを重ねるための場所。 */
export const avatarSlots = ['root', 'image', 'fallback', 'badge'] as const

export const avatarRequiredSlots = ['root'] as const

export type AvatarSlot = (typeof avatarSlots)[number]
export type AvatarRequiredSlot = (typeof avatarRequiredSlots)[number]

/**
 * 人や組織を表す画像。読み込みに失敗したら fallback を表示する。
 *
 * @keywords アバター プロフィール画像 顔写真 avatar
 *
 * @a11y 画像が読めないときの頭文字表示には `role="img"` と `aria-label`（`name`）を与える。
 * `name` を省略すると誰を指すのか伝わらない
 *
 * @example
 * <Avatar src="/me.jpg" name="小島 佑翔" />
 */
export interface AvatarProps extends NoviBaseProps {
  size?: NoviSize
  radius?: NoviRadius
  src?: string
  /** 画像の代替テキストと、fallback のイニシャル生成に使う */
  name?: string
  /** 画像がないときに表示する内容。未指定なら name のイニシャル */
  fallback?: ReactNode
  /** 右下に重ねる小さな印。オンライン状態などに使う */
  badge?: ReactNode
  classNames?: ClassNames<typeof avatarSlots>
}
