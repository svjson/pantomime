import { Coord2D } from './geom'
import { Cell } from './surface'
import { Canvas } from './canvas'
import { coordAdd, coordRotate, coordRound, coordSubtract } from './arithmetic'

export type Shape2D = Cell[][]

export type Degrees = number

export interface Transform {
  pos: Coord2D
  rot?: Degrees
}

export const makeShape = (
  lines: string[],
  fg?: number,
  bg?: number
): Shape2D => {
  return lines.map((line) => Array.from(line).map((ch) => ({ ch, fg, bg })))
}

export class Entity {
  transform: Transform
  shape: Shape2D

  constructor(pos: Coord2D, shape: Shape2D) {
    this.transform = { pos, rot: 0 }
    this.shape = shape
  }

  draw(canvas: Canvas) {
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
          if (cell && cell.ch !== ' ') {
            canvas.plot({ x, y }, cell)
          }
        }
      }
    }
  }
}
