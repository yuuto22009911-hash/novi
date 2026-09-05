/**
 * 応答の**文面**を検査する。
 *
 * このサーバの価値は「正しい API を返すこと」と同じくらい
 * 「無いものを無いと言うこと」にある（ADR-A4）。後者は文面でしか検査できない。
 */
import { describe, expect, it } from 'vitest'
import type { ComponentIndex } from './index-data.js'
import { index } from './index-data.js'
import {
  createTools,
  getComponent,
  getDesignRules,
  listComponents,
  searchComponents,
} from './tools.js'

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

  it('キーボード操作を表で返し、対話しない部品には節を出さない', () => {
    expect(output).toContain('## キーボード')
    expect(output).toMatch(/- Enter \/ Space: 押す/)
    expect(getComponent('Badge')).not.toContain('## キーボード')
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
    // FileUpload は未実装（DatePicker が入るまではそちらで検査していた）
    const missing = getComponent('FileUpload')
    expect(missing).toContain('ありません')
    expect(missing).toContain('代用しないでください')
    expect(missing).toContain('react-aria-components')
    // Input は「ファイル添付の代替」ではない。候補として名前を押し出さない
    expect(missing).not.toContain('代わりに')
  })

  it('実装していないテーマを指定されたら、そのテーマでは使えないと答える', () => {
    const output = getComponent('Button', 'nonexistent')
    expect(output).toContain('実装されていません')
    expect(output).toContain('raster')
  })
})

describe('get_design_rules（AC-04-3 / FR-12）', () => {
  // テーマを列挙して回す。3本目を足しても検査対象に自動で入る。
  // 特定のテーマを名指しすると、追加したテーマが素通りする
  const themeNames = Object.keys(index.themes)

  it('2本以上のテーマを持つ（規則がテーマごとに違うことの前提）', () => {
    expect(themeNames.length).toBeGreaterThanOrEqual(2)
  })

  it.each(themeNames)('%s: 数値定義を返す', (theme) => {
    const output = getDesignRules(theme)
    const heights = index.themes[theme]?.designRules.numeric.controlHeights ?? {}
    for (const [size, px] of Object.entries(heights)) {
      expect(output, `${theme}/${size}`).toContain(`${size}=${px}`)
    }
  })

  it.each(themeNames)('%s: 禁止クラスを CI と同じ定義で返す', (theme) => {
    const output = getDesignRules(theme)
    for (const rule of index.themes[theme]?.designRules.prohibited ?? []) {
      expect(output).toContain(rule.pattern)
    }
  })

  it.each(themeNames)('%s: 色の扱いを返す', (theme) => {
    expect(getDesignRules(theme)).toContain('--novi-color-')
  })

  it.each(themeNames)('%s: 例外は理由付きで返す', (theme) => {
    const output = getDesignRules(theme)
    for (const exception of index.themes[theme]?.designRules.exceptions ?? []) {
      expect(output).toContain(exception.file)
      expect(output).toContain(exception.reason.slice(0, 12))
    }
  })

  it('テーマごとに違う規則を返す（1つの規則を使い回していない）', () => {
    const outputs = themeNames.map((t) => getDesignRules(t))
    expect(new Set(outputs).size).toBe(themeNames.length)
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
    const output = searchComponents('ファイルを添付させたい')
    expect(output).toContain('ありません')
    expect(output).toContain('代用しないでください')
    // 「近いもの」として実装済みコンポーネントを候補に挙げてはいけない
    expect(output).not.toContain('一致したコンポーネント')
  })

  it('未実装の語が実装済みの語に部分一致しても引っかからない', () => {
    // `toaster` が `toast` に当たると、無関係なものを Toast として答えてしまう
    // （Table が入るまでは `table` → `tab` で検査していた）
    const output = searchComponents('toaster の設定画面')
    expect(output).not.toContain('一致したコンポーネント')
  })

  it('table は Table に当たり、Tabs には当たらない', () => {
    const output = searchComponents('データを table で並べたい')
    expect(output).toContain('Table')
    expect(output).not.toMatch(/\bTabs\b/)
  })

  it('空の検索語には検索語を求める', () => {
    expect(searchComponents('   ')).toContain('検索語が空です')
  })

  it('一致した語を示して、なぜその候補なのかを説明する', () => {
    expect(searchComponents('プルダウン')).toContain('一致した語')
  })

  it('複数当たったときは具体的な語で当たったものを先に出す', () => {
    // 「ラジオボタン」は「ボタン」を含むため Button にも当たる。
    // より長い語で当たった Radio を先に出す
    const output = searchComponents('ラジオボタンを出したい')
    expect(output).toContain('**Button**')
    expect(output.indexOf('**Radio**')).toBeLessThan(output.indexOf('**Button**'))
  })
})

