import { Coord2D, Dimension2D, Rect2D } from '@pantomime/core'

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

export type SurfaceEventType = 'resize'

/**
 * Output surface abstraction
 */
export interface Surface {
  bounds: Rect2D
  /**
   * Prepare surface for output, ie, hide cursor
   */
  begin(): void
  /**
   * Apply patch
   */
  present(patch: Patch): void

  /**
   * Set surface bounds
   */
  setBounds(bounds: Rect2D): void

  /**
   * Clear surface
   */
  clear(): void

  /**
   * Register a callback to be invoked when an event of type `event`
   * occurs inside this Surface.
   */
  on(event: SurfaceEventType, cb: () => void): void

  /**
   * Destroy surface and restore target, ie, restore cursor
   */
  end(): void
}

export interface Output {
  write(buffer: Uint8Array | string, cb?: (err?: Error | null) => void): boolean
  isTTY: boolean
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

  private listeners: Record<SurfaceEventType, Function[]> = {
    resize: [],
  }

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
    private dim: Dimension2D = { w: 1, h: 1 },
    private __out: Output = process.stdout
  ) {}

  /**
   * Get the current bounding box of this surface
   */
  get bounds() {
    return { ...this.origin, ...this.dim }
  }

  /**
   * Set the Surface size and origin
   */
  setBounds(rect: Rect2D): void {
    this.origin = { x: rect.x, y: rect.y }
    this.dim = { w: rect.w, h: rect.h }
    this.#fireEvent('resize')
  }

  /**
   * Prefix an ANSI output sequence with the ANSI escape sequence
   */
  private esc = (s: string) => `${this.ESC}${s}`
  /**
   * Output `s` to stdout
   */
  private write = (s: string) => this.__out.write(s)
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

    this.write(this.esc(`${row + this.origin.y};${col + this.origin.x}H`))
  }
  /**
   * Hide cursor
   */
  begin() {
    if (!this.__out.isTTY) {
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
      this.moveTo(run.y, run.x)
      this.write(
        run.cells
          .map((c) => c.ch)
          .slice(
            0,
            run.cells.length -
              Math.max(0, run.x + run.cells.length - this.bounds.w)
          )
          .join('')
      )
    }
  }
  /**
   * Register a callback to be invoked when an event of type `event`
   */
  on(event: SurfaceEventType, handler: () => void): void {
    this.listeners[event].push(handler)
  }

  #fireEvent(event: SurfaceEventType) {
    this.listeners[event].forEach((handler) => handler(event))
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
