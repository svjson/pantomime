import {
  Surface,
  ANSISurface,
  Cell,
  Run,
  Patch,
  coordAdd,
  coordAddIn,
  coordRound,
} from './surface'

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
  const dot = { x: 1, y: 1 }
  const velocity = { x: 0.6, y: 0.4 }
  let prevCoord = { ...dot }

  const fpsMs = 1000 / 25
  interval = setInterval(() => {
    // update
    coordAddIn(dot, velocity)
    if (dot.x < 0) {
      dot.x = 0
      velocity.x = Math.abs(velocity.x)
    }
    if (dot.y < 0) {
      dot.y = 0
      velocity.y = Math.abs(velocity.y)
    }
    if (dot.x > BOX_DIMS.w - 1) {
      dot.x = BOX_DIMS.w - 1
      velocity.x = -Math.abs(velocity.x)
    }
    if (dot.y > BOX_DIMS.h - 1) {
      dot.y = BOX_DIMS.h - 1
      velocity.y = -Math.abs(velocity.y)
    }

    const i = coordRound(dot)

    const patch: Patch = [
      { ...prevCoord, cells: [{ ch: ' ' }] },
      { ...i, cells: [{ ch: '*' }] },
    ]
    surface.present(patch)

    prevCoord = i
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
