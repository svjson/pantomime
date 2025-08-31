import { describe, it, expect } from 'vitest'
import { Dimension2D, Rect2D } from '@src/index'
import { Align, applyRelativeLength, Layout } from '@src/layout'

describe('Layout', () => {
  describe('construction', () => {
    it('should default to hAlign/vAlign `start` if not provided', () => {
      // When
      const layout = new Layout({
        size: { mode: 'fixed', dim: { w: 10, h: 10 } },
      })

      // Then
      expect(layout.hAlign).toEqual('start')
      expect(layout.vAlign).toEqual('start')
    })
  })

  describe('apply', () => {
    describe('fixed size', () => {
      it.each([
        [
          {
            fixedDim: { w: 30, h: 40 },
            hAlign: 'center',
            vAlign: 'center',
          },
          { x: 0, y: 0, w: 100, h: 100 },
          { x: 35, y: 30, w: 30, h: 40 },
        ],
        [
          {
            fixedDim: { w: 30, h: 40 },
            hAlign: 'center',
            vAlign: 'center',
          },
          { x: 0, y: 0, w: 50, h: 50 },
          { x: 10, y: 5, w: 30, h: 40 },
        ],
        [
          {
            fixedDim: { w: 30, h: 40 },
            hAlign: 'start',
            vAlign: 'end',
          },
          { x: 0, y: 0, w: 100, h: 100 },
          { x: 0, y: 60, w: 30, h: 40 },
        ],
        [
          {
            fixedDim: { w: 30, h: 40 },
            hAlign: 'end',
            vAlign: 'start',
          },
          { x: 0, y: 0, w: 50, h: 50 },
          { x: 20, y: 0, w: 30, h: 40 },
        ],
      ] as [
        { fixedDim: Dimension2D; hAlign: Align; vAlign: Align },
        Rect2D,
        Rect2D,
      ][])(
        'should apply fixed dim layout %o in parent dim %o and give dim %o',
        ({ fixedDim, hAlign, vAlign }, parentRect, expected) => {
          // Given
          const layout = new Layout({
            size: { mode: 'fixed', dim: fixedDim },
            hAlign,
            vAlign,
          })

          // When
          const result = layout.apply(parentRect)

          // Then
          expect(result).toEqual(expected)
        }
      )
    })

    describe('relative size', () => {
      it.each([
        [
          { wPerc: 50, hPerc: 30, hAlign: 'end', vAlign: 'end' },
          { x: 0, y: 0, w: 200, h: 100 },
          { x: 100, y: 70, w: 100, h: 30 },
        ],
        [
          { wPerc: 50, hPerc: 30, hAlign: 'start', vAlign: 'start' },
          { x: 0, y: 0, w: 200, h: 100 },
          { x: 0, y: 0, w: 100, h: 30 },
        ],
        [
          { wPerc: 50, hPerc: 30, hAlign: 'center', vAlign: 'center' },
          { x: 0, y: 0, w: 200, h: 100 },
          { x: 50, y: 35, w: 100, h: 30 },
        ],
      ] as [
        { wPerc: number; hPerc: number; vAlign: Align; hAlign: Align },
        Rect2D,
        Rect2D,
      ][])(
        'should apply relative size layout %o in parent dim %o and give dim %o',
        ({ wPerc, hPerc, hAlign, vAlign }, parentRect, expected) => {
          // Given
          const layout = new Layout({
            size: {
              mode: 'relative',
              dim: {
                w: { kind: '%', value: wPerc },
                h: { kind: '%', value: hPerc },
              },
            },
            hAlign,
            vAlign,
          })

          // When
          const result = layout.apply(parentRect)

          // Then
          expect(result).toEqual(expected)
        }
      )
    })
  })
})

describe('applyRelativeLength', () => {
  describe('%', () => {
    it.each([
      ['5% of 10 rounds to 1', 10, 5, 1],
      ['50% of 10 does not round', 10, 50, 5],
      ['0% of 10 is obviously 0', 10, 0, 0],
      ['100% of 10 is still 10', 10, 100, 10],
      ['7% of 50 rounds to 4', 50, 7, 4],
      ['10% of 10 is 1', 10, 10, 1],
      ['-1% of 10 rounds to -0', 10, -1, -0],
      ['-20% of 10 rounds to -2', 10, -20, -2],
    ])('%s - %d% of %d === %d', (_, base, percent, expected) => {
      // When
      const result = applyRelativeLength({ kind: '%', value: percent }, base)

      // Then
      expect(result).toBe(expected)
    })
  })
})
