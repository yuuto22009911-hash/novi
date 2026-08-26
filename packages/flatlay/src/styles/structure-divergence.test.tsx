import * as raster from '@novi-ui/raster'
import * as tactile from '@novi-ui/tactile'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, expectTypeOf, it } from 'vitest'
import * as flatlay from '../index'

/**
 * 着手条件の検証（T-16・**本 Spec の存在理由**）。
 *
 * architecture.md §12 の最大のリスクは「テーマ差が結局『色と角丸』に収束する」こと。
 * 3本目の着手条件も2本目と同じく **Modal・Select・Tabs の DOM 構造が実際に違うこと**で、
 * ここはそれを機械的に固定する。Tactile の `structure-divergence.test.tsx` は
 * 2本を突き合わせたが、こちらは **3本を同時に import して3通りが互いに違うこと**を見る。
 * どれか1つを複製で済ませた瞬間に落ちる。
 *
 * 逆に、公開 API（props の型）は3本で完全に同一でなければならない。
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

describe('Modal: 3通りの構造（AC-02-1 / AC-02-4）', () => {
  // 中央ダイアログ（Raster）→ ボトムシート（Tactile）→ 全画面テイクオーバー（Flatlay）。
  // slot 名は同じで、面の取り方と出口の位置だけが違う

  function renderModal(theme: typeof raster | typeof tactile | typeof flatlay) {
    // 1つのテストで3テーマを並べて比べるので、前のテーマを必ず消してから描く
    cleanup()
    const { Modal, ModalTitle, ModalBody } = theme
    render(
      <Modal isOpen>
        <ModalTitle>削除しますか</ModalTitle>
        <ModalBody>この操作は取り消せません。</ModalBody>
      </Modal>,
    )
    return {
      close: document.querySelector('[data-slot="closeButton"]'),
      panel: document.querySelector('[data-slot="panel"]'),
    }
  }

  it('Flatlay の panel は viewport 全面を占める（幅の段階を持たない）', () => {
    const { panel } = renderModal(flatlay)
    expect(panel?.className).toContain('w-full')
    expect(panel?.className).toContain('h-full')
    // size は幅ではなく本文の行長として解釈するので、panel に max-w が乗らない
    expect(panel?.className).not.toMatch(/(?<![\w-])max-w-/)
  })

  it('Raster の panel は幅に段階を持つ（中央ダイアログ）', () => {
    const { panel } = renderModal(raster)
    expect(panel?.className).toMatch(/(?<![\w-])max-w-/)
    expect(panel?.className).not.toContain('h-full')
  })

  it('size の解釈先が違う（Flatlay は body / Raster は panel）', () => {
    // 語彙は core が固定し、解釈はテーマの自由（ADR-06）。同じ props が別の場所に効く
    expect(flatlay.modalStyles({ size: 'sm' }).body()).toContain('max-w-[32rem]')
    expect(flatlay.modalStyles({ size: 'sm' }).panel()).not.toMatch(/(?<![\w-])max-w-/)
    expect(raster.modalStyles({ size: 'sm' }).panel()).toMatch(/(?<![\w-])max-w-/)
  })

  it('closeButton の所属が3通り（header / footer / header）', () => {
    expect(isDescendantOfSlot(renderModal(raster).close, 'header')).toBe(true)
    expect(isDescendantOfSlot(renderModal(tactile).close, 'footer')).toBe(true)
    expect(isDescendantOfSlot(renderModal(flatlay).close, 'header')).toBe(true)
  })

  it('Flatlay の閉じるは「← 戻る」で、Raster の ✕ とは別の言葉', () => {
    // 位置が Raster と同じ header なので、区別しているのは中身。
    // ✕ が「閉じて消す」なら、テイクオーバーは前の紙に戻る
    expect(renderModal(flatlay).close?.textContent).toContain('戻る')
    expect(renderModal(raster).close?.getAttribute('aria-label')).toBe('閉じる')
  })

  it('Flatlay は地を暗転させず、z-index も持たない（FR-02 / ADR-F2）', () => {
    renderModal(flatlay)
    const backdrop = document.querySelector('[data-slot="backdrop"]')
    // 暗転は「背後に何かがある」の表現で、それ自体が z 軸の語彙になる
    expect(backdrop?.className).toContain('bg-[var(--novi-color-overlay)]')
    expect(backdrop?.className).not.toMatch(/(?<![\w-])z-(?:\d+|\[[^\]]*\])/)
    expect(document.querySelector('[data-slot="panel"]')?.className).not.toMatch(
      /(?<![\w-])z-(?:\d+|\[[^\]]*\])/,
    )
  })
})

describe('Select: 展開部の置き場所が違う（AC-02-2）', () => {
  async function openSelect(node: React.ReactElement) {
    cleanup()
    render(node)
    await userEvent.click(screen.getByRole('button'))
    return document.querySelector('[data-slot="popover"]')
  }

  it('Flatlay の展開部は root の内側、つまり文書のフローの中にある', async () => {
    // ここが3モデルで唯一「ポータルの外に出ない」。押し下げが起きる理由そのもの
    const popover = await openSelect(
      <flatlay.Select aria-label="サイズ">
        <flatlay.SelectItem id="s">S</flatlay.SelectItem>
      </flatlay.Select>,
    )
    expect(popover).not.toBeNull()
    expect(isDescendantOfSlot(popover, 'root')).toBe(true)
    // 上流が書くインラインの absolute / z-index を剥がしてフローに戻す
    expect(popover?.className).toContain('static!')
    expect(popover?.className).toContain('z-auto!')
  })

  it('Raster / Tactile の展開部は root の外（body へポータルされる）', async () => {
    const rasterPopover = await openSelect(
      <raster.Select aria-label="サイズ">
        <raster.SelectItem id="s">S</raster.SelectItem>
      </raster.Select>,
    )
    expect(isDescendantOfSlot(rasterPopover, 'root')).toBe(false)

    const tactilePopover = await openSelect(
      <tactile.Select aria-label="サイズ">
        <tactile.SelectItem id="s">S</tactile.SelectItem>
      </tactile.Select>,
    )
    expect(isDescendantOfSlot(tactilePopover, 'root')).toBe(false)
    // 下端シートは viewport に貼り付く。フローには戻さない
    expect(tactilePopover?.className).toContain('!bottom-0')
  })

  it('選択済みの印が3通り（Flatlay だけ記号を別の span で持つ）', () => {
    render(
      <flatlay.Select aria-label="サイズ" defaultSelectedKey="s" defaultOpen>
        <flatlay.SelectItem id="s">S</flatlay.SelectItem>
      </flatlay.Select>,
    )
    // 押下の反転と役割を分けるため、状態は記号（▸）で示す
    expect(document.querySelector('[data-slot="option"]')?.textContent).toContain('▸')
  })
})

describe('Tabs: indicator の性質が3通り（AC-02-3）', () => {
  function renderTabs(theme: typeof raster | typeof tactile | typeof flatlay) {
    const { Tabs, TabItems, TabItem, TabContent } = theme
    const { container } = render(
      <Tabs defaultSelectedKey="a">
        <TabItems>
          <TabItem id="a">A</TabItem>
          <TabItem id="b">B</TabItem>
        </TabItems>
        <TabContent id="a">1</TabContent>
      </Tabs>,
    )
    return {
      indicator: container.querySelector('[data-slot="indicator"]'),
      list: container.querySelector('[data-slot="list"]')?.className ?? '',
      selected: container.querySelector('[data-slot="tab"][data-selected]')?.className ?? '',
      panel: container.querySelector('[data-slot="panel"]')?.className ?? '',
    }
  }

  it('Tactile だけが indicator 要素を持つ（塗り面）', () => {
    expect(renderTabs(raster).indicator).toBeNull()
    // Flatlay の切れ目は罫線に空ける穴なので、実体を持たせると「上に乗った何か」に見える
    expect(renderTabs(flatlay).indicator).toBeNull()
    expect(renderTabs(tactile).indicator).not.toBeNull()
  })

  it('Flatlay の選択タブは罫線に切れ目を空ける（塗り面でも下線でもない）', () => {
    const { selected } = renderTabs(flatlay)
    // 見出し列の下辺罫線に 1px 重なり、その 1px を地色で塗る
    expect(selected).toContain('-mb-px')
    expect(selected).toContain('data-[selected]:border-b-[var(--novi-color-bg)]')
  })

  it('Raster の選択タブは下線を引く（切れ目ではなく線そのもの）', () => {
    const { selected } = renderTabs(raster)
    // 同じ `-mb-px` でも用途が逆。Raster は線を引くために重ね、Flatlay は線を抜くために重ねる
    expect(selected).toContain('data-[selected]:border-[var(--novi-color-fg)]')
    expect(selected).not.toContain('data-[selected]:border-b-[var(--novi-color-bg)]')
  })

  it('パネルの囲みが3通り（Flatlay だけが三辺の罫線で見出しと繋がる）', () => {
    expect(renderTabs(flatlay).panel).toMatch(/border-x/)
    expect(renderTabs(raster).panel).not.toMatch(/border-x/)
    expect(renderTabs(tactile).panel).not.toMatch(/border-x/)
  })

  it('list の構造が3通り（罫線 / 塗りトラック / 罫線＋切れ目の受け皿）', () => {
    expect(renderTabs(raster).list).toMatch(/border-b/)
    expect(renderTabs(tactile).list).not.toMatch(/border-b/)
    expect(renderTabs(tactile).list).toMatch(/rounded-/)
    expect(renderTabs(flatlay).list).toMatch(/border-b/)
    // 見出し列とパネルを離すと罫線が繋がらない
    expect(flatlay.tabsStyles().root()).not.toMatch(/(?<![\w-])gap-/)
  })
})

describe('公開 API は3本で完全に同一（AC-02-4）', () => {
  it('Modal / Select / Tabs / Button の props 型が一致する', () => {
    expectTypeOf(flatlay.Modal).parameters.toEqualTypeOf<Parameters<typeof raster.Modal>>()
    expectTypeOf(flatlay.Select).parameters.toEqualTypeOf<Parameters<typeof raster.Select>>()
    expectTypeOf(flatlay.Tabs).parameters.toEqualTypeOf<Parameters<typeof raster.Tabs>>()
    expectTypeOf(flatlay.Button).parameters.toEqualTypeOf<Parameters<typeof raster.Button>>()
    expectTypeOf(flatlay.Tabs).parameters.toEqualTypeOf<Parameters<typeof tactile.Tabs>>()
  })

  it('他テーマ向けに書いた classNames を渡しても壊れない（AC-02-5）', () => {
    // Flatlay が解釈しない slot（Tactile の indicator など）は黙って無視される
    expect(() =>
      render(
        <flatlay.Tabs defaultSelectedKey="a" classNames={{ indicator: 'x', root: 'y' }}>
          <flatlay.TabItems>
            <flatlay.TabItem id="a">A</flatlay.TabItem>
          </flatlay.TabItems>
          <flatlay.TabContent id="a">1</flatlay.TabContent>
        </flatlay.Tabs>,
      ),
    ).not.toThrow()
    expect(document.querySelector('[data-slot="root"]')?.className).toContain('y')
  })
})
