'use client'

/**
 * Flatlay テーマの公開エントリ。
 *
 * `'use client'` は**このファイルに必要**。バンドラは import 先のファイルに書かれた
 * ディレクティブを成果物へ引き上げないため、エントリ自身に置かないと消える（ADR-R6）。
 * CI（`scripts/check-dist-rules.mjs`）がこれを検査している。
 *
 * 契約は Phase 2 以降で 1 コンポーネント = 1 PR で足していく（specs/07-theme-flatlay/tasks.md）。
 */

export { Button, type ButtonStyleProps, buttonStyles } from './button'
