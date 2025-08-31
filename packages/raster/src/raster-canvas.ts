import { Canvas } from '@pantomime/core'
import { Color } from './color'

export type FrameBuffer = {}

export interface RasterCanvas extends Canvas<Color, FrameBuffer> {}
