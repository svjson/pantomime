import { Dimension2D, Rect2D } from './geom'

export type Insets = {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export type Dim2DConstraint = {
  w: Length
  h: Length
}

export type Length =
  | { kind: 'px'; value: number }
  | { kind: '%'; value: number } // 0..100
  | { kind: 'fr'; value: number } // flexible fractions (grid-like)

export type Align = 'start' | 'center' | 'end' | 'stretch'

export type ResizePolicy =
  | FixedSize
  | {
      mode: 'relative'
      dim: Dim2DConstraint
      min?: Rect2D
      max?: Rect2D
    }
  | {
      mode: 'aspect'
      aspect: number
      basis: 'width' | 'height' | 'min'
      max?: Rect2D
    }
  | { mode: 'fit'; padding?: Insets; min?: Rect2D; max?: Rect2D }

export type FixedSize = {
  mode: 'fixed'
  dim: Dimension2D
}

export const applyRelativeLength = (length: Length, value: number) => {
  switch (length.kind) {
    case '%':
      return Math.round((value / 100) * length.value)
    default:
      return value
  }
}

export const applyRelativeDim = (
  constraint: Dim2DConstraint,
  parentDim: Dimension2D
): Dimension2D => {
  return {
    w: applyRelativeLength(constraint.w, parentDim.w),
    h: applyRelativeLength(constraint.h, parentDim.h),
  }
}

export const applyAlignment = (
  align: Align,
  parentSide: number,
  side: number
) => {
  switch (align) {
    case 'center':
      return Math.round(parentSide / 2 - side / 2)
    case 'end':
      return parentSide - side
    default:
      return 0
  }
}

export interface LayoutOptions {
  /**
   * Controls automatic resize of the target layout
   */
  size: ResizePolicy
  hAlign?: Align
  vAlign?: Align
  margin?: Insets
  z?: number
  anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  offset?: { dx?: Length; dy?: Length }
}

export class Layout {
  /**
   * Controls automatic resize behavior of this Layout instance
   */
  size: ResizePolicy
  hAlign: Align
  vAlign: Align
  margin?: Insets
  z?: number // draw order
  anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  offset?: { dx?: Length; dy?: Length } // nudge from anchor

  constructor(opts: LayoutOptions) {
    this.size = opts.size
    this.hAlign = opts.hAlign ?? 'start'
    this.vAlign = opts.vAlign ?? 'start'
    this.margin = opts.margin
    this.z = opts.z
    this.anchor = opts.anchor
    this.offset = opts.offset
  }

  apply(parentRect: Rect2D): Rect2D {
    const rect = { ...parentRect }

    if (this.size.mode === 'fixed') {
      Object.assign(rect, this.size.dim)
    } else if (this.size.mode === 'relative') {
      Object.assign(rect, applyRelativeDim(this.size.dim, parentRect))
    }

    rect.x = applyAlignment(this.hAlign, parentRect.w, rect.w)
    rect.y = applyAlignment(this.vAlign, parentRect.h, rect.h)
    return rect
  }
}
