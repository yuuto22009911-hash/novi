/**
 * 中間表現（`component-index.json`）のスキーマ。
 *
 * docs の props 表・`llms.txt`・MCP がこの1ファイルを読む（ADR-A1）。
 * 形が変わると全出力先に波及するため、**形の定義をここ1箇所に固定する**。
 *
 * 生成時（ビルドを落とす）と MCP のテスト（同梱物の検証）の両方から使う。
 * 検証を出力先ごとに書くと、片方だけ緩くなって欠損が通り抜ける。
 *
 * バリデータは依存を持たない。IR を読むだけのために zod を入れると、
 * MCP の依存が増えて ADR-A3（読み取り専用・最小依存）と噛み合わない。
 */

/** @param {unknown} v */
const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)

/** @param {unknown} v */
const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== ''

/**
 * IR を検証し、違反の一覧を返す。空配列なら適合。
 *
 * 例外を投げずに一覧で返すのは、1回の実行で全部の欠損を見せるため。
 * 1件ずつ落ちると、直しては落ちるを繰り返すことになる。
 *
 * @param {unknown} index
 * @returns {string[]}
 */
export function validateComponentIndex(index) {
  /** @type {string[]} */
  const errors = []
  const push = (message) => errors.push(message)

  if (!isPlainObject(index)) return ['IR がオブジェクトではありません']

  if (!isNonEmptyString(index.version)) push('version: 空でない文字列が必要です')

  // --- conventions ---
  if (!isPlainObject(index.conventions)) {
    push('conventions: オブジェクトが必要です')
  } else {
    const { noProvider, emitsDataSlot, propNaming } = index.conventions
    // 値そのものを検査する。false になったら llms.txt の冒頭の記述が嘘になる
    if (noProvider !== true) push('conventions.noProvider: true でなければなりません')
    if (emitsDataSlot !== true) push('conventions.emitsDataSlot: true でなければなりません')
    if (!isPlainObject(propNaming)) {
      push('conventions.propNaming: オブジェクトが必要です')
    } else {
      for (const [from, to] of [
        ['disabled', 'isDisabled'],
        ['onClick', 'onPress'],
      ]) {
        if (propNaming[from] !== to) {
          push(`conventions.propNaming.${from}: '${to}' でなければなりません`)
        }
      }
    }
  }

  // --- vocabularies / tokenTypes ---
  const VOCABULARIES = ['variants', 'sizes', 'colors', 'radii']
  if (!isPlainObject(index.vocabularies)) {
    push('vocabularies: オブジェクトが必要です')
  } else {
    for (const key of VOCABULARIES) {
      const values = index.vocabularies[key]
      if (!Array.isArray(values) || values.length === 0 || !values.every(isNonEmptyString)) {
        push(`vocabularies.${key}: 空でない文字列の配列が必要です`)
      }
    }
  }

  const TOKEN_TYPES = ['NoviVariant', 'NoviSize', 'NoviColor', 'NoviRadius']
  if (!isPlainObject(index.tokenTypes)) {
    push('tokenTypes: オブジェクトが必要です')
  } else {
    for (const key of TOKEN_TYPES) {
      if (!isNonEmptyString(index.tokenTypes[key])) {
        push(`tokenTypes.${key}: 展開後の型が必要です`)
      }
    }
  }

  // --- themes ---
  const themeKeys = isPlainObject(index.themes) ? Object.keys(index.themes) : []
  if (themeKeys.length === 0) {
    push('themes: 1つ以上のテーマが必要です')
  } else {
    for (const [key, theme] of Object.entries(index.themes)) {
      const at = `themes.${key}`
      if (!isPlainObject(theme)) {
        push(`${at}: オブジェクトが必要です`)
        continue
      }
      for (const field of ['pkg', 'label', 'description']) {
        if (!isNonEmptyString(theme[field])) push(`${at}.${field}: 空でない文字列が必要です`)
      }
      errors.push(...validateDesignRules(theme.designRules, `${at}.designRules`))
      errors.push(...validateCssVariables(theme.cssVariables, `${at}.cssVariables`))
    }
  }

  // --- components ---
  if (!Array.isArray(index.components) || index.components.length === 0) {
    push('components: 1件以上の配列が必要です')
    return errors
  }

  const seen = new Set()
  for (const component of index.components) {
    if (!isPlainObject(component)) {
      push('components[]: オブジェクトが必要です')
      continue
    }

    const name = isNonEmptyString(component.name) ? component.name : '(名前なし)'
    const at = `components.${name}`
    if (!isNonEmptyString(component.name)) push('components[].name: 空でない文字列が必要です')
    if (seen.has(name)) push(`${at}: 契約名が重複しています`)
    seen.add(name)

    // AI 向け出力の質に直結する項目。欠けたまま配信すると AI が自分で埋める
    for (const field of ['summary', 'a11y', 'example', 'importName']) {
      if (!isNonEmptyString(component[field])) push(`${at}.${field}: 空でない文字列が必要です`)
    }
    if (component.notes !== null && !isNonEmptyString(component.notes)) {
      push(`${at}.notes: 文字列か null が必要です`)
    }

    // 検索語が無いと MCP の検索が名前の一致しか返せず、未実装と区別できなくなる
    if (
      !Array.isArray(component.keywords) ||
      component.keywords.length === 0 ||
      !component.keywords.every(isNonEmptyString)
    ) {
      push(`${at}.keywords: 空でない文字列の配列が必要です`)
    }

    // キーボード操作表。対話しない部品は空配列でよい
    if (
      !Array.isArray(component.keyboard) ||
      !component.keyboard.every(
        (k) => isPlainObject(k) && isNonEmptyString(k.keys) && isNonEmptyString(k.action),
      )
    ) {
      push(`${at}.keyboard: { keys, action } の配列が必要です`)
    }

    if (!Array.isArray(component.implementedBy)) {
      push(`${at}.implementedBy: 配列が必要です`)
    } else {
      for (const theme of component.implementedBy) {
        if (!themeKeys.includes(theme)) push(`${at}.implementedBy: 未知のテーマ '${theme}'`)
      }
    }

    errors.push(...validateProps(component.props, `${at}.props`))
    errors.push(...validateSlots(component.slots, `${at}.slots`))
  }

  return errors
}

