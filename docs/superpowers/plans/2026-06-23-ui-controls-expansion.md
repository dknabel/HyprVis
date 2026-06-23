# UI Controls Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a custom color picker, mesh resolution slider, and animation intensity slider to the ControlPanel inside a collapsible "Advanced" section.

**Architecture:** Three new state values (`color`, `resolution`, `animIntensity`) live in `App` and flow down to both `ControlPanel` (controls) and `Scene` (rendering). The ControlPanel gets a locally-toggled advanced section below the existing controls. Scene handles each new prop via a dedicated `useEffect`.

**Tech Stack:** React 19, Three.js, Tailwind CSS v4 (via Vite plugin), Vitest, @testing-library/react

## Global Constraints

- Padding on `.rounded-2xl` panel must use inline `style={{ padding: '15px 13px' }}` — Tailwind `px-*`/`py-*` classes are zeroed out by an un-layered reset in `index.css`
- Three.js materials use `color.set()` — never reassign `material.color` directly
- `buildPositions` and `buildIndices` must always receive `resolution` as a parameter — the module-level `RESOLUTION` constant is removed in Task 4
- No new npm dependencies except `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` (Task 2 setup)

---

### Task 1: App state wiring

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: `color` (hex string), `resolution` (integer), `animIntensity` (float) state values passed as props to both `ControlPanel` and `Scene`; `handlePresetChange` that resets `color` to the new preset's color

- [ ] **Step 1: Replace `src/App.jsx` with the wired version**

```jsx
import { useState } from 'react';
import Scene from './Scene.jsx';
import ControlPanel from './ControlPanel.jsx';
import { presets } from './presets.js';

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [wireframe, setWireframe] = useState(false);
  const [color, setColor] = useState(presets[0].color);
  const [resolution, setResolution] = useState(96);
  const [animIntensity, setAnimIntensity] = useState(1.0);

  function handlePresetChange(index) {
    setActiveIndex(index);
    setColor(presets[index].color);
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Scene
        preset={presets[activeIndex]}
        rotationSpeed={rotationSpeed}
        wireframe={wireframe}
        color={color}
        resolution={resolution}
        animIntensity={animIntensity}
      />
      <ControlPanel
        presets={presets}
        activeIndex={activeIndex}
        rotationSpeed={rotationSpeed}
        wireframe={wireframe}
        color={color}
        resolution={resolution}
        animIntensity={animIntensity}
        onPresetChange={handlePresetChange}
        onSpeedChange={setRotationSpeed}
        onWireframeChange={setWireframe}
        onColorChange={setColor}
        onResolutionChange={setResolution}
        onAnimIntensityChange={setAnimIntensity}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify the app still renders**

```bash
npm run dev
```

Open `http://localhost:5173`. The panel and 3D scene should look identical to before (Scene and ControlPanel don't consume the new props yet, but they should not crash).

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add color, resolution, animIntensity state to App"
```

---

### Task 2: ControlPanel collapsible advanced section

**Files:**
- Modify: `src/ControlPanel.jsx`
- Modify: `vite.config.js` (add vitest jsdom config)
- Create: `src/test/setup.js`
- Create: `src/test/ControlPanel.test.jsx`

**Interfaces:**
- Consumes: `color` (hex string), `resolution` (integer), `animIntensity` (float), `onColorChange`, `onResolutionChange`, `onAnimIntensityChange` from App
- Produces: collapsible UI with `id="resolution-slider"`, `id="anim-slider"`, `input[type="color"]` with `aria-label="Shape color"`, toggle button with accessible name matching `/advanced/i`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Add vitest jsdom config to `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
```

- [ ] **Step 3: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Write failing tests in `src/test/ControlPanel.test.jsx`**

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ControlPanel from '../ControlPanel.jsx';

const mockPresets = [
  { name: 'Torus', color: '#6366f1' },
  { name: 'Enneper', color: '#14b8a6' },
];

const defaultProps = {
  presets: mockPresets,
  activeIndex: 0,
  rotationSpeed: 0.5,
  wireframe: false,
  color: '#6366f1',
  resolution: 96,
  animIntensity: 1.0,
  onPresetChange: vi.fn(),
  onSpeedChange: vi.fn(),
  onWireframeChange: vi.fn(),
  onColorChange: vi.fn(),
  onResolutionChange: vi.fn(),
  onAnimIntensityChange: vi.fn(),
};

describe('ControlPanel advanced section', () => {
  test('advanced controls are hidden by default', () => {
    const { container } = render(<ControlPanel {...defaultProps} />);
    expect(container.querySelector('input[type="color"]')).toBeNull();
    expect(container.querySelector('#resolution-slider')).toBeNull();
    expect(container.querySelector('#anim-slider')).toBeNull();
  });

  test('clicking Advanced toggle shows all three advanced controls', () => {
    const { container } = render(<ControlPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /advanced/i }));
    expect(container.querySelector('input[type="color"]')).not.toBeNull();
    expect(container.querySelector('#resolution-slider')).not.toBeNull();
    expect(container.querySelector('#anim-slider')).not.toBeNull();
  });

  test('clicking Advanced toggle a second time hides the controls', () => {
    const { container } = render(<ControlPanel {...defaultProps} />);
    const btn = screen.getByRole('button', { name: /advanced/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(container.querySelector('input[type="color"]')).toBeNull();
  });

  test('color picker reflects the color prop', () => {
    const { container } = render(<ControlPanel {...defaultProps} color="#ff0000" />);
    fireEvent.click(screen.getByRole('button', { name: /advanced/i }));
    expect(container.querySelector('input[type="color"]').value).toBe('#ff0000');
  });

  test('resolution slider reflects the resolution prop', () => {
    const { container } = render(<ControlPanel {...defaultProps} resolution={64} />);
    fireEvent.click(screen.getByRole('button', { name: /advanced/i }));
    expect(container.querySelector('#resolution-slider').value).toBe('64');
  });
});
```

