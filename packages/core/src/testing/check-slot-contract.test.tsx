import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NOVI_CONTRACTS } from '../contracts/registry'
import { checkSlotContract, formatSlotContractFailure } from './check-slot-contract'
import { testSlotContract } from './index'

const modal = NOVI_CONTRACTS.Modal

/** 必須 slot（backdrop / panel / body）をすべて出す、契約を守った実装。 */
function GoodModal() {
  return (
    <div data-slot="backdrop">
      <div data-slot="panel">
        <div data-slot="header">
          <h2 data-slot="title">確認</h2>
        </div>
        <div data-slot="body">本文</div>
      </div>
    </div>
  )
}

/** panel を出し忘れた実装。 */
function MissingPanelModal() {
  return (
    <div data-slot="backdrop">
      <div data-slot="body">本文</div>
    </div>
  )
}

/** 語彙にない slot を勝手に足した実装。 */
function UnknownSlotModal() {
  return (
    <div data-slot="backdrop">
      <div data-slot="panel">
        <div data-slot="wrapper">
          <div data-slot="body">本文</div>
        </div>
      </div>
    </div>
  )
}

describe('checkSlotContract', () => {
  it('契約を守った実装では missing も unknown も空になる（AC-02-1）', () => {
    const { container } = render(<GoodModal />)
    const result = checkSlotContract(container, modal)

    expect(result.missing).toEqual([])
    expect(result.unknown).toEqual([])
    expect(result.found).toEqual(['backdrop', 'body', 'header', 'panel', 'title'])
  })

  it('必須 slot の欠落を検出する（AC-02-2）', () => {
    const { container } = render(<MissingPanelModal />)
    const result = checkSlotContract(container, modal)

    expect(result.missing).toEqual(['panel'])
    expect(result.unknown).toEqual([])
  })

  it('語彙外の slot を検出する（AC-02-3）', () => {
    const { container } = render(<UnknownSlotModal />)
    const result = checkSlotContract(container, modal)

    expect(result.unknown).toEqual(['wrapper'])
    expect(result.missing).toEqual([])
  })

  it('任意 slot を省略しても失敗しない', () => {
    // GoodModal は closeButton / footer を出していないが、いずれも任意
    const { container } = render(<GoodModal />)
    expect(checkSlotContract(container, modal).missing).toEqual([])
  })

  it('何も描画しない実装では必須 slot がすべて欠落として挙がる', () => {
    const { container } = render(<div />)
    const result = checkSlotContract(container, modal)

    expect(result.missing).toEqual([...modal.required])
    expect(result.found).toEqual([])
  })

  it('空文字の data-slot は無視する', () => {
    const { container } = render(
      <div data-slot="backdrop">
        <div data-slot="">
          <div data-slot="panel">
            <div data-slot="body">本文</div>
          </div>
        </div>
      </div>,
    )
    const result = checkSlotContract(container, modal)

    expect(result.missing).toEqual([])
    expect(result.unknown).toEqual([])
  })

  it('入れ子の別コンポーネント由来の slot は違反にしない', () => {
    // RadioGroup の中の Radio のように、別コンポーネントの slot が同じツリーに出ることがある。
    // これを語彙外と誤検出すると、契約テストが実用にならない。
    const { container } = render(
      <div data-slot="backdrop">
        <div data-slot="panel">
          <div data-slot="body">
            {/* Checkbox の slot。Modal の語彙には無いが、発明された名前ではない */}
            <span data-slot="control" />
          </div>
        </div>
      </div>,
    )
    const result = checkSlotContract(container, modal)

    expect(result.unknown).toEqual([])
    expect(result.fromNestedComponents).toEqual(['control'])
  })

  it('どの契約にも無い名前は依然として違反にする', () => {
    const { container } = render(<UnknownSlotModal />)
    const result = checkSlotContract(container, modal)

    expect(result.unknown).toEqual(['wrapper'])
    expect(result.fromNestedComponents).toEqual([])
  })

  it('同じ slot が複数回現れても重複して数えない', () => {
    const { container } = render(
      <div data-slot="backdrop">
        <div data-slot="panel">
          <div data-slot="body">1</div>
          <div data-slot="body">2</div>
        </div>
      </div>,
    )
    expect(checkSlotContract(container, modal).found).toEqual(['backdrop', 'body', 'panel'])
  })
})

describe('formatSlotContractFailure', () => {
  it('欠落した slot 名がメッセージに含まれる（AC-02-2）', () => {
    const { container } = render(<MissingPanelModal />)
    const message = formatSlotContractFailure('Modal', checkSlotContract(container, modal))

    expect(message).toContain('panel')
    expect(message).toContain('必須 slot が出力されていません')
  })

  it('語彙外の slot 名がメッセージに含まれる（AC-02-3）', () => {
    const { container } = render(<UnknownSlotModal />)
    const message = formatSlotContractFailure('Modal', checkSlotContract(container, modal))

    expect(message).toContain('wrapper')
    expect(message).toContain('語彙にない slot')
  })

  it('実際に出力された slot を併記して原因を追いやすくする', () => {
    const { container } = render(<GoodModal />)
    const message = formatSlotContractFailure('Modal', checkSlotContract(container, modal))

    expect(message).toContain('出力された slot: backdrop, body, header, panel, title')
  })
})

// スイート本体が実際に動くことを、契約を守った実装で確認する
testSlotContract({
  name: 'GoodModal',
  contract: modal,
  render: () => <GoodModal />,
})