/** @param {unknown} props @param {string} at @returns {string[]} */
function validateProps(props, at) {
  if (!Array.isArray(props) || props.length === 0) return [`${at}: 1件以上の配列が必要です`]

  const errors = []
  const seen = new Set()

  for (const prop of props) {
    if (!isPlainObject(prop)) {
      errors.push(`${at}[]: オブジェクトが必要です`)
      continue
    }
    if (!isNonEmptyString(prop.name)) {
      errors.push(`${at}[].name: 空でない文字列が必要です`)
      continue
    }
    if (seen.has(prop.name)) errors.push(`${at}.${prop.name}: prop 名が重複しています`)
    seen.add(prop.name)

    if (!isNonEmptyString(prop.type)) errors.push(`${at}.${prop.name}.type: 型が必要です`)
    if (typeof prop.required !== 'boolean') {
      errors.push(`${at}.${prop.name}.required: 真偽値が必要です`)
    }
    // doc は空でよい。すべての prop に説明があるとは限らない
    if (typeof prop.doc !== 'string') errors.push(`${at}.${prop.name}.doc: 文字列が必要です`)
  }

  return errors
}

/** @param {unknown} slots @param {string} at @returns {string[]} */
function validateSlots(slots, at) {
  if (!isPlainObject(slots)) return [`${at}: オブジェクトが必要です`]

  const errors = []
  const { all, required } = slots

  if (!Array.isArray(all) || all.length === 0 || !all.every(isNonEmptyString)) {
    errors.push(`${at}.all: 空でない文字列の配列が必要です`)
    return errors
  }
  if (!Array.isArray(required) || !required.every(isNonEmptyString)) {
    errors.push(`${at}.required: 文字列の配列が必要です`)
    return errors
  }

  // 必須 slot が全体に含まれていないと、契約テストが検査できない対象を要求することになる
  for (const slot of required) {
    if (!all.includes(slot)) errors.push(`${at}.required: '${slot}' が all にありません`)
  }

  return errors
}

