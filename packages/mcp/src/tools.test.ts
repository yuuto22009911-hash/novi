/**
 * 応答の**文面**を検査する。
 *
 * このサーバの価値は「正しい API を返すこと」と同じくらい
 * 「無いものを無いと言うこと」にある（ADR-A4）。後者は文面でしか検査できない。
 */
import { describe, expect, it } from 'vitest'
import { index } from './index-data.js'
import { getComponent, getDesignRules, listComponents, searchComponents } from './tools.js'

describe('list_components（AC-04-1）', () => {
  const output = listComponents()

  it('全コンポーネントの名前と1行説明を返す', () => {
    for (const component of index.components) {
      expect(output).toContain(component.name)
      expect(output).toContain(component.summary)
    }
  })

  it('実装テーマを示す', () => {
    expect(output).toContain('@novi-ui/raster')
  })

  it('一覧が閉じた集合であることを明示する', () => {
    expect(output).toContain('未実装')
  })
})

describe('get_component（AC-04-2）', () => {
  const output = getComponent('Button')

  it('props / slot / 使用例 / a11y 注記をすべて返す', () => {
    expect(output).toContain('isDisabled')
    expect(output).toContain('data-slot')
    expect(output).toContain('startContent')
    expect(output).toContain('<Button')
    expect(output).toContain('Enter / Space')
  })

  it('import 文を実際に使える形で示す', () => {
    expect(output).toContain("import { Button } from '@novi-ui/raster'")
  })

  it('トークン型を取りうる値に展開する', () => {
    // `NoviVariant` のままでは、どの値が通るのか分からない
    expect(output).not.toContain('NoviVariant')
    expect(output).toContain("'solid'")
  })

  it('バージョンを添えて、古い情報かどうかを判別できるようにする', () => {
    expect(output).toContain(index.version)
  })

  it('大文字小文字の違いは同じものとして扱う', () => {
    expect(getComponent('button')).toBe(output)
  })

  it('未知の名前には未実装と答え、代替を提案しない', () => {
    const missing = getComponent('DatePicker')
    expect(missing).toContain('ありません')
    expect(missing).toContain('代用しないでください')
    expect(missing).toContain('react-aria-components')
    // Select は「日付選択の代替」ではない。候補として名前を押し出さない
    expect(missing).not.toContain('代わりに')
  })

  it('実装していないテーマを指定されたら、そのテーマでは使えないと答える', () => {
    const output = getComponent('Button', 'nonexistent')
    expect(output).toContain('実装されていません')
    expect(output).toContain('raster')
  })
})

describe('get_design_rules（AC-04-3 / FR-12）', () => {
  const output = getDesignRules('raster')

  it('数値定義を返す', () => {
    expect(output).toContain('sm=32')
    expect(output).toContain('md=40')
    expect(output).toContain('lg=48')
  })

  it('禁止クラスを CI と同じ定義で返す', () => {
    for (const rule of index.themes.raster?.designRules.prohibited ?? []) {
      expect(output).toContain(rule.pattern)
    }
  })

  it('色の扱いを返す', () => {
    expect(output).toContain('--novi-color-')
  })

  it('例外は理由付きで返す', () => {
    expect(output).toContain('spinner.styles.ts')
    expect(output).toContain('ADR-R2')
  })

  it('未知のテーマには利用できるテーマを挙げる', () => {
    const output = getDesignRules('material')
    expect(output).toContain('ありません')
    expect(output).toContain('raster')
  })
})

describe('search_components（AC-04-4 / FR-06 / ADR-A4）', () => {
  it('検索語から実装済みのコンポーネントを見つける', () => {
    expect(searchComponents('プルダウンで選ばせたい')).toContain('Select')
    expect(searchComponents('モーダルを出したい')).toContain('Modal')
    expect(searchComponents('トグルで切り替えたい')).toContain('Switch')
  })

  it('助詞や活用で語が分断されていても見つける', () => {
    // 「一覧から選ぶ」は「一覧から1つ選ばせたい」に文字列としては現れない
    expect(searchComponents('一覧から1つ選ばせたい')).toContain('Select')
    expect(searchComponents('よくある質問を並べたい')).toContain('Accordion')
  })

  it('英語でも見つかる', () => {
    expect(searchComponents('I need a tooltip')).toContain('Tooltip')
  })

  it('未実装のものには代替を提案しない（ADR-A4）', () => {
    const output = searchComponents('日付を選ばせたい')
    expect(output).toContain('ありません')
    expect(output).toContain('代用しないでください')
    // 「近いもの」として実装済みコンポーネントを候補に挙げてはいけない
    expect(output).not.toContain('一致したコンポーネント')
  })

  it('未実装の語が実装済みの語に部分一致しても引っかからない', () => {
    // `table` が `tab` に当たると、Table を Tabs として答えてしまう
    const output = searchComponents('データを table で並べたい')
    expect(output).not.toContain('一致したコンポーネント')
  })

  it('空の検索語には検索語を求める', () => {
    expect(searchComponents('   ')).toContain('検索語が空です')
  })

  it('一致した語を示して、なぜその候補なのかを説明する', () => {
    expect(searchComponents('プルダウン')).toContain('一致した語')
  })
})
