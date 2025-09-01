import {
  Coord2D,
  coordAdd,
  Dimension2D,
  insideRect,
  Rect2D,
} from '@pantomime/core'
import { Grid, GridCell } from './grid'
import { Patch, Run } from './surface'
import equal from 'fast-deep-equal'
import { Glyph, GlyphCanvas } from './glyph-canvas'

/**
 * Canvas-implementation targeting Grid
 */
export class GridCanvas implements GlyphCanvas {
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

  plot(c: Coord2D, glyph: Glyph): void {
    const p = coordAdd(this.origin, c)
    if (!this.inClipRect(p)) return

    this.grid.set(
      p,
      typeof glyph === 'string' ? { ch: glyph.length ? glyph[0] : ' ' } : glyph
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
   * @param glyph Glyph/character to plot
   */
  plotHLine(c: Coord2D, len: number, glyph: Glyph) {
    const step = len >= 0 ? 1 : -1
    for (let i = 0; i !== len; i += step)
      this.plot({ x: c.x + i, y: c.y }, glyph)
  }

  /**
   * Draw a vertical line at row starting from coordinate `c`
   *
   * For positive values of `len`, the line is drawn from top to bottom,
   * otherwise from bottom to top.
   *
   * @param c Starting coordinate
   * @param len Length of line
   * @param glyph Glyph/character to use for line grid cell
   */
  plotVLine(c: Coord2D, len: number, glyph: Glyph) {
    const step = len >= 0 ? 1 : -1
    for (let i = 0; i !== len; i += step)
      this.plot({ x: c.x, y: c.y + i }, glyph)
  }

  /**
   * Draw a line from coordinate `a` to coordinate `b`
   *
   * Uses Bresenham (int grid), but delegates to plotHLine/plotVLine
   * for purely horizontal/vertical lines (a.y === b.y) or (a.x === b.x).
   *
   * @param a Starting coordinate
   * @param b Ending coordinate
   * @param glyph Cell/character to plot
   */
  plotLine(a: Coord2D, b: Coord2D, glyph: Glyph) {
    if (a.y === b.y) {
      this.plotHLine(a, b.x - a.x, glyph)
      return
    }
    if (a.x === b.x) {
      this.plotVLine(a, b.y - a.y, glyph)
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
      this.plot({ x: x0, y: y0 }, glyph)
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
   * @param value Glyph/character to plot
   */
  plotRect(rect: Rect2D, glyph: Glyph) {
    const { x, y, w, h } = rect
    if (w <= 0 || h <= 0) return
    this.plotHLine(rect, w, glyph)
    this.plotHLine({ x: rect.x, y: rect.y + h - 1 }, w, glyph)
    if (h > 2) {
      this.plotVLine({ x: rect.x, y: rect.y + 1 }, h - 1, glyph)
      this.plotVLine({ x: rect.x - w - 1, y: rect.y + 1 }, h - 1, glyph)
    }
  }

  /**
   * Plot a filled rectangle
   *
   * @param rect Rectangle to fill
   * @param glyph Glyph/character to plot
   */
  fillRect(rect: Rect2D, glyph: Glyph): void {
    for (let y = rect.y; y < rect.h; y++) {
      for (let x = rect.x; x < rect.w; x++) {
        this.plot({ x, y }, glyph)
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
  blit(c: Coord2D, src: GlyphCanvas): void {
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
