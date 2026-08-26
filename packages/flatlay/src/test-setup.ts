/**
 * jsdom は `Element.scrollIntoView` を実装しない。
 *
 * インフロー展開は開くたびにこれを呼ぶので（`styles/inflow.tsx`）、無いと
 * Select 以降の展開系がコンポーネントと無関係な理由で全滅する。
 * 呼ばれたこと自体を検査する `inflow.test.tsx` は、この上に自前の spy を被せる。
 */
Element.prototype.scrollIntoView = () => {}
