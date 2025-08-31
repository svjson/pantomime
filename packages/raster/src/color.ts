export type Color = { r: number; g: number; b: number; a?: number }

export const rgba = (r: number, g: number, b: number, a: number): Color => ({
  r,
  g,
  b,
  a,
})

export const rgb = (r: number, g: number, b: number): Color => ({
  r,
  g,
  b,
})
