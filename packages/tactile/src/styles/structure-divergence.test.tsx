import * as raster from '@novi-ui/raster'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, expectTypeOf, it } from 'vitest'
import * as tactile from '../index'

/**
 * 着手条件の検証（T-12 / T-17・**本 Spec の存在理由**）。
 *
 * architecture.md §12 は最大のリスクを「テーマ差が結局『色と角丸』に収束する」とし、
 * 2本目の着手条件を **Modal・Select・Tabs の3つで DOM 構造が実際に違うこと**と定めた。
 * ここはそれを機械的に固定する。**Raster を実際に import して突き合わせる**ため、
 * 片方を複製で済ませた瞬間に落ちる。
 *
 * 逆に、公開 API（props の型）は完全に同一でなければならない。
 * 構造が違っても同じコードが動くことが slot 契約の約束そのもの（AC-02-4）。
 */

/** その要素が指定 slot の子孫か。 */
function isDescendantOfSlot(el: Element | null, slot: string): boolean {
  let node = el?.parentElement ?? null
  while (node !== null) {
    if (node.getAttribute('data-slot') === slot) return true
    node = node.parentElement
  }
  return false
}

describe('Modal: closeButton の位置が違う（AC-02-1）', () => {
  // Raster は「ヘッダー右上の ✕」、Tactile は「フッターのフルワイドボタン」。
  // slot 名は同じで、DOM 上の所属だけが違う
  it('Raster では header の子孫にある', () => {
    render(
      <raster.Modal isOpen>
        <raster.ModalTitle>削除しますか</raster.ModalTitle>
        <raster.ModalBody>この操作は取り消せません。</raster.ModalBody>
      </raster.Modal>,
    )
    const close = document.querySelector('[data-slot="closeButton"]')
    expect(close, 'Raster に closeButton が無い').not.toBeNull()
    expect(isDescendantOfSlot(close, 'header')).toBe(true)
    expect(isDescendantOfSlot(close, 'footer')).toBe(false)
  })

  it('Tactile では footer の子孫にある', () => {
    render(
      <tactile.Modal isOpen>
        <tactile.ModalTitle>削除しますか</tactile.ModalTitle>
        <tactile.ModalBody>この操作は取り消せません。</tactile.ModalBody>
      </tactile.Modal>,
    )
    const close = document.querySelector('[data-slot="closeButton"]')
    expect(close, 'Tactile に closeButton が無い').not.toBeNull()
    expect(isDescendantOfSlot(close, 'footer')).toBe(true)
    expect(isDescendantOfSlot(close, 'header')).toBe(false)
  })

  it('Tactile は header を描画しない（任意 slot の省略）', () => {
    render(
      <tactile.Modal isOpen>
        <tactile.ModalTitle>削除しますか</tactile.ModalTitle>
      </tactile.Modal>,
    )
    // title はダイアログの名前として必要なので描画する。header という「行」が無い
    expect(document.querySelector('[data-slot="title"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="header"]')).toBeNull()
  })

  it('Tactile の grabber は装飾で、slot でもフォーカス対象でもない（AC-03-4 / AC-05-6）', () => {
    render(
      <tactile.Modal isOpen>
        <tactile.ModalBody>本文</tactile.ModalBody>
      </tactile.Modal>,
    )
    const grabber = document.querySelector('[data-tactile-grabber]')
    expect(grabber, 'grabber が無い').not.toBeNull()
    expect(grabber?.getAttribute('data-slot')).toBeNull()
    expect(grabber?.getAttribute('aria-hidden')).toBe('true')
    expect(grabber?.hasAttribute('tabindex')).toBe(false)
  })
})

