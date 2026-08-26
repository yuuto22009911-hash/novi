/** `scan-design-rules.mjs` の型。変異テスト（design-rules.test.ts）が import する。 */
export interface DesignRuleViolation {
  file: string
  line: number
  rule: string
  found: string
  message: string
  text: string
}

export declare function scanSource(fileName: string, source: string): DesignRuleViolation[]
export declare function checkExceptionComment(fileName: string, source: string): string | null
