import { describe, expect, it } from 'vitest'

import { LFO } from '@src/index'

describe('LFO', () => {
  it('should generate values between -1 and 1', () => {
    const lfo = new LFO({ freqHz: 1, amplitude: 50, offset: 0 })
    const sampleRate = 100
    const duration = 1
    const values = []
    for (let i = 0; i < sampleRate * duration; i++) {
      const value = lfo.next(1 / sampleRate)
      values.push(value)
      expect(value).toBeGreaterThanOrEqual(-50)
      expect(value).toBeLessThanOrEqual(50)
    }

    const min = Math.min(...values)
    const max = Math.max(...values)
    expect(min).toBeLessThan(-40)
    expect(max).toBeGreaterThan(40)
  })

  it('should complete a full cycle in the expected number of samples', () => {
    const lfo = new LFO({ freqHz: 2, amplitude: 50, offset: 0 })
    const sampleRate = 100
    const samplesPerCycle = sampleRate / lfo.freq
    const values = []

    for (let i = 0; i < samplesPerCycle + 1; i++) {
      values.push(lfo.next(1 / sampleRate))
    }

    expect(values[0]).toBeCloseTo(values[values.length - 1], 5)
  })
})
