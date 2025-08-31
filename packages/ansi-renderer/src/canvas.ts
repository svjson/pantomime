import { Coord2D, Dimension2D, Rect2D } from './geom'
import { GridCell } from './grid'
import { Patch } from './surface'

export interface Canvas {
  readonly dim: Dimension2D

  /**
   * Begin drawing a new frame.
   *
   * Swaps/clears buffers as needed, depending on implementation.
   */
  beginFrame(clear?: boolean): void

  /**
   * Finalize frame and return `Patch` for `Surface`
   */
  finalizeFrame(): Patch

  /**
   * Offset furthering drawing from `offset`
   *
   * Optionally offset from current offset translation.
   * Omitting `relative` or providing `false` performs translation
   * from (0, 0).
   *
   * @param coord Offset coordinate
   * @param relative Whether to offset from current translation
   */
  translate(coord: Coord2D, relative?: boolean): void

  /**
   * Set a clip rectangle, ignoring any drawing outside of this region.
   *
   * Calling setClip with no arguments or null/undefined removes any
   * current clipping.
   *
   * @param rect Clipping rectangle
   */
  setClip(rect?: Rect2D): void

  /**
   * Clear all canvas content
   */
  clear(): void

  /**
   * Plot a single cell/"pixel"
   *
   * If `value` is a string, the first character is used as the cell
   * character, with no colors.
   *
   * @param coord Coordinate to plot at
   * @param value Cell data or character to plot
   */
  plot(coord: Coord2D, value: string | GridCell): void

  /**
   * Draw a line from coordinate `a` to coordinate `b`
   *
   * @param a Starting coordinate
   * @param b Ending coordinate
   * @param value Cell data or character to plot
   */
  plotLine(a: Coord2D, b: Coord2D, value: string | GridCell): void

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
  plotHLine(c: Coord2D, len: number, value: string | GridCell): void

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
  plotVLine(c: Coord2D, len: number, value: string | GridCell): void

  /**
   * Plot the outline of a rectangle
   *
   * @param rect Rectangle to plot
   * @param value Cell data or character to plot
   */
  plotRect(rect: Rect2D, value: string | GridCell): void

  /**
   * Plot a filled rectangle
   *
   * @param rect Rectangle to fill
   * @param value Cell data or character to plot
   */
  fillRect(rect: Rect2D, value: string | GridCell): void

  /**
   * Draw text/string `text` at coordinate `c`
   *
   * @param c Coordinate to draw text at
   * @param text Text/string to draw
   */
  text(c: Coord2D, text: string): void

  /**
   * Draw, or "blit", the contents of another canvas onto this canvas at `c`
   *
   * Clipping and translation are applied as normal.
   * The source canvas is not modified.
   *
   * @param c Coordinate to draw the source canvas at
   * @param src Source canvas to draw
   */
  blit(c: Coord2D, src: Canvas): void
}
