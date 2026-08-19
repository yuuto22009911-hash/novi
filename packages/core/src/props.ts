/**
 * 全コンポーネント共通の基底 props。
 *
 * `classNames` は**ここに置かない**。slot 語彙がコンポーネントごとに異なるため、
 * 基底で `Record<string, string>` として持つと派生側の型が緩くなり、
 * 語彙外のキーを弾けなくなる。各コンポーネントが
 * `classNames?: ClassNames<typeof xxxSlots>` を自分で宣言する。
 *
 * @example
 * export interface ButtonProps extends NoviBaseProps {
 *   variant?: NoviVariant
 *   classNames?: ClassNames<typeof buttonSlots>
 * }
 */
export interface NoviBaseProps {
  /** ルート要素に付与する追加クラス */
  className?: string
  /** ルート要素の id */
  id?: string
}
