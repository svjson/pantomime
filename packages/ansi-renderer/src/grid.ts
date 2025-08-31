import equal from 'fast-deep-equal'

import { areaOf, coordAdd, insideRect } from './arithmetic'
import { Coord2D, Dimension2D, Rect2D } from './geom'
import { Canvas } from './canvas'
import { Patch, Run, Cell } from './surface'

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

/**
 * Canvas-implementation targeting Grid
 */
export class GridCanvas implements Canvas {
  /**
   * Canvas dimension
   */
  readonly dim: Dimension2D
  /**
   * The current target for canvas operations
   */
  private grid: Grid
  /**
   * The last "frame", used for calculating diffs
   */
  private prev: Grid
  /**
   * Translation origin
   */
  private origin: Coord2D = { x: 0, y: 0 }
  /**
   * All drawing is limited to the bounds of clipRect, if non-null
   */
  private clipRect: Rect2D | null = null

  /**
   * Construct a new GridCanvas instance
   */
  constructor(dim: Dimension2D) {
    this.dim = { w: dim.w, h: dim.h }
    this.grid = new Grid(this.dim)
    this.prev = this.grid.clone()
  }

  /**
   * Begin frame. This clears any previous output, whether it has been
   * collected/flushed or not.
   */
  beginFrame(clear: boolean = true): void {
    this.prev = this.grid
    this.grid = clear ? new Grid(this.dim) : this.prev.clone()
  }

  /**
   * Finalize frame. This collects a `Patch` of all modifications done
   * since the
   */
  finalizeFrame(): Patch {
    const patch: Patch = []
    let run: Run | null = null

    for (let y = 0; y < this.dim.h; y++) {
      for (let x = 0; x < this.dim.w; x++) {
        const c = { x, y }
        const cell = this.grid.get(c)
        if (equal(cell, this.prev.get(c))) {
          if (run) {
            patch.push(run)
            run = null
          }
        } else {
          if (!run) {
            run = { x, y, cells: [] }
          }
          run.cells.push(cell)
        }
      }
      if (run) {
        patch.push(run)
        run = null
      }
    }

    return patch
  }

  /**
   * Translate all further drawing operations by offset coordinate by
   * `coord`.
   */
  translate(coord: Coord2D, relative = false): void {
    this.origin = relative ? coordAdd(this.origin, coord) : { ...coord }
  }

  setClip(rect?: Rect2D): void {
    this.clipRect = rect
  }

  clear(): void {
    this.grid.clear()
  }

  plot(c: Coord2D, value: string | GridCell): void {
    const p = coordAdd(this.origin, c)
    if (!this.inClipRect(p)) return

    this.grid.set(
      p,
      typeof value === 'string' ? { ch: value.length ? value[0] : ' ' } : value
    )
  }

  /**
   * Draw a horizontal line at row starting from coordinate `c`
   *
   * For positive values of `len`, the line is drawn from left to right,
   * otherwise from right to left.
   *
   * @param c Starting coordinate
   * @param len Length of line
   * @param value Cell data or character to plot
   */
  plotHLine(c: Coord2D, len: number, value: string | GridCell) {
    const step = len >= 0 ? 1 : -1
    for (let i = 0; i !== len; i += step)
      this.plot({ x: c.x + i, y: c.y }, value)
  }

  /**
   * Draw a vertical line at row starting from coordinate `c`
   *
   * For positive values of `len`, the line is drawn from top to bottom,
   * otherwise from bottom to top.
   *
   * @param c Starting coordinate
   * @param len Length of line
   * @param value Cell data or character to plot
   */
  plotVLine(c: Coord2D, len: number, value: string | GridCell) {
    const step = len >= 0 ? 1 : -1
    for (let i = 0; i !== len; i += step)
      this.plot({ x: c.x, y: c.y + i }, value)
  }

  /**
   * Draw a line from coordinate `a` to coordinate `b`
   *
   * Uses Bresenham (int grid), but delegates to plotHLine/plotVLine
   * for purely horizontal/vertical lines (a.y === b.y) or (a.x === b.x).
   *
   * @param a Starting coordinate
   * @param b Ending coordinate
   * @param value Cell data or character to plot
   */
  plotLine(a: Coord2D, b: Coord2D, value: string | GridCell) {
    if (a.y === b.y) {
      this.plotHLine(a, b.x - a.x, value)
      return
    }
    if (a.x === b.x) {
      this.plotVLine(b, b.y - a.y, value)
      return
    }
    let x0 = a.x,
      y0 = a.y,
      x1 = b.x,
      y1 = b.y
    const dx = Math.abs(x1 - x0),
      sx = x0 < x1 ? 1 : -1
    const dy = -Math.abs(y1 - y0),
      sy = y0 < y1 ? 1 : -1
    let err = dx + dy
    for (;;) {
      this.plot({ x: x0, y: y0 }, value)
      if (x0 === x1 && y0 === y1) break
      const e2 = 2 * err
      if (e2 >= dy) {
        err += dy
        x0 += sx
      }
      if (e2 <= dx) {
        err += dx
        y0 += sy
      }
    }
  }

  /**
   * Plot the outline of a rectangle
   *
   * @param rect Rectangle to plot
   * @param value Cell data or character to plot
   */
  plotRect(rect: Rect2D, value: string | GridCell) {
    const { x, y, w, h } = rect
    if (w <= 0 || h <= 0) return
    this.plotHLine(rect, w, value)
    this.plotHLine({ x: rect.x, y: rect.y + h - 1 }, w, value)
    if (h > 2) {
      this.plotVLine({ x: rect.x, y: rect.y + 1 }, h - 1, value)
      this.plotVLine({ x: rect.x - w - 1, y: rect.y + 1 }, h - 1, value)
    }
  }

  /**
   * Plot a filled rectangle
   *
   * @param rect Rectangle to fill
   * @param value Cell data or character to plot
   */
  fillRect(rect: Rect2D, value: string | GridCell): void {
    for (let y = rect.y; y < rect.h; y++) {
      for (let x = rect.x; x < rect.w; x++) {
        this.plot({ x, y }, value)
      }
    }
  }

  /**
   * Draw text/string `text` at coordinate `c`
   *
   * @param c Coordinate to draw text at
   * @param text Text/string to draw
   */
  text(c: Coord2D, text: string): void {
    for (let i = 0; i < text.length; i++) {
      this.plot({ x: c.x + i, y: c.y }, text[i])
    }
  }

  /**
   * Draw, or "blit", the contents of another canvas onto this canvas at `c`
   *
   * Clipping and translation are applied as normal.
   * The source canvas is not modified.
   *
   * @param c Coordinate to draw the source canvas at
   * @param src Source canvas to draw
   */
  blit(c: Coord2D, src: Canvas): void {
    for (let y = 0; y < src.dim.h; y++) {
      for (let x = 0; x < src.dim.w; x++) {
        const cell: GridCell = (src as any).curr.get(x, y)
        if (cell.ch !== ' ') this.plot({ x: c.x + x, y: c.y + y }, cell)
      }
    }
  }

  resize(dim: Dimension2D) {
    this.dim.w = dim.w
    this.dim.h = dim.h
    this.grid.resize(dim)
    this.prev.resize(dim)
  }

  /**
   * Query whether coordinate `c` is contained within the bounds of
   * the current clipRect, if any, and within the canvas bounds.
   */
  private inClipRect(c: Coord2D): boolean {
    if (this.clipRect && !insideRect(this.clipRect, c)) {
      return false
    }
    return insideRect(this.dim, c)
  }
}
