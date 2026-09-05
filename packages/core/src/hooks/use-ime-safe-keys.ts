import type { CompositionEvent, DOMAttributes, KeyboardEvent, KeyboardEventHandler } from 'react'
import { useCallback, useEffect, useRef } from 'react'

/** IME 変換中に一部の環境が返す keyCode。`isComposing` が立たない環境のフォールバック。 */
const IME_KEY_CODE = 229

export type ImeSafeKeyProps<E extends Element> = Pick<
  DOMAttributes<E>,
  'onKeyDown' | 'onKeyDownCapture' | 'onCompositionStart' | 'onCompositionEnd'
>

/**
 * IME 変換中のキー操作を抑制する。
 *
 * 日本語入力で「にほんご」と打って Enter で変換確定したとき、
 * 素朴な実装ではその Enter が送信・決定・候補選択として誤発火する。
 * 各コンポーネントに個別対応を書くと必ずどこかで漏れ、
 * 漏れた場所だけ日本語入力で誤動作するという最も再現しにくいバグになるため、
 * core が一律で引き受ける。
 *
 * 判定は3条件の OR で行う。1つでは環境差を吸収できない。
 * - `isComposing`: 標準的な変換中判定
 * - `keyCode === 229`: `isComposing` が立たない環境のフォールバック
 * - 内部フラグ: `compositionend` 直後に keydown が届く環境（Safari 系）への対処
 *
 * @example
 * const keyProps = useImeSafeKeys<HTMLInputElement>((e) => {
 *   if (e.key === 'Enter') submit()
 * })
 * return <input {...keyProps} />
 */
export function useImeSafeKeys<E extends Element = HTMLElement>(
  onKeyDown?: KeyboardEventHandler<E>,
): ImeSafeKeyProps<E> {
  const composingRef = useRef(false)
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // アンマウント後にフラグ解除のタイマーが残らないようにする
  useEffect(
    () => () => {
      if (releaseTimerRef.current !== undefined) clearTimeout(releaseTimerRef.current)
    },
    [],
  )

  const handleCompositionStart = useCallback((_event: CompositionEvent<E>) => {
    if (releaseTimerRef.current !== undefined) clearTimeout(releaseTimerRef.current)
    composingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback((_event: CompositionEvent<E>) => {
    // compositionend の "後" に確定 Enter の keydown が届く環境がある。
    // 同一タスク内は抑制を維持し、次タスクで解除する。
    // 人間が1タスク内に Enter を2回押すことは不可能なので、誤抑制の実害はない。
    if (releaseTimerRef.current !== undefined) clearTimeout(releaseTimerRef.current)
    releaseTimerRef.current = setTimeout(() => {
      composingRef.current = false
      releaseTimerRef.current = undefined
    }, 0)
  }, [])

  const isComposing = useCallback(
    (event: KeyboardEvent<E>) =>
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === IME_KEY_CODE ||
      composingRef.current,
    [],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<E>) => {
      if (isComposing(event)) return
      onKeyDown?.(event)
    },
    [onKeyDown, isComposing],
  )

  /**
   * 変換中のキーを**同じ要素に付いた他のハンドラにも渡さない**。
   *
   * 利用者の `onKeyDown` を包むだけでは、React Aria が同じ input に付ける
   * ハンドラ（ComboBox の Enter で決定、NumberField の矢印で増減）が
   * 変換中の Enter / 矢印で発火する。capture 段で伝播を止めれば、
   * 同じ要素の bubble 段のハンドラも走らない（React は各リスナの前に
   * `isPropagationStopped` を見る）。Escape も止まるが、変換中の Escape は
   * IME の取り消しであってダイアログを閉じる操作ではないので、それで正しい。
   */
  const handleKeyDownCapture = useCallback(
    (event: KeyboardEvent<E>) => {
      if (isComposing(event)) event.stopPropagation()
    },
    [isComposing],
  )

  return {
    onKeyDown: handleKeyDown,
    onKeyDownCapture: handleKeyDownCapture,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
  }
}
