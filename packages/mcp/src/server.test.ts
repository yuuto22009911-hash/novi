/**
 * MCP クライアントから実際に接続して4ツールを呼ぶ（T-24 / AC-04-1〜4）。
 *
 * 純関数の検査（`tools.test.ts`）だけでは、**配線の間違いが素通りする**。
 * ツール名の綴り、入力スキーマ、応答の形は、プロトコルに乗せて初めて検証できる。
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { index } from './index-data.js'
import { createNoviServer } from './server.js'

let client: Client

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  client = new Client({ name: 'test', version: '0.0.0' })
  await Promise.all([createNoviServer().connect(serverTransport), client.connect(clientTransport)])
})

afterAll(async () => {
  await client.close()
})

/** 応答からテキストだけを取り出す。 */
async function call(name: string, args: Record<string, unknown> = {}): Promise<string> {
  const result = await client.callTool({ name, arguments: args })
  const content = result.content as { type: string; text?: string }[]
  return content
    .filter((part) => part.type === 'text')
    .map((part) => part.text ?? '')
    .join('\n')
}

describe('接続とツールの公開', () => {
  it('4つのツールを公開する', async () => {
    const { tools } = await client.listTools()
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'get_component',
      'get_design_rules',
      'list_components',
      'search_components',
    ])
  })

  it('すべて読み取り専用・外部と通信しないと宣言している（ADR-A3）', async () => {
    const { tools } = await client.listTools()
    for (const tool of tools) {
      expect(tool.annotations?.readOnlyHint, tool.name).toBe(true)
      expect(tool.annotations?.openWorldHint, tool.name).toBe(false)
    }
  })

  it('引数を取るツールは入力スキーマを公開する', async () => {
    const { tools } = await client.listTools()
    const byName = new Map(tools.map((tool) => [tool.name, tool]))
    expect(byName.get('get_component')?.inputSchema.properties).toHaveProperty('name')
    expect(byName.get('get_design_rules')?.inputSchema.properties).toHaveProperty('theme')
    expect(byName.get('search_components')?.inputSchema.properties).toHaveProperty('query')
  })
})

describe('4ツールの応答', () => {
  it('list_components が全件返す（AC-04-1）', async () => {
    const output = await call('list_components')
    for (const component of index.components) {
      expect(output).toContain(component.name)
    }
  })

  it('get_component が props / slot / 使用例 / a11y を返す（AC-04-2）', async () => {
    const output = await call('get_component', { name: 'Select' })
    expect(output).toContain('data-slot')
    expect(output).toContain('<Select')
    expect(output).toContain('Escape')
  })

  it('get_design_rules が数値と禁止クラスを返す（AC-04-3）', async () => {
    const output = await call('get_design_rules', { theme: 'raster' })
    expect(output).toContain('sm=32')
    expect(output).toContain('shadow-')
  })

  it('search_components が未実装に代替提案をしない（AC-04-4 / FR-06）', async () => {
    const output = await call('search_components', { query: 'ファイルを添付させたい' })
    expect(output).toContain('代用しないでください')
    expect(output).not.toContain('一致したコンポーネント')
  })
})

describe('入力の検証', () => {
  it('必須の引数が無ければエラーになる', async () => {
    const result = await client.callTool({ name: 'get_component', arguments: {} })
    expect(result.isError).toBe(true)
  })

  it('知らないツール名はエラーになる', async () => {
    const result = await client.callTool({ name: 'delete_everything', arguments: {} })
    expect(result.isError).toBe(true)
  })
})
