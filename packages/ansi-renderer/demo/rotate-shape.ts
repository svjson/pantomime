import { coordRound } from '@pantomime/core'

import {
  Canvas,
  GridCanvas,
  Entity,
  makeShape,
  TerminalDisplay,
} from '@src/index'
import { DemoResources, drawBox, makeHUD, register } from './common'

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

  const canvas: Canvas = new GridCanvas(surface.bounds)

  const shape = makeShape([
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
  const entity = new Entity({ x: 50, y: 20 }, shape)

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

    entity.transform.rot += 0.05
    entity.position = coordRound({ x: canvas.dim.w / 2, y: canvas.dim.h / 2 })
    entity.draw(canvas)
    surface.present(canvas.finalizeFrame())
    hud.tick()
  }, FRAMERATE_MS)
}

start()