- [ ] **Step 5: Run tests — expect all 5 to fail**

```bash
npm test -- --run
```

Expected: 5 failing tests (ControlPanel missing the new props and UI).

- [ ] **Step 6: Replace `src/ControlPanel.jsx` with the full implementation**

```jsx
import { useState } from 'react';

export default function ControlPanel({
  presets,
  activeIndex,
  rotationSpeed,
  wireframe,
  color,
  resolution,
  animIntensity,
  onPresetChange,
  onSpeedChange,
  onWireframeChange,
  onColorChange,
  onResolutionChange,
  onAnimIntensityChange,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const prev = () => onPresetChange((activeIndex - 1 + presets.length) % presets.length);
  const next = () => onPresetChange((activeIndex + 1) % presets.length);

  return (
    <div
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 10, padding: '15px 13px' }}
      className="w-64 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
    >
      {/* Preset name + arrows */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prev}
          className="text-white/50 hover:text-white/90 transition-colors text-lg leading-none px-1"
          aria-label="Previous preset"
        >
          ‹
        </button>
        <span className="text-white/80 text-sm font-medium tracking-wide truncate px-2">
          {presets[activeIndex].name}
        </span>
        <button
          onClick={next}
          className="text-white/50 hover:text-white/90 transition-colors text-lg leading-none px-1"
          aria-label="Next preset"
        >
          ›
        </button>
      </div>

      {/* Rotation speed */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <label htmlFor="speed-slider" className="text-white/40 text-xs uppercase tracking-widest">Speed</label>
          <span className="text-white/40 text-xs">{rotationSpeed.toFixed(1)}×</span>
        </div>
        <input
          id="speed-slider"
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={rotationSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full accent-white/60 cursor-pointer"
        />
      </div>

      {/* Wireframe toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/40 text-xs uppercase tracking-widest">Wireframe</span>
        <button
          onClick={() => onWireframeChange(!wireframe)}
          className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
            wireframe ? 'bg-white/40' : 'bg-white/10'
          }`}
          aria-pressed={wireframe}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              wireframe ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 flex-wrap mt-1 mb-3">
        {presets.map((_, i) => (
          <button
            key={i}
            onClick={() => onPresetChange(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              i === activeIndex ? 'bg-white/80 scale-125' : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Preset ${i + 1}`}
          />
        ))}
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center justify-between w-full text-white/30 hover:text-white/60 transition-colors text-xs uppercase tracking-widest"
        aria-expanded={showAdvanced}
      >
        <span>Advanced</span>
        <span
          className="transition-transform duration-200"
          style={{ display: 'inline-block', transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>

      {/* Advanced controls */}
      {showAdvanced && (
        <div className="mt-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Color */}
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs uppercase tracking-widest">Color</span>
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              style={{ width: '32px', height: '20px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
              aria-label="Shape color"
            />
          </div>

          {/* Resolution */}
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="resolution-slider" className="text-white/40 text-xs uppercase tracking-widest">Mesh</label>
              <span className="text-white/40 text-xs">{resolution}</span>
            </div>
            <input
              id="resolution-slider"
              type="range"
              min="16"
              max="192"
              step="8"
              value={resolution}
              onChange={(e) => onResolutionChange(parseInt(e.target.value, 10))}
              className="w-full accent-white/60 cursor-pointer"
            />
          </div>

          {/* Animation intensity */}
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="anim-slider" className="text-white/40 text-xs uppercase tracking-widest">Anim</label>
              <span className="text-white/40 text-xs">{animIntensity.toFixed(1)}×</span>
            </div>
            <input
              id="anim-slider"
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={animIntensity}
              onChange={(e) => onAnimIntensityChange(parseFloat(e.target.value))}
              className="w-full accent-white/60 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Run tests — expect all 5 to pass**

```bash
npm test -- --run
```

Expected: 5 passing tests.

- [ ] **Step 8: Manually verify the UI**

```bash
npm run dev
```

Open `http://localhost:5173`. Confirm:
- Panel looks identical to before (no visible Advanced section)
- Clicking "Advanced" expands the section showing color, mesh, anim controls
- Clicking "Advanced" again collapses it
- Chevron rotates on expand/collapse

- [ ] **Step 9: Commit**

```bash
git add vite.config.js src/test/setup.js src/test/ControlPanel.test.jsx src/ControlPanel.jsx
git commit -m "feat: add collapsible advanced section to ControlPanel with tests"
```

---

### Task 3: Scene — color and animIntensity props

**Files:**
- Modify: `src/Scene.jsx`

**Interfaces:**
- Consumes: `color` (hex string), `animIntensity` (float) from App
- The preset-change `useEffect` must use the `color` prop (not `preset.color`) when updating material colors

- [ ] **Step 1: Update `src/Scene.jsx` to accept and apply `color` and `animIntensity`**

Make these targeted changes to the existing `Scene.jsx`:

**1a. Update the function signature** to add `color` and `animIntensity`:
```jsx
export default function Scene({ preset, rotationSpeed, wireframe, color, resolution, animIntensity }) {
```

**1b. Update `stateRef.current` initialization** inside the `useEffect([], [])` to include both new values and use `color` prop for material init (replace the existing `stateRef.current = { ... }` block):
```js
stateRef.current = {
  preset, rotationSpeed, wireframe, color, animIntensity,
  resolution: 96,
  solidMat, wireMat, posAttr,
  morph: { from: null, target: null, start: null },
  t: 0,
};
```

**1c. Update material initialization** inside the same `useEffect` to use `color` prop (replace the two `new THREE.Mesh*Material` lines):
```js
const solidMat = new THREE.MeshPhongMaterial({
  color: color, shininess: 60, side: THREE.DoubleSide,
});
const wireMat = new THREE.MeshBasicMaterial({
  color: color, wireframe: true, side: THREE.DoubleSide,
});
```

**1d. Update the animate loop** `t` increment (replace `t += 0.005;`):
```js
t += 0.005 * s.animIntensity;
```

**1e. Update the preset-change `useEffect`** to use `color` prop instead of `preset.color`:
```js
useEffect(() => {
  const s = stateRef.current;
  if (!s.morph || !s.posAttr) return;
  s.morph.from = new Float32Array(s.posAttr.array);
  s.morph.target = buildPositions(s.preset.fn, s.t ?? 0);
  s.morph.start = performance.now();
  if (s.solidMat) {
    s.solidMat.color.set(color);
    s.wireMat.color.set(color);
  }
  s.preset = preset;
}, [preset]);
```

**1f. Add two new `useEffect` hooks** after the existing one-liner effects:
```js
useEffect(() => {
  const s = stateRef.current;
  if (!s.solidMat) return;
  s.color = color;
  s.solidMat.color.set(color);
  s.wireMat.color.set(color);
}, [color]);

useEffect(() => { stateRef.current.animIntensity = animIntensity; }, [animIntensity]);
```

- [ ] **Step 2: Run tests to confirm no regressions**

```bash
npm test -- --run
```

Expected: 5 passing (ControlPanel tests), 0 failing.

- [ ] **Step 3: Manual verification**

```bash
npm run dev
```

Open `http://localhost:5173`. Confirm:
- Open Advanced section, change color — 3D shape changes color immediately
- Switch to a different preset — color picker updates to the new preset's default color and the shape changes color
- Set Anim slider to 0 — shape stops morphing/distorting (rotation continues because that's separate)
- Set Anim slider to 3 — shape distorts visibly faster

- [ ] **Step 4: Commit**

```bash
git add src/Scene.jsx
git commit -m "feat: add color and animIntensity props to Scene"
```

---

### Task 4: Scene — resolution prop

**Files:**
- Modify: `src/Scene.jsx`

**Interfaces:**
- Consumes: `resolution` (integer, 16–192 step 8) from App
- When `resolution` changes: rebuilds index buffer and position attribute on the existing `geo` object, resets morph state, recomputes normals
- `buildPositions(fn, t, resolution)` and `buildIndices(resolution)` now take `resolution` as a parameter — the module-level `RESOLUTION` constant is removed

- [ ] **Step 1: Update `buildPositions` and `buildIndices` to accept `resolution`**

Replace the top of `src/Scene.jsx` (before the `frenetTube` helper if present, or at the top of the file). Remove the `const RESOLUTION = 96;` line and update both functions:

```js
function buildPositions(fn, t, resolution) {
  const count = (resolution + 1) * (resolution + 1);
  const positions = new Float32Array(count * 3);
  let i = 0;
  for (let row = 0; row <= resolution; row++) {
    for (let col = 0; col <= resolution; col++) {
      const { x, y, z } = fn(col / resolution, row / resolution, t);
      positions[i++] = x;
      positions[i++] = y;
      positions[i++] = z;
    }
  }
  return positions;
}

function buildIndices(resolution) {
  const indices = [];
  for (let row = 0; row < resolution; row++) {
    for (let col = 0; col < resolution; col++) {
      const a = row * (resolution + 1) + col;
      const b = a + 1;
      const c = a + (resolution + 1);
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }
  return new Uint32Array(indices);
}
```

- [ ] **Step 2: Add `geoRef` and update geometry initialization in the mount `useEffect`**

Add `const geoRef = useRef(null);` alongside `stateRef`.

Inside the mount `useEffect`, after creating `geo`, store it:
```js
geoRef.current = geo;
```

Update the initial geometry setup to use `resolution` prop (replace the existing `buildIndices()` and `buildPositions(preset.fn, 0)` calls):
```js
geo.setIndex(new THREE.BufferAttribute(buildIndices(resolution), 1));
const posAttr = new THREE.BufferAttribute(buildPositions(preset.fn, 0, resolution), 3);
```

Update `stateRef.current` initialization to track resolution:
```js
stateRef.current = {
  preset, rotationSpeed, wireframe, color, animIntensity,
  resolution,
  solidMat, wireMat, posAttr,
  morph: { from: null, target: null, start: null },
  t: 0,
};
```

Update the animate loop to pass `s.resolution` to `buildPositions`:
```js
s.posAttr.array.set(buildPositions(s.preset.fn, t, s.resolution));
```

Update the preset-change `useEffect` to pass `s.resolution` to `buildPositions`:
```js
s.morph.target = buildPositions(preset.fn, s.t ?? 0, s.resolution);
```

- [ ] **Step 3: Add the resolution `useEffect`**

After the `animIntensity` one-liner effect, add:

```js
useEffect(() => {
  const s = stateRef.current;
  const geo = geoRef.current;
  if (!geo || !s.posAttr) return;
  s.resolution = resolution;

  geo.setIndex(new THREE.BufferAttribute(buildIndices(resolution), 1));

  const newPositions = buildPositions(s.preset.fn, s.t ?? 0, resolution);
  const newPosAttr = new THREE.BufferAttribute(newPositions, 3);
  geo.setAttribute('position', newPosAttr);
  s.posAttr = newPosAttr;

  s.morph = { from: null, target: null, start: null };

  geo.computeVertexNormals();
}, [resolution]);
```

- [ ] **Step 4: Run tests to confirm no regressions**

```bash
npm test -- --run
```

Expected: 5 passing, 0 failing.

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```

Open `http://localhost:5173`. Confirm:
- Open Advanced section, drag Mesh slider to 16 — shape becomes visibly blocky/low-poly
- Drag Mesh slider to 192 — shape becomes very smooth
- Change presets at low resolution — morph transition still works
- No console errors when rapidly dragging the slider

- [ ] **Step 6: Commit**

```bash
git add src/Scene.jsx
git commit -m "feat: add dynamic resolution prop to Scene"
```
