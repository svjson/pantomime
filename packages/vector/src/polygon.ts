import { Canvas, Coord2D, Degrees, Shape2D, Transform } from '@pantomime/core'

export type Path = Coord2D[]

export interface Brush<C> {
  cell(opts?: { angle?: Degrees }): C
}

export class Polygon<T> implements Shape2D<T> {
  constructor(
    private path: Path,
    private brush: Brush<T>,
    public transform: Transform = { pos: { x: 0, y: 0 }, rot: 0 }
  ) {}

  draw(canvas: Canvas<T, any>): void {
    for (let i = 0; i < this.path.length - 1; i++) {
      canvas.plotLine(this.path[i], this.path[i + 1], this.brush.cell())
    }
    canvas.plotLine(this.path.at(-1), this.path[0], this.brush.cell())
  }
}
