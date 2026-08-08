import { describe, expect, test } from "bun:test"
import { SEGMENTS, TOTAL_FRAMES, segmentState, trailScale } from "./busy-wave"

describe("trailScale", () => {
  test("keeps the head at full height", () => {
    expect(trailScale(0)).toBe(1)
  })

  test("shrinks monotonically to the inactive scale", () => {
    const values = [0, 1, 2, 3, 4, 5].map(trailScale)
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeLessThan(values[i - 1])
    expect(values.at(-1)).toBe(0.25)
  })
})

describe("segmentState", () => {
  test("sweeps a full-height, full-opacity head left to right", () => {
    for (let frame = 0; frame < SEGMENTS; frame++) {
      const head = segmentState(frame, frame)
      expect(head.alpha).toBe(1)
      expect(head.scaleY).toBe(1)
    }
  })

  test("renders a gradient trail behind the head", () => {
    const head = segmentState(4, 4)
    const trailing = segmentState(4, 2)
    expect(trailing.alpha).toBeLessThan(head.alpha)
    expect(trailing.scaleY).toBeLessThan(head.scaleY)
  })

  test("stays within valid alpha and scale bounds across the whole cycle", () => {
    for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
      for (let char = 0; char < SEGMENTS; char++) {
        const state = segmentState(frame, char)
        expect(state.alpha).toBeGreaterThanOrEqual(0)
        expect(state.alpha).toBeLessThanOrEqual(1)
        expect(state.scaleY).toBeGreaterThanOrEqual(0)
        expect(state.scaleY).toBeLessThanOrEqual(1)
      }
    }
  })
})
