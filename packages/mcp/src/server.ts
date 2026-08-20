/**
 * MCP の配線。**ここには判断を書かない。**
 *
 * 応答の内容は `tools.ts` の純関数が決める。配線と中身を分けておくと、
 * 文面の検査にサーバの起動が要らなくなる。
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { index } from './index-data.js'
import { getComponent, getDesignRules, listComponents, searchComponents } from './tools.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })

/**
 * すべてのツールに付ける注記。
 *
 * 読み取り専用で、外部と一切やり取りしない。これはこのサーバの設計そのもの（ADR-A3）で、
 * クライアント側が接続前に判断できるよう機械可読な形でも宣言する。
 */
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const

export function createNoviServer(): McpServer {
  const server = new McpServer(
    { name: 'novi-ui', version: index.version },
    {
      capabilities: { tools: {} },
      instructions: [
        `Novi UI ${index.version} の API を提供します。`,
        'Provider は不要です。`disabled` ではなく `isDisabled`、`onClick` ではなく `onPress` を使います。',
        'ここに無いコンポーネントは未実装です。近いもので代用せず、未実装だと伝えてください。',
      ].join('\n'),
    },
  )

  server.registerTool(
    'list_components',
    {
      title: 'コンポーネント一覧',
      description:
        'Novi UI が実装している全コンポーネントの名前・1行説明・実装テーマを返す。ここに無いものは未実装。',
      inputSchema: {},
      annotations: READ_ONLY,
    },
    () => text(listComponents()),
  )

  server.registerTool(
    'get_component',
    {
      title: 'コンポーネントの詳細',
      description:
        '1つのコンポーネントの props / slot / 使用例 / アクセシビリティ注記を返す。実装前に必ずこれを見る。',
      inputSchema: {
        name: z.string().describe('契約名。例: Button, Select, CheckboxGroup'),
        theme: z.string().optional().describe('テーマ名。省略時は実装済みの最初のテーマ'),
      },
      annotations: READ_ONLY,
    },
    ({ name, theme }) => text(getComponent(name, theme)),
  )

  server.registerTool(
    'get_design_rules',
    {
      title: 'テーマのデザイン規則',
      description:
        'テーマの数値定義・書いてはいけないクラス・色の扱いを返す。CI が検査している規則と同じもの。',
      inputSchema: {
        theme: z.string().describe(`テーマ名。例: ${Object.keys(index.themes).join(', ')}`),
      },
      annotations: READ_ONLY,
    },
    ({ theme }) => text(getDesignRules(theme)),
  )

  server.registerTool(
    'search_components',
    {
      title: 'コンポーネントを探す',
      description:
        '作りたいものを自然文で渡すと候補を返す。該当が無ければ「未実装」と答え、代替は提案しない。',
      inputSchema: {
        query: z.string().describe('作りたいもの。例: 一覧から1つ選ばせたい'),
      },
      annotations: READ_ONLY,
    },
    ({ query }) => text(searchComponents(query)),
  )

  return server
}
