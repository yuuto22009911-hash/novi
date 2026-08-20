/**
 * ライブラリとしてのエントリ。接続はしない。
 *
 * 実行ファイルは `bin.ts` に分けてある。import しただけで標準入出力を掴む作りにすると、
 * テストや他のサーバへの組み込みができなくなる。
 */

export type { ComponentEntry, ComponentIndex, DesignRules, ThemeEntry } from './index-data.js'
export { index } from './index-data.js'
export { createNoviServer } from './server.js'
export { getComponent, getDesignRules, listComponents, searchComponents } from './tools.js'
