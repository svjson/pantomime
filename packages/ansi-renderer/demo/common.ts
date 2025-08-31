import { Surface, Canvas, Dimension2D } from '@src/index'

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
