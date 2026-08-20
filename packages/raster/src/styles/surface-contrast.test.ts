import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * **背景を設定する面は、文字色も設定しなければならない。**
 *
 * 設定しないと、その面の中の文字はページから色を継承する。
 * ライトのページにダークの面を置いた瞬間、文字が読めなくなる。
 *
 * 実際に 2026-08-20、Card がこれを満たしておらず
 * ダークでコントラスト比 1.07（ほぼ不可視）になっていた。
 * jsdom では検出できず、実ブラウザの axe で初めて分かった。
 */

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')

/** 文字を含まない装飾部品。背景だけを持つのが正しい。 */
const DECORATIVE_SLOTS = new Set([
  'control',
  'track',
  'thumb',
  'indicator',
  'dot',
  'circle',
  'arrow',
  'separator',
  'image',
])

function styleFiles(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...styleFiles(full))
    else if (entry.endsWith('.styles.ts')) found.push(full)
  }
  return found
}

/**
 * 文字をまったく持たないコンポーネント。
 * Skeleton は aria-hidden の場所取りで、子要素も文言も持たない。
 */
const TEXTLESS_FILES = new Set(['skeleton.styles.ts'])

const SURFACE_BG =
  /bg-\[var\(--novi-color-(bg|subtle|default|primary|secondary|success|warning|danger)/
const HAS_FG = /text-\[var\(--(novi-color-|c)/

interface Offender {
  file: string
  slot: string
}

function findOffenders(): Offender[] {
  const offenders: Offender[] = []

  for (const file of styleFiles(SRC)) {
    const source = readFileSync(file, 'utf8')
    const name = file.split('/').pop() ?? ''
    if (TEXTLESS_FILES.has(name)) continue

    for (const match of source.matchAll(/^ {2}(\w+): (\[[\s\S]*?\]\.join\(' '\)|'[^']*'),?$/gm)) {
      const [, slot, body] = match
      if (slot === undefined || body === undefined) continue
      if (DECORATIVE_SLOTS.has(slot)) continue
      if (!SURFACE_BG.test(body)) continue
      if (HAS_FG.test(body)) continue
      offenders.push({ file: name, slot })
    }
  }

  return offenders
}

describe('面と文字色の対応', () => {
  it('背景を設定する slot は文字色も設定している', () => {
    const offenders = findOffenders().map((o) => `${o.file} → ${o.slot}`)
    expect(
      offenders,
      `背景だけを設定している面があります。ページの文字色を継承するため、\n` +
        `ライト/ダークのどちらかで文字が読めなくなります:\n  ${offenders.join('\n  ')}`,
    ).toEqual([])
  })
})
