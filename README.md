# HyprVis

A real-time 3D mathematical surface visualizer built as a portfolio exploration of WebGL, parametric geometry, and clean interaction design.

Twelve curated surfaces — from Möbius strips to Breather solitons — morph fluidly into one another via per-vertex interpolation. Each surface is defined as a pure parametric function `fn(u, v, t) → {x, y, z}` and animates continuously over time.

**[Live demo →](https://github.com/dknabel/HyprVis)**

---

## What it demonstrates

**WebGL / Three.js**
Full imperative Three.js setup — no abstraction layer. Custom `BufferGeometry` built from parametric functions at 96×96 resolution, recomputed every frame. Phong shading with a hand-tuned directional light and ambient fill.

**Smooth morphing**
Preset transitions lerp between vertex position arrays over 800ms using a cubic ease-in-out curve. The morph snapshots current geometry at switch time so mid-transition switches blend cleanly from wherever the surface is.

**React architecture**
Three.js lifecycle lives in a single `useEffect([])` to avoid re-mounting the renderer on re-renders. Mutable animation state (rotation speed, wireframe, active preset) flows into the loop via a `stateRef` rather than triggering effect teardown. Clean cleanup: RAF cancellation, event listener removal, all Three.js resources disposed.

**Parametric math**
Twelve surfaces spanning classical differential geometry — minimal surfaces (Enneper), non-orientable topologies (Möbius, Klein Bottle, Roman Surface), soliton solutions (Breather), curve-extruded tubes (Trefoil via Frenet frame), and spherical harmonics. All animate via a time parameter with guards against numerical singularities.

---

## Surfaces

Torus · Enneper · Möbius Strip · Trefoil · Roman Surface · Seashell · Sphere Harmonic · Dini's Surface · Klein Bottle · Lissajous · Breather · Supertoroid

---

## Stack

React 19 · Vite · Three.js · Tailwind CSS v4 · Vitest

---

## Run locally

```bash
npm install
npm run dev
```
