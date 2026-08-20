import index from '../.generated/component-index.json'

interface PropRow {
  name: string
  required: boolean
  type: string
  doc: string
}

interface ComponentEntry {
  name: string
  summary: string
  notes: string | null
  a11y: string | null
  implementedBy: string[]
  importName: string
  props: PropRow[]
  example: string | null
  slots: { all: string[]; required: string[] }
}

const COMPONENTS = index.components as ComponentEntry[]

/** 型名だけでは取りうる値が分からない。IR が持つ展開を引く。 */
const TOKEN_TYPES = index.tokenTypes as Record<string, string>
const displayType = (type: string) => TOKEN_TYPES[type] ?? type

export function getComponent(name: string): ComponentEntry {
  const found = COMPONENTS.find((c) => c.name === name)
  if (found === undefined) throw new Error(`${name} の契約が見つかりません`)
  return found
}

export const componentNames = COMPONENTS.map((c) => c.name)

/**
 * props 表。**ソースから生成したデータだけを描画する**（FR-05）。
 *
 * 手書きすると必ず実装とズレる。ズレたドキュメントは人間には軽い不便だが、
 * AI には致命的（誤った API を自信を持って生成する）。
 */
export function PropsTable({ name }: { name: string }) {
  const { props } = getComponent(name)

  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">{name} の props 一覧</caption>
      <thead>
        <tr className="border-b border-site-border text-left">
          <th scope="col" className="py-2 pr-4 font-medium">
            名前
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            型
          </th>
          <th scope="col" className="py-2 font-medium">
            説明
          </th>
        </tr>
      </thead>
      <tbody>
        {props.map((prop) => (
          <tr key={prop.name} className="border-b border-site-border align-top">
            <td className="py-2 pr-4 font-mono text-xs whitespace-nowrap">
              {prop.name}
              {prop.required && <span className="text-site-accent"> *</span>}
            </td>
            <td className="py-2 pr-4 font-mono text-xs text-site-muted">
              {displayType(prop.type)}
            </td>
            <td className="py-2 text-site-muted">{prop.doc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * slot 表。core の契約をそのまま読むため、原理的にズレようがない（FR-06）。
 */
export function SlotTable({ name }: { name: string }) {
  const { slots } = getComponent(name)

  return (
    <ul className="flex flex-wrap gap-2 text-sm">
      {slots.all.map((slot) => {
        const required = slots.required.includes(slot)
        return (
          <li
            key={slot}
            className={[
              'border px-2 py-1 font-mono text-xs',
              required
                ? 'border-site-accent text-site-accent'
                : 'border-site-border text-site-muted',
            ].join(' ')}
          >
            {slot}
            {required && <span className="ml-1 not-italic">必須</span>}
          </li>
        )
      })}
    </ul>
  )
}
