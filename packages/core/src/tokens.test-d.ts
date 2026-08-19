import { describe, expectTypeOf, it } from 'vitest'
import type { NoviColor, NoviRadius, NoviSize, NoviVariant, VariantMap } from './tokens'

describe('固定語彙', () => {
  it('variant は5つの値だけを取る', () => {
    expectTypeOf<NoviVariant>().toEqualTypeOf<'solid' | 'outline' | 'soft' | 'ghost' | 'plain'>()
  })

  it('size / color / radius が語彙どおりである', () => {
    expectTypeOf<NoviSize>().toEqualTypeOf<'sm' | 'md' | 'lg'>()
    expectTypeOf<NoviColor>().toEqualTypeOf<
      'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
    >()
    expectTypeOf<NoviRadius>().toEqualTypeOf<'none' | 'sm' | 'md' | 'lg' | 'full'>()
  })
})

describe('VariantMap', () => {
  type Style = { root: string }

  it('全語彙を実装したものは代入できる', () => {
    const full: VariantMap<NoviVariant, Style> = {
      solid: { root: 'a' },
      outline: { root: 'b' },
      soft: { root: 'c' },
      ghost: { root: 'd' },
      plain: { root: 'e' },
    }
    expectTypeOf(full).toEqualTypeOf<VariantMap<NoviVariant, Style>>()
  })

  it('語彙の実装漏れはコンパイルエラーになる（AC-07-1）', () => {
    // @ts-expect-error soft が欠けている
    const missing: VariantMap<NoviVariant, Style> = {
      solid: { root: 'a' },
      outline: { root: 'b' },
      ghost: { root: 'd' },
      plain: { root: 'e' },
    }
    expectTypeOf(missing).not.toBeNever()
  })

  it('語彙外の追加はコンパイルエラーになる（AC-07-2）', () => {
    const extra: VariantMap<NoviVariant, Style> = {
      solid: { root: 'a' },
      outline: { root: 'b' },
      soft: { root: 'c' },
      ghost: { root: 'd' },
      plain: { root: 'e' },
      // @ts-expect-error elevated は語彙にない
      elevated: { root: 'f' },
    }
    expectTypeOf(extra).not.toBeNever()
  })
})
