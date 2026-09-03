'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import type { ThemeName } from '../lib/theme-registry'
import { useThemeState } from '../lib/use-novi-theme'
import { type ColorEntry, getTheme } from './token-tables'

/**
 * 試着室はライブラリ本体を引き込むので、この chunk には入れない。
 * `lazy()` の import() はクライアント側で描画時に要求されるため、
 * 見本帳の一覧（IR の JSON だけで描ける）を待たせない。
 */
const FittingRoom = lazy(() => import('./fitting-room'))

/**
 * 見本帳の中身。**ヘッダーのモデル切替に追従し、選択中のセットだけを見せる**。
 *
 * コード例が import 文を掛け替えるのと同じ流儀で、見本帳はセットごと掛け替わる。
 * ここで読むのは IR の JSON だけで、ライブラリ実装は引き込まない
 * （theme-registry の 900KB 事故と同じ轍を踏まないため）。
 */
const SET_INFO: Record<ThemeName, { setName: string; lede: string }> = {
  raster: {
    setName: 'Print Inks',
    lede: '印刷インク。全色が顔料・インクの実名を持ちます。紙（中立色）は染まらず、インクだけが替わります。紫・青緑・ピンクは意図的に入れていません。入れない色が、このモデルの性格を作ります。',
  },
  tactile: {
    setName: 'Textile Dyes',
    lede: '織物の染料。生地（中立色）まで選んだ色の色相にわずかに染まります。Print Inks とは色相の重複がなく、同じ系統の色でもモデルを替えると発色が変わります。',
  },
  flatlay: {
    setName: 'Stationery',
    lede: '机の上の事務道具。地は染まらず、罫線だけが選んだ色に染まります。彩度は三部作でいちばん低く、染料でも印刷インクでもない「褪せた実用品の色」を狙っています。',
  },
}

function scrollToFittingRoom() {
  const el = document.getElementById('fitting-room')
  if (el === null) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * 色ごとの見開き。左が light、右が dark。
 *
 * 面は `data-novi-theme` と `data-novi-color` を自分で宣言する。
 * スキーム切替に追従させないのは意図で、見開きは常に両面を見せる。
 * `data-testid="preview"` を付けないのも意図（視覚回帰の対象はデモだけ）。
 */
function ColorCard({
  theme,
  color,
  pairName,
  isDefault,
  isWorn,
  onWear,
}: {
  theme: string
  color: ColorEntry
  pairName: string
  isDefault: boolean
  isWorn: boolean
  onWear: (id: string) => void
}) {
  const faces = [
    { scheme: undefined, label: 'LIGHT' },
    { scheme: 'dark', label: 'DARK' },
  ] as const

  return (
    <div className="flex flex-col border border-site-border">
      <div className="grid grid-cols-2">
        {faces.map((face) => (
          <div
            key={face.label}
            data-novi-theme={theme}
            data-novi-color={color.id}
            {...(face.scheme === undefined ? {} : { 'data-novi-scheme': face.scheme })}
            className="flex flex-col gap-3 bg-[var(--novi-color-bg)] p-4"
          >
            <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--novi-color-muted)]">
              {face.label}
            </span>
            <span className="h-14 rounded-[var(--novi-radius-sm)] bg-[var(--novi-color-primary)]" />
            <span className="self-start rounded-[var(--novi-radius-sm)] bg-[var(--novi-color-secondary)] px-2 py-0.5 text-xs text-[var(--novi-color-secondary-fg)]">
              相方 {pairName}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 border-t border-site-border p-4">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">{color.name}</span>
          {isDefault && (
            <span className="font-mono text-[10px] tracking-[0.14em] text-site-accent">
              DEFAULT
            </span>
          )}
          <button
            type="button"
            aria-pressed={isWorn}
            onClick={() => {
              onWear(color.id)
              scrollToFittingRoom()
            }}
            className="ml-auto min-h-11 border border-site-border px-3 text-xs aria-pressed:bg-site-fg aria-pressed:text-site-bg"
          >
            {isWorn ? '着用中' : '着せる'}
          </button>
        </div>
        <p className="text-sm leading-[1.6] text-site-muted">{color.description}</p>
        <p className="font-mono text-xs text-site-muted">
          hue {color.hue} · {color.light.primary}
        </p>
      </div>
    </div>
  )
}

export function LookbookGallery() {
  const { theme } = useThemeState()
  const entry = getTheme(theme)
  const { setName, lede } = SET_INFO[theme]
  const nameOf = new Map(entry.colorSet.map((c) => [c.id, c.name]))
  const tone = entry.tone

  // 着せている色。モデルを替えたら、そのモデルの既定色に着替える
  // （前のモデルの色名はこのセットに存在しない）
  const [worn, setWorn] = useState(entry.defaultColor)
  useEffect(() => {
    setWorn(entry.defaultColor)
  }, [entry.defaultColor])

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="flex flex-wrap items-baseline gap-x-3 text-xl font-medium tracking-tight">
          {entry.label} — {setName}
          <span className="font-mono text-xs font-normal tracking-normal text-site-muted">
            トーン L{tone.light.l} / C{tone.light.c.toFixed(3)} · dark L{tone.dark.l} / C
            {tone.dark.c.toFixed(3)}
          </span>
        </h2>
        <p className="max-w-[40rem] text-base leading-[1.6] text-site-muted">{lede}</p>
      </div>

      {/* 予約高さは試着室の実測値に合わせる。読み込み中に下の一覧が跳ねないため */}
      <Suspense fallback={<div className="min-h-[36rem] sm:min-h-[24rem]" />}>
        <FittingRoom theme={theme} color={worn} colorSet={entry.colorSet} onChange={setWorn} />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        {entry.colorSet.map((color) => (
          <ColorCard
            key={color.id}
            theme={theme}
            color={color}
            pairName={nameOf.get(color.pair) ?? color.pair}
            isDefault={color.id === entry.defaultColor}
            isWorn={color.id === worn}
            onWear={setWorn}
          />
        ))}
      </div>
    </section>
  )
}
