import { NOVI_COLORS, NOVI_RADII } from '@novi-ui/core'
import { chromaOf, contrastRatio, parseOklch, relativeLuminance } from '@novi-ui/core/testing'
import { describe, expect, it } from 'vitest'
import {
  buildColorEntry,
  colorById,
  DEFAULT_COLOR_ID,
  FLATLAY_COLOR_SET,
  FLATLAY_TONE,
  type FlatlayColorEntry,
  inSrgbGamut,
  neutralsFor,
} from './color-set'
import {
  ACHROMATIC_NEUTRAL_KEYS,
  BORDER_CHROMA_RANGE,
  FLATLAY_CONTROL_HEIGHTS,
  FLATLAY_DARK_COLORS,
  FLATLAY_FONTS,
  FLATLAY_LIGHT_COLORS,
  FLATLAY_MOTION,
  FLATLAY_RADII,
  FLATLAY_SHADOWS,
  FLATLAY_TEXT,
  MAX_RADIUS_PX,
  MAX_SEMANTIC_CHROMA,
  SEMANTIC_COLOR_KEYS,
  TINTED_BORDER_KEYS,
} from './flatlay-tokens'

/**
 * Flatlay のトークン検査（T-02）。**値を決める前にこれを書く。**
 *
 * 両テーマとの決定的な違いは2点。
 * 1. **影が階層を作らない**ので、検査は「影が全段透明であること」を要求する側に回る
 * 2. **地は染まらず罫線だけが染まる**（FR-07）。中立色は chroma 0 のまま、
 *    `border` / `border-strong` だけが選択色の hue を C 0.02〜0.03 で帯びる
 *
 * さらに ADR-F3（押下は反転）のため、**面と文字を入れ替えた組み合わせ**も
 * コントラスト検査の対象になる。反転が起きる瞬間だけ読めなくなる事故を防ぐ。
 */

const SCHEMES = [
  ['light', FLATLAY_LIGHT_COLORS],
  ['dark', FLATLAY_DARK_COLORS],
] as const

type Scheme = 'light' | 'dark'

