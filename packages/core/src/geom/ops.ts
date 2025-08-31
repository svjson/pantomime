import { Coord2D, Dimension2D, Rect2D } from "./types";

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
  };
};

/**
 * Subtract x and y values of `other` from `coord` and return a new result.
 *
 * Does not mutate any of the argument values.
 *
 * @param coord - First coordinate
 * @param other - Second coordinate
 *
 * @return New coordinate which is the sum of `coord` and `other`
 */
export const coordSubtract = (coord: Coord2D, other: Coord2D): Coord2D => {
  return {
    x: coord.x - other.x,
    y: coord.y - other.y,
  };
};

/**
 * Add x and y values of `other` to `coord`, mutating `coord`.
 *
 * Mutates `coord`. Does not mutate `other`.
 *
 * @param coord - First coordinate, which will be mutated
 * @param other - Second coordinate
 */
export const coordAddIn = (coord: Coord2D, other: Coord2D): void => {
  coord.x += other.x;
  coord.y += other.y;
};

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
  };
};

/**
 * Return the distance between two coordinates
 *
 * @param a - First coordinate
 * @param b - Second coordinate
 * @return Distance between coordinates
 */
export const coordDistance = (a: Coord2D, b: Coord2D): number => {
  return Math.hypot(b.x - a.x, b.y - a.y);
};

/**
 * Subtract w and h values of `other` from `dim` and return a new result.
 *
 * Does not mutate any of the argument values.
 *
 * @param dim - First dimension
 * @param other - Second dimension
 *
 * @return New dimension which is the product of `dim` and `other`
 */
export const dimSubtract = (
  dim: Dimension2D,
  other: Dimension2D,
): Dimension2D => {
  return {
    w: dim.w - other.w,
    h: dim.h - other.h,
  };
};

/**
 * Divide dimension `dim` by `other` and return a new instance.
 *
 * Does not mutate any of the argument values.
 *
 * @param dim - First dimension
 * @param other - Second dimension or number used as both w and h.
 *
 * @return New dimension which is the divided of `dim`
 */
export const dimDivide = (
  dim: Dimension2D,
  other: Dimension2D | number,
): Dimension2D => {
  const { w, h } = typeof other === "number" ? { w: other, h: other } : other;
  return {
    w: dim.w / w,
    h: dim.h / h,
  };
};

/**
 * Calculate the area of a rectangle or dimension
 *
 * @param dim - Rectangle or dimension
 * @return Area (width * height)
 */
export const areaOf = (dim: Rect2D | Dimension2D): number => {
  return dim.w * dim.h;
};

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
  const x = (rect as Rect2D).x ?? 0;
  const y = (rect as Rect2D).y ?? 0;
  return c.x >= x && c.x < x + rect.w && c.y >= y && c.y < y + rect.h;
};

/**
 * Rotate a coordinate around the origin (0,0) by `angle` radians
 * and return a new coordinate.
 *
 * Does not mutate the argument value.
 *
 * @param c - Coordinate to rotate
 * @param angle - Angle in radians
 * @return New rotated coordinate
 */
export const coordRotate = (c: Coord2D, angle: number): Coord2D => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: c.x * cos - c.y * sin, y: c.x * sin + c.y * cos };
};
