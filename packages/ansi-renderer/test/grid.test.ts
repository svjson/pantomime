import { describe, expect, it } from 'vitest'

import { Grid } from '@src/index'
import { GridCell } from './grid'

const RED = 0xff0000
const BLUE = 0x0000ff

const cellsFrom = (...strData: string[]): GridCell[] =>
  strData.flatMap((str) => str.split('')).map((c) => ({ ch: c }))

describe('Grid', () => {
  describe('constructor', () => {
    it('should accept grid data matching dimension', () => {
      // When
      const grid = new Grid(
        { w: 4, h: 4 },
        cellsFrom('0123', 'abcd', '9876', 'ABCD')
      )

      // Then
      expect(grid.getDimension()).toEqual({ w: 4, h: 4 })
      expect(grid.data).toEqual(cellsFrom('0123', 'abcd', '9876', 'ABCD'))
    })

    it('should accept and truncate grid data with more cells than dim area', () => {
      // When
      const grid = new Grid(
        { w: 3, h: 4 },
        cellsFrom('0123', 'abcd', '9876', 'ABCD')
      )

      // Then
      expect(grid.getDimension()).toEqual({ w: 3, h: 4 })
      expect(grid.data).toEqual(cellsFrom('012', '3ab', 'cd9', '876'))
    })

    it('should accept and extends grid data with fewer cells than dim area', () => {
      // When
      const grid = new Grid({ w: 4, h: 4 }, cellsFrom('0123', 'abcd', '98'))

      // Then
      expect(grid.getDimension()).toEqual({ w: 4, h: 4 })
      expect(grid.data).toEqual(cellsFrom('0123', 'abcd', '98  ', '    '))
    })
  })

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

  describe('resize', () => {
    it('should crop content horizontally and vertically when resized to smaller w & h', () => {
      // Given
      const grid = new Grid(
        { w: 4, h: 4 },
        cellsFrom('0123', 'abcd', '9876', 'ABCD')
      )

      // When
      grid.resize({ w: 2, h: 2 })

      // Then
      expect(grid.data).toEqual(cellsFrom('01', 'ab'))
    })

    it('should crop last content line when resized to smaller h', () => {
      // Given
      const grid = new Grid(
        { w: 4, h: 4 },
        cellsFrom('0123', 'abcd', '9876', 'ABCD')
      )

      // When
      grid.resize({ w: 4, h: 3 })

      // Then
      expect(grid.data).toEqual(cellsFrom('0123', 'abcd', '9876'))
    })

    it('should extend each line when only width is increased', () => {
      // Given
      const grid = new Grid(
        { w: 4, h: 4 },
        cellsFrom('0123', 'abcd', '9876', 'ABCD')
      )

      // When
      grid.resize({ w: 6, h: 4 })

      // Then
      expect(grid.getDimension()).toEqual({ w: 6, h: 4 })
      expect(grid.data).toEqual(
        cellsFrom('0123  ', 'abcd  ', '9876  ', 'ABCD  ')
      )
    })

    it('should append an empty line when only height is increased', () => {
      // Given
      const grid = new Grid(
        { w: 4, h: 4 },
        cellsFrom('0123', 'abcd', '9876', 'ABCD')
      )

      // When
      grid.resize({ w: 4, h: 5 })

      // Then
      expect(grid.data).toEqual(
        cellsFrom('0123', 'abcd', '9876', 'ABCD', '    ')
      )
    })
  })
})
