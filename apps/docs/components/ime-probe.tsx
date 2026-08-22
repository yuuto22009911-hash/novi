'use client'

import { useState } from 'react'
import { useNoviTheme } from '../lib/theme-components'
import { Preview } from './preview'

/**
 * 変換確定の Enter がキーハンドラに届いた回数を数える。
 *
 * **ここが 0 でなくなったら、日本語入力でフォーム送信が暴発する。**
 * ブラウザは変換中の keydown にも `isComposing: true` を立てて配信するため、
 * DOM にリスナを足して観測しても抑制の有無を区別できない。
 * テーマの `onKeyDown` に実際に届いたかどうかだけが、抑制が効いている証拠になる。
 */
export function ImeProbe() {
  const { Input, TextArea } = useNoviTheme()
  const [inputEnters, setInputEnters] = useState(0)
  const [textareaEnters, setTextareaEnters] = useState(0)

  return (
    <Preview className="flex-col items-stretch gap-4">
      <div className="flex w-full max-w-sm flex-col gap-2">
        <Input
          label="Input"
          aria-label="IME 計測用の入力"
          onKeyDown={(event) => {
            if (event.key === 'Enter') setInputEnters((n) => n + 1)
          }}
        />
        <p data-testid="input-enters" className="text-[var(--novi-color-fg)]">
          {inputEnters}
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2">
        <TextArea
          label="TextArea"
          rows={2}
          onKeyDown={(event) => {
            if (event.key === 'Enter') setTextareaEnters((n) => n + 1)
          }}
        />
        <p data-testid="textarea-enters" className="text-[var(--novi-color-fg)]">
          {textareaEnters}
        </p>
      </div>
    </Preview>
  )
}
