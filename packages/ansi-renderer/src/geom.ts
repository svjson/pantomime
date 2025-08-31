/**
 * A coordinate in 2D space
 */
export interface Coord2D {
  x: number
  y: number
}

/**
 * A dimension in 2D space
 */
export interface Dimension2D {
  w: number
  h: number
}

/**
 * A rectangle in 2D space
 */
export type Rect2D = Coord2D & Dimension2D