/**
 * 上書きできる CSS 変数の一覧。
 *
 * 名前が実際の出力とズレると利用者の上書きが黙って効かなくなるため、
 * 形だけでなく `--novi-` で始まることまで見る。
 *
 * @param {unknown} groups @param {string} at @returns {string[]}
 */
function validateCssVariables(groups, at) {
  if (!Array.isArray(groups) || groups.length === 0) return [`${at}: 1件以上の配列が必要です`]

  const errors = []

  for (const group of groups) {
    if (!isPlainObject(group)) {
      errors.push(`${at}[]: オブジェクトが必要です`)
      continue
    }
    for (const field of ['id', 'label', 'description']) {
      if (!isNonEmptyString(group[field])) {
        errors.push(`${at}[${group.id ?? '?'}].${field}: 空でない文字列が必要です`)
      }
    }
    if (!Array.isArray(group.variables) || group.variables.length === 0) {
      errors.push(`${at}[${group.id ?? '?'}].variables: 1件以上の配列が必要です`)
      continue
    }
    for (const variable of group.variables) {
      if (!isPlainObject(variable)) {
        errors.push(`${at}[${group.id}].variables[]: オブジェクトが必要です`)
        continue
      }
      if (!isNonEmptyString(variable.name) || !variable.name.startsWith('--novi-')) {
        errors.push(`${at}[${group.id}].variables[].name: --novi- で始まる名前が必要です`)
      }
      if (!isNonEmptyString(variable.value)) {
        errors.push(`${at}[${group.id}].variables[${variable.name ?? '?'}].value: 必要です`)
      }
      if (variable.dark !== null && !isNonEmptyString(variable.dark)) {
        errors.push(`${at}[${group.id}].variables[${variable.name ?? '?'}].dark: 文字列か null`)
      }
    }
  }

  return errors
}

/** @param {unknown} rules @param {string} at @returns {string[]} */
function validateDesignRules(rules, at) {
  if (!isPlainObject(rules)) return [`${at}: オブジェクトが必要です`]

  const errors = []

  if (!isPlainObject(rules.numeric) || Object.keys(rules.numeric).length === 0) {
    errors.push(`${at}.numeric: 1つ以上の数値定義が必要です`)
  }
  if (!isNonEmptyString(rules.colorRule)) errors.push(`${at}.colorRule: 空でない文字列が必要です`)

  if (!Array.isArray(rules.prohibited) || rules.prohibited.length === 0) {
    errors.push(`${at}.prohibited: 1件以上の配列が必要です`)
  } else {
    for (const rule of rules.prohibited) {
      if (!isPlainObject(rule)) {
        errors.push(`${at}.prohibited[]: オブジェクトが必要です`)
        continue
      }
      for (const field of ['id', 'pattern', 'reason']) {
        if (!isNonEmptyString(rule[field])) {
          errors.push(`${at}.prohibited[${rule.id ?? '?'}].${field}: 空でない文字列が必要です`)
        }
      }
    }
  }

  if (!Array.isArray(rules.exceptions)) {
    errors.push(`${at}.exceptions: 配列が必要です`)
  } else {
    for (const exception of rules.exceptions) {
      if (!isPlainObject(exception)) {
        errors.push(`${at}.exceptions[]: オブジェクトが必要です`)
        continue
      }
      // 理由のない例外を通すと、デザイン規律の検査そのものが形骸化する
      if (!isNonEmptyString(exception.file)) errors.push(`${at}.exceptions[].file: 必要です`)
      if (!isNonEmptyString(exception.reason)) {
        errors.push(`${at}.exceptions[${exception.file ?? '?'}].reason: 理由の明記が必要です`)
      }
      if (!Array.isArray(exception.rules) || exception.rules.length === 0) {
        errors.push(`${at}.exceptions[${exception.file ?? '?'}].rules: 1件以上必要です`)
      }
    }
  }

  return errors
}
