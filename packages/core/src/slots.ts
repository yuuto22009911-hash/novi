/**
 * slot 契約の型ヘルパ。
 *
 * core は「コンポーネントを構成する部位の名前」だけを決め、JSX は決めない。
 * これによりテーマは DOM 構造を完全に自由に組めるのに、公開 API は同一に保たれる。
 *
 * 全テーマは slot に対応する要素へ `data-slot="<名前>"` を出力する義務がある。
 * これ1つで、テスト・視覚回帰・ユーザーの CSS 上書き・AI の構造理解がすべて
 * テーマ横断で成立する。
 */

/**
 * slot 名の集合から `tv()` の slots オブジェクトの型を作る。
 * `R` に指定した slot は必須、それ以外は任意になる。
 *
 * テーマは必須 slot 以外を描画しなくてよいが、
 * 語彙の外の名前を発明してはならない。
 *
 * @example
 * const slots: SlotMap<typeof modalSlots, ModalRequiredSlot> = {
 *   backdrop: 'fixed inset-0 bg-[--novi-color-overlay]',
 *   panel: 'bg-[--novi-color-bg] border border-[--novi-color-border]',
 *   body: 'px-6 py-4',
 *   // header は任意 slot なので省略できる
 *   // wrapper のような語彙外のキーはコンパイルエラーになる
 * }
 */
export type SlotMap<S extends readonly string[], R extends S[number] = never> = Record<R, string> &
  Partial<Record<Exclude<S[number], R>, string>>

/**
 * ユーザー向け `classNames` prop の型。
 *
 * キーが slot 名と一致するため、**テーマを差し替えてもこの記述は壊れない**。
 * npm 配布における「コードを所有できない」という不満に対する回答のひとつ。
 *
 * @example
 * <Modal classNames={{ panel: 'max-w-2xl', footer: 'justify-start' }} />
 */
export type ClassNames<S extends readonly string[]> = Partial<Record<S[number], string>>
