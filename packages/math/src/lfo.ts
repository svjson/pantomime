/**
 * Simple sine-based Low Frequency Oscillator
 */
export class LFO {
  /**
   * Current phase in radians
   */
  phase = 0
  /**
   * Frequency in Hz
   */
  freq: number
  /**
   * Amplitude
   */
  amp: number
  /**
   * Offset (center) value
   */
  offset: number
  /**
   * Angular frequency in radians per second (ω = 2πf)
   */
  angularFreq: number

  constructor({
    freqHz,
    amplitude,
    offset = 0,
  }: {
    freqHz: number
    amplitude: number
    offset?: number
  }) {
    this.freq = freqHz
    this.amp = amplitude
    this.offset = offset
    this.angularFreq = 2 * Math.PI * freqHz
  }

  /**
   * Get LFO value at a specific phase (in radians)
   *
   * This function allows usage of the LFO as a pure function
   * over the LFO settings, disregarding the phase state of the
   * instance.
   *
   * @param phase Phase in radians
   * @return LFO value at that phase
   */
  valueAt(phase: number): number {
    return this.offset + Math.sin(phase) * this.amp
  }

  /**
   * Advance the LFO by `dt` seconds and return the new value
   *
   * This function mutates the internal phase of the LFO
   *
   * @param dt Time delta in seconds
   * @return New LFO value
   */
  next(dt: number): number {
    this.phase += this.angularFreq * dt
    if (this.phase > Math.PI * 2) this.phase -= Math.PI * 2
    return this.valueAt(this.phase)
  }
}