describe('コントラスト（WCAG 2.2 AA）— 既定色', () => {
  it.each(SCHEMES)('%s: 本文が背景・subtle 両方で 4.5:1 以上', (_s, c) => {
    expect(contrastRatio(c.fg as string, c.bg as string)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(c.fg as string, c.subtle as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 補助文字が背景・subtle 両方で 4.5:1 以上', (_s, c) => {
    expect(contrastRatio(c.muted as string, c.bg as string)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(c.muted as string, c.subtle as string)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(SCHEMES)('%s: 機能上必要な罫線が 3:1 以上（AC-06-3）', (_s, c) => {
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

describe('反転押下のコントラスト（ADR-F3）', () => {
  // 押下時に面と文字が入れ替わる。solid は「primary の面に primary-fg の文字」から
  // 「primary-fg の面に primary の文字」へ、outline / ghost は「地に primary の文字」から
  // 「primary の面に primary-fg の文字」へ変わる。
  // 通常時だけを検査していると、押している 100ms だけ読めない配色を見逃す
  it.each(SCHEMES)('%s: 面と文字を入れ替えても 4.5:1 以上（solid の反転）', (_s, c) => {
    const failures = NOVI_COLORS.map((name) => {
      const inverted = contrastRatio(c[name] as string, c[`${name}-fg`] as string)
      return inverted < 4.5 ? `${name}: ${inverted.toFixed(2)}:1` : null
    }).filter(Boolean)
    expect(failures).toEqual([])
  })

  it.each(SCHEMES)('%s: outline / ghost が押下で塗りに変わっても読める', (_s, c) => {
    // 押下前は地の上の文字、押下後は色面の上の -fg。両方が基準を満たす必要がある。
    // `default` を外すのは、これが面の色（subtle 相当）であって文字色ではないため。
    // outline/ghost の color="default" は文字に default-fg を使う
    const failures = NOVI_COLORS.filter((n) => n !== 'default').flatMap((name) => {
      const before = contrastRatio(c[name] as string, c.bg as string)
      const after = contrastRatio(c[`${name}-fg`] as string, c[name] as string)
      return [
        before < 4.5 ? `${name} 押下前: ${before.toFixed(2)}:1` : null,
        after < 4.5 ? `${name} 押下後: ${after.toFixed(2)}:1` : null,
      ].filter(Boolean)
    })
    expect(failures).toEqual([])
  })

  it.each(SCHEMES)('%s: 反転は対称なので、どちらの向きでも同じ比になる', (_s, c) => {
    // 対称性が崩れていたらコントラスト計算そのものが壊れている
    for (const name of NOVI_COLORS) {
      const a = contrastRatio(c[name] as string, c[`${name}-fg`] as string)
      const b = contrastRatio(c[`${name}-fg`] as string, c[name] as string)
      expect(a).toBeCloseTo(b, 10)
    }
  })
})

/** 1色 × 1スキームを全条件で検査する。失敗理由の一覧を返す（空なら合格）。 */
function checkScheme(entry: FlatlayColorEntry, scheme: Scheme): string[] {
  const failures: string[] = []
  const { primary, primaryFg } = entry[scheme]
  const neutrals = neutralsFor(entry.hue, scheme)
  const tone = FLATLAY_TONE[scheme]

  const parsed = parseOklch(primary)
  if (parsed === null) return [`${scheme}: OKLCH として解釈できない: ${primary}`]

  if (!inSrgbGamut(parsed.l, parsed.c, parsed.h)) {
    failures.push(`${scheme}: sRGB 域外 (${primary})`)
  }

  // 地は染まらないので相手は全色共通。それでも8色ぶん回すのは、
  // トーンを動かしたときにどの色から落ちるかを失敗メッセージで見せるため
  for (const name of ['bg', 'subtle'] as const) {
    const ratio = contrastRatio(primary, neutrals[name] as string)
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

  return failures
}

const checkEntry = (entry: FlatlayColorEntry): string[] => [
  ...checkScheme(entry, 'light'),
  ...checkScheme(entry, 'dark'),
]

describe('カラーセット Stationery — 8色 × 2スキーム（48判定・AC-06-3）', () => {
  it.each(FLATLAY_COLOR_SET.map((entry) => [entry.id, entry] as const))(
    '%s: 色域・地へのコントラスト・トーン一致が通る',
    (_id, entry) => {
      expect(checkEntry(entry)).toEqual([])
    },
  )

  it.each(FLATLAY_COLOR_SET.map((entry) => [entry.id, entry] as const))(
    '%s: border-strong が light / dark 両方で 3:1 以上',
    (_id, entry) => {
      const failures = (['light', 'dark'] as const)
        .map((scheme) => {
          const n = neutralsFor(entry.hue, scheme)
          const ratio = contrastRatio(n['border-strong'] as string, n.bg as string)
          return ratio < 3 ? `${scheme}: ${ratio.toFixed(2)}:1` : null
        })
        .filter(Boolean)
      expect(failures).toEqual([])
    },
  )

  it('相方が全員セット内にいて、自分自身ではない（ダブルエントリー）', () => {
    for (const entry of FLATLAY_COLOR_SET) {
      expect(() => colorById(entry.pair)).not.toThrow()
      expect(entry.pair).not.toBe(entry.id)
    }
  })

  it('Raster / Tactile と hue が1つも重ならない', () => {
    const taken = [268, 235, 160, 125, 70, 35, 12, 270, 255, 200, 148, 78, 28, 5, 315, 80]
    const overlap = FLATLAY_COLOR_SET.filter((c) => taken.includes(c.hue)).map((c) => c.id)
    expect(overlap).toEqual([])
  })

  it('赤帯（danger の hue ± 15）に primary を持たない（赤は意味色への予約）', () => {
    // Redline を入れなかった判断そのものを検査に残す。世界観の説明と実装がズレると、
    // あとから「1色足すだけ」で danger と紛れる primary が入り込む
    const near = FLATLAY_COLOR_SET.filter((c) => Math.abs(c.hue - 27) <= 15).map((c) => c.id)
    expect(near).toEqual([])
  })

  it('既定色が Fieldbook（3代連続の藍を避けた判断・デザイン診断 B-2）', () => {
    expect(DEFAULT_COLOR_ID).toBe('fieldbook')
    // 藍帯（230〜275）を既定にしていないこと。Pencil は無彩枠なので既定になりえない
    expect(colorById(DEFAULT_COLOR_ID).hue).toBeLessThan(230)
  })

  it('変異: トーンを L53 に上げると subtle で落ちる（この検査が効いている証拠）', () => {
    // 掃引の実測値は L52 で 4.65:1、L53 で 4.46:1。つまり実用上限は L52。
    // 採用した L47 は 5.76:1 で、丸めや将来の微調整に 1.2 ぶんの余裕を残している。
    // 上限ぎりぎりを採らないのは、後から subtle の明度を動かせなくなるため
    const failures = FLATLAY_COLOR_SET.flatMap((def) =>
      checkEntry(buildColorEntry(def, { light: { l: 53, c: 0.07 }, dark: FLATLAY_TONE.dark })),
    )
    expect(failures.length).toBeGreaterThan(0)
    expect(failures.join(' ')).toContain('subtle')
  })
})

describe('地は染まらず罫線だけが染まる（FR-07 / AC-06-2）', () => {
  it.each(['light', 'dark'] as const)('%s: 中立の地・文字は chroma 0 のまま', (scheme) => {
    const tinted = FLATLAY_COLOR_SET.flatMap((entry) => {
      const neutrals = neutralsFor(entry.hue, scheme)
      return ACHROMATIC_NEUTRAL_KEYS.filter((k) => chromaOf(neutrals[k] as string) !== 0).map(
        (k) => `${entry.id}.${k}: ${chromaOf(neutrals[k] as string)}`,
      )
    })
    expect(tinted, '紙は染まらない。染まってよいのは罫線だけ').toEqual([])
  })

  it.each(['light', 'dark'] as const)(
    '%s: 罫線が選択色の hue を C 0.02〜0.03 で帯びる',
    (scheme) => {
      const wrong = FLATLAY_COLOR_SET.flatMap((entry) => {
        const neutrals = neutralsFor(entry.hue, scheme)
        return TINTED_BORDER_KEYS.flatMap((k) => {
          const value = neutrals[k] as string
          const c = chromaOf(value)
          const problems: string[] = []
          if (c < BORDER_CHROMA_RANGE.min || c > BORDER_CHROMA_RANGE.max) {
            problems.push(`${entry.id}.${k}: C ${c} が帯域外`)
          }
          if (parseOklch(value)?.h !== entry.hue) {
            problems.push(`${entry.id}.${k}: hue が選択色に従っていない`)
          }
          return problems
        })
      })
      expect(wrong).toEqual([])
    },
  )

  it('overlay が暗幕ではなく紙色（ADR-F2）', () => {
    // テイクオーバーは「背後に何かがある」ことを示す暗転ではなく、新しい紙への差し替え。
    // alpha を持たせた瞬間に z 軸の語彙が戻ってくる
    for (const scheme of ['light', 'dark'] as const) {
      for (const entry of FLATLAY_COLOR_SET) {
        const n = neutralsFor(entry.hue, scheme)
        expect(n.overlay, `${entry.id}/${scheme}`).toBe(n.bg)
        expect(n.overlay).not.toContain('/')
      }
    }
  })

  it('surface が地と同じ紙（浮く面が存在しない）', () => {
    for (const scheme of ['light', 'dark'] as const) {
      const n = neutralsFor(172, scheme)
      expect(n.surface).toBe(n.bg)
    }
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

describe('Flatlay デザイン言語（数値定義）', () => {
  it('影がすべて透明（z 軸を持たないので影は嘘・FR-04）', () => {
    for (const [key, value] of Object.entries(FLATLAY_SHADOWS)) {
      expect(value, `shadow-${key}`).toBe('0 0 #0000')
    }
  })

  it('影のトークンに none を混ぜない（リング合成の教訓）', () => {
    // `box-shadow: <ring>, none` は不正値で、宣言ごと破棄されてリングまで消える。
    // Flatlay は全段が「影なし」なので、うっかり none と書きたくなる場所が全段にある
    const invalid = Object.entries(FLATLAY_SHADOWS)
      .filter(([, v]) => v.trim() === 'none')
      .map(([k]) => k)
    expect(invalid).toEqual([])
  })

  it(`角丸が書類の直角（none=0 / sm=md=2 / lg=4、full 以外は ${MAX_RADIUS_PX}px 以下）`, () => {
    expect(FLATLAY_RADII).toMatchObject({ none: '0px', sm: '2px', md: '2px', lg: '4px' })
    for (const key of ['none', 'sm', 'md', 'lg']) {
      expect(Number.parseFloat(FLATLAY_RADII[key] as string), `radius-${key}`).toBeLessThanOrEqual(
        MAX_RADIUS_PX,
      )
    }
  })

  it('角丸が両テーマのどの段とも一致しない（丸みが第3の識別子）', () => {
    const raster = ['6px', '8px', '12px']
    const tactile = ['8px', '14px', '20px']
    const mine = ['sm', 'md', 'lg'].map((k) => FLATLAY_RADII[k] as string)
    expect(mine.filter((v) => raster.includes(v) || tactile.includes(v))).toEqual([])
  })

  it('radius が NOVI_RADII を網羅している', () => {
    expect(NOVI_RADII.filter((r) => !(r in FLATLAY_RADII))).toEqual([])
  })

  it('高さは 28/32/40px（帳票の行。タッチ下限は Tactile の領分）', () => {
    expect(FLATLAY_CONTROL_HEIGHTS).toEqual({ sm: 28, md: 32, lg: 40 })
  })

  it('本文が 16px 以上（iOS Safari の自動ズームを避ける）', () => {
    expect(Number.parseFloat(FLATLAY_TEXT.base as string)).toBeGreaterThanOrEqual(16)
  })

  it('文字サイズが単調増加する', () => {
    const order = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl']
    const steps = order.map((k) => Number.parseFloat(FLATLAY_TEXT[k] as string))
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1] as number)
    }
  })

  it('モーションが1本（3段の duration がすべて同じ値・FR-12）', () => {
    const values = ['duration-fast', 'duration-base', 'duration-slow'].map(
      (k) => FLATLAY_MOTION[k] as string,
    )
    expect(new Set(values).size, `3段に分かれている: ${values.join(' / ')}`).toBe(1)
    expect(Number.parseFloat(values[0] as string)).toBeLessThanOrEqual(100)
  })

  it('イージングも1本（緩急で階層を語らない）', () => {
    expect(FLATLAY_MOTION['ease-emphasized']).toBe(FLATLAY_MOTION['ease-standard'])
  })

  it('mono が実体のあるスタックで、sans と別物である（G6 / ADR-F7）', () => {
    // 数値・ショートカット・ラベルがこれを消費する。core の既定
    // （`ui-monospace, monospace`）のままではフォールバックが痩せすぎる
    expect(FLATLAY_FONTS.mono).not.toBe(FLATLAY_FONTS.sans)
    expect((FLATLAY_FONTS.mono as string).split(',').length).toBeGreaterThanOrEqual(4)
    expect(FLATLAY_FONTS.mono).toContain('ui-monospace')
  })
})

describe('既定色（FR-08）', () => {
  it('テーマの primary / secondary が Fieldbook とその相方 Eraser である', () => {
    const fieldbook = colorById(DEFAULT_COLOR_ID)
    const pair = colorById(fieldbook.pair)
    expect(pair.id).toBe('eraser')
    expect(FLATLAY_LIGHT_COLORS.primary).toBe(fieldbook.light.primary)
    expect(FLATLAY_LIGHT_COLORS.secondary).toBe(pair.light.primary)
    expect(FLATLAY_DARK_COLORS.primary).toBe(fieldbook.dark.primary)
  })

  it('既定の罫線が Fieldbook の hue で染まっている', () => {
    const fieldbook = colorById(DEFAULT_COLOR_ID)
    expect(parseOklch(FLATLAY_LIGHT_COLORS.border as string)?.h).toBe(fieldbook.hue)
    expect(parseOklch(FLATLAY_DARK_COLORS['border-strong'] as string)?.h).toBe(fieldbook.hue)
  })

  it('既定の地は染まっていない（chroma 0）', () => {
    for (const colors of [FLATLAY_LIGHT_COLORS, FLATLAY_DARK_COLORS]) {
      expect(chromaOf(colors.bg as string)).toBe(0)
      expect(chromaOf(colors.fg as string)).toBe(0)
    }
  })

  it('dark の地が light より暗い（スキームの向きが逆転していない）', () => {
    expect(relativeLuminance(FLATLAY_DARK_COLORS.bg as string)).toBeLessThan(
      relativeLuminance(FLATLAY_LIGHT_COLORS.bg as string),
    )
  })
})
