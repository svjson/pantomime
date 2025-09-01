import { Coord2D, Degrees, Transform } from '@src/geom'
import { Canvas } from './canvas'

export interface Shape2DBaseCtorParams {
  pos?: Coord2D
  hotspot?: Coord2D
  rot?: Degrees
}

export interface Shape2D<T> {
  transform: Transform
  draw(canvas: Canvas<T, any>): void
}

export const makeShape2DTransform = ({
  pos,
  hotspot,
  rot,
}: Shape2DBaseCtorParams) => {
  return {
    pos: pos ?? { x: 0, y: 0 },
    rot: rot ?? 0,
    hotspot: hotspot ?? { x: 0, y: 0 },
  }
}
