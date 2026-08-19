import { describe, expectTypeOf, it } from 'vitest'
import type { ClassNames, SlotMap } from './slots'

// architecture.md §6 の Modal の slot 語彙を検証用に使う
const modalSlots = [
  'backdrop',
  'panel',
  'header',
  'title',
  'closeButton',
  'body',
  'footer',
] as const
const modalRequiredSlots = ['backdrop', 'panel', 'body'] as const

type ModalSlotMap = SlotMap<typeof modalSlots, (typeof modalRequiredSlots)[number]>

describe('SlotMap', () => {
  it('必須 slot をすべて書けば通る', () => {
    const ok: ModalSlotMap = {
      backdrop: 'fixed inset-0',
      panel: 'bg-[--novi-color-bg]',
      body: 'px-6 py-4',
    }
    expectTypeOf(ok).toEqualTypeOf<ModalSlotMap>()
  })

  it('任意 slot は省略できる（AC-01-2）', () => {
    const withoutHeader: ModalSlotMap = {
      backdrop: 'fixed inset-0',
      panel: 'bg-[--novi-color-bg]',
      body: 'px-6 py-4',
      footer: 'flex justify-end',
    }
    expectTypeOf(withoutHeader).toEqualTypeOf<ModalSlotMap>()
  })

  it('必須 slot の省略はコンパイルエラーになる（AC-01-1）', () => {
    // @ts-expect-error panel は必須
    const missingPanel: ModalSlotMap = {
      backdrop: 'fixed inset-0',
      body: 'px-6 py-4',
    }
    expectTypeOf(missingPanel).not.toBeNever()
  })

  it('語彙外のキーはコンパイルエラーになる（AC-01-3）', () => {
    const unknownSlot: ModalSlotMap = {
      backdrop: 'fixed inset-0',
      panel: 'bg-[--novi-color-bg]',
      body: 'px-6 py-4',
      // @ts-expect-error wrapper は Modal の slot 語彙にない
      wrapper: 'grid',
    }
    expectTypeOf(unknownSlot).not.toBeNever()
  })
})

describe('ClassNames', () => {
  it('全 slot が任意になる', () => {
    const only: ClassNames<typeof modalSlots> = { panel: 'max-w-2xl' }
    expectTypeOf(only).toEqualTypeOf<ClassNames<typeof modalSlots>>()

    const empty: ClassNames<typeof modalSlots> = {}
    expectTypeOf(empty).toEqualTypeOf<ClassNames<typeof modalSlots>>()
  })

  it('語彙外のキーはコンパイルエラーになる', () => {
    const bad: ClassNames<typeof modalSlots> = {
      // @ts-expect-error wrapper は語彙にない
      wrapper: 'grid',
    }
    expectTypeOf(bad).not.toBeNever()
  })
})
