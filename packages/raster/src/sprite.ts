import {
  Canvas,
  Coord2D,
  coordAdd,
  coordRotate,
  coordSubtract,
  makeShape2DTransform,
  Shape2D,
  Shape2DBaseCtorParams,
  Transform,
} from '@pantomime/core'

import { Bitmap } from './bitmap'

export interface SpriteCtorParams<T> extends Shape2DBaseCtorParams {
  isEmpty: (p: T) => boolean
  bitmap: Bitmap<T>
}

export class Sprite<T> implements Shape2D<T> {
  transform: Transform
  shape: Bitmap<T>

  isEmpty: (p: T) => boolean

  constructor(params: SpriteCtorParams<T>) {
    const { bitmap, isEmpty } = params
    this.transform = makeShape2DTransform(params)
    this.shape = bitmap
    this.isEmpty = isEmpty
  }

  set position(pos: Coord2D) {
    this.transform.pos = pos
  }

  draw(canvas: Canvas<T, any>) {
    const rot = this.transform.rot
    const w = this.shape[0].length
    const h = this.shape.length

    const c = {
      x: w / 2,
      y: h / 2,
    }

    const corners = [
      { x: 0, y: 0 },
      { x: w - 1, y: 0 },
      { x: 0, y: h - 1 },
      { x: w - 1, y: h - 1 },
    ].map((p) =>
      coordAdd(coordRotate(coordSubtract(p, c), rot), this.transform.pos)
    )

    const xs = corners.map((c) => c.x)
    const ys = corners.map((c) => c.y)

    const minX = Math.round(Math.min(...xs))
    const maxX = Math.round(Math.max(...xs))
    const minY = Math.round(Math.min(...ys))
    const maxY = Math.round(Math.max(...ys))

    const shape = this.shape

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const local = coordAdd(
          coordRotate(
            coordSubtract({ x, y }, this.transform.pos),
            -this.transform.rot
          ),
          c
        )

        if (local.x >= 0 && local.x < w && local.y >= 0 && local.y < h) {
          const cell = shape[Math.floor(local.y)][Math.floor(local.x)]
          if (!this.isEmpty(cell)) {
            canvas.plot({ x, y }, cell)
          }
        }
      }
    }
  }
}
