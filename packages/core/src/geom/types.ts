/**
 * Degrees of rotation
 */
export type Degrees = number

/**
 * Describes the position and transformation of any object
 * in 2D space
 */
export interface Transform {
  pos: Coord2D
  rot?: Degrees
}

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
