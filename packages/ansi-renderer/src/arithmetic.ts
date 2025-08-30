import { Coord2D, Dimension2D, Rect2D } from './dimension'

/**
 * Add x and y values of two Coord2D coordinates and return a new result.
 *
 * Does not mutate any of the argument values.
 *
 * @param coord - First coordinate
 * @param other - Second coordinate
 *
 * @return New coordinate which is the sum of `coord` and `other`
 */
export const coordAdd = (coord: Coord2D, other: Coord2D): Coord2D => {
  return {
    x: coord.x + other.x,
    y: coord.y + other.y,
  }
}

/**
 * Add x and y values of `other` to `coord`, mutating `coord`.
 *
 * Mutates `coord`. Does not mutate `other`.
 *
 * @param coord - First coordinate, which will be mutated
 * @param other - Second coordinate
 */
export const coordAddIn = (coord: Coord2D, other: Coord2D): void => {
  coord.x += other.x
  coord.y += other.y
}

/**
 * Return a new Coord2D where x and y values have been rounded according
 * to Math.round/ECMAScript semantics.
 *
 * Does not mutate the argument value.
 *
 * @param coord - Coordinate to round
 * @return New rounded coordinate
 */
export const coordRound = (coord: Coord2D): Coord2D => {
  return {
    x: Math.round(coord.x),
    y: Math.round(coord.y),
  }
}

/**
 * Calculate the area of a rectangle or dimension
 *
 * @param dim - Rectangle or dimension
 * @return Area (width * height)
 */
export const areaOf = (dim: Rect2D | Dimension2D): number => {
  return dim.w * dim.h
}

/**
 * Check if a coordinate is inside a rectangle or dimension.
 * A coordinate on the right or bottom edge is considered outside.
 * A coordinate on the top or left edge is considered inside.
 * An empty rectangle or dimension (width or height is zero or negative)
 * contains no coordinates.
 *
 * @param rect - Rectangle or dimension
 * @param c - Coordinate to check
 * @return True if coordinate is inside rectangle/dimension, false otherwise
 */
export const insideRect = (rect: Rect2D | Dimension2D, c: Coord2D): boolean => {
  const x = (rect as Rect2D).x ?? 0
  const y = (rect as Rect2D).y ?? 0
  return c.x >= x && c.x < x + rect.w && c.y >= y && c.y < y + rect.h
}
