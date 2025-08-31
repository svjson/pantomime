import {
  Canvas,
  Coord2D,
  GridCanvas,
  coordAddIn,
  coordDistance,
  TerminalDisplay,
} from '@src/index'
import { DemoResources, drawBox, register } from './common'

const FRAMERATE_MS = 1000 / 25
const RAMP = ' .:-=+*#%@%#*+=-:. '

const display = new TerminalDisplay()

const resources: DemoResources = {
  surface: display.makeSurface({
    layout: {
      size: {
        mode: 'relative',
        dim: {
          w: { kind: '%', value: 80 },
          h: { kind: '%', value: 80 },
        },
      },
      hAlign: 'center',
      vAlign: 'center',
    },
  }),
  interval: null,
}
register(resources)
const { surface } = resources

const start = () => {
  console.clear()
  surface.begin()
  surface.clear()

  const canvas: Canvas = new GridCanvas(surface.bounds)

  surface.on('resize', () => {
    console.clear()
    canvas.resize(surface.bounds)
    canvas.clear()
  })

  let container = {
    x: 1,
    y: 1,
    w: surface.bounds.w - 2,
    h: surface.bounds.h - 2,
  }

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

  resources.interval = setInterval(() => {
    let container = {
      x: 1,
      y: 1,
      w: surface.bounds.w - 2,
      h: surface.bounds.h - 2,
    }
    canvas.beginFrame()
    canvas.translate({ x: 0, y: 0 })
    drawBox(canvas, canvas.dim)

    canvas.translate({ x: 1, y: 1 })

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
          RAMP[RAMP.length - Math.round(RAMP.length * (dist / container.w))] ??
            ' '
        )
      }
    }

    surface.present(canvas.finalizeFrame())
  }, FRAMERATE_MS)
}

start()
