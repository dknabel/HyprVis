# HyprVis — Design Spec
_Date: 2026-06-22_

## Overview

A portfolio-grade interactive 3D mathematical surface visualizer built with React + Vite + Three.js. Inspired by evolvecode.io/hyperspace but with a dramatically simplified UI and clean dark aesthetic. Users browse 12 curated parametric surfaces via a minimal floating control panel. No math editing — only curated presets.

---

## Architecture

Four primary files:

| File | Responsibility |
|------|---------------|
| `src/App.jsx` | Holds all state (activePreset index, rotationSpeed, wireframe). Wires Scene and ControlPanel together. |
| `src/Scene.jsx` | Owns the Three.js renderer, camera, OrbitControls, animation loop, and geometry. Receives `preset`, `rotationSpeed`, `wireframe` as props. |
| `src/ControlPanel.jsx` | Floating frosted-glass UI panel. Emits `onPresetChange`, `onSpeedChange`, `onWireframeChange` callbacks. |
| `src/presets.js` | Array of 12 named surface definitions: `{ name, color, fn(u, v, t) → { x, y, z } }`. |

State lives entirely in `App.jsx` and flows down as props — no global store needed.

---

## Presets

12 curated parametric surfaces, each defined as `fn(u, v, t)` returning `{ x, y, z }`. The `t` parameter increments each frame so surfaces gently animate even when not rotating.

| # | Name | Character | Color |
|---|------|-----------|-------|
| 1 | Torus Knot | Twisted tube looping through itself | Indigo |
| 2 | Enneper Surface | Minimal surface with saddle folds | Teal |
| 3 | Möbius Strip | Classic one-sided surface | Amber |
| 4 | Trefoil | Three-lobed knotted extruded surface | Rose |
| 5 | Boy's Surface | Non-orientable, alien topology | Violet |
| 6 | Seashell | Spiral nautilus organic form | Emerald |
| 7 | Lissajous | Overlapping sine waves, woven grid | Cyan |
| 8 | Sphere Harmonic | Deformed sphere with pulsing lobes | Orange |
| 9 | Klein Bottle | Closed surface, no inside/outside | Lime |
| 10 | Dini's Surface | Constant negative curvature, tight spiral | Sky |
| 11 | Roman Surface | Self-intersecting, six-lobed | Fuchsia |
| 12 | Breather Surface | Sine-Gordon solution, rippling folds | Yellow |

---

## Rendering

- **Background:** `#050505` — near-black
- **Geometry:** `BufferGeometry` built from parametric `fn(u,v,t)` at 128×128 resolution, rebuilt on preset change, updated each frame for `t` animation
- **Material (solid):** `MeshPhongMaterial` — preset jewel tone, single warm-white directional light + low ambient
- **Material (wireframe):** `MeshBasicMaterial` — bright accent color matching preset, no lighting
- **Camera:** Perspective, OrbitControls for manual drag-to-orbit. Auto-rotates on Y axis at `rotationSpeed`
- **Transitions:** On preset switch, vertex positions lerp from old surface to new over 800ms. The surface morphs fluidly rather than cutting.
- **Animation:** `t` increments at ~0.005 per frame — surfaces breathe/pulse subtly at all times

---

## Control Panel

Fixed position: bottom-right corner. Approximate dimensions: 260px wide × 160px tall.

**Styling:** `bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4` (Tailwind)

**Contents (top to bottom):**

1. **Preset name** — `text-white/80 text-sm font-medium`, centered
2. **Prev / Next arrows** — flanking the name, cycle through presets
3. **Rotation Speed slider** — labeled, range 0–2, default 0.5, step 0.05
4. **Wireframe toggle** — labeled switch, off by default
5. **Dot indicators** — 12 small dots at bottom, current preset highlighted, all clickable

No other controls. The panel is intentionally compact — roughly business-card height.

---

## Stack

- **React 19 + Vite 6** — project scaffold
- **Three.js** — WebGL rendering
- **@react-three/fiber** — NOT used; Scene.jsx manages Three.js imperatively via `useEffect`/`useRef` to keep full control over the render loop and geometry updates
- **Tailwind CSS v4** — utility classes for the control panel only

---

## Out of Scope

- User-editable math functions
- Save / load / share
- Thumbnail previews of presets
- Mobile touch controls (OrbitControls handles pinch-zoom passively)
- Sound / audio reactivity
