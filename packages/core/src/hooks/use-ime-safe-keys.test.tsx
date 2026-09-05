import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useImeSafeKeys } from './use-ime-safe-keys'

function Subject({ onKeyDown }: { onKeyDown: (key: string) => void }) {
  const keyProps = useImeSafeKeys<HTMLInputElement>((event) => onKeyDown(event.key))
  return <input aria-label="入力" {...keyProps} />
}

/** setTimeout(0) による抑制解除を待つ。 */
function flushRelease() {
  act(() => {
    vi.advanceTimersByTime(1)
  })
}

describe('useImeSafeKeys', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('IME を使わない直接入力の Enter は即座にハンドラへ届く（AC-03-3）', () => {
    const handler = vi.fn()
    render(<Subject onKeyDown={handler} />)

    fireEvent.keyDown(screen.getByLabelText('入力'), { key: 'Enter' })

    expect(handler).toHaveBeenCalledExactlyOnceWith('Enter')
  })

  it('IME 変換中（isComposing）の Enter はハンドラへ届かない（AC-03-1）', () => {
    const handler = vi.fn()
    render(<Subject onKeyDown={handler} />)
    const input = screen.getByLabelText('入力')

    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(handler).not.toHaveBeenCalled()
  })

  it('isComposing が立たない環境でも keyCode 229 で抑制する', () => {
    const handler = vi.fn()
    render(<Subject onKeyDown={handler} />)

    // compositionStart を発火させず、keyCode だけで判定できることを確かめる
    fireEvent.keyDown(screen.getByLabelText('入力'), { key: 'Enter', keyCode: 229 })

    expect(handler).not.toHaveBeenCalled()
  })

  it('compositionend 直後・同一タスク内の keydown も抑制する（AC-03-4）', () => {
    const handler = vi.fn()
    render(<Subject onKeyDown={handler} />)
    const input = screen.getByLabelText('入力')

    // Safari 系では compositionend の "後" に確定 Enter が isComposing:false で届く
    fireEvent.compositionStart(input)
    fireEvent.compositionEnd(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: false })

    expect(handler).not.toHaveBeenCalled()
  })

  it('変換確定後にもう一度押した Enter はハンドラへ届く（AC-03-2）', () => {
    const handler = vi.fn()
    render(<Subject onKeyDown={handler} />)
    const input = screen.getByLabelText('入力')

    fireEvent.compositionStart(input)
    fireEvent.compositionEnd(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: false })
    expect(handler).not.toHaveBeenCalled()

    flushRelease()
    fireEvent.keyDown(input, { key: 'Enter', isComposing: false })

    expect(handler).toHaveBeenCalledExactlyOnceWith('Enter')
  })

  it('変換を再開すると再び抑制される', () => {
    const handler = vi.fn()
    render(<Subject onKeyDown={handler} />)
    const input = screen.getByLabelText('入力')

    fireEvent.compositionStart(input)
    fireEvent.compositionEnd(input)
    flushRelease()

    // 2回目の変換
    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(handler).not.toHaveBeenCalled()
  })

  it('解除待ちの間に次の変換が始まっても抑制が続く（高速入力）', () => {
    const handler = vi.fn()
    render(<Subject onKeyDown={handler} />)
    const input = screen.getByLabelText('入力')

    // 1回目の変換を確定 → 解除タイマーが動いている状態で、すぐ次の変換を始める
    fireEvent.compositionStart(input)
    fireEvent.compositionEnd(input)
    fireEvent.compositionStart(input)

    // ここで解除タイマーが発火しても、2回目の変換中なので抑制されたままでなければならない
    flushRelease()
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(handler).not.toHaveBeenCalled()
  })

  it('解除待ちの間にもう一度確定しても解除が1回にまとまる', () => {
    const handler = vi.fn()
    render(<Subject onKeyDown={handler} />)
    const input = screen.getByLabelText('入力')

    fireEvent.compositionStart(input)
    fireEvent.compositionEnd(input)
    fireEvent.compositionEnd(input)

    // 解除前は抑制されている
    fireEvent.keyDown(input, { key: 'Enter', isComposing: false })
    expect(handler).not.toHaveBeenCalled()

    // 解除後は通る
    flushRelease()
    fireEvent.keyDown(input, { key: 'Enter', isComposing: false })
    expect(handler).toHaveBeenCalledExactlyOnceWith('Enter')
  })

  it('Enter 以外のキーも変換中は抑制する', () => {
    const handler = vi.fn()
    render(<Subject onKeyDown={handler} />)
    const input = screen.getByLabelText('入力')

    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'ArrowDown', isComposing: true })

    // 変換中の矢印キーは候補選択に使われるため、消費側へ渡してはいけない
    expect(handler).not.toHaveBeenCalled()
  })

  it('ハンドラ未指定でも例外を投げない', () => {
    function NoHandler() {
      const keyProps = useImeSafeKeys<HTMLInputElement>()
      return <input aria-label="入力" {...keyProps} />
    }
    render(<NoHandler />)

    expect(() => fireEvent.keyDown(screen.getByLabelText('入力'), { key: 'Enter' })).not.toThrow()
  })

  it('アンマウント時に解除タイマーを片付ける', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount } = render(<Subject onKeyDown={vi.fn()} />)
    const input = screen.getByLabelText('入力')

    fireEvent.compositionStart(input)
    fireEvent.compositionEnd(input)
    unmount()

    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })
})

describe('useImeSafeKeys: capture 段の遮断', () => {
  /** 同じ input に別のハンドラ（React Aria が付けるもの相当）を並べる。 */
  function WithSibling({ sibling }: { sibling: (key: string) => void }) {
    const keyProps = useImeSafeKeys<HTMLInputElement>()
    return <input aria-label="入力" {...keyProps} onKeyDown={(e) => sibling(e.key)} />
  }

  it('変換中の Enter は同じ要素の他のハンドラにも届かない', () => {
    vi.useFakeTimers()
    const sibling = vi.fn()
    render(<WithSibling sibling={sibling} />)
    const input = screen.getByLabelText('入力')

    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(sibling).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('変換していなければ他のハンドラに届く', () => {
    const sibling = vi.fn()
    render(<WithSibling sibling={sibling} />)

    fireEvent.keyDown(screen.getByLabelText('入力'), { key: 'Enter' })

    expect(sibling).toHaveBeenCalledExactlyOnceWith('Enter')
  })
})
