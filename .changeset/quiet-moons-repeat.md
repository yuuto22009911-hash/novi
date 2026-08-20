---
'@novi-ui/core': patch
---

Tabs と Toast の JSDoc の使用例を実装に合わせた。

Tabs の例は `<Tab>` / `<TabPanel>` を使っていたが、実体は `TabItem` / `TabContent`。
そのまま写すとコンパイルが通らない。Toast の例は `toast.add(...)` とだけ書かれており、
`toast` の作り方（`createToastQueue()`）が示されていなかった。

例は最も忠実に真似される部分なので、間違っていると全員が同じ間違いをする。
再発しないよう、例が実在する export だけを使っているかをビルド時に検査するようにした。
