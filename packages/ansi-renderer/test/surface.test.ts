import { describe, expect, it } from 'vitest'

import { Coord2D } from '@pantomime/core'

import { ANSISurface, Output } from '@src/surface'

class FakeOutput implements Output {
  written: (Uint8Array | string)[] = []
  isTTY = true

  write(
    buffer: Uint8Array | string,
    _cb?: (err?: Error | null) => void
  ): boolean {
    this.written.push(buffer)
    return true
  }
}

describe('ANSISurface', () => {
  describe('moveTo', () => {
    type moveToAccessor = { moveTo: (c: Coord2D | number, y?: number) => void }

    describe('Non-offsetted', () => {
      describe('Coord2D', () => {
        it('should issue ANSI positioning codes', () => {
          // Given
          const output = new FakeOutput()
          const surface = new ANSISurface(
            { x: 0, y: 0 },
            { w: 15, h: 15 },
            output
          )

          // When
          ;(surface as unknown as moveToAccessor).moveTo({
            x: 2,
            y: 8,
          })

          // Then
          expect(output.written.join('')).toEqualAnsi('\x1b[8;2H')
        })
      })
    })

    describe('number, number', () => {
      it('should issue ANSI positioning codes', () => {
        // Given
        const output = new FakeOutput()
        const surface = new ANSISurface(
          { x: 0, y: 0 },
          { w: 15, h: 15 },
          output
        )

        // When
        ;(surface as unknown as moveToAccessor).moveTo(8, 2)

        // Then
        expect(output.written.join('')).toEqualAnsi('\x1b[8;2H')
      })
    })

    describe('Offsetted', () => {
      describe('Coord2D', () => {
        it('should issue ANSI positioning codes', () => {
          // Given
          const output = new FakeOutput()
          const surface = new ANSISurface(
            { x: 20, y: 20 },
            { w: 15, h: 15 },
            output
          )

          // When
          ;(surface as unknown as moveToAccessor).moveTo({
            x: 2,
            y: 8,
          })

          // Then
          expect(output.written.join('')).toEqualAnsi('\x1b[28;22H')
        })
      })
    })

    describe('number, number', () => {
      it('should issue ANSI positioning codes', () => {
        // Given
        const output = new FakeOutput()
        const surface = new ANSISurface(
          { x: 20, y: 20 },
          { w: 15, h: 15 },
          output
        )

        // When
        ;(surface as unknown as moveToAccessor).moveTo(8, 2)

        // Then
        expect(output.written.join('')).toEqualAnsi('\x1b[28;22H')
      })
    })
  })

  describe('present', () => {
    it('should use ANSI escape codes to position and output patch data', () => {
      // Given
      const output = new FakeOutput()
      const surface = new ANSISurface({ x: 0, y: 0 }, { w: 20, h: 20 }, output)

      // When
      surface.present([
        {
          x: 5,
          y: 8,
          cells: [{ ch: 'a' }, { ch: 'b' }, { ch: 'c' }],
        },
        {
          x: 4,
          y: 9,
          cells: [{ ch: '0' }, { ch: '1' }, { ch: '2' }, { ch: '3' }],
        },
      ])

      // Then
      expect(output.written.join('')).toEqualAnsi('\x1b[8;5Habc\x1b[9;4H0123')
    })

    it('should not write output outside of surface bounds', () => {
      // Given
      const output = new FakeOutput()
      const surface = new ANSISurface({ x: 0, y: 0 }, { w: 20, h: 20 }, output)

      // When
      surface.present([
        {
          x: 18,
          y: 8,
          cells: [{ ch: 'a' }, { ch: 'b' }, { ch: 'c' }],
        },
        {
          x: 4,
          y: 9,
          cells: [{ ch: '0' }, { ch: '1' }, { ch: '2' }, { ch: '3' }],
        },
      ])

      // Then
      expect(output.written.join('')).toEqualAnsi('\x1b[8;18Hab\x1b[9;4H0123')
    })
  })
})
