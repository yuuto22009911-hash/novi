'use client'

/**
 * Tactile テーマの公開エントリ。
 *
 * `'use client'` は**このファイルに必要**。バンドラは import 先のファイルに書かれた
 * ディレクティブを成果物へ引き上げないため、エントリ自身に置かないと消える（ADR-R6）。
 * CI（`scripts/check-dist-rules.mjs`）がこれを検査している。
 */

export { Button } from './button/button'
export { type ButtonStyleProps, buttonStyles } from './button/button.styles'
