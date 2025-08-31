import { describe, expect, it } from 'vitest'

import { ANSISurface, Output } from '@src/surface'
import { Coord2D } from './geom'

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
        expect(output.written).toEqual(['\x1b[8;2H'])
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
        expect(output.written).toEqual(['\x1b[8;2H'])
      })
    })
  })
})
