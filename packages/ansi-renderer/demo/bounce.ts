import {
  ANSISurface,
  Canvas,
  coordAddIn,
  coordRound,
  GridCanvas,
} from '@src/index'
import { DemoResources, drawBox, register } from './common'

const ORIGIN = { x: 5, y: 5 }
const BOX_DIMS = { w: 50, h: 25 }

const resources: DemoResources = {
  surface: new ANSISurface(ORIGIN, BOX_DIMS),
  interval: null,
}

register(resources)
const { surface } = resources

const start = () => {
  console.clear()
  surface.begin()
  surface.clear()

  const canvas: Canvas = new GridCanvas(BOX_DIMS)
  canvas.beginFrame()
  drawBox(canvas, BOX_DIMS)

  surface.present(canvas.finalizeFrame())

  const dot = { x: 1, y: 1 }
  const velocity = { x: 0.6, y: 0.4 }
  let prevCoord = { ...dot }

  const container = { x: 1, y: 1, w: BOX_DIMS.w - 2, h: BOX_DIMS.h - 2 }
  canvas.translate({ x: 1, y: 1 })

  const fpsMs = 1000 / 25
  resources.interval = setInterval(() => {
    canvas.beginFrame(false)

    coordAddIn(dot, velocity)
    if (dot.x < 0) {
      dot.x = 0
      velocity.x = Math.abs(velocity.x)
    }
    if (dot.y < 0) {
      dot.y = 0
      velocity.y = Math.abs(velocity.y)
    }
    if (dot.x > container.w - 1) {
      dot.x = container.w - 1
      velocity.x = -Math.abs(velocity.x)
    }
    if (dot.y > container.h - 1) {
      dot.y = container.h - 1
      velocity.y = -Math.abs(velocity.y)
    }

    const i = coordRound(dot)

    canvas.plot(prevCoord, ' ')
    canvas.plot(i, '*')
    surface.present(canvas.finalizeFrame())

    prevCoord = i
  }, fpsMs)
}

start()
