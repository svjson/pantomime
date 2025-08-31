import { Dimension2D } from '@pantomime/core'
import { Surface, Canvas, Display, GridCanvas } from '@src/index'

export interface DemoResources {
  surface: Surface
  interval: NodeJS.Timeout | null
  cleanedUp?: boolean
}

/**
 * Clean up terminal state
 */
export const cleanup = (res: DemoResources) => {
  if (res.cleanedUp) return
  res.cleanedUp = true
  if (res.interval) clearInterval(res.interval)
  res.surface.end()
  console.clear()
}

export const register = (res: DemoResources) => {
  // restore TTY on any exit path
  process.on('SIGINT', () => {
    cleanup(res)
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    cleanup(res)
    process.exit(0)
  })
  process.on('exit', () => cleanup(res))
}

/**
 * Draw a simple rectangle box
 */
export const drawBox = (canvas: Canvas, dim: Dimension2D) => {
  canvas.plot({ x: 0, y: 0 }, '+')
  canvas.plotHLine({ x: 1, y: 0 }, dim.w - 2, '-')

  canvas.plot({ x: dim.w - 1, y: 0 }, '+')
  canvas.plotVLine({ x: dim.w - 1, y: 1 }, dim.h - 2, '|')

  canvas.plot({ x: dim.w - 1, y: dim.h - 1 }, '+')
  canvas.plotHLine({ x: 1, y: dim.h - 1 }, dim.w - 2, '-')

  canvas.plot({ x: 0, y: dim.h - 1 }, '+')
  canvas.plotVLine({ x: 0, y: 1 }, dim.h - 2, '|')
}

export const makeHUD = (
  display: Display,
  demoSurface: Surface,
  targetHz: number
) => {
  const surface = display.makeSurface({
    layout: {
      size: {
        mode: 'fixed',
        dim: {
          w: 55,
          h: 3,
        },
      },
      hAlign: 'end',
      vAlign: 'end',
    },
  })

  let last = performance.now()
  let lastDraw = 0
  let emaFps = 0
  let frame = 0

  const canvas = new GridCanvas(surface.bounds)
  surface.on('resize', () => {
    canvas.resize(surface.bounds)
    canvas.clear()
  })

  const draw = () => {
    canvas.beginFrame()
    canvas.translate({ x: 0, y: 0 })
    drawBox(canvas, canvas.dim)
    canvas.translate({ x: 2, y: 1 })

    const innerW = Math.max(0, canvas.dim.w - 2)
    const memMb = process.memoryUsage().heapUsed / (1024 * 1024)
    const stats = [
      `FPS ${emaFps.toFixed(1)}`,
      `Frame ${frame}`,
      `Size ${demoSurface.bounds.w}×${demoSurface.bounds.h}`,
      `Mem ${memMb.toFixed(1)} MB`,
    ]

    let line = stats.join(' | ')

    if (line.length < innerW) line += ' '.repeat(innerW - line.length - 1)
    else if (line.length > innerW) line = stats.join('|')

    if (line.length > innerW) line = line.slice(0, innerW)

    canvas.text({ x: 0, y: 0 }, line)
    surface.present(canvas.finalizeFrame())
  }

  return {
    tick() {
      const now = performance.now()
      const dt = now - last
      last = now
      frame++

      const inst = dt > 0 ? 1000 / dt : emaFps || 0
      emaFps = emaFps ? emaFps * 0.9 + inst * 0.1 : inst

      if (now - lastDraw >= targetHz) {
        lastDraw = now
        draw()
      }
    },
  }
}
