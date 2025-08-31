import { Transform } from '@src/geom'
import { Canvas } from './canvas'

export interface Shape2D<T> {
  transform: Transform
  draw(canvas: Canvas<T, any>): void
}
