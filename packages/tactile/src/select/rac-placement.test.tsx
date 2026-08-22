import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, ListBox, ListBoxItem, Popover, Select, SelectValue } from 'react-aria-components'
import { describe, expect, it } from 'vitest'

/**
 * RAC の Popover 配置に関する前提の固定（T-13 のスパイク結果）。
 *
 * **シートを画面下端に固定する手段は `!important` しかない。** 実測の結論:
 * - 通常のクラス指定 → インラインスタイルに負ける
 * - `style` prop → 実装は `{...popoverProps.style, ...renderProps.style}` の順に見えるが、
 *   位置は測定後に再適用されるため **RAC の top / left / max-height が最終的に勝つ**
 * - スタイルシートの `!important` → インラインに勝つ（実ブラウザで確認済み）
 *
 * ここが固定しているのは「style prop では勝てない」という前提そのもの。
 * RAC 側が変わって style prop で勝てるようになればこのテストが落ち、
 * `!important` という強い手段を外せると分かる。
 */
describe('RAC Popover の配置（ADR-T2 の前提）', () => {
  it('style prop では RAC の位置決めを上書きできない', async () => {
    render(
      <Select aria-label="サイズ">
        <Button>
          <SelectValue />
        </Button>
        <Popover style={{ position: 'fixed', top: 'auto', left: 0, bottom: 0, maxHeight: '85dvh' }}>
          <ListBox>
            <ListBoxItem id="s">S</ListBoxItem>
          </ListBox>
        </Popover>
      </Select>,
    )
    await userEvent.click(screen.getByRole('button'))

    const popover = document.querySelector('.react-aria-Popover') as HTMLElement
    expect(popover).not.toBeNull()
    // RAC が測定結果で上書きするため、渡した値は残らない
    expect(popover.style.top).not.toBe('auto')
    expect(popover.style.maxHeight).not.toBe('85dvh')
  })
})
