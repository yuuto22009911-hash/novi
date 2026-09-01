import {
  NOVI_COLORS,
  NOVI_GAP_TOKENS,
  NOVI_PAD_TOKENS,
  NOVI_RADII,
  NOVI_TRACKING_TOKENS,
} from '@novi-ui/core'
import { chromaOf, contrastRatio, parseOklch, relativeLuminance } from '@novi-ui/core/testing'
import { describe, expect, it } from 'vitest'
import {
  buildColorEntry,
  colorById,
  DEFAULT_COLOR_ID,
  inSrgbGamut,
  neutralsFor,
  surfaceFor,
  TACTILE_COLOR_SET,
  TACTILE_TONE,
  type TactileColorEntry,
} from './color-set'
import {
  MAX_SEMANTIC_CHROMA,
  MAX_SHADOW_ALPHA,
  MIN_RADIUS_PX,
  NEUTRAL_CHROMA_RANGE,
  NEUTRAL_COLOR_KEYS,
  SEMANTIC_COLOR_KEYS,
  TACTILE_CONTROL_HEIGHTS,
  TACTILE_DARK_COLORS,
  TACTILE_GAP,
  TACTILE_LEADING,
  TACTILE_LIGHT_COLORS,
  TACTILE_MOTION,
  TACTILE_PAD,
  TACTILE_RADII,
  TACTILE_SHADOWS,
  TACTILE_TEXT,
  TACTILE_TRACKING,
} from './tactile-tokens'

/**
 * Tactile のトークン検査（T-02）。**値を決める前にこれを書く。**
 *
 * Raster との決定的な違いは、コントラストを測る相手が「染まった地」であること。
 * Tactile は選んだ染料の hue に中立色まで従うため、色ごとに地が変わる。
 * 既定色だけ検査しても、他の7色で破綻していれば意味がない（AC-06-1〜3）。
 */

const SCHEMES = [
  ['light', TACTILE_LIGHT_COLORS],
  ['dark', TACTILE_DARK_COLORS],
] as const

type Scheme = 'light' | 'dark'

