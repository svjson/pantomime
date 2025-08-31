import { describe, it, expect } from 'vitest'
import { Canvas, Coord2D } from '@pantomime/core'
import { Polygon } from '@src/polygon'

describe('Polygon', () => {
  describe('draw', () => {
    it('should draw a simple triangle', () => {
      // Given
      const lines: [Coord2D, Coord2D, string][] = []
      const canvas = {
        plotLine: (from: Coord2D, to: Coord2D, value: string) => {
          lines.push([from, to, value])
        },
      } as Canvas<string, any>
      const polygon = new Polygon<string>(
        [
          { x: 30, y: 5 },
          { x: 50, y: 20 },
          { x: 10, y: 20 },
        ],
        {
          cell: () => '*',
        }
      )

      // When
      polygon.draw(canvas)

      // Then
      expect(lines).toEqual([
        [{ x: 30, y: 5 }, { x: 50, y: 20 }, '*'],
        [{ x: 50, y: 20 }, { x: 10, y: 20 }, '*'],
        [{ x: 10, y: 20 }, { x: 30, y: 5 }, '*'],
      ])
    })
  })
})
