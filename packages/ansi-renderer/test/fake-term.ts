import { TerminalOutput, TerminalOutputEventType } from './display'
import { Dimension2D } from '@pantomime/core'

export class FakeTerminalOutput implements TerminalOutput {
  written: (Uint8Array | string)[] = []

  columns: number
  rows: number
  isTTY: boolean

  listeners: Record<TerminalOutputEventType, Function[]> = {
    resize: [],
  }

  constructor({
    columns,
    rows,
    isTTY = true,
  }: {
    columns: number
    rows: number
    isTTY?: boolean
  }) {
    this.columns = columns
    this.rows = rows
    this.isTTY = isTTY
  }

  write(
    buffer: Uint8Array | string,
    _cb?: (err?: Error | null) => void
  ): boolean {
    this.written.push(buffer)
    return true
  }

  on(event: TerminalOutputEventType, handler: Function) {
    this.listeners[event].push(handler)
  }

  emit(event: TerminalOutputEventType) {
    this.listeners[event].forEach((l) => {
      l()
    })
  }

  resize(dim: Dimension2D) {
    this.columns = dim.w
    this.rows = dim.h
    this.emit('resize')
  }
}
