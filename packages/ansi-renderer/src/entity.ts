import { Coord2D } from './geom'
import { Cell } from './surface'
import { Canvas } from './canvas'

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
    const { x, y } = this.transform.pos
    for (let dy = 0; dy < this.shape.length; dy++) {
      const row = this.shape[dy]
      for (let dx = 0; dx < row.length; dx++) {
        const cell = row[dx]
        if (cell.ch !== ' ') {
          canvas.plot({ x: Math.round(x + dx), y: Math.round(y + dy) }, cell)
        }
      }
    }
  }
}
