/**
 * コードの表示枠。
 *
 * 横スクロールする領域はキーボードでも読めなければならない（WCAG 2.1.1）。
 * `section` + `aria-label` で暗黙のロールを region にし、タブ順に入れる。
 */
export function Code({ children, label = 'コード' }: { children: string; label?: string }) {
  return (
    <section
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: スクロール領域は WCAG 2.1.1 によりキーボードで読めるようにする必要がある
      tabIndex={0}
      className="overflow-x-auto border border-site-border bg-site-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-site-accent"
    >
      <pre className="p-4 text-xs leading-relaxed">
        <code>{children}</code>
      </pre>
    </section>
  )
}
