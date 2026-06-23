# HyprVis UI Rework

**Date:** 2026-06-23

## Overview

Replace the floating bottom-right control panel with a full-width bottom bar. Add more surfaces (12 → 30), replace the wireframe toggle with a three-way view mode, and add background color and opacity controls.

---

## Changes by File

### `App.jsx`

- Replace `wireframe: boolean` state (default `false`) with `viewMode: 'wire' | 'overlay' | 'solid'` (default `'wire'`)
- Add `bgColor` state, default `'#050505'`
- Add `opacity` state, default `1.0`
- Pass `viewMode`, `bgColor`, `opacity` to both `Scene` and `ControlPanel`
- Remove `resolution` state and all related props — mesh resolution control is dropped

### `ControlPanel.jsx`

Full rewrite. Layout: fixed bottom bar, full-width, ~44px tall, `bg rgba(8,8,18,0.9)`, `border-top 1px rgba(255,255,255,0.07)`, no backdrop-blur needed at this height.

Controls in left-to-right order, separated by hairline vertical dividers:

| Group | Controls |
|-------|----------|
| Preset | ‹ arrow · surface name · › arrow |
| View | WIRE / OVL / SOLID pill selector |
| Motion | Speed slider + value · Anim slider + value |
| Appearance | Surface color swatch · BG color swatch · Opacity slider |

- Pill selector: active pill gets `bg rgba(255,255,255,0.18)`, others `bg rgba(255,255,255,0.04)`
- Sliders: 2px track, small thumb handle, value readout to the right (e.g. `0.8×`)
- Color swatches: 16px circles, clicking opens native `<input type="color">`
- Remove: dot indicators, Advanced collapsible section — all controls are always visible

### `Scene.jsx`

**Props added:** `viewMode`, `bgColor`, `opacity`  
**Prop removed:** `wireframe`, `resolution`

Rendering modes driven by `viewMode`:
- `'wire'`: render wireMat mesh only (existing behavior)
- `'solid'`: render solidMat mesh only; apply `opacity` to `solidMat.opacity`, set `solidMat.transparent = opacity < 1`
- `'overlay'`: render both — solidMat with opacity beneath, wireMat on top (second mesh added to scene)

Background: `renderer.setClearColor(bgColor)` updated reactively via `useEffect`.

Resolution hardcoded to `96` (removed from props). The `buildIndices` / `buildPositions` calls use the constant directly.

### `presets.js`

Expand from 12 to 30 surfaces. New surfaces to add (~18):

- Helicoid
- Catenoid
- Pseudosphere
- Boy's Surface
- Scherk's First Surface
- Catalan's Surface
- Hyperbolic Paraboloid (saddle)
- Monkey Saddle
- Costa Minimal Surface (approximation)
- Twisted Torus
- Astroid Tube (frenet-extruded astroid curve)
- Cross-Cap
- Bour's Minimal Surface
- Sphere Harmonic Y(2,1)
- Sphere Harmonic Y(3,2)
- Sphere Harmonic Y(4,0)
- Lemniscate of Bernoulli (tube)
- Chmutov Surface (degree-4 approximation)

Each gets a distinct color following the existing palette style. Animate via time parameter `t` where meaningful (breathing/pulsing scale, parameter drift).

---

## Behavior Notes

- `overlay` mode: the wire mesh sits on top of a semi-transparent solid. Opacity slider makes the solid more or less visible. At `opacity = 0`, overlay looks the same as wire-only.
- `bgColor` change is purely a `renderer.setClearColor` call — no geometry rebuild needed.
- Preset arrows wrap around (last → first, first → last), same as current behavior.
- No hidden controls. Everything is accessible without expanding a section.
