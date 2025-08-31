import {
  ANSISurface,
  Canvas,
  Coord2D,
  GridCanvas,
  coordAddIn,
  coordDistance,
} from '@src/index'
import { DemoResources, drawBox, register } from './common'

const ORIGIN = { x: 5, y: 5 }
const BOX_DIMS = { w: 150, h: 40 }

const RAMP = ' .:-=+*#%@%#*+=-:. '

const resources: DemoResources = {
  surface: new ANSISurface(ORIGIN, BOX_DIMS),
  interval: null,
}
register(resources)
const { surface } = resources

const start = () => {
  console.clear()
  surface.begin()

  const canvas: Canvas = new GridCanvas(BOX_DIMS)
  canvas.beginFrame()
  drawBox(canvas, BOX_DIMS)

  surface.present(canvas.finalizeFrame())
  const container = { x: 1, y: 1, w: BOX_DIMS.w - 2, h: BOX_DIMS.h - 2 }
  canvas.translate({ x: 1, y: 1 })

  const nexii: { pos: Coord2D; vel: Coord2D }[] = []
  for (let i = 0; i < 5; i++) {
    nexii.push({
      pos: {
        x: Math.random() * container.w,
        y: Math.random() * container.h,
      },
      vel: {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
      },
    })
  }

  const fpsMs = 1000 / 25
  resources.interval = setInterval(() => {
    canvas.beginFrame(false)

    for (const { pos, vel } of nexii) {
      coordAddIn(pos, vel)

      if (pos.x < 0) {
        pos.x = 0
        vel.x = Math.abs(vel.x)
      }
      if (pos.y < 0) {
        pos.y = 0
        vel.y = Math.abs(vel.y)
      }
      if (pos.x > container.w - 1) {
        pos.x = container.w - 1
        vel.x = -Math.abs(vel.x)
      }
      if (pos.y > container.h - 1) {
        pos.y = container.h - 1
        vel.y = -Math.abs(vel.y)
      }
    }

    for (let y = 0; y < container.h; y++) {
      for (let x = 0; x < container.w; x++) {
        const dist =
          (2 *
            nexii
              .map((n) => coordDistance(n.pos, { x, y }))
              .reduce(
                (sum, d) => sum + d,

                0
              )) /
          nexii.length

        canvas.plot(
          { x, y },
          RAMP[RAMP.length - Math.round(RAMP.length * (dist / BOX_DIMS.w))] ??
            ' '
        )
      }
    }

    surface.present(canvas.finalizeFrame())
  }, fpsMs)
}

start()
