/**
 * 色の検証ユーティリティ。
 *
 * コントラストを目分量で決めると必ず基準を割る。
 * テーマは**値を決める前にこれで検査する**こと。
 *
 * slot 契約テストと同じく「テーマが基準を満たしているか検査する道具」なので、
 * core の testing エントリが持つ。ランタイムには含まれない。
 */

export interface Oklch {
  /** 明度 0〜1 */
  l: number
  /** 彩度 */
  c: number
  /** 色相（度） */
  h: number
  /** 不透明度 0〜1 */
  alpha: number
}

const OKLCH_PATTERN = /^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/

/**
 * `oklch(52% 0.18 250)` 形式の文字列を解釈する。
 *
 * @example
 * parseOklch('oklch(52% 0.18 250)') // { l: 0.52, c: 0.18, h: 250, alpha: 1 }
 */
export function parseOklch(value: string): Oklch | null {
  const m = OKLCH_PATTERN.exec(value)
  if (!m) return null
  return {
    l: Number(m[1]) / 100,
    c: Number(m[2]),
    h: Number(m[3]),
    alpha: m[4] === undefined ? 1 : Number(m[4]),
  }
}

/** OKLCH を線形 sRGB に変換する。 */
function toLinearSrgb({ l: L, c, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180
  const a = c * Math.cos(rad)
  const b = c * Math.sin(rad)

  const lc = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mc = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const sc = (L - 0.0894841775 * a - 1.291485548 * b) ** 3

  return [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ]
}

/**
 * WCAG の相対輝度を求める。
 *
 * @example
 * relativeLuminance('oklch(99% 0 0)') // ≒ 0.97
 */
export function relativeLuminance(value: string): number {
  const parsed = parseOklch(value)
  if (parsed === null) throw new Error(`OKLCH として解釈できません: ${value}`)
  const [r, g, b] = toLinearSrgb(parsed)
  const clamp = (x: number) => Math.min(1, Math.max(0, x))
  return 0.2126 * clamp(r) + 0.7152 * clamp(g) + 0.0722 * clamp(b)
}

/**
 * 2色のコントラスト比を求める。
 *
 * 本文は 4.5:1 以上（WCAG 1.4.3）、
 * 機能上必要な非テキスト要素は 3:1 以上（WCAG 1.4.11）が必要。
 *
 * @example
 * contrastRatio('oklch(20% 0 0)', 'oklch(99% 0 0)') // ≒ 15.2
 */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * 彩度を取り出す。中立色が本当に無彩色かを検査するのに使う。
 *
 * @example
 * chromaOf('oklch(48% 0 0)') // 0
 */
export function chromaOf(value: string): number {
  const parsed = parseOklch(value)
  if (parsed === null) throw new Error(`OKLCH として解釈できません: ${value}`)
  return parsed.c
}
