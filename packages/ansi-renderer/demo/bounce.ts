import { ANSISurface } from '@src/surface'
import { coordAddIn, coordRound } from '@src/arithmetic'
import { GridCanvas } from '@src/grid'
import { Canvas } from '@src/canvas'
import { cleanup } from './common'

const ORIGIN = { x: 5, y: 5 }
const BOX_DIMS = { w: 50, h: 25 }

const surface = new ANSISurface(ORIGIN, BOX_DIMS)

let interval: NodeJS.Timeout | null = null

/**
 * Draw a simple rectangle box
 */
const drawBox = (canvas: Canvas) => {
  canvas.plot({ x: 0, y: 0 }, '+')
  canvas.plotHLine({ x: 1, y: 0 }, BOX_DIMS.w - 2, '-')
  canvas.plot({ x: BOX_DIMS.w - 1, y: 0 }, '+')
  canvas.plotVLine({ x: BOX_DIMS.w - 1, y: 1 }, BOX_DIMS.h - 2, '|')
  canvas.plot({ x: BOX_DIMS.w - 1, y: BOX_DIMS.h - 1 }, '+')
  canvas.plotHLine({ x: 1, y: BOX_DIMS.h - 1 }, BOX_DIMS.w - 2, '-')
  canvas.plot({ x: 0, y: BOX_DIMS.h - 1 }, '+')
  canvas.plotVLine({ x: 0, y: 1 }, BOX_DIMS.h - 2, '|')
}

const start = () => {
  console.clear()
  surface.begin()
  surface.clear()

  const canvas = new GridCanvas(BOX_DIMS)
  canvas.beginFrame()
  drawBox(canvas)

  surface.present(canvas.finalizeFrame())

  const dot = { x: 1, y: 1 }
  const velocity = { x: 0.6, y: 0.4 }
  let prevCoord = { ...dot }

  const container = { x: 1, y: 1, w: BOX_DIMS.w - 2, h: BOX_DIMS.h - 2 }
  canvas.translate({ x: 1, y: 1 })

  const fpsMs = 1000 / 25
  interval = setInterval(() => {
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

// restore TTY on any exit path
process.on('SIGINT', () => {
  cleanup(surface, interval)
  process.exit(0)
})
process.on('SIGTERM', () => {
  cleanup(surface, interval)
  process.exit(0)
})
process.on('exit', () => cleanup(surface, interval))

start()
