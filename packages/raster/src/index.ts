'use client'

/**
 * Raster テーマの公開エントリ。
 *
 * `'use client'` は**このファイルに必要**。バンドラは import 先のファイルに書かれた
 * ディレクティブを成果物へ引き上げないため、エントリ自身に置かないと消える。
 * 消えると Next.js の RSC から使ったときに分かりにくいビルドエラーになる。
 * CI（`scripts/check-dist-rules.mjs`）がこれを検査している。
 */

export { Button, type ButtonStyleProps, buttonStyles } from './button'
