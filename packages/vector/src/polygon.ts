import {
  Canvas,
  Coord2D,
  coordAdd,
  coordDivide,
  coordRotate,
  coordRound,
  coordSubtract,
  coordSum,
  Degrees,
  Shape2D,
  Transform,
} from '@pantomime/core'

export type Path = Coord2D[]

export interface Brush<C> {
  cell(opts?: { angle?: Degrees }): C
}

export const coordAverage = (...cs: Coord2D[]) => {
  return coordDivide(coordSum(...cs), cs.length)
}

export class Polygon<T> implements Shape2D<T> {
  constructor(
    private path: Path,
    private brush: Brush<T>,
    public transform: Transform = { pos: { x: 0, y: 0 }, rot: 0 }
  ) {}

  draw(canvas: Canvas<T, any>): void {
    const hotspot = coordAverage(...this.path)
    const pts = this.path.map((p) =>
      coordRound(
        coordAdd(
          coordRotate(coordSubtract(p, hotspot), this.transform.rot),
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
