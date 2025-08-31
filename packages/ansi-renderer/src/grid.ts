import { Coord2D, Dimension2D, areaOf } from '@pantomime/core'
import { Cell } from './surface'

export type GridCell = Cell

/**
 * A 2D grid of cells
 *
 * Cells are stored in a contiguous 1D array, row-major order.
 * The grid does not perform any bounds checking.
 *
 * Cells are initialized to a space character (' ') with no colors.
 * The grid can be cleared to reset all cells to this state.
 *
 * The grid can be cloned to create a copy of its current state.
 * Modifications to the clone do not affect the original grid.
 *
 * Example usage:
 * ```ts
 * const grid = new Grid({ w: 10, h: 5 })
 * grid.set({ x: 2, y: 3 }, { ch: '@', fg: 0xffffff })
 *
 * const cell = grid.get({ x: 2, y: 3 })
 * console.log(cell) // { ch: '@', fg: 0xffffff }
 *
 * grid.clear()
 * const emptyCell = grid.get({ x: 2, y: 3 })
 * console.log(emptyCell) // { ch: ' ' }
 *
 * const gridClone = grid.clone()
 * gridClone.set({ x: 0, y: 0 }, { ch: '#', fg: 0xff0000 })
 *
 * const originalCell = grid.get({ x: 0, y: 0 })
 * console.log(originalCell) // { ch: ' ' }
 *
 * const clonedCell = gridClone.get({ x: 0, y: 0 })
 * console.log(clonedCell) // { ch: '#', fg: 0xff0000 }
 * ```
 */
export class Grid {
  /**
   * Grid cell data, as a contiguous array
   */
  private _data: GridCell[]
  /**
   * Construct a new Grid of dimension `dim`
   *
   * All cells are initialized to a space character (' ') with no colors,
   * unless grid data is provided.
   *
   * If grid data is provided and does not match `dim` it will be truncated
   * or extend accordingly. Mismatch in grid width will make the row offsets
   * skew and result in a misaligned bitmap.
   *
   * @param dim - Dimension of the grid
   * @param data - (Optional) Grid data
   */
  constructor(
    private dim: Dimension2D,
    data?: GridCell[]
  ) {
    this.dim = { ...dim }
    if (!data) {
      this._data = Array.from({ length: areaOf(dim) }, () => ({ ch: ' ' }))
    } else {
      this._data = [...data]
      const lenDiff = areaOf(dim) - this._data.length
      if (lenDiff < 0) {
        this._data = this._data.slice(0, areaOf(dim))
      } else if (lenDiff > 0) {
        for (let i = 0; i < lenDiff; i++) {
          this._data.push({ ch: ' ' })
        }
      }
    }
  }
  /**
   * Convert a 2D coordinate to a 1D array index
   *
   * @param coord 2D coordinate
   *
   * @return 1D array index
   */
  private index(coord: Coord2D) {
    return coord.y * this.dim.w + coord.x
  }

  /**
   * Get the cell at coordinate `coord`
   *
   * @param coord 2D coordinate
   */
  get(coord: Coord2D): GridCell {
    return this._data[this.index(coord)]
  }

  /**
   * Set the cell at coordinate `coord` to `cell`
   *
   * @param coord 2D coordinate.
   * @param cell Cell data to set
   */
  set(coord: Coord2D, cell: GridCell) {
    return (this._data[this.index(coord)] = cell)
  }

  /**
   * Clear the grid, setting all cells to a space character (' ')
   * with no colors.
   */
  clear(): void {
    for (let i = 0; i < this._data.length; i++) this._data[i] = { ch: ' ' }
  }

  get data(): GridCell[] {
    return this._data
  }

  /**
   * Return the grid dimension
   */
  getDimension(): Dimension2D {
    return { ...this.dim }
  }

  /**
   * Resize the grid
   */
  resize(dim: Dimension2D) {
    const newData: GridCell[] = []
    for (let row = 0; row < Math.min(this.dim.h, dim.h); row++) {
      let rowStart = this.index({ x: 0, y: row })
      newData.push(
        ...this._data.slice(rowStart, rowStart + Math.min(this.dim.w, dim.w))
      )
      if (dim.w > this.dim.w) {
        newData.push(
          ...Array.from({ length: dim.w - this.dim.w }, () => ({
            ch: ' ',
          }))
        )
      }
    }

    if (dim.h > this.dim.h) {
      newData.push(
        ...Array.from({ length: dim.w }, () => ({
          ch: ' ',
        }))
      )
    }

    this._data = newData
    this.dim = dim
  }

  /**
   * Create a clone of this grid
   */
  clone(): Grid {
    const g = new Grid(this.dim)
    g._data = this._data.slice()
    return g
  }
}
