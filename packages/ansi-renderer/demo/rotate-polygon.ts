import { coordDivide, coordRound, coordSubtract } from '@pantomime/core'

import { GlyphCanvas, GridCanvas, TerminalDisplay } from '@src/index'
import { DemoResources, drawBox, makeHUD, register } from './common'
import { Polygon } from '@pantomime/vector'
import { Glyph } from './glyph-canvas'

const FRAMERATE_MS = 1000 / 25

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

  const canvas: GlyphCanvas = new GridCanvas(surface.bounds)

  const polygonA = new Polygon<Glyph>(
    [
      { x: 20, y: 80 },
      { x: 40, y: 20 },
      { x: 50, y: 20 },
      { x: 70, y: 80 },
      { x: 60, y: 80 },
      { x: 52, y: 60 },
      { x: 38, y: 60 },
      { x: 30, y: 80 },
    ],
    {
      cell: () => '*',
    }
  )

  const hud = makeHUD(display, surface, FRAMERATE_MS)

  resources.interval = setInterval(() => {
    canvas.beginFrame(true)
    canvas.setClip()
    drawBox(canvas, canvas.dim)
    const container = {
      x: 1,
      y: 1,
      w: canvas.dim.w - 2,
      h: canvas.dim.h - 2,
    }
    canvas.setClip(container)

    polygonA.transform.rot += 0.05
    polygonA.transform.pos = coordRound({
      x: canvas.dim.w / 2,
      y: canvas.dim.h / 2,
    })
    polygonA.draw(canvas)
    surface.present(canvas.finalizeFrame())
    hud.tick()
  }, FRAMERATE_MS)
}

start()
