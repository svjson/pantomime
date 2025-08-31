import { describe, expect, it } from 'vitest'

import { Coord2D } from '@pantomime/core'
import { GridCanvas } from '@src/index'

describe('GridCanvas', () => {
  describe('plot', () => {
    describe('plain', () => {
      it('should plot a single character at given coordinates', () => {
        // Given
        const canvas = new GridCanvas({ w: 10, h: 5 })
        const coord = { x: 2, y: 2 }
        const char = 'X'

        // When
        canvas.plot(coord, char)
        const patch = canvas.finalizeFrame()

        // Then
        expect(patch).toEqual([
          {
            x: 2,
            y: 2,
            cells: [{ ch: 'X', fg: undefined, bg: undefined }],
          },
        ])
      })
    })

    describe('with clip', () => {
      it('should not plot outside the clipping region', () => {
        // Given
        const canvas = new GridCanvas({ w: 10, h: 5 })
        canvas.setClip({ x: 1, y: 1, w: 5, h: 3 })
        const coordInside = { x: 3, y: 2 }
        const coordOutside = { x: 7, y: 4 }
        const char = 'O'

        // When
        canvas.plot(coordInside, char)
        canvas.plot(coordOutside, char)
        const patch = canvas.finalizeFrame()

        // Then
        expect(patch).toEqual([
          {
            x: 3,
            y: 2,
            cells: [{ ch: 'O', fg: undefined, bg: undefined }],
          },
        ])
      })
    })

    describe('with translation', () => {
      it('should plot with translation applied', () => {
        // Given
        const canvas = new GridCanvas({ w: 10, h: 5 })
        canvas.translate({ x: 2, y: 1 })
        const coord = { x: 1, y: 1 }
        const char = 'T'

        // When
        canvas.plot(coord, char)
        const patch = canvas.finalizeFrame()

        // Then
        expect(patch).toEqual([
          {
            x: 3,
            y: 2,
            cells: [{ ch: 'T', fg: undefined, bg: undefined }],
          },
        ])
      })
    })
  })

  describe('plotHLine', () => {
    describe('plain', () => {
      it.each([
        [
          'Line starting at top left bounds',
          [{ x: 0, y: 0 }, 4, '-'],
          [
            {
              x: 0,
              y: 0,
              cells: [
                {
                  ch: '-',
                },
                {
                  ch: '-',
                },
                {
                  ch: '-',
                },
                {
                  ch: '-',
                },
              ],
            },
          ],
        ],

        [
          'Line starting inside bounds',
          [{ x: 5, y: 5 }, 2, 'A'],
          [
            {
              x: 5,
              y: 5,
              cells: [
                {
                  ch: 'A',
                },
                {
                  ch: 'A',
                },
              ],
            },
          ],
        ],

        [
          'Line starting inside bounds, but ending outside',
          [{ x: 8, y: 5 }, 8, 'F'],
          [
            {
              x: 8,
              y: 5,
              cells: [
                {
                  ch: 'F',
                },
                {
                  ch: 'F',
                },
              ],
            },
          ],
        ],
      ])(
        '%o - from %o with length %o',
        (_, [origin, len, ch]: [Coord2D, number, string], expected) => {
          // Given
          const canvas = new GridCanvas({ w: 10, h: 10 })

          // When
          canvas.plotHLine(origin, len, ch)
          const patch = canvas.finalizeFrame()

          // Then
          expect(patch).toEqual(expected)
        }
      )
    })
  })

  describe('plotVLine', () => {
    describe('plain', () => {
      it.each([
        [
          'Line starting at top left bounds',
          [{ x: 0, y: 0 }, 4, '|'],
          [
            {
              x: 0,
              y: 0,
              cells: [
                {
                  ch: '|',
                },
              ],
            },
            {
              x: 0,
              y: 1,
              cells: [
                {
                  ch: '|',
                },
              ],
            },
            {
              x: 0,
              y: 2,
              cells: [
                {
                  ch: '|',
                },
              ],
            },
            {
              x: 0,
              y: 3,
              cells: [
                {
                  ch: '|',
                },
              ],
            },
          ],
        ],

        [
          'Line starting inside bounds',
          [{ x: 5, y: 5 }, 2, 'A'],
          [
            {
              x: 5,
              y: 5,
              cells: [
                {
                  ch: 'A',
                },
              ],
            },
            {
              x: 5,
              y: 6,
              cells: [
                {
                  ch: 'A',
                },
              ],
            },
          ],
        ],

        [
          'Line starting inside bounds, but ending outside',
          [{ x: 5, y: 8 }, 8, 'F'],
          [
            {
              x: 5,
              y: 8,
              cells: [
                {
                  ch: 'F',
                },
              ],
            },
            {
              x: 5,
              y: 9,
              cells: [
                {
                  ch: 'F',
                },
              ],
            },
          ],
        ],
      ])(
        '%o - from %o with length %o',
        (_, [origin, len, ch]: [Coord2D, number, string], expected) => {
          // Given
          const canvas = new GridCanvas({ w: 10, h: 10 })

          // When
          canvas.plotVLine(origin, len, ch)
          const patch = canvas.finalizeFrame()

          // Then
          expect(patch).toEqual(expected)
        }
      )
    })
  })

  describe('finalizeFrame', () => {
    it('should treat contiguous writes across row edges as separate runs', () => {
      // Given
      const canvas = new GridCanvas({ w: 10, h: 10 })

      // When
      canvas.plot({ x: 9, y: 4 }, ']')
      canvas.plot({ x: 0, y: 5 }, '[')
      const patch = canvas.finalizeFrame()

      // Then
      expect(patch).toEqual([
        {
          x: 9,
          y: 4,
          cells: [
            {
              ch: ']',
            },
          ],
        },
        {
          x: 0,
          y: 5,
          cells: [
            {
              ch: '[',
            },
          ],
        },
      ])
    })
  })
})
