import { Surface } from '@src/surface'

let cleanedUp = false

/**
 * Clean up terminal state
 */
export const cleanup = (surface: Surface, interval: NodeJS.Timeout | null) => {
  if (cleanedUp) return
  cleanedUp = true
  if (interval) clearInterval(interval)
  surface.end()
  console.clear()
}
