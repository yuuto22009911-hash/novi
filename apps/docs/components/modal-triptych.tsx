import type { ReactNode } from 'react'
import stageClasses from '../.generated/modal-stage-classes.json'
import { THEME_NAMES, type ThemeName, themeRegistry } from '../lib/theme-registry'
import { CodeExample } from './code-example'
import { ModalStageFrame } from './modal-stage-frame'

/**
 * トップの主役。**同じ JSX の Modal を3テーマで「開いた状態」で並べる。**
 *
 * 本物の `<Modal isOpen>` を3つ同時に置くことはできない。RAC の ModalOverlay は
 * 開くたびに外側を aria-hidden にしフォーカスを閉じ込めるので、3つ開けば
 * ページ全体が支援技術から消え、最後の1つだけが操作できる状態になる。
 *
 * そこで見本は**テーマが export する `modalStyles` / `buttonStyles` の slot クラス**で
 * 静的に組む。クラスはビルド時に本物から書き出した JSON（generate-modal-stage.mjs）
 * なので、色・寸法・余白・書体はすべて本物と同じ値が当たる。
 * 手で書いているのは slot の「組み合わせ方」だけで、それが各テーマの
 * `modal.tsx` と一致することを e2e（modal-stage.spec.ts）が実物と突き合わせて守る。
 *
 * サーバーコンポーネントなのは意図。ファーストビューのために3テーマ分の JS を
 * hydration すると TBT が 100ms 以上悪化した。JS が要るのはスキーム属性を
 * 付ける枠（ModalStageFrame）だけに絞る。
 */

type StageClasses = {
  modal: Partial<
    Record<'backdrop' | 'panel' | 'header' | 'title' | 'closeButton' | 'body' | 'footer', string>
  >
  button: { root: string; label: string }
}
const CLASSES = stageClasses as Record<ThemeName, StageClasses>

const TITLE = '注文を確定しますか'
const BODY = '在庫を引き当てて、確認メールを送ります。この操作は取り消せません。'
const CONFIRM = '確定する'

const CODE = `<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
  <ModalTitle>${TITLE}</ModalTitle>
  <ModalBody>${BODY}</ModalBody>
  <ModalFooter>
    <Button color="primary">${CONFIRM}</Button>
  </ModalFooter>
</Modal>`

const STRUCTURE: Record<ThemeName, string> = {
  raster: '中央に浮かぶ。地を暗転させ、閉じるは右上の ✕',
  tactile: '下からせり上がるシート。閉じるはフッターに全幅で',
  flatlay: '紙ごと差し替わる。左上の「← 戻る」で前の紙に戻る',
}

/** 見本の下に敷く「元のページ」。backdrop の暗転や差し替えが見えるようにする */
function PageBehind() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-[var(--novi-gap-stack)] px-[var(--novi-pad-surface-x)] py-[var(--novi-pad-surface-y)]"
    >
      <div className="h-3 w-28 bg-[var(--novi-color-border)]" />
      <div className="flex flex-col gap-[var(--novi-gap-inline)]">
        <div className="h-2 w-full bg-[var(--novi-color-subtle)]" />
        <div className="h-2 w-5/6 bg-[var(--novi-color-subtle)]" />
        <div className="h-2 w-2/3 bg-[var(--novi-color-subtle)]" />
      </div>
      <div className="flex gap-[var(--novi-gap-inline)]">
        <div className="h-8 w-24 border border-[var(--novi-color-border)]" />
        <div className="h-8 w-24 bg-[var(--novi-color-subtle)]" />
      </div>
    </div>
  )
}

/** 押せない「ボタン」。本物と同じ buttonStyles を当てる */
function Confirm({ name }: { name: ThemeName }) {
  const b = CLASSES[name].button
  return (
    <span data-slot="root" className={b.root}>
      <span data-slot="label" className={b.label}>
        {CONFIRM}
      </span>
    </span>
  )
}

function Frame({ name, children }: { name: ThemeName; children: ReactNode }) {
  const m = CLASSES[name].modal
  return (
    <div data-slot="backdrop" className={m.backdrop}>
      <div data-slot="panel" className={m.panel}>
        {children}
      </div>
    </div>
  )
}

/* 以下3つは各テーマの modal.tsx の組み合わせ方の写し。slot の並びを変えるなら本物を先に変える */

function RasterModal() {
  const m = CLASSES.raster.modal
  return (
    <Frame name="raster">
      <div className="outline-none">
        <div data-slot="header" className={m.header}>
          <div data-slot="title" className={m.title}>
            {TITLE}
          </div>
          <span data-slot="closeButton" className={m.closeButton}>
            <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
        </div>
        <div data-slot="body" className={m.body}>
          {BODY}
        </div>
        <div data-slot="footer" className={m.footer}>
          <Confirm name="raster" />
        </div>
      </div>
    </Frame>
  )
}

function TactileModal() {
  const m = CLASSES.tactile.modal
  return (
    <Frame name="tactile">
      <div className="outline-none flex flex-col">
        <div
          aria-hidden="true"
          className="mx-auto mt-2 mb-1 h-1 w-9 shrink-0 rounded-[var(--novi-radius-full)] bg-[var(--novi-color-border)]"
        />
        <div data-slot="title" className={m.title}>
          {TITLE}
        </div>
        <div data-slot="body" className={m.body}>
          {BODY}
        </div>
        <div data-slot="footer" className={m.footer}>
          <Confirm name="tactile" />
          <span data-slot="closeButton" className={m.closeButton}>
            閉じる
          </span>
        </div>
      </div>
    </Frame>
  )
}

function FlatlayModal() {
  const m = CLASSES.flatlay.modal
  return (
    <Frame name="flatlay">
      <div className="outline-none flex flex-col grow">
        <div data-slot="header" className={m.header}>
          <span data-slot="closeButton" className={m.closeButton}>
            <span aria-hidden="true" className="shrink-0 font-mono">
              ←
            </span>
            戻る
          </span>
          <div data-slot="title" className={m.title}>
            {TITLE}
          </div>
        </div>
        <div data-slot="body" className={m.body}>
          {BODY}
        </div>
        <div data-slot="footer" className={m.footer}>
          <Confirm name="flatlay" />
        </div>
      </div>
    </Frame>
  )
}

const OPEN_MODAL: Record<ThemeName, () => ReactNode> = {
  raster: RasterModal,
  tactile: TactileModal,
  flatlay: FlatlayModal,
}

function Stage({ name }: { name: ThemeName }) {
  const meta = themeRegistry[name]
  const Open = OPEN_MODAL[name]

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="font-medium text-sm">{meta.label}</span>
        <span className="text-site-muted text-xs leading-[1.6]">{STRUCTURE[name]}</span>
      </div>
      <ModalStageFrame theme={name} label={`${meta.label} の Modal。${STRUCTURE[name]}`}>
        <PageBehind />
        <Open />
      </ModalStageFrame>
    </div>
  )
}

export function ModalTriptych() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 sm:grid-cols-3">
        {THEME_NAMES.map((name) => (
          <Stage key={name} name={name} />
        ))}
      </div>
      <CodeExample
        code={CODE}
        imports={['Button', 'Modal', 'ModalBody', 'ModalFooter', 'ModalTitle']}
      />
    </div>
  )
}
