import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import type { NoviContract } from '../contracts/registry'
import { checkSlotContract, formatSlotContractFailure } from './check-slot-contract'

export {
  checkSlotContract,
  formatSlotContractFailure,
  type SlotContractResult,
} from './check-slot-contract'

export interface TestSlotContractOptions {
  /** テスト名に使う。例: 'Modal' */
  name: string
  /** `NOVI_CONTRACTS` から取り出した契約 */
  contract: NoviContract
  /** **全 slot が出る状態**でレンダリングすること（モーダルなら開いた状態など） */
  render: () => ReactElement
}

/**
 * テーマのコンポーネントが slot 契約を守っているかを検査するテストを登録する。
 *
 * テーマが増えても契約の遵守が自動で保証されるよう、各テーマがこれを実行する。
 *
 * @example
 * testSlotContract({
 *   name: 'Modal',
 *   contract: NOVI_CONTRACTS.Modal,
 *   render: () => <Modal isOpen>本文</Modal>,
 * })
 */
export function testSlotContract({
  name,
  contract,
  render: renderElement,
}: TestSlotContractOptions): void {
  describe(`${name}: slot 契約`, () => {
    it('必須 slot をすべて data-slot で出力する', () => {
      const { container } = render(renderElement())
      const result = checkSlotContract(container, contract)
      expect(result.missing, formatSlotContractFailure(name, result)).toEqual([])
    })

    it('語彙にない data-slot を出力しない', () => {
      const { container } = render(renderElement())
      const result = checkSlotContract(container, contract)
      expect(result.unknown, formatSlotContractFailure(name, result)).toEqual([])
    })
  })
}
