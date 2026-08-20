#!/usr/bin/env node
/**
 * `novi-mcp` の実行エントリ。標準入出力で MCP クライアントと話す。
 *
 * 起動時に読むものは何も無い。データはこのファイルに埋め込まれている（ADR-A3）。
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createNoviServer } from './server.js'

await createNoviServer().connect(new StdioServerTransport())
