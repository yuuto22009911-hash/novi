/**
 * 実効タップ領域を 44×44px 以上にする共通断片（G5 / AC-01-5）。
 *
 * **視覚寸法とタップ寸法を分離する。** Checkbox の箱（24px）や Breadcrumbs のリンクは
 * 小さく見えてよいが、指が当たる範囲まで小さいと押し直しが起きる。
 * 擬似要素で当たり判定だけを広げると、見た目を変えずに下限を満たせる。
 *
 * `before:` を使うのは、内容（label・アイコン）と重ならない層を1つ増やせるため。
 * `-z-10` は置かない — 重なると擬似要素がクリックを受けなくなる環境がある。
 */
export const tapTarget = [
  'relative',
  // 当たり判定のみ。背景を持たないので視覚には現れない
  'before:absolute before:left-1/2 before:top-1/2',
  'before:-translate-x-1/2 before:-translate-y-1/2',
  'before:size-[max(100%,44px)] before:content-[""]',
].join(' ')

/**
 * 高さが既に 44px 以上ある要素（md / lg のボタン等）にも付けてよい。
 * `max(100%,44px)` なので、大きい方が採られて当たり判定は広がらない。
 */
