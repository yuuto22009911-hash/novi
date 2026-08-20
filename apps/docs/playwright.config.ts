import { defineConfig, devices } from '@playwright/test'

/**
 * ブラウザでの検証。
 *
 * jsdom では確かめられないものをここで担保する。
 * - axe はレイアウトと計算済みスタイルを見るため実ブラウザが要る
 * - カラースキームのカスケード（`@media` と属性の優先順位）
 * - Tooltip のホバー
 * - 見た目の回帰
 *
 * 静的エクスポートした `out/` をそのまま配信するので、
 * 本番と同じ成果物を検証している。
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './.playwright',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI !== undefined ? 1 : 0,
  reporter: process.env.CI !== undefined ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx --yes serve@14 out -l 4321 --no-clipboard',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: process.env.CI === undefined,
    timeout: 60_000,
  },
})
