# UI Controls Expansion — Design Spec

**Date:** 2026-06-23
**Status:** Approved

## Overview

Add three new controls to the existing `ControlPanel`: a custom color picker, a mesh resolution slider, and an animation intensity slider. The new controls live in a collapsible "Advanced" section below the existing four controls, keeping the panel compact by default.

---

## State & Data Flow

Three new state values are added to `App`:

| State | Type | Default | Resets on preset change? |
|---|---|---|---|
| `color` | string (hex) | `presets[activeIndex].color` | Yes — resets to new preset's color |
| `resolution` | integer | `96` | No |
| `animIntensity` | float | `1.0` | No |

All three are passed as props to both `ControlPanel` (for the controls) and `Scene` (for rendering). `Scene` reads `color` from props instead of `preset.color` — the picker overrides the preset default.

---

## ControlPanel UI

The existing controls (preset arrows, speed slider, wireframe toggle, dot indicators) are unchanged.

Below the dot indicators, a toggle row with a chevron icon and "Advanced" label controls a `showAdvanced` boolean in local `ControlPanel` state. The chevron rotates 180° when expanded, using the same transition duration as the wireframe toggle.

When expanded, three rows appear in order:

**Color**
- Label: `COLOR` (uppercase, `text-white/40 text-xs tracking-widest` — matching existing labels)
- Control: `<input type="color">` right-aligned, small and rounded, styled to suppress default browser chrome (`w-8 h-5 rounded cursor-pointer border-0 p-0 bg-transparent`)
- Value is `color` prop; `onChange` calls `onColorChange`

**Resolution**
- Label: `MESH` + current value (e.g. `96`) right-aligned
- Control: range slider, min `16`, max `192`, step `8`
- Value is `resolution` prop; `onChange` calls `onResolutionChange`

**Animation Intensity**
- Label: `ANIM` + current value (e.g. `1.0×`) right-aligned
- Control: range slider, min `0`, max `3`, step `0.1`
- Value is `animIntensity` prop; `onChange` calls `onAnimIntensityChange`

---

## Scene Changes

### Color

- Replace all reads of `preset.color` with the `color` prop in the existing preset-change `useEffect`
- Add a new `useEffect` watching `color` that calls `solidMat.color.set(color)` and `wireMat.color.set(color)` and stores `color` in `stateRef`

### Animation Intensity

- Add `animIntensity` to `stateRef`, updated via a one-liner `useEffect` (same pattern as `rotationSpeed`)
- In the animate loop, change `t += 0.005` to `t += 0.005 * s.animIntensity`

### Resolution

- Remove the module-level `RESOLUTION = 96` constant
- Track resolution in a `resolutionRef` (updated via `useEffect` watching `resolution` prop)
- When `resolution` changes, rebuild the geometry buffers on the existing `geo` object:
  1. `geo.setIndex(new THREE.BufferAttribute(buildIndices(resolution), 1))`
  2. Create a new position `Float32Array` of the correct size and replace `geo.getAttribute('position')`
  3. `geo.computeVertexNormals()`
- No renderer, scene, or material teardown required — only the buffers are replaced

---

## Files Changed

| File | Change |
|---|---|
| `src/App.jsx` | Add `color`, `resolution`, `animIntensity` state; pass to `ControlPanel` and `Scene`; reset `color` on preset change |
| `src/ControlPanel.jsx` | Add collapsible advanced section with color picker, resolution slider, intensity slider |
| `src/Scene.jsx` | Accept `color`, `resolution`, `animIntensity` props; apply as described above |
