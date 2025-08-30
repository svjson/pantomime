/**
 * Smallest unit of output, a character/terminal cell.
 */
export type Cell = {
  /**
   * Character/glyph
   */
  ch: string
  /**
   * (Optional) foreground color
   */
  fg?: number
  /**
   * (Optional) background color
   */
  bg?: number
}

/**
 * A horizontal run of adjacent cells.
 *
 * Grouped together to allow output of character sequences
 * without issuing ANSI cursor move codes unneccesarily
 */
export type Run = {
  /**
   * Screen row
   */
  y: number
  /**
   * Screen column of first cell
   */
  x: number
  /**
   * Output cells
   */
  cells: Cell[]
}

/**
 * A collection of `Run` structs, together forming a while
 * "patch" to apply to a Surface
 */
export type Patch = Run[]

/**
 * Output surface abstraction
 */
export interface Surface {
  /**
   * Prepare surface for output, ie, hide cursor
   */
  begin(): void
  /**
   * Apply patch
   */
  present(patch: Patch): void

  /**
   * Clear surface
   */
  clear(): void

  /**
   * Destroy surface and restore target, ie, restore cursor
   */
  end(): void
}

export interface Coord2D {
  x: number
  y: number
}

export const coordAdd = (coord: Coord2D, other: Coord2D) => {
  return {
    x: coord.x + other.x,
    y: coord.y + other.y,
  }
}

export const coordAddIn = (coord: Coord2D, other: Coord2D) => {
  coord.x += other.x
  coord.y += other.y
}

export const coordRound = (coord: Coord2D) => {
  return {
    x: Math.round(coord.x),
    y: Math.round(coord.y),
  }
}

export interface Dimension2D {
  w: number
  h: number
}

/**
 * Surface for outputting directly to an ANSI-capable TTY console / terminal
 * emulator
 */
export class ANSISurface implements Surface {
  /**
   * ANSI Escape sequence
   */
  private readonly ESC = '\x1b[' // CSI

  /**
   * Construct a new ANSISurface instance, with its top left corner located
   * at `origin`.
   *
   * Terminal output is 1-based, whereas the internal surface frame buffer
   * is 0-based.
   *
   * @param origin Coordinates of top-left corner of surface in terminal cells
   */
  constructor(
    private origin: Coord2D = { x: 1, y: 1 },
    private dim: Dimension2D = { w: 40, h: 20 }
  ) {}

  /**
   * Prefix an ANSI output sequence with the ANSI escape sequence
   */
  private esc = (s: string) => `${this.ESC}${s}`
  /**
   * Output `s` to stdout
   */
  private write = (s: string) => process.stdout.write(s)
  /**
   * Move cursor/output point to coordinate `c`.
   *
   * Coordinates are 1-based, with (1,1) being the top-left corner
   *
   * @param c Target coordinate
   */
  private moveTo(c: Coord2D): void
  /**
   * Move cursor/output point to (`row`, `col`).
   *
   * Coordinates are 1-based, with (1,1) being the top-left corner
   *
   * @param row Target row, or Y position
   * @param col Target column, or X position
   */
  private moveTo(row: number, col: number): void
  /**
   * Overload implementation for `moveTo(row, col)` and `moveTo(c)`
   *
   * @param row Target row or target Coord2D
   * @param col Target column, or X position
   */
  private moveTo(row: number | Coord2D, col?: number) {
    if (typeof row !== 'number') {
      col = row.x
      row = row.y
    }

    this.write(this.esc(`${row};${col}H`))
  }
  /**
   * Hide cursor
   */
  begin() {
    if (!process.stdout.isTTY) {
      console.error('Not a TTY. Run in a real terminal.')
      process.exit(1)
    }
    this.write(this.esc('?25l'))
  }
  /**
   * Show cursor
   */
  end() {
    this.write(this.esc('?25h'))
  }
  /**
   * Apply `patch` to surface
   */
  present(patch: Patch) {
    for (const run of patch) {
      this.moveTo(this.origin.y + run.y, this.origin.x + run.x)
      this.write(run.cells.map((c) => c.ch).join(''))
    }
  }
  /**
   * Clear surface area
   */
  clear() {
    const patch: Patch = Array(this.dim.h)
    for (let y = 0; y < this.dim.h; y++) {
      patch[y] = {
        y,
        x: 0,
        cells: Array(this.dim.w)
          .fill(null)
          .map((_) => ({
            ch: ' ',
          })),
      }
    }
    this.present(patch)
  }
}
