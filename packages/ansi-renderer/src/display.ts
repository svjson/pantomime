import { Dimension2D } from './geom'
import { Layout, LayoutOptions } from './layout'
import { ANSISurface, Output, Surface } from './surface'

export interface SurfaceOptions {
  layout: LayoutOptions
}

export type Node = {
  id: number
  surface: Surface
  layout: Layout
  z: number
  visible: boolean
}

export interface Display {
  output: Output
  rootLayout: Layout
  size: Dimension2D

  makeSurface(opts?: SurfaceOptions): Surface
}

export type TerminalOutputEventType = 'resize'

export interface TerminalOutput extends Output {
  on: (event: TerminalOutputEventType, cb: Function) => void
  columns: number
  rows: number
}

/**
 * TerminalDisplay is a Display implementation that uses a terminal as the output
 * device.
 *
 * It creates ANSISurface instances for rendering content to the terminal.
 * It listens for terminal resize events and updates the size of the root layout
 * and all child surfaces accordingly.
 */
export class TerminalDisplay implements Display {
  #_output:
    | (NodeJS.WriteStream & {
        fd: 1
      })
    | TerminalOutput
  root: Layout
  #_size: Dimension2D
  #_nodeCounter: number = 0

  private nodes: Node[] = []

  constructor({ output }: { output?: TerminalOutput } = {}) {
    this.#_output = output ?? process.stdout
    this.root = new Layout({
      size: {
        mode: 'relative',
        dim: {
          w: { kind: '%', value: 100 },
          h: { kind: '%', value: 100 },
        },
      },
    })
    this.#_size = this.#_outputSize()

    this.#_output.on('resize', () => {
      this.#_size = this.#_outputSize()
      this.nodes.forEach((n) => {
        n.surface.setBounds(n.layout.apply({ x: 1, y: 1, ...this.size }))
      })
    })
  }

  get output(): Output {
    return this.#_output
  }

  get rootLayout(): Layout {
    return this.root
  }

  get size(): Dimension2D {
    return { ...this.#_size }
  }

  #_outputSize(): Dimension2D {
    return {
      w: this.#_output.columns,
      h: this.#_output.rows,
    }
  }

  makeSurface(opts?: SurfaceOptions): Surface {
    const layout = new Layout(
      opts?.layout ?? {
        size: { ...this.root.size },
      }
    )
    const surface = new ANSISurface(
      { x: 1, y: 1 },
      { ...this.size },
      this.#_output
    )

    this.nodes.push({
      id: ++this.#_nodeCounter,
      surface,
      layout,
      visible: true,
      z: this.#_nodeCounter,
    })

    surface.setBounds(layout.apply({ x: 1, y: 1, ...this.size }))

    return surface
  }
}
