import type { ModalOverlayProps, PopoverProps, TooltipProps } from 'react-aria-components'
import { describe, expectTypeOf, it } from 'vitest'
import type { INFLOW_PORTAL_PROP, InflowPortalProps } from './portal'

/**
 * 上流の改名検知（FR-09）。
 *
 * `UNSTABLE_portalContainer` が改名・削除されると、`Props[PortalKey]` の索引が
 * 型エラーになってここが落ちる。**ランタイムでは検知できない**のが理由で、
 * 存在しない prop を渡しても React は黙って無視し、overlay は body へポータルされ、
 * 「開いたら押し下げる」が静かに「浮く」に戻る。見た目の差は小さく、気づけない。
 */

type PortalKey = typeof INFLOW_PORTAL_PROP

describe('INFLOW_PORTAL_PROP', () => {
  it('Popover が受け取れる', () => {
    expectTypeOf<PopoverProps[PortalKey]>().toEqualTypeOf<Element | undefined>()
  })

  it('Tooltip が受け取れる', () => {
    expectTypeOf<TooltipProps[PortalKey]>().toEqualTypeOf<Element | undefined>()
  })

  it('ModalOverlay が受け取れる', () => {
    expectTypeOf<ModalOverlayProps[PortalKey]>().toEqualTypeOf<Element | undefined>()
  })

  it('InflowPortalProps を spread すると overlay の props として通る', () => {
    expectTypeOf<InflowPortalProps>().toExtend<Partial<PopoverProps>>()
  })
})
