import {
  Canvas,
  Coord2D,
  coordAdd,
  coordRotate,
  coordRound,
  coordSubtract,
  Degrees,
  makeShape2DTransform,
  Shape2D,
  Shape2DBaseCtorParams,
  Transform,
} from '@pantomime/core'

/**
 * A series of 2D coordinates that define the vertices of a polygon.
 */
export type Path = Coord2D[]

/**
 * A brush defines how the edges of a polygon are drawn.
 */
export interface Brush<C> {
  cell(opts?: { angle?: Degrees }): C
}

/**
 * Parameters for constructing a Polygon.
 */
export interface PolygonCtorParams<T> extends Shape2DBaseCtorParams {
  path: Path
  brush: Brush<T>
}

/**
 * A 2D polygon shape that can be drawn on a canvas.
 *
 * The polygon is defined by a series of points (the path) and a brush that
 * determines how the edges are drawn.
 *
 * The polygon can be transformed by position, rotation, and hotspot.
 * The hotspot is the point around which the polygon rotates.
 * The position is the location of the hotspot in the canvas.
 *
 * The polygon is drawn by connecting the points in the path with lines
 * using the brush to determine the appearance of the lines.
 *
 * The polygon is closed by connecting the last point in the path
 * to the first point.
 *
 * The polygon does not fill the area inside the path; it only draws the edges.
 */
export class Polygon<T> implements Shape2D<T> {
  path: Path
  brush: Brush<T>
  transform: Transform

  constructor(params: PolygonCtorParams<T>) {
    const { path, brush } = params
    this.transform = makeShape2DTransform(params)
    this.path = path
    this.brush = brush
  }

  draw(canvas: Canvas<T, any>): void {
    const pts = this.path.map((p) =>
      coordRound(
        coordAdd(
          coordRotate(
            coordSubtract(p, this.transform.hotspot),
            this.transform.rot
          ),
          this.transform.pos
        )
      )
    )

    for (let i = 0; i < pts.length - 1; i++) {
      canvas.plotLine(pts[i], pts[i + 1], this.brush.cell())
    }
    canvas.plotLine(pts.at(-1), pts[0], this.brush.cell())
  }
}
