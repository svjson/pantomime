import { describe, expect, it } from 'vitest'
import {
  areaOf,
  coordAdd,
  coordAddIn,
  coordRound,
  insideRect,
} from '@src/arithmetic'

describe('coordAdd', () => {
  it.each([
    [
      { x: 1, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: -1, y: 5 },
      { x: 2, y: 3 },
      { x: 1, y: 8 },
    ],
    [
      { x: 8, y: 8 },
      { x: 0, y: 0 },
      { x: 8, y: 8 },
    ],
    [
      { x: -1, y: -1 },
      { x: -2, y: -2 },
      { x: -3, y: -3 },
    ],
  ])('coordAdd(%o, %o) === %o', (a, b, expected) => {
    const origA = { ...a }
    const origB = { ...b }

    // When
    const result = coordAdd(a, b)

    // Then
    expect(result).toEqual(expected)
    expect(a).toEqual(origA)
    expect(b).toEqual(origB)
  })
})

describe('coordAddIn', () => {
  it.each([
    [
      { x: 1, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: -1, y: 5 },
      { x: 2, y: 3 },
      { x: 1, y: 8 },
    ],
    [
      { x: 8, y: 8 },
      { x: 0, y: 0 },
      { x: 8, y: 8 },
    ],
    [
      { x: -1, y: -1 },
      { x: -2, y: -2 },
      { x: -3, y: -3 },
    ],
  ])('coordAddIn(%o, %o) => a === %o', (a, b, expected) => {
    const origB = { ...b }

    // When
    coordAddIn(a, b)

    // Then
    expect(a).toEqual(expected)
    expect(b).toEqual(origB)
  })
})

describe('coordRound', () => {
  it.each([
    [
      { x: 1.1, y: 1.1 },
      { x: 1, y: 1 },
    ],
    [
      { x: 1.5, y: 1.5 },
      { x: 2, y: 2 },
    ],
    [
      { x: -1.5, y: -1.5 },
      { x: -1, y: -1 },
    ],
    [
      { x: -1.1, y: -1.1 },
      { x: -1, y: -1 },
    ],
    [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
    [
      { x: 0.4, y: 0.6 },
      { x: 0, y: 1 },
    ],
    [
      { x: -0.4, y: -0.6 },
      { x: -0, y: -1 },
    ],
  ])('coordRound(%o) === %o', (input, expected) => {
    const origInput = { ...input }

    // When
    const result = coordRound(input)

    // Then
    expect(result).toEqual(expected)
    expect(input).toEqual(origInput)
  })
})

describe('areaOf', () => {
  it.each([
    [{ w: 1, h: 1 }, 1],
    [{ w: 2, h: 3 }, 6],
    [{ w: 0, h: 10 }, 0],
    [{ w: 10, h: 0 }, 0],
    [{ w: 5, h: 5 }, 25],
    [{ x: 0, y: 0, w: 1, h: 1 }, 1],
    [{ x: 4, y: 10, w: 2, h: 3 }, 6],
    [{ x: 1, y: 4, w: 0, h: 10 }, 0],
    [{ x: 5, y: 8, w: 10, h: 0 }, 0],
    [{ x: 0, y: 9, w: 5, h: 5 }, 25],
  ])('areaOf(%o) === %d', (dim, expected) => {
    // When
    const result = areaOf(dim)

    // Then
    expect(result).toBe(expected)
  })
})

describe('insideRect', () => {
  it.each([
    [
      { x: 1, y: 1 },
      { x: 0, y: 0, w: 3, h: 3 },
    ],
    [
      { x: 0, y: 0 },
      { x: 0, y: 0, w: 3, h: 3 },
    ],
    [
      { x: 2, y: 2 },
      { x: 0, y: 0, w: 3, h: 3 },
    ],
    [
      { x: 1, y: 1 },
      { x: 1, y: 1, w: 1, h: 1 },
    ],
    [
      { x: 1.5, y: 1.5 },
      { x: 1, y: 1, w: 1, h: 1 },
    ],
    [
      { x: -0.5, y: -0.5 },
      { x: -1, y: -1, w: 1, h: 1 },
    ],
  ])('insideRect(%o, %o) === true / inside', (coord, rect) => {
    // When
    const result = insideRect(rect, coord)

    // Then
    expect(result).toBe(true)
  })

  it.each([
    [
      { x: 3, y: 3 },
      { x: 0, y: 0, w: 3, h: 3 },
    ],
    [
      { x: -1, y: -1 },
      { x: 0, y: 0, w: 3, h: 3 },
    ],
    [
      { x: 1, y: 1 },
      { x: 1, y: 1, w: 0, h: 0 },
    ],
    [
      { x: 2, y: 2 },
      { x: 1, y: 1, w: 1, h: 1 },
    ],
    [
      { x: -1.5, y: -1.5 },
      { x: -1, y: -1, w: 1, h: 1 },
    ],
  ])('insideRect(%o, %o) === false / outside', (coord, rect) => {
    // When
    const result = insideRect(rect, coord)

    // Then
    expect(result).toBe(false)
  })

  describe('coordDistance', () => {
    it.each([
      [{ x: 0, y: 0 }, { x: 3, y: 4 }, 5],
      [{ x: -1, y: -1 }, { x: 2, y: 3 }, 5],
      [{ x: 1, y: 1 }, { x: 1, y: 1 }, 0],
      [{ x: -2, y: -3 }, { x: -4, y: -7 }, 4.47213595499958],
    ])('coordDistance(%o, %o) === %d', (a, b, expected) => {
      const origA = { ...a }
      const origB = { ...b }

      // When
      const result = Math.hypot(b.x - a.x, b.y - a.y)

      // Then
      expect(result).toBeCloseTo(expected)
      expect(a).toEqual(origA)
      expect(b).toEqual(origB)
    })
  })
})
