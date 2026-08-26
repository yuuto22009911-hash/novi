import { describe, expect, it } from 'vitest'
import { INFLOW_PORTAL_PROP, inflowPortalProps } from './portal'

describe('inflowPortalProps', () => {
  it('要素を渡すと上流の prop 名で包む', () => {
    const el = document.createElement('div')
    expect(inflowPortalProps(el)).toEqual({ [INFLOW_PORTAL_PROP]: el })
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
  ])('%s なら空を返す（上流の既定に委ねる）', (_name, value) => {
    // 空オブジェクトであることが要点。`{ [PROP]: undefined }` を返すと
    // spread 先で明示的な undefined になり、上流の既定値の解決を妨げる
    expect(Object.keys(inflowPortalProps(value))).toEqual([])
  })
})
