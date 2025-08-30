const ESC = '\x1b[' // CSI

const write = (s: string) => process.stdout.write(s)
const cursorTo = (row: number, col: number) => write(`${ESC}${row};${col}H`)
const hideCursor = () => write('\x1b[?25l')
const showCursor = () => write('\x1b[?25h')

const ORIGIN_ROW = 2
const ORIGIN_COL = 2
const BOX_COLS = 40
const BOX_ROWS = 20

let interval: NodeJS.Timeout | null = null
let cleanedUp = false

/**
 * Draw a simple rectanle box
 */
function drawBox() {
  cursorTo(ORIGIN_ROW - 1, ORIGIN_COL - 1)
  write('+' + '-'.repeat(BOX_COLS) + '+')
  for (let r = 0; r < BOX_ROWS; r++) {
    cursorTo(ORIGIN_ROW + r, ORIGIN_COL - 1)
    write('|')
    cursorTo(ORIGIN_ROW + r, ORIGIN_COL + BOX_COLS)
    write('|')
  }
  cursorTo(ORIGIN_ROW + BOX_ROWS, ORIGIN_COL - 1)
  write('+' + '-'.repeat(BOX_COLS) + '+')
}

/**
 * Clean up terminal state
 */
function cleanup() {
  if (cleanedUp) return
  cleanedUp = true
  if (interval) clearInterval(interval)
  showCursor()
  cursorTo(ORIGIN_ROW + BOX_ROWS + 2, 1)
  write('\n')
}

function start() {
  if (!process.stdout.isTTY) {
    console.error('Not a TTY. Run in a real terminal.')
    process.exit(1)
  }

  hideCursor()
  // Clear just our region
  for (let r = 0; r < BOX_ROWS + 3; r++) {
    cursorTo(ORIGIN_ROW - 1 + r, ORIGIN_COL - 1)
    write(' '.repeat(BOX_COLS + 2))
  }
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
    cursorTo(ORIGIN_ROW + py, ORIGIN_COL + px)
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
    if (x > BOX_COLS - 1) {
      x = BOX_COLS - 1
      vx = -Math.abs(vx)
    }
    if (y > BOX_ROWS - 1) {
      y = BOX_ROWS - 1
      vy = -Math.abs(vy)
    }

    // draw new
    const ix = Math.round(x)
    const iy = Math.round(y)
    cursorTo(ORIGIN_ROW + iy, ORIGIN_COL + ix)
    write('*')

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
