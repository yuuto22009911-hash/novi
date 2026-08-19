import type { NoviContract } from '../contracts/registry'

export interface SlotContractResult {
  /** 実際に `data-slot` として出力されていた slot 名 */
  found: string[]
  /** 契約上必須なのに出力されていなかった slot 名 */
  missing: string[]
  /** 語彙に存在しないのに出力されていた slot 名 */
  unknown: string[]
}

/**
 * レンダリング結果が slot 契約を満たしているか調べる。
 *
 * テストフレームワークに依存しない純粋関数にしてある。
 * `describe`/`it` の中に検査ロジックを埋めると、
 * **「壊れたときにちゃんと失敗するか」自体をテストできなくなる**ため。
 *
 * @example
 * const { container } = render(<Modal isOpen>本文</Modal>)
 * const { missing, unknown } = checkSlotContract(container, NOVI_CONTRACTS.Modal)
 */
export function checkSlotContract(
  container: ParentNode,
  contract: NoviContract,
): SlotContractResult {
  const found = new Set<string>()
  for (const element of container.querySelectorAll('[data-slot]')) {
    // セレクタで絞っているため属性は必ず存在する。空文字だけを除く。
    const name = element.getAttribute('data-slot') ?? ''
    if (name !== '') found.add(name)
  }

  const vocabulary = new Set(contract.slots)

  return {
    found: [...found].sort(),
    missing: contract.required.filter((slot) => !found.has(slot)),
    unknown: [...found].filter((slot) => !vocabulary.has(slot)).sort(),
  }
}

/** 失敗時に何が起きたか一目で分かるメッセージを組み立てる。 */
export function formatSlotContractFailure(name: string, result: SlotContractResult): string {
  const lines: string[] = []
  if (result.missing.length > 0) {
    lines.push(`${name}: 必須 slot が出力されていません → ${result.missing.join(', ')}`)
  }
  if (result.unknown.length > 0) {
    lines.push(
      `${name}: 語彙にない slot が出力されています → ${result.unknown.join(', ')}`,
      '  slot 名は core の契約で決まっています。勝手に増やすと docs とテストが横断で成立しなくなります。',
    )
  }
  lines.push(`  出力された slot: ${result.found.length > 0 ? result.found.join(', ') : '(なし)'}`)
  return lines.join('\n')
}
