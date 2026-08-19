import { NOVI_CONTRACTS, type NoviContract } from '../contracts/registry'

/**
 * Novi の全コンポーネントが使う slot 名の集合。
 *
 * ある契約の検査中に、入れ子になった**別の** Novi コンポーネントの slot が
 * 同じツリーに現れることがある（RadioGroup の中の Radio など）。
 * それを「語彙外」と誤検出しないために使う。
 */
const ALL_KNOWN_SLOTS: ReadonlySet<string> = new Set(
  Object.values(NOVI_CONTRACTS).flatMap((contract) => [...contract.slots]),
)

export interface SlotContractResult {
  /** 実際に `data-slot` として出力されていた slot 名 */
  found: string[]
  /** 契約上必須なのに出力されていなかった slot 名 */
  missing: string[]
  /** Novi のどの契約にも存在しない、発明された slot 名 */
  unknown: string[]
  /** この契約の語彙外だが、他の Novi コンポーネント由来と判断した slot 名 */
  fromNestedComponents: string[]
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
  const outside = [...found].filter((slot) => !vocabulary.has(slot)).sort()

  return {
    found: [...found].sort(),
    missing: contract.required.filter((slot) => !found.has(slot)),
    // 検出したいのは「勝手に発明された名前」。入れ子の別コンポーネント由来は違反ではない
    unknown: outside.filter((slot) => !ALL_KNOWN_SLOTS.has(slot)),
    fromNestedComponents: outside.filter((slot) => ALL_KNOWN_SLOTS.has(slot)),
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
  if (result.fromNestedComponents.length > 0) {
    lines.push(
      `  （入れ子の別コンポーネント由来と判断: ${result.fromNestedComponents.join(', ')}）`,
    )
  }
  return lines.join('\n')
}
