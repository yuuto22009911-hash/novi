/** `design-rules.data.mjs` の型。変異テスト（design-rules.test.ts）が import する。 */
export interface DesignRule {
  id: string
  prohibited: string
  pattern: RegExp
  message: string
}

export interface DesignRuleException {
  rules: string[]
  reason: string
}

export declare const DESIGN_RULES: DesignRule[]
export declare const DESIGN_RULE_EXCEPTIONS: Record<string, DesignRuleException>
export declare const EXCEPTION_COMMENT_MARKER: string
export declare const COLOR_RULE: string
