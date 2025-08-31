import { coordAddIn, coordRound } from '@pantomime/core'

import { GlyphCanvas, GridCanvas, TerminalDisplay } from '@src/index'
import { DemoResources, drawBox, makeHUD, register } from './common'

const FRAMERATE_MS = 1000 / 25
const BOX_DIMS = { w: 50, h: 25 }

const display = new TerminalDisplay()

const resources: DemoResources = {
  surface: display.makeSurface({
    layout: {
      size: {
        mode: 'fixed',
        dim: BOX_DIMS,
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

  const canvas: GlyphCanvas = new GridCanvas(BOX_DIMS)

  surface.on('resize', () => {
    console.clear()
    canvas.resize(surface.bounds)
    canvas.clear()
  })

  const dot = { x: 1, y: 1 }
  const velocity = { x: 0.6, y: 0.4 }

  const hud = makeHUD(display, surface, FRAMERATE_MS)

  resources.interval = setInterval(() => {
    const container = {
      x: 1,
      y: 1,
      w: surface.bounds.w - 2,
      h: surface.bounds.h - 2,
    }
    canvas.beginFrame()
    canvas.translate({ x: 0, y: 0 })
    drawBox(canvas, canvas.dim)

    canvas.translate({ x: 1, y: 1 })
    coordAddIn(dot, velocity)
    if (dot.x < 0) {
      dot.x = 0
      velocity.x = Math.abs(velocity.x)
    }
    if (dot.y < 0) {
      dot.y = 0
      velocity.y = Math.abs(velocity.y)
    }
    if (dot.x >= container.w - 1) {
      dot.x = container.w - 1
      velocity.x = -Math.abs(velocity.x)
    }
    if (dot.y >= container.h - 1) {
      dot.y = container.h - 1
      velocity.y = -Math.abs(velocity.y)
    }

    const i = coordRound(dot)

    canvas.plot(i, '*')
    hud.tick()
    surface.present(canvas.finalizeFrame())
  }, FRAMERATE_MS)
}

start()
