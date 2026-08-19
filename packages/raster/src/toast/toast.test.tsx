import { NOVI_CONTRACTS } from '@novi-ui/core'
import { checkSlotContract } from '@novi-ui/core/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tv } from 'tailwind-variants'
import { describe, expect, it } from 'vitest'
import { createToastQueue, NoviToastRegion } from './toast'
import { toastStyles } from './toast.styles'

describe('Toast: 表示', () => {
  it('キューに追加すると表示される', async () => {
    const queue = createToastQueue()
    render(<NoviToastRegion queue={queue} />)

    act(() => {
      queue.add({ title: '保存しました' })
    })

    await waitFor(() => {
      expect(screen.getByText('保存しました')).toBeDefined()
    })
  })

  it('slot 契約を満たす', async () => {
    const queue = createToastQueue()
    const { baseElement } = render(<NoviToastRegion queue={queue} />)

    act(() => {
      queue.add({
        title: '保存しました',
        description: '変更が反映されています',
        color: 'success',
      })
    })

    await waitFor(() => {
      expect(screen.getByText('保存しました')).toBeDefined()
    })

    const result = checkSlotContract(baseElement, NOVI_CONTRACTS.Toast)
    expect(result.missing, `欠落: ${result.missing.join(', ')}`).toEqual([])
    expect(result.unknown).toEqual([])
  })

  it('閉じるボタンで消える', async () => {
    const queue = createToastQueue()
    render(<NoviToastRegion queue={queue} />)

    act(() => {
      queue.add({ title: '保存しました' })
    })
    await waitFor(() => {
      expect(screen.getByText('保存しました')).toBeDefined()
    })

    await userEvent.click(screen.getByRole('button', { name: '閉じる' }))

    await waitFor(() => {
      expect(screen.queryByText('保存しました')).toBeNull()
    })
  })
})

describe('Toast: Raster のデザイン規律', () => {
  it('影を使わない', () => {
    expect(toastStyles().root()).toContain('shadow-none')
  })

  it('右下に固定する', () => {
    expect(toastStyles().region()).toContain('bottom-4')
    expect(toastStyles().region()).toContain('right-4')
  })
})

describe('Toast: 拡張', () => {
  it('tv({ extend }) で拡張できる', () => {
    const my = tv({ extend: toastStyles, slots: { region: 'bottom-8' } })
    expect(my().region()).toContain('bottom-8')
  })
})
