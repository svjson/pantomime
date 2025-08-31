import { describe, expect, it } from 'vitest'
import { TerminalDisplay } from '@src/index'
import { FakeTerminalOutput } from './fake-term'

describe('TerminalDisplay', () => {
  describe('makeSurface', () => {
    describe('Surface construction', () => {
      it('should create a new surface with default values when called with no args', () => {
        // Given
        const output = new FakeTerminalOutput({ columns: 80, rows: 25 })
        const terminal = new TerminalDisplay({ output })

        // When
        const surface = terminal.makeSurface()

        // Then
        expect(surface.bounds).toEqual({
          x: 0,
          y: 0,
          w: 80,
          h: 25,
        })
      })

      it('should create a new centered fixed-width surface', () => {
        // Given
        const output = new FakeTerminalOutput({ columns: 100, rows: 100 })
        const terminal = new TerminalDisplay({ output })

        // When
        const surface = terminal.makeSurface({
          layout: {
            size: {
              mode: 'fixed',
              dim: {
                w: 50,
                h: 20,
              },
            },
            hAlign: 'center',
            vAlign: 'center',
          },
        })

        // Then
        expect(surface.bounds).toEqual({
          x: 25,
          y: 40,
          w: 50,
          h: 20,
        })
      })

      it('should create a new centered relative-size surface', () => {
        // Given
        const output = new FakeTerminalOutput({ columns: 100, rows: 100 })
        const terminal = new TerminalDisplay({ output })

        // When
        const surface = terminal.makeSurface({
          layout: {
            size: {
              mode: 'relative',
              dim: {
                w: { kind: '%', value: 20 },
                h: { kind: '%', value: 40 },
              },
            },
            hAlign: 'center',
            vAlign: 'center',
          },
        })

        // Then
        expect(surface.bounds).toEqual({
          x: 40,
          y: 30,
          w: 20,
          h: 40,
        })
      })
    })

    describe('Display resize', () => {
      it('should stretch default arg surface to match new terminal dimension', () => {
        // Given
        const output = new FakeTerminalOutput({ columns: 80, rows: 25 })
        const terminal = new TerminalDisplay({ output })

        // When
        const surface = terminal.makeSurface()
        output.resize({ w: 100, h: 80 })

        // Then
        expect(surface.bounds).toEqual({
          x: 0,
          y: 0,
          w: 100,
          h: 80,
        })
      })

      it('should keep fixed-width dimension and recenter centered surface', () => {
        // Given
        const output = new FakeTerminalOutput({ columns: 100, rows: 100 })
        const terminal = new TerminalDisplay({ output })

        // When
        const surface = terminal.makeSurface({
          layout: {
            size: {
              mode: 'fixed',
              dim: {
                w: 50,
                h: 20,
              },
            },
            hAlign: 'center',
            vAlign: 'center',
          },
        })
        output.resize({ w: 80, h: 100 })

        // Then
        expect(surface.bounds).toEqual({
          x: 15,
          y: 40,
          w: 50,
          h: 20,
        })
      })

      it('should reapply relative dimension and recenter centered surface', () => {
        // Given
        const output = new FakeTerminalOutput({ columns: 100, rows: 100 })
        const terminal = new TerminalDisplay({ output })

        // When
        const surface = terminal.makeSurface({
          layout: {
            size: {
              mode: 'relative',
              dim: {
                w: { kind: '%', value: 50 },
                h: { kind: '%', value: 20 },
              },
            },
            hAlign: 'center',
            vAlign: 'center',
          },
        })
        output.resize({ w: 80, h: 100 })

        // Then
        expect(surface.bounds).toEqual({
          x: 20,
          y: 40,
          w: 40,
          h: 20,
        })
      })
    })
  })
})
