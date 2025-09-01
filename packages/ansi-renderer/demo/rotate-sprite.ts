import { coordRound } from '@pantomime/core'
import { Sprite } from '@pantomime/raster'

import {
  GlyphCanvas,
  GridCanvas,
  makeGlyphBitmap,
  TerminalDisplay,
} from '@src/index'
import { DemoResources, drawBox, makeHUD, register } from './common'
import { Cell } from './surface'

const FRAMERATE_MS = 1000 / 25

const display = new TerminalDisplay()

const resources: DemoResources = {
  surface: display.makeSurface({
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
  }),
  interval: null,
}
register(resources)
const { surface } = resources

const start = () => {
  console.clear()
  surface.begin()

  const canvas: GlyphCanvas = new GridCanvas(surface.bounds)

  surface.on('resize', () => {
    console.clear()
    canvas.resize(surface.bounds)
    canvas.clear()
  })

  const shape = makeGlyphBitmap([
    '    ,#####       ##        ##    .##    #########    ###  ',
    '   ,#...,*#    ##*.##     #*.#  .#**#  #*.......*#  #*.*# ',
    '   #*.##,,#   #*.##.#    #*...# #*.**   ##-...###  #*...# ',
    '   #*.##*.#  #*.# #.#   #*.....##..*#     #..#    #*.#*.# ',
    '   #*...##   #*.###..#  #*..##*.....*#   .#..#    #.# #.# ',
    '   #*.##     #*......#  #*..# #*....*#   #*..#    #.# #.# ',
    '   #*..#     #*.##*..#  #*..#  #*..*#    #*..#    #.*#..# ',
    '   #*...#    #*.# #..#  #*..#  #*.*#     #..#      #...#  ',
    '    #*.*#    #*#  #*#    #.#    #*#       ##       #..#   ',
    '     ###     ##    #      #      #                  ##*   ',
  ])
  const sprite = new Sprite<Cell>({
    pos: { x: 50, y: 20 },
    bitmap: shape,
    isEmpty: (c) => !c || c.ch === ' ',
  })
  sprite.transform.hotspot = {
    x: shape[0].length / 2,
    y: shape.length / 2,
  }

  const hud = makeHUD(display, surface, FRAMERATE_MS)

  resources.interval = setInterval(() => {
    canvas.beginFrame(true)
    canvas.setClip()
    drawBox(canvas, canvas.dim)
    const container = {
      x: 1,
      y: 1,
      w: canvas.dim.w - 2,
      h: canvas.dim.h - 2,
    }
    canvas.setClip(container)

    sprite.transform.rot += 0.05
    sprite.position = coordRound({ x: canvas.dim.w / 2, y: canvas.dim.h / 2 })
    sprite.draw(canvas)
    surface.present(canvas.finalizeFrame())
    hud.tick()
  }, FRAMERATE_MS)
}

start()
