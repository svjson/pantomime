import { describe, it, expect } from 'vitest'
import { FakeTerminalOutput } from './fake-term'
import { GridCanvas, TerminalDisplay } from '@src/index'

describe('Drawing to centered relative surface via GridCanvas', () => {
  it('should correctly translate coordinates through pipeline, start to finish', () => {
    // Initial setup
    const output = new FakeTerminalOutput({
      columns: 211,
      rows: 56,
      isTTY: true,
    })
    const display = new TerminalDisplay({ output: output })

    const surface = display.makeSurface({
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
    })

    // Verify surface bounds
    expect(surface.bounds).toEqual({
      x: 21,
      y: 6,
      w: 169,
      h: 45,
    })

    const canvas = new GridCanvas(surface.bounds)
    expect(canvas.dim).toEqual({ w: 169, h: 45 })

    canvas.plot({ x: 0, y: 0 }, '+')

    const patch = canvas.finalizeFrame()

    expect(patch).toEqual([
      {
        x: 0,
        y: 0,
        cells: [
          {
            ch: '+',
          },
        ],
      },
    ])

    surface.present(patch)

    expect(output.written.join('')).toEqualAnsi('\x1b[6;21H+')
  })
})
