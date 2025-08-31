import {
  Canvas,
  Coord2D,
  coordAdd,
  coordRotate,
  coordSubtract,
  Shape2D,
} from '@pantomime/core'
import { Bitmap } from '@pantomime/raster'

import { GridCell } from './grid'

export const makeGlyphBitmap = (
  lines: string[],
  fg?: number,
  bg?: number
): Bitmap<GridCell> => {
  return lines.map((line) => Array.from(line).map((ch) => ({ ch, fg, bg })))
}
