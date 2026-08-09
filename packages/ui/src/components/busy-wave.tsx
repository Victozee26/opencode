import { createEffect, createSignal, onCleanup, type JSX } from "solid-js"

export const SEGMENTS = 8
const HOLD_FRAMES = { start: 30, end: 9 }
export const TOTAL_FRAMES = SEGMENTS + HOLD_FRAMES.end + (SEGMENTS - 1) + HOLD_FRAMES.start
const FRAME_MS = 40
const TRAIL_ALPHAS = [1, 0.9, 0.65, 0.4225, 0.274625, 0.17850625]
const TRAIL_STEPS = TRAIL_ALPHAS.length
const INACTIVE_ALPHA = 0.6
const INACTIVE_SCALE = 0.25
const MIN_ALPHA = 0.3
const SEGMENT_INDEXES = Array.from({ length: SEGMENTS }, (_, index) => index)

export function trailScale(index: number) {
  const t = 1 - index / (TRAIL_STEPS - 1)
  const eased = 1 - t * t * t
  return 1 - eased * (1 - INACTIVE_SCALE)
}

export function segmentState(frame: number, char: number) {
  const forwardFrames = SEGMENTS
  const backwardFrames = SEGMENTS - 1

  let activePosition = 0
  let isHolding = false
  let holdProgress = 0
  let holdTotal = 0
  let movementProgress = 0
  let movementTotal = 0
  let isMovingForward = true

  if (frame < forwardFrames) {
    activePosition = frame
    movementProgress = frame
    movementTotal = forwardFrames
  } else if (frame < forwardFrames + HOLD_FRAMES.end) {
    activePosition = SEGMENTS - 1
    isHolding = true
    holdProgress = frame - forwardFrames
    holdTotal = HOLD_FRAMES.end
  } else if (frame < forwardFrames + HOLD_FRAMES.end + backwardFrames) {
    activePosition = SEGMENTS - 2 - (frame - forwardFrames - HOLD_FRAMES.end)
    movementProgress = frame - forwardFrames - HOLD_FRAMES.end
    movementTotal = backwardFrames
    isMovingForward = false
  } else {
    activePosition = 0
    isHolding = true
    holdProgress = frame - forwardFrames - HOLD_FRAMES.end - backwardFrames
    holdTotal = HOLD_FRAMES.start
    isMovingForward = false
  }

  const distance = isMovingForward ? activePosition - char : char - activePosition
  const index = isHolding
    ? distance + holdProgress
    : distance === 0
      ? 0
      : distance > 0 && distance < TRAIL_STEPS
        ? distance
        : -1

  if (index >= 0 && index < TRAIL_STEPS) {
    const brightness = index === 1 ? 1.15 : 1
    return { alpha: TRAIL_ALPHAS[index], scaleY: trailScale(index), brightness }
  }

  let fadeFactor = 1
  if (isHolding && holdTotal > 0) {
    const progress = Math.min(holdProgress / holdTotal, 1)
    fadeFactor = Math.max(MIN_ALPHA, 1 - progress * (1 - MIN_ALPHA))
  } else if (!isHolding && movementTotal > 0) {
    const progress = Math.min(movementProgress / Math.max(1, movementTotal - 1), 1)
    fadeFactor = MIN_ALPHA + progress * (1 - MIN_ALPHA)
  }
  return { alpha: INACTIVE_ALPHA * fadeFactor, scaleY: INACTIVE_SCALE * fadeFactor, brightness: 1 }
}

export function BusyWave(props: {
  color?: string
  label?: string
  class?: string
  style?: JSX.CSSProperties
}) {
  const [frame, setFrame] = createSignal(0)
  const segments: HTMLSpanElement[] = []

  const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)")
  const [paused, setPaused] = createSignal(motionMedia.matches)
  const onMotionChange = (event: MediaQueryListEvent) => setPaused(event.matches)
  motionMedia.addEventListener("change", onMotionChange)

  let timer: ReturnType<typeof setInterval> | undefined
  const start = () => {
    if (timer !== undefined || paused()) return
    timer = setInterval(() => setFrame((current) => (current + 1) % TOTAL_FRAMES), FRAME_MS)
  }
  const stop = () => {
    if (timer === undefined) return
    clearInterval(timer)
    timer = undefined
  }

  onCleanup(() => {
    stop()
    motionMedia.removeEventListener("change", onMotionChange)
  })

  createEffect(() => {
    if (paused()) stop()
    else start()
  })

  createEffect(() => {
    const f = frame()
    for (let i = 0; i < SEGMENTS; i++) {
      const el = segments[i]
      if (!el) continue
      const state = segmentState(f, i)
      el.style.opacity = String(state.alpha)
      el.style.transform = `scaleY(${state.scaleY})`
      el.style.filter = state.brightness !== 1 ? `brightness(${state.brightness})` : ""
    }
  })

  return (
    <div
      data-component="busy-wave"
      class={props.class}
      style={{ "--busy-wave-color": props.color, ...props.style }}
      role="status"
      aria-busy="true"
      aria-label={props.label}
    >
      {SEGMENT_INDEXES.map((char) => (
        <span data-slot="busy-wave-segment" ref={(el) => { segments[char] = el }} />
      ))}
    </div>
  )
}
