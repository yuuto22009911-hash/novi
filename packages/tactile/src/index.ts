'use client'

/**
 * Tactile テーマの公開エントリ。
 *
 * `'use client'` は**このファイルに必要**。バンドラは import 先のファイルに書かれた
 * ディレクティブを成果物へ引き上げないため、エントリ自身に置かないと消える（ADR-R6）。
 * CI（`scripts/check-dist-rules.mjs`）がこれを検査している。
 *
 * コンポーネントは Phase 2 以降で追加する。
 */

export {}