describe('コントラスト（WCAG 2.2 AA）— 既定色', () => {
  it.each(SCHEMES)('%s: 本文が背景に対して 4.5:1 以上（AC-06-1）', (_s, c) => {
    expect(contrastRatio(c.fg as string, c.bg as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 補助文字が背景・subtle 両方で 4.5:1 以上', (_s, c) => {
    expect(contrastRatio(c.muted as string, c.bg as string)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(c.muted as string, c.subtle as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 本文が浮く面（surface）でも 4.5:1 以上', (_s, c) => {
    expect(contrastRatio(c.fg as string, c.surface as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 機能上必要な境界線が 3:1 以上（AC-06-2）', (_s, c) => {
    expect(contrastRatio(c['border-strong'] as string, c.bg as string)).toBeGreaterThanOrEqual(3)
  })

  it.each(SCHEMES)('%s: 全 NOVI_COLORS の -fg が地色に対して 4.5:1 以上', (_s, c) => {
    const failures = NOVI_COLORS.map((name) => {
      const ratio = contrastRatio(c[`${name}-fg`] as string, c[name] as string)
      return ratio < 4.5 ? `${name}: ${ratio.toFixed(2)}:1` : null
    }).filter(Boolean)
    expect(failures).toEqual([])
  })

  it.each(SCHEMES)('%s: 意味を持つ色を文字色に使っても 4.5:1 以上', (_s, c) => {
    const failures = ['primary', 'secondary', 'success', 'warning', 'danger']
      .map((name) => {
        const worst = Math.min(
          contrastRatio(c[name] as string, c.bg as string),
          contrastRatio(c[name] as string, c.subtle as string),
        )
        return worst < 4.5 ? `${name}: ${worst.toFixed(2)}:1` : null
      })
      .filter(Boolean)
    expect(failures).toEqual([])
  })
})

describe('浮く面の階層（AC-06-3）', () => {
  // 「浮いている」を伝える手段はスキームで違う。light は影、dark は明度差。
  // 同じ検査を両方に当てると、light では白い面を白い地に置けなくなる
  it('dark: surface と bg の背景色差が 1.2:1 以上（影がほぼ見えないため）', () => {
    const failures = TACTILE_COLOR_SET.map((entry) => {
      const bg = neutralsFor(entry.hue, 'dark').bg as string
      const ratio = contrastRatio(surfaceFor(entry.hue, 'dark'), bg)
      return ratio < 1.2 ? `${entry.id}: ${ratio.toFixed(3)}:1` : null
    }).filter(Boolean)
    expect(failures).toEqual([])
  })

  it('light: 浮く層の影が実体を持つ（階層を影が担う側）', () => {
    for (const key of ['md', 'lg']) {
      expect(TACTILE_SHADOWS[key]).not.toBe('none')
    }
  })

  // 実機（iOS Safari）で outline の Input / TextArea の境界線が消えていた。
  // ring は box-shadow に合成されるため、影のトークンに `none` が混ざると
  // `box-shadow: <ring>, none` という不正値になり、宣言ごと破棄されて ring まで消える。
  // 影を持たせない意図は「透明な影」で表す（Tailwind の shadow-none と同じ形）。
  it('影のトークンは box-shadow に合成できる値（none を混ぜない）', () => {
    const invalid = Object.entries(TACTILE_SHADOWS)
      .filter(([, value]) => value.trim() === 'none')
      .map(([key]) => key)
    expect(invalid, 'none はリングと合成できない。0 0 #0000 を使う').toEqual([])
  })

  it('dark: bg < subtle < surface の順（持ち上がるほど明るい）', () => {
    for (const entry of TACTILE_COLOR_SET) {
      const n = neutralsFor(entry.hue, 'dark')
      const [bg, subtle, surface] = [
        relativeLuminance(n.bg as string),
        relativeLuminance(n.subtle as string),
        relativeLuminance(surfaceFor(entry.hue, 'dark')),
      ]
      expect(bg, `${entry.id}: bg < subtle`).toBeLessThan(subtle)
      expect(subtle, `${entry.id}: subtle < surface`).toBeLessThan(surface)
    }
  })
})

/** 1色 × 1スキームを全条件で検査する。失敗理由の一覧を返す（空なら合格）。 */
function checkScheme(entry: TactileColorEntry, scheme: Scheme): string[] {
  const failures: string[] = []
  const { primary, primaryFg } = entry[scheme]
  const neutrals = neutralsFor(entry.hue, scheme)
  const surface = surfaceFor(entry.hue, scheme)
  const tone = TACTILE_TONE[scheme]

  const parsed = parseOklch(primary)
  if (parsed === null) return [`${scheme}: OKLCH として解釈できない: ${primary}`]

  if (!inSrgbGamut(parsed.l, parsed.c, parsed.h)) {
    failures.push(`${scheme}: sRGB 域外 (${primary})`)
  }

  // 染まった地すべてに対して読めること。Tactile ではここが本質
  for (const [name, ground] of [
    ['bg', neutrals.bg as string],
    ['subtle', neutrals.subtle as string],
    ['surface', surface],
  ] as const) {
    const ratio = contrastRatio(primary, ground)
    if (ratio < 4.5) failures.push(`${scheme}: ${name} への文字 ${ratio.toFixed(2)}:1 < 4.5`)
  }

  const onFace = contrastRatio(primaryFg, primary)
  if (onFace < 4.5) failures.push(`${scheme}: 面上の文字 ${onFace.toFixed(2)}:1 < 4.5`)

  const expectedC = scheme === 'light' ? (entry.fixedC ?? tone.c) : (entry.fixedCDark ?? tone.c)
  if (Math.abs(parsed.l * 100 - tone.l) > 1e-9) {
    failures.push(`${scheme}: L がトーンとズレている (${parsed.l * 100} ≠ ${tone.l})`)
  }
  if (Math.abs(parsed.c - expectedC) > 1e-9) {
    failures.push(`${scheme}: C がトーンとズレている (${parsed.c} ≠ ${expectedC})`)
  }

  const chroma = chromaOf(primary)
  if (chroma <= 0 || chroma > MAX_SEMANTIC_CHROMA) {
    failures.push(`${scheme}: chroma ${chroma} が (0, ${MAX_SEMANTIC_CHROMA}] の外`)
  }

  return failures
}

const checkEntry = (entry: TactileColorEntry): string[] => [
  ...checkScheme(entry, 'light'),
  ...checkScheme(entry, 'dark'),
]

describe('カラーセット Textile Dyes — 8色 × 2スキーム', () => {
  it.each(TACTILE_COLOR_SET.map((entry) => [entry.id, entry] as const))(
    '%s: 色域・染まった地へのコントラスト・トーン一致が通る',
    (_id, entry) => {
      expect(checkEntry(entry)).toEqual([])
    },
  )

  it('相方が全員セット内にいて、自分自身ではない', () => {
    for (const entry of TACTILE_COLOR_SET) {
      expect(() => colorById(entry.pair)).not.toThrow()
      expect(entry.pair).not.toBe(entry.id)
    }
  })

  it('Raster と hue が1つも重ならない（モデルの性格を色の顔ぶれで示す）', () => {
    // 重なると「同じ色を別トーンで出しただけ」に見え、セットを分けた意味が消える
    const rasterHues = [268, 235, 160, 125, 70, 35, 12, 270]
    const overlap = TACTILE_COLOR_SET.filter((c) => rasterHues.includes(c.hue)).map((c) => c.id)
    expect(overlap).toEqual([])
  })

  it('変異: トーンを L54 に上げると通らなくなる（L50 が実用上限である根拠）', () => {
    // 承認時の掃引は `subtle` 面を含めておらず L54 を上限としていた。
    // 検査がこれを落とせなければ、トーンを 50 に下げた理由そのものが消える
    const failures = TACTILE_COLOR_SET.flatMap((def) =>
      checkEntry(buildColorEntry(def, { light: { l: 54, c: 0.08 }, dark: TACTILE_TONE.dark })),
    )
    expect(failures.length).toBeGreaterThan(0)
    expect(failures.join(' ')).toContain('subtle')
  })
})

describe('彩度の規律（ADR-T6）', () => {
  it.each(['light', 'dark'] as const)(
    '%s: 中立色の chroma が 0.004〜0.02 の帯域に収まる',
    (scheme) => {
      const outOfBand = TACTILE_COLOR_SET.flatMap((entry) => {
        const neutrals = neutralsFor(entry.hue, scheme)
        return NEUTRAL_COLOR_KEYS.filter((k) => {
          const c = chromaOf(neutrals[k] as string)
          return c < NEUTRAL_CHROMA_RANGE.min || c > NEUTRAL_CHROMA_RANGE.max
        }).map((k) => `${entry.id}.${k}: ${chromaOf(neutrals[k] as string)}`)
      })
      expect(outOfBand).toEqual([])
    },
  )

  it.each(['light', 'dark'] as const)('%s: 中立色の hue が選んだ染料に従う（FR-06）', (scheme) => {
    const wrong = TACTILE_COLOR_SET.flatMap((entry) => {
      const neutrals = neutralsFor(entry.hue, scheme)
      return NEUTRAL_COLOR_KEYS.filter(
        (k) => parseOklch(neutrals[k] as string)?.h !== entry.hue,
      ).map((k) => `${entry.id}.${k}`)
    })
    expect(wrong).toEqual([])
  })

  it.each(SCHEMES)('%s: 意味を持つ色は有彩で、上限を超えない', (_s, c) => {
    const invalid = SEMANTIC_COLOR_KEYS.filter((k) => {
      if (k.endsWith('-fg')) return false
      const chroma = chromaOf(c[k] as string)
      return chroma <= 0 || chroma > MAX_SEMANTIC_CHROMA
    })
    expect(invalid).toEqual([])
  })
})

describe('Tactile デザイン言語（数値定義）', () => {
  it(`角丸は none=0 で、他はすべて ${MIN_RADIUS_PX}px 以上（FR-09）`, () => {
    expect(TACTILE_RADII.none).toBe('0px')
    for (const key of ['sm', 'md', 'lg']) {
      expect(Number.parseFloat(TACTILE_RADII[key] as string)).toBeGreaterThanOrEqual(MIN_RADIUS_PX)
    }
  })

  it('角丸が sm→md→lg で単調増加する', () => {
    const steps = ['sm', 'md', 'lg'].map((k) => Number.parseFloat(TACTILE_RADII[k] as string))
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1] as number)
    }
  })

  it('radius が NOVI_RADII を網羅している', () => {
    expect(NOVI_RADII.filter((r) => !(r in TACTILE_RADII))).toEqual([])
  })

  it(`影の不透明度がすべて ${MAX_SHADOW_ALPHA} 以下（低不透明度に限る）`, () => {
    const tooStrong: string[] = []
    for (const [key, value] of Object.entries(TACTILE_SHADOWS)) {
      if (value === 'none') continue
      for (const m of value.matchAll(/\/\s*([\d.]+)\)/g)) {
        const alpha = Number(m[1])
        if (alpha > MAX_SHADOW_ALPHA) tooStrong.push(`${key}: ${alpha}`)
      }
    }
    expect(tooStrong).toEqual([])
  })

  it('影は none 以外がすべて実体を持ち、lg だけが上向き（下から来るシート用）', () => {
    // `none` そのものではなく透明な影。理由は下の「box-shadow に合成できる値」を参照
    expect(TACTILE_SHADOWS.none).toBe('0 0 #0000')
    for (const key of ['sm', 'md']) {
      expect(TACTILE_SHADOWS[key]).not.toBe('none')
      expect(TACTILE_SHADOWS[key]).not.toMatch(/\s-\d+px/)
    }
    expect(TACTILE_SHADOWS.lg).toMatch(/0 -\d+px/)
  })

  it('高さは 40/48/56px で、最小段でも 40px を下回らない', () => {
    expect(TACTILE_CONTROL_HEIGHTS).toEqual({ sm: 40, md: 48, lg: 56 })
    for (const h of Object.values(TACTILE_CONTROL_HEIGHTS)) {
      expect(h).toBeGreaterThanOrEqual(40)
    }
  })

  it('本文が 16px 以上（iOS Safari の自動ズームを避ける・AC-01-3）', () => {
    // 16px 未満の入力欄はフォーカス時にページごと拡大され、レイアウトが飛ぶ
    expect(Number.parseFloat(TACTILE_TEXT.base as string)).toBeGreaterThanOrEqual(16)
    expect(Number.parseFloat(TACTILE_TEXT.sm as string)).toBeGreaterThanOrEqual(15)
  })

  it('文字サイズが単調増加する', () => {
    const order = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl']
    const steps = order.map((k) => Number.parseFloat(TACTILE_TEXT[k] as string))
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1] as number)
    }
  })

  it('モーションが3段に分かれている（Raster は1段）', () => {
    const fast = Number.parseFloat(TACTILE_MOTION['duration-fast'] as string)
    const base = Number.parseFloat(TACTILE_MOTION['duration-base'] as string)
    const slow = Number.parseFloat(TACTILE_MOTION['duration-slow'] as string)
    expect(fast).toBeLessThan(base)
    expect(base).toBeLessThan(slow)
    // 下から出る面は移動距離が長い。120ms では瞬間移動に見える
    expect(slow).toBeGreaterThanOrEqual(240)
  })

  it('ease-emphasized がオーバーシュートしない（減速主体）', () => {
    const values = (TACTILE_MOTION['ease-emphasized'] as string)
      .replace(/cubic-bezier\(|\)/g, '')
      .split(',')
      .map(Number)
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })

  // 語彙は core が持ち、値は各テーマが持つ。網羅していないトークンがあると、
  // その CSS 変数だけ未定義のまま出力され、参照側は黙って初期値に落ちる
  it('pad が NOVI_PAD_TOKENS を網羅している', () => {
    expect(NOVI_PAD_TOKENS.filter((t) => !(t in TACTILE_PAD))).toEqual([])
  })

  it('gap が NOVI_GAP_TOKENS を網羅している', () => {
    expect(NOVI_GAP_TOKENS.filter((t) => !(t in TACTILE_GAP))).toEqual([])
  })

  it('tracking が NOVI_TRACKING_TOKENS を網羅している', () => {
    expect(NOVI_TRACKING_TOKENS.filter((t) => !(t in TACTILE_TRACKING))).toEqual([])
  })

  it('gap が inline < stack < section の順に広がる', () => {
    const steps = ['inline', 'stack', 'section'].map((k) =>
      Number.parseFloat(TACTILE_GAP[k] as string),
    )
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1] as number)
    }
  })

  it('section / stack の比が 1.5 以上（余白のコントラスト）', () => {
    // 「塊の内側」と「塊の外側」の距離が近いほど、絶対値をいくら増やしても詰まって見える。
    // 単調増加だけでは 20/21/22 のような無意味な段も通ってしまう
    const stack = Number.parseFloat(TACTILE_GAP.stack as string)
    const section = Number.parseFloat(TACTILE_GAP.section as string)
    expect(section / stack).toBeGreaterThanOrEqual(1.5)
  })

  it('本文の行送りが 1.7 以上（支配軸「面積」は行送りにも及ぶ）', () => {
    // 腕を伸ばした距離・手ブレのある状態で読む前提。行が近いと次の行を目で拾い直せない
    expect(Number.parseFloat(TACTILE_LEADING.body as string)).toBeGreaterThanOrEqual(1.7)
  })
})

describe('既定色（FR-05）', () => {
  it('テーマの primary / secondary が Indigo とその相方 Saffron である', () => {
    const indigo = colorById(DEFAULT_COLOR_ID)
    const pair = colorById(indigo.pair)
    expect(TACTILE_LIGHT_COLORS.primary).toBe(indigo.light.primary)
    expect(TACTILE_LIGHT_COLORS.secondary).toBe(pair.light.primary)
    expect(TACTILE_DARK_COLORS.primary).toBe(indigo.dark.primary)
  })

  it('中立色が既定色 Indigo の hue で染まっている', () => {
    const indigo = colorById(DEFAULT_COLOR_ID)
    expect(parseOklch(TACTILE_LIGHT_COLORS.bg as string)?.h).toBe(indigo.hue)
    expect(parseOklch(TACTILE_DARK_COLORS.fg as string)?.h).toBe(indigo.hue)
  })

  it('dark の地が light より暗い（スキームの向きが逆転していない）', () => {
    expect(relativeLuminance(TACTILE_DARK_COLORS.bg as string)).toBeLessThan(
      relativeLuminance(TACTILE_LIGHT_COLORS.bg as string),
    )
  })
})