describe('Select: popover の配置手段が違う（AC-02-2）', () => {
  // jsdom はレイアウトを持たないため、実際の位置は e2e（T-45）で測る。
  // ここでは「下端固定を宣言しているか」という手段の差を固定する
  async function openSelect(node: React.ReactElement) {
    render(node)
    await userEvent.click(screen.getByRole('button'))
    return document.querySelector('[data-slot="popover"]')
  }

  it('Raster はアンカー配置のまま（下端固定を宣言しない）', async () => {
    const popover = await openSelect(
      <raster.Select aria-label="サイズ">
        <raster.SelectItem id="s">S</raster.SelectItem>
      </raster.Select>,
    )
    expect(popover).not.toBeNull()
    expect(popover?.className).not.toContain('!bottom-0')
  })

  it('Tactile は viewport 下端に固定する（!important で RAC の配置を奪う）', async () => {
    const popover = await openSelect(
      <tactile.Select aria-label="サイズ">
        <tactile.SelectItem id="s">S</tactile.SelectItem>
      </tactile.Select>,
    )
    expect(popover).not.toBeNull()
    // 通常のクラスも style prop も RAC のインラインに負ける（ADR-T2 / rac-placement.test）
    for (const cls of ['!fixed', '!inset-x-0', '!bottom-0', '!top-auto', '!max-w-none']) {
      expect(popover?.className, `${cls} が無い`).toContain(cls)
    }
  })
})

describe('Tabs: indicator の性質が違う（AC-02-3）', () => {
  const rasterTabs = (
    <raster.Tabs defaultSelectedKey="a">
      <raster.TabItems>
        <raster.TabItem id="a">A</raster.TabItem>
        <raster.TabItem id="b">B</raster.TabItem>
      </raster.TabItems>
      <raster.TabContent id="a">1</raster.TabContent>
    </raster.Tabs>
  )
  const tactileTabs = (
    <tactile.Tabs defaultSelectedKey="a">
      <tactile.TabItems>
        <tactile.TabItem id="a">A</tactile.TabItem>
        <tactile.TabItem id="b">B</tactile.TabItem>
      </tactile.TabItems>
      <tactile.TabContent id="a">1</tactile.TabContent>
    </tactile.Tabs>
  )

  it('Raster は indicator 要素を持たない（下線は tab 自身の境界線）', () => {
    const { container } = render(rasterTabs)
    expect(container.querySelector('[data-slot="indicator"]')).toBeNull()
    // 選択中の tab が自分で下線を引く
    const selected = container.querySelector('[data-slot="tab"][data-selected]')
    expect(selected?.className).toMatch(/border-b/)
  })

  it('Tactile は list の内側を移動する塗り面を持つ', () => {
    const { container } = render(tactileTabs)
    const indicator = container.querySelector('[data-slot="indicator"]')
    expect(indicator, 'indicator が無い').not.toBeNull()
    // list が塗られたトラックで、indicator はその内側に重なる面
    const list = container.querySelector('[data-slot="list"]')
    expect(list?.className).toMatch(/bg-\[var\(--novi-color-subtle\)\]/)
    expect(indicator?.className).toMatch(/absolute/)
  })

  it('list の構造が違う（Raster は下辺の罫線 / Tactile は塗りトラック）', () => {
    const { container: r } = render(rasterTabs)
    const rasterList = r.querySelector('[data-slot="list"]')?.className ?? ''
    const { container: t } = render(tactileTabs)
    const tactileList = t.querySelector('[data-slot="list"]')?.className ?? ''

    expect(rasterList).toMatch(/border-b/)
    expect(tactileList).not.toMatch(/border-b/)
    expect(tactileList).toMatch(/rounded-/)
  })
})

describe('公開 API は完全に同一（AC-02-4）', () => {
  // 構造が違っても同じコードが動くこと。これが崩れると slot 契約の意味が消える
  it('Modal / Select / Tabs の props 型が一致する', () => {
    expectTypeOf(tactile.Modal).parameters.toEqualTypeOf<Parameters<typeof raster.Modal>>()
    expectTypeOf(tactile.Select).parameters.toEqualTypeOf<Parameters<typeof raster.Select>>()
    expectTypeOf(tactile.Tabs).parameters.toEqualTypeOf<Parameters<typeof raster.Tabs>>()
    expectTypeOf(tactile.Button).parameters.toEqualTypeOf<Parameters<typeof raster.Button>>()
  })

  it('Raster 向けに書いた classNames を渡しても壊れない（AC-02-5）', () => {
    // Tactile は header を描画しないが、渡されたキーは黙って無視されるだけ
    expect(() =>
      render(
        <tactile.Modal isOpen classNames={{ header: 'x', panel: 'y' }}>
          <tactile.ModalBody>本文</tactile.ModalBody>
        </tactile.Modal>,
      ),
    ).not.toThrow()
    expect(document.querySelector('[data-slot="panel"]')?.className).toContain('y')
  })
})
