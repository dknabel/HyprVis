# HyprVis

Interactive 3D mathematical surface visualizer. Browse 12 curated parametric surfaces with smooth morph transitions, real-time animation, and a minimal frosted-glass control panel.

## Surfaces

| # | Name | Character |
|---|------|-----------|
| 1 | Torus | Breathing donut with animated radius |
| 2 | Enneper | Classical minimal saddle surface |
| 3 | Möbius Strip | One-sided surface with a twist |
| 4 | Trefoil | Tube extruded along a trefoil knot |
| 5 | Roman Surface | Steiner's self-intersecting six-lobed form |
| 6 | Seashell | Logarithmic spiral shell |
| 7 | Sphere Harmonic | Deformed sphere with pulsing lobes |
| 8 | Dini's Surface | Constant negative curvature spiral horn |
| 9 | Klein Bottle | Closed surface with no inside or outside |
| 10 | Lissajous | Overlapping sine waves forming a woven surface |
| 11 | Breather | Sine-Gordon soliton with rippling folds |
| 12 | Supertoroid | Superelliptic torus with animated exponent |

## Controls

- **‹ / ›** or dot indicators — cycle presets
- **Speed slider** — rotation speed from 0× to 2×
- **Wireframe toggle** — switch between solid (Phong) and mesh
- **Mouse drag** — orbit camera
- **Scroll** — zoom

## Stack

- [React 19](https://react.dev) + [Vite](https://vitejs.dev)
- [Three.js](https://threejs.org) — WebGL rendering (imperative, no fiber)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Vitest](https://vitest.dev) — unit tests for all 12 surface functions

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # preview the build locally
```

## Tests

```bash
npm test
```

37 tests covering all 12 parametric surface functions — verifying finite output across sample coordinates and crash-safety across time values.
