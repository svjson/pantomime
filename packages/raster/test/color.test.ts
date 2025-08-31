import { describe, expect, it } from 'vitest'

import { rgb, rgba } from '@src/index'

describe('rgb', () => {
  it('should return a Color instance', () => {
    expect(rgb(50, 60, 70)).toEqual({
      r: 50,
      g: 60,
      b: 70,
      a: undefined,
    })
  })
})

describe('rgba', () => {
  it('should return a Color instance', () => {
    expect(rgba(50, 60, 70, 0.5)).toEqual({
      r: 50,
      g: 60,
      b: 70,
      a: 0.5,
    })
  })
})
