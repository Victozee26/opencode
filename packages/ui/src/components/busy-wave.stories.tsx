// @ts-nocheck
import * as mod from "./busy-wave"
import { create } from "../storybook/scaffold"

const docs = `### Overview
Busy indicator ported from the TUI: eight segments sweeping in a bidirectional wave with a gradient alpha trail and easeOutCubic vertical scaling.

Use while a session is working, in place of a static loading label(Thinking ).

### API
- Optional: \`color\` (any CSS color, default \`var(--text-weak)\`), \`label\` (aria-label), \`class\`, \`style\`.

### Variants and states
- Colors inherit the active agent color in production.
- Animation pauses under \`prefers-reduced-motion\`.

### Behavior
- 54-frame bidirectional cycle at 40ms per frame (25fps): 8 forward, 9-frame hold, 7 backward, 30-frame hold.
- Segments render as fixed spans; opacity and \`scaleY\` are patched imperatively each frame.

### Accessibility
- \`role="status"\` with the \`label\` as \`aria-label\`.

### Theming/tokens
- Uses \`data-component="busy-wave"\` and the \`--busy-wave-color\` custom property.

`

const defaults = {
  label: "Thinking",
} as const

const story = create({ title: "UI/BusyWave", mod, args: defaults })

export default {
  title: "UI/BusyWave",
  id: "components-busy-wave",
  component: story.meta.component,
  tags: ["autodocs"],
  args: defaults,
  argTypes: {
    color: { control: "color" },
    label: { control: "text" },
    class: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const Basic = story.Basic

export const AgentColor = {
  args: {
    color: "#2090f5",
  },
}

export const StaticLabel = {
  args: {
    label: "Working",
  },
}
