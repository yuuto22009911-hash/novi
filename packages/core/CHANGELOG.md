# @novi-ui/core

## 0.1.1

### Patch Changes

- 30e59a9: 契約の JSDoc に `@a11y` と `@keywords` を追加した。
  
  型定義に含まれるためエディタの補完でも読める。実行時の API は変わらない。
  
  これらは AI 向け出力（`llms.txt` / `@novi-ui/mcp`）の生成元になる。
  アクセシビリティ注記を契約に置くことで、docs・llms・MCP の3箇所が
  同じ記述を読むようになり、書き分けによるズレが起きなくなる。
- ac225c2: Tabs と Toast の JSDoc の使用例を実装に合わせた。
  
  Tabs の例は `<Tab>` / `<TabPanel>` を使っていたが、実体は `TabItem` / `TabContent`。
  そのまま写すとコンパイルが通らない。Toast の例は `toast.add(...)` とだけ書かれており、
  `toast` の作り方（`createToastQueue()`）が示されていなかった。
  
  例は最も忠実に真似される部分なので、間違っていると全員が同じ間違いをする。
  再発しないよう、例が実在する export だけを使っているかをビルド時に検査するようにした。