/**
 * 同梱データでは再現できない状態を、IR を差し替えて検査する。
 *
 * 「契約はあるがどのテーマも実装していない」「例外が1つも無いテーマ」は
 * 今は起きないが、テーマを増やしたときに必ず通る道。
 * 通らない道として書かれたコードは、通ったときに初めて壊れていると分かる。
 */
describe('テーマがまだ実装していない状態', () => {
  const fixture: ComponentIndex = {
    ...index,
    themes: {
      minimal: {
        pkg: '@novi-ui/minimal',
        label: 'Minimal',
        description: 'テスト用',
        designRules: {
          numeric: { controlHeights: { sm: 32 } },
          prohibited: [{ id: 'shadow', pattern: 'shadow-*', reason: '影は使わない' }],
          exceptions: [],
          colorRule: '色は --novi-color-* を経由する',
        },
      },
    },
    components: [
      {
        name: 'Button',
        summary: 'ボタン。',
        notes: null,
        a11y: 'Enter / Space で発火する',
        keywords: ['ボタン'],
        implementedBy: ['minimal'],
        importName: 'Button',
        props: [{ name: 'variant', required: false, type: 'NoviVariant', doc: '' }],
        example: '<Button>保存</Button>',
        keyboard: [{ keys: 'Enter / Space', action: '押す' }],
        slots: { all: ['root', 'label'], required: ['root', 'label'] },
      },
      {
        name: 'DatePicker',
        summary: '日付を選ぶ。',
        notes: null,
        a11y: '矢印キーで日を移動する',
        keywords: ['日付', 'datepicker'],
        implementedBy: [],
        importName: 'DatePicker',
        props: [{ name: 'value', required: false, type: 'string', doc: '' }],
        example: '<DatePicker />',
        keyboard: [],
        slots: { all: ['root'], required: ['root'] },
      },
    ],
  }

  const tools = createTools(fixture)

  it('一覧では未実装と明示する', () => {
    const output = tools.listComponents()
    expect(output).toContain('DatePicker')
    expect(output).toContain('**未実装**')
  })

  it('詳細を求められても使えないと答え、代替を提案しない', () => {
    const output = tools.getComponent('DatePicker')
    expect(output).toContain('どのテーマも実装していません')
    expect(output).toContain('代用しないでください')
  })

  it('検索の候補に出さない', () => {
    const output = tools.searchComponents('日付を選ばせたい')
    expect(output).not.toContain('一致したコンポーネント')
  })

  it('例外が1つも無いテーマでは「なし」と答える', () => {
    const output = tools.getDesignRules('minimal')
    expect(output).toContain('## 例外')
    expect(output).toContain('なし')
  })
})

describe('IR が壊れている場合', () => {
  // スキーマ検証を通れば起きないが、通らなかったときに黙って嘘をつかせない
  const broken = createTools({
    ...index,
    components: index.components.map((c) =>
      c.name === 'Button' ? { ...c, implementedBy: ['ghost-theme'] } : c,
    ),
  })

  it('存在しないテーマを指しているとき、import 先を作らずに不明と答える', () => {
    const output = broken.getComponent('Button')
    expect(output).toContain('不明なテーマ')
    expect(output).not.toContain("from '@novi-ui/ghost-theme'")
  })

  it('一覧でも不明なテーマとして出す', () => {
    expect(broken.listComponents()).toContain('不明なテーマ')
  })
})
