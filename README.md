# alu-74181

A SolidJS component rendering the TI 74181 ALU as an interactive schematic.

- Click any input pin (A0-A3, B0-B3, S0-S3, M, Cn) to toggle it.
- Output pins (F0-F3, Cn+4, P, G, A=B) light up green when high.
- Side panel exposes numeric inputs for A, B, S, a mode selector (Arithmetic/Logic),
  carry-in toggle, and a human-readable readout of F, the function name, and all
  chip output pins.
- Gate-level simulator implements the real 74181 (all 32 arithmetic+logic functions)
  and is exhaustively verified against a datasheet-oracle (all 16 384 input
  combinations) plus a seeded fuzz pass.

## Usage

```tsx
import { ALU74181 } from "alu-74181";

export default () => <ALU74181 />;
```

Optional palette props:

```tsx
<ALU74181 highColor="#44ff88" lowColor="#111" bgColor="#fdfdfd" />
```

## Monorepo layout

- `packages/alu-74181/` — the library
- `packages/demo/` — Vite dev harness that mounts the component

```bash
pnpm install
pnpm test        # exhaustive 16384 + seeded fuzz vs. reference
pnpm dev         # http://localhost:5173
pnpm build       # library + demo
```

## Attribution

Schematic by
[CrowbarBarbarian](https://commons.wikimedia.org/wiki/File:74181aluschematic.svg),
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0), via Wikimedia
Commons. The SVG is inlined into the library and preserved unmodified in its
visual content; interactive overlays (pin dots) are added at runtime.
