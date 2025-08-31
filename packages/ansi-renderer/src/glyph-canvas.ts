import { Canvas, Coord2D } from '@pantomime/core'
import { GridCell } from './grid'
import { Patch } from './surface'

export type Glyph = string | GridCell

export interface GlyphCanvas extends Canvas<Glyph, Patch> {
  /**
   * Draw text/string `text` at coordinate `c`
   *
   * @param c Coordinate to draw text at
   * @param text Text/string to draw
   */
  text(c: Coord2D, text: string): void
}
