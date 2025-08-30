import { describe, expect, it } from 'vitest'

import { Grid } from '@src/grid'

const RED = 0xff0000
const BLUE = 0x0000ff

describe('Grid', () => {
  describe('get and set', () => {
    it('should get and set cells correctly', () => {
      // Given
      const grid = new Grid({ w: 3, h: 2 })
      const coord = { x: 1, y: 1 }
      const cell = { ch: 'A', fg: RED, bg: BLUE }

      // When
      grid.set(coord, cell)
      const retrievedCell = grid.get(coord)

      // Then
      expect(retrievedCell).toEqual(cell)
    })
  })

  describe('clear', () => {
    it('should clear the grid correctly', () => {
      // Given
      const grid = new Grid({ w: 3, h: 2 })
      grid.set({ x: 0, y: 0 }, { ch: 'X' })
      grid.set({ x: 1, y: 1 }, { ch: 'Y' })

      // When
      grid.clear()

      // Then
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 3; x++) {
          expect(grid.get({ x, y })).toEqual({ ch: ' ' })
        }
      }
    })
  })

  describe('getDimension', () => {
    it('should return the correct dimensions', () => {
      // Given
      const dim = { w: 4, h: 5 }
      const grid = new Grid(dim)

      // When
      const retrievedDim = grid.getDimension()

      // Then
      expect(retrievedDim).toEqual(dim)
    })
  })

  describe('clone', () => {
    it('should create an accurate clone of the grid', () => {
      // Given
      const grid = new Grid({ w: 2, h: 2 })
      grid.set({ x: 0, y: 0 }, { ch: 'A' })
      grid.set({ x: 1, y: 1 }, { ch: 'B' })

      // When
      const clonedGrid = grid.clone()

      // Then
      expect(clonedGrid.getDimension()).toEqual(grid.getDimension())
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          expect(clonedGrid.get({ x, y })).toEqual(grid.get({ x, y }))
        }
      }
    })
  })
})
