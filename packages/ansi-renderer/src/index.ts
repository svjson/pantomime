import { Surface, ANSISurface, Cell, Run, Patch } from './surface'

const ESC = '\x1b[' // CSI

const write = (s: string) => process.stdout.write(s)
const cursorTo = (row: number, col: number) => write(`${ESC}${row};${col}H`)

const ORIGIN = { x: 2, y: 2 }
const BOX_DIMS = { w: 40, h: 20 }

const surface = new ANSISurface(ORIGIN)

let interval: NodeJS.Timeout | null = null
let cleanedUp = false

/**
 * Draw a simple rectangle box
 */
function drawBox() {
  cursorTo(ORIGIN.y - 1, ORIGIN.x - 1)
  write('+' + '-'.repeat(BOX_DIMS.w) + '+')
  for (let r = 0; r < BOX_DIMS.h; r++) {
    cursorTo(ORIGIN.y + r, ORIGIN.x - 1)
    write('|')
    cursorTo(ORIGIN.y + r, ORIGIN.x + BOX_DIMS.w)
    write('|')
  }
  cursorTo(ORIGIN.y + BOX_DIMS.h, ORIGIN.x - 1)
  write('+' + '-'.repeat(BOX_DIMS.w) + '+')
}

/**
 * Clean up terminal state
 */
function cleanup() {
  if (cleanedUp) return
  cleanedUp = true
  if (interval) clearInterval(interval)
  surface.end()
  write('\n')
}

function start() {
  surface.begin()
  surface.clear()

  // Clear just our region
  drawBox()

  // dot state
  let x = 1,
    y = 1
  let vx = 0.6,
    vy = 0.4 // cells per frame @ ~25 fps
  let px = x,
    py = y // previous integer position for erasing

  const fpsMs = 1000 / 25
  interval = setInterval(() => {
    // erase previous
    cursorTo(ORIGIN.y + py, ORIGIN.x + px)
    write(' ')

    // update
    x += vx
    y += vy
    if (x < 0) {
      x = 0
      vx = Math.abs(vx)
    }
    if (y < 0) {
      y = 0
      vy = Math.abs(vy)
    }
    if (x > BOX_DIMS.w - 1) {
      x = BOX_DIMS.w - 1
      vx = -Math.abs(vx)
    }
    if (y > BOX_DIMS.h - 1) {
      y = BOX_DIMS.h - 1
      vy = -Math.abs(vy)
    }

    const ix = Math.round(x)
    const iy = Math.round(y)

    const patch: Patch = [
      { y: py, x: px, cells: [{ ch: ' ' }] },
      { y: iy, x: ix, cells: [{ ch: '*' }] },
    ]
    surface.present(patch)

    px = ix
    py = iy
  }, fpsMs)
}

// restore TTY on any exit path
process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})
process.on('SIGTERM', () => {
  cleanup()
  process.exit(0)
})
process.on('exit', cleanup)

// kick it off
start()
