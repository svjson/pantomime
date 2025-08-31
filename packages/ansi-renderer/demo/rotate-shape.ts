import { ANSISurface, Canvas, GridCanvas, Entity, makeShape } from '@src/index'
import { DemoResources, drawBox, register } from './common'

const ORIGIN = { x: 5, y: 5 }
const BOX_DIMS = { w: 150, h: 40 }
const fpsMs = 1000 / 25

const resources: DemoResources = {
  surface: new ANSISurface(ORIGIN, BOX_DIMS),
  interval: null,
}
register(resources)
const { surface } = resources

const start = () => {
  console.clear()
  surface.begin()

  const canvas: Canvas = new GridCanvas(BOX_DIMS)
  canvas.beginFrame()
  drawBox(canvas, BOX_DIMS)

  const container = { x: 1, y: 1, w: BOX_DIMS.w - 2, h: BOX_DIMS.h - 2 }
  canvas.translate({ x: 1, y: 1 })

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

  resources.interval = setInterval(() => {
    canvas.beginFrame()
    entity.draw(canvas)
    surface.present(canvas.finalizeFrame())

    entity.transform.rot += 0.05
    // entity.transform.pos.x += 0.03
    // entity.transform.pos.y += 0.01
  }, fpsMs)
}

start()
