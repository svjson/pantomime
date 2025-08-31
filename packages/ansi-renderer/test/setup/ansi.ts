import { expect } from 'vitest'

const stripAnsi = (s: string) =>
  s
    .replace(/\x1b/g, '\\x1b')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')

expect.extend({
  toEqualAnsi(received: string, expected: string) {
    const pass = received === expected
    return {
      pass,
      message: () =>
        `Expected:\n  ${stripAnsi(expected)}\nReceived:\n  ${stripAnsi(received)}`,
      actual: stripAnsi(received),
      expected: stripAnsi(expected),
    }
  },
})

declare module 'vitest' {
  // typing sugar
  interface Assertion<T = any> {
    toEqualAnsi(expected: string): T
  }
}
