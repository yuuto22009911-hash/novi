/**
 * トップの Modal 見本（modal-triptych.tsx）が使う slot クラスを、ビルド時に書き出す。
 *
 * 見本をクライアントコンポーネントにしてテーマの `modalStyles()` を実行すると、
 * ファーストビューのために3テーマ分の JS を hydration することになり、
 * TBT が 100ms 以上悪化した。クラス文字列は静的なので、Node で一度計算して
 * JSON に落とし、見本はサーバーコンポーネントとして素の HTML で出す。
 *
 * ここで書き出すのは**本物の theme パッケージが返す値そのもの**。
 * 見本と本物のずれは e2e（modal-stage.spec.ts）が slot の並びで検査する。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as flatlay from '@novi-ui/flatlay'
import * as raster from '@novi-ui/raster'
import * as tactile from '@novi-ui/tactile'

const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../.generated/modal-stage-classes.json',
)

const MODAL_SLOTS = ['backdrop', 'panel', 'header', 'title', 'closeButton', 'body', 'footer']

function classesOf(theme) {
  const modal = theme.modalStyles()
  const button = theme.buttonStyles({ color: 'primary' })
  return {
    modal: Object.fromEntries(
      MODAL_SLOTS.filter((slot) => typeof modal[slot] === 'function').map((slot) => [
        slot,
        modal[slot](),
      ]),
    ),
    button: { root: button.root(), label: button.label() },
  }
}

const data = { raster: classesOf(raster), tactile: classesOf(tactile), flatlay: classesOf(flatlay) }

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`)
console.log(`✓ modal-stage-classes.json を生成（${Object.keys(data).join(' / ')}）`)
