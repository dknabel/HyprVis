# Mobile Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a collapsible settings drawer for mobile screens that leaves the desktop layout completely unchanged.

**Architecture:** The existing desktop bottom bar gets `hidden md:flex` so it's hidden on mobile. A parallel mobile bar (`flex md:hidden`) shows only preset nav and a ⚙ toggle. When toggled, a full-screen backdrop and a drawer panel slide in above the mobile bar containing all controls stacked vertically. All three mobile elements live in `ControlPanel.jsx` alongside the existing desktop bar — no new files.

**Tech Stack:** React 19, Tailwind CSS v4, Vitest, @testing-library/react

## Global Constraints

- Desktop layout (`md` and above) must be pixel-identical to today — no class changes to the desktop bar's visible styles
- No JS breakpoint detection — use Tailwind `md:` prefix only
- All changes in `src/ControlPanel.jsx` and `src/test/ControlPanel.test.jsx` — no new files
- Run `npm test` after every task; all tests must pass before committing

---

### Task 1: Mobile collapsed bar + drawer toggle state

**Files:**
- Modify: `src/ControlPanel.jsx`
- Modify: `src/test/ControlPanel.test.jsx`

**Interfaces:**
- Produces: `drawerOpen` boolean state; mobile bar with `data-testid="mobile-bar"`; desktop bar with `data-testid="desktop-bar"`; ⚙ toggle button with `aria-label="Open settings"` / `aria-label="Close settings"`

- [ ] **Step 1: Update existing tests that will break due to duplicate prev/next buttons**

The mobile bar will add a second "Previous preset" and "Next preset" button to the DOM. Two existing tests use `screen.getByRole('button', { name: /previous|next preset/i })` and will throw "found multiple elements." Scope them to the desktop bar with `data-testid`.

Replace in `src/test/ControlPanel.test.jsx`:

```jsx
// BEFORE (two tests, find and replace each):
fireEvent.click(screen.getByRole('button', { name: /previous preset/i }));
// ...
fireEvent.click(screen.getByRole('button', { name: /next preset/i }));

// AFTER — scope to desktop bar:
import { render, screen, fireEvent, within } from '@testing-library/react';
// ...
const desktopBar = screen.getByTestId('desktop-bar');
fireEvent.click(within(desktopBar).getByRole('button', { name: /previous preset/i }));
// ...
const desktopBar2 = screen.getByTestId('desktop-bar');
fireEvent.click(within(desktopBar2).getByRole('button', { name: /next preset/i }));
```

Full updated file `src/test/ControlPanel.test.jsx`:

```jsx
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ControlPanel from '../ControlPanel.jsx';

const defaultProps = {
  presets: [{ name: 'Torus', color: '#6366f1' }, { name: 'Enneper', color: '#14b8a6' }],
  activeIndex: 0,
  rotationSpeed: 0.5,
  viewMode: 'wire',
  color: '#6366f1',
  bgColor: '#050505',
  opacity: 1.0,
  animIntensity: 1.0,
  onPresetChange: vi.fn(),
  onSpeedChange: vi.fn(),
  onViewModeChange: vi.fn(),
  onColorChange: vi.fn(),
  onBgColorChange: vi.fn(),
  onOpacityChange: vi.fn(),
  onAnimIntensityChange: vi.fn(),
};

describe('ControlPanel bottom bar', () => {
  test('preset name displays correctly for activeIndex 0', () => {
    render(<ControlPanel {...defaultProps} />);
    expect(screen.getAllByText('TORUS').length).toBeGreaterThan(0);
  });

  test('‹ calls onPresetChange with wrapped index (n-1)', () => {
    const onPresetChange = vi.fn();
    render(<ControlPanel {...defaultProps} activeIndex={0} onPresetChange={onPresetChange} />);
    const desktopBar = screen.getByTestId('desktop-bar');
    fireEvent.click(within(desktopBar).getByRole('button', { name: /previous preset/i }));
    // (0 - 1 + 2) % 2 = 1
    expect(onPresetChange).toHaveBeenCalledWith(1);
  });

  test('› calls onPresetChange with wrapped index (n+1)', () => {
    const onPresetChange = vi.fn();
    render(<ControlPanel {...defaultProps} activeIndex={1} onPresetChange={onPresetChange} />);
    const desktopBar = screen.getByTestId('desktop-bar');
    fireEvent.click(within(desktopBar).getByRole('button', { name: /next preset/i }));
    // (1 + 1) % 2 = 0
    expect(onPresetChange).toHaveBeenCalledWith(0);
  });

  test('active view mode pill has aria-pressed="true"', () => {
    render(<ControlPanel {...defaultProps} viewMode="wire" />);
    const desktopBar = screen.getByTestId('desktop-bar');
    const wireBtn = within(desktopBar).getByRole('button', { name: /^WIRE$/i });
    expect(wireBtn.getAttribute('aria-pressed')).toBe('true');
    const ovlBtn = within(desktopBar).getByRole('button', { name: /^OVL$/i });
    expect(ovlBtn.getAttribute('aria-pressed')).toBe('false');
  });

  test('clicking a different view mode pill calls onViewModeChange with that mode', () => {
    const onViewModeChange = vi.fn();
    render(<ControlPanel {...defaultProps} viewMode="wire" onViewModeChange={onViewModeChange} />);
    const desktopBar = screen.getByTestId('desktop-bar');
    fireEvent.click(within(desktopBar).getByRole('button', { name: /^SOLID$/i }));
    expect(onViewModeChange).toHaveBeenCalledWith('solid');
  });

  test('both color inputs exist and reflect their prop values', () => {
    const { container } = render(
      <ControlPanel {...defaultProps} color="#ff0000" bgColor="#00ff00" />
    );
    const colorInputs = container.querySelectorAll('input[type="color"]');
    expect(colorInputs.length).toBeGreaterThanOrEqual(2);
    const values = Array.from(colorInputs).map(i => i.value);
    expect(values).toContain('#ff0000');
    expect(values).toContain('#00ff00');
  });

  test('speed slider reflects rotationSpeed prop', () => {
    const { container } = render(<ControlPanel {...defaultProps} rotationSpeed={1.5} />);
    const desktopBar = container.querySelector('[data-testid="desktop-bar"]');
    const rangeInputs = desktopBar.querySelectorAll('input[type="range"]');
    expect(rangeInputs[0].value).toBe('1.5');
  });

  test('opacity slider reflects opacity prop', () => {
    const { container } = render(<ControlPanel {...defaultProps} opacity={0.75} />);
    const desktopBar = container.querySelector('[data-testid="desktop-bar"]');
    const rangeInputs = desktopBar.querySelectorAll('input[type="range"]');
    expect(rangeInputs[2].value).toBe('0.75');
  });

  test('no Advanced button exists (no collapsed sections)', () => {
    render(<ControlPanel {...defaultProps} />);
    const advancedBtn = screen.queryByRole('button', { name: /advanced/i });
    expect(advancedBtn).toBeNull();
  });
});
```

- [ ] **Step 2: Run existing tests to confirm they still pass (before any ControlPanel changes)**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: all existing tests pass.

- [ ] **Step 3: Add mobile bar and drawerOpen state to ControlPanel.jsx**

Replace the entire `export default function ControlPanel` in `src/ControlPanel.jsx`:

```jsx
export default function ControlPanel({
  presets,
  activeIndex,
  rotationSpeed,
  viewMode,
  color,
  bgColor,
  opacity,
  animIntensity,
  onPresetChange,
  onSpeedChange,
  onViewModeChange,
  onColorChange,
  onBgColorChange,
  onOpacityChange,
  onAnimIntensityChange,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const prev = () => onPresetChange((activeIndex - 1 + presets.length) % presets.length);
  const next = () => onPresetChange((activeIndex + 1) % presets.length);

  return (
    <>
      {/* ── Desktop bar (hidden on mobile) ── */}
      <div
        data-testid="desktop-bar"
        className="hidden md:flex fixed bottom-0 left-0 right-0 z-10 items-center h-11 px-5 gap-3"
        style={{ background: 'rgba(8,8,18,0.9)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Preset */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={prev}
            className="text-white/20 hover:text-white/60 transition-colors text-lg leading-none"
            aria-label="Previous preset"
          >
            ‹
          </button>
          <span className="text-white/75 text-xs font-semibold tracking-widest w-36 text-center truncate">
            {presets[activeIndex].name.toUpperCase()}
          </span>
          <button
            onClick={next}
            className="text-white/20 hover:text-white/60 transition-colors text-lg leading-none"
            aria-label="Next preset"
          >
            ›
          </button>
        </div>

        <Divider />

        {/* View mode */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-white/20 text-xs uppercase tracking-widest">View</span>
          <div className="flex gap-0.5">
            {[['wire', 'WIRE'], ['overlay', 'OVL'], ['solid', 'SOLID']].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                aria-pressed={viewMode === mode}
                className={`px-2 py-1 rounded text-xs tracking-wide transition-colors ${
                  viewMode === mode
                    ? 'bg-white/20 text-white/75 font-semibold'
                    : 'bg-white/5 text-white/25 hover:text-white/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Motion */}
        <div className="flex items-center gap-4 shrink-0">
          <SliderControl
            label="Speed"
            min={0} max={2} step={0.05}
            value={rotationSpeed}
            onChange={onSpeedChange}
            unit="×"
          />
          <SliderControl
            label="Anim"
            min={0} max={3} step={0.1}
            value={animIntensity}
            onChange={onAnimIntensityChange}
            unit="×"
          />
        </div>

        <Divider />

        {/* Appearance */}
        <div className="flex items-center gap-4 shrink-0">
          <ColorSwatch label="Surface" value={color} onChange={onColorChange} />
          <ColorSwatch label="BG" value={bgColor} onChange={onBgColorChange} />
          <SliderControl
            label="Opacity"
            min={0} max={1} step={0.01}
            value={opacity}
            onChange={onOpacityChange}
          />
        </div>
      </div>

      {/* ── Mobile collapsed bar (hidden on md+) ── */}
      <div
        data-testid="mobile-bar"
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-10 items-center h-11 px-4"
        style={{ background: 'rgba(8,8,18,0.9)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2 flex-1 justify-center">
          <button
            onClick={prev}
            className="text-white/20 hover:text-white/60 transition-colors text-lg leading-none"
            aria-label="Previous preset"
          >
            ‹
          </button>
          <span className="text-white/75 text-xs font-semibold tracking-widest w-36 text-center truncate">
            {presets[activeIndex].name.toUpperCase()}
          </span>
          <button
            onClick={next}
            className="text-white/20 hover:text-white/60 transition-colors text-lg leading-none"
            aria-label="Next preset"
          >
            ›
          </button>
        </div>
        <button
          onClick={() => setDrawerOpen(o => !o)}
          aria-label={drawerOpen ? 'Close settings' : 'Open settings'}
          className="text-white/30 hover:text-white/70 transition-colors text-base leading-none ml-2"
        >
          ⚙
        </button>
      </div>
    </>
  );
}
```

Also add `useState` to the import at the top of the file (it already imports `useRef` — add `useState`):

```jsx
import { useState, useRef } from 'react';
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Add mobile bar test**

Append to the `describe` block in `src/test/ControlPanel.test.jsx`:

```jsx
describe('ControlPanel mobile bar', () => {
  test('settings toggle button exists in mobile bar', () => {
    render(<ControlPanel {...defaultProps} />);
    const mobileBar = screen.getByTestId('mobile-bar');
    const toggleBtn = within(mobileBar).getByRole('button', { name: /open settings/i });
    expect(toggleBtn).toBeTruthy();
  });

  test('settings toggle label changes to "Close settings" after click', () => {
    render(<ControlPanel {...defaultProps} />);
    const mobileBar = screen.getByTestId('mobile-bar');
    const toggleBtn = within(mobileBar).getByRole('button', { name: /open settings/i });
    fireEvent.click(toggleBtn);
    expect(within(mobileBar).getByRole('button', { name: /close settings/i })).toBeTruthy();
  });
});
```

- [ ] **Step 6: Run tests**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: all tests pass including the two new mobile bar tests.

- [ ] **Step 7: Commit**

```bash
git add src/ControlPanel.jsx src/test/ControlPanel.test.jsx
git commit -m "feat: add mobile collapsed bar with drawer toggle"
```

---

### Task 2: Backdrop and drawer panel

**Files:**
- Modify: `src/ControlPanel.jsx`
- Modify: `src/test/ControlPanel.test.jsx`

**Interfaces:**
- Consumes: `drawerOpen` state and `setDrawerOpen` from Task 1
- Produces: backdrop `div` with `data-testid="mobile-backdrop"`; drawer `div` with `role="region"` `aria-label="Settings drawer"` containing all controls stacked

- [ ] **Step 1: Write failing tests for the drawer**

Append a new describe block to `src/test/ControlPanel.test.jsx`:

```jsx
describe('ControlPanel mobile drawer', () => {
  test('drawer is not present when closed', () => {
    render(<ControlPanel {...defaultProps} />);
    expect(screen.queryByRole('region', { name: /settings drawer/i })).toBeNull();
  });

  test('clicking Open settings renders the drawer', () => {
    render(<ControlPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    expect(screen.getByRole('region', { name: /settings drawer/i })).toBeTruthy();
  });

  test('drawer contains view mode buttons', () => {
    render(<ControlPanel {...defaultProps} viewMode="wire" />);
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    const drawer = screen.getByRole('region', { name: /settings drawer/i });
    expect(within(drawer).getByRole('button', { name: /^WIRE$/i })).toBeTruthy();
    expect(within(drawer).getByRole('button', { name: /^OVL$/i })).toBeTruthy();
    expect(within(drawer).getByRole('button', { name: /^SOLID$/i })).toBeTruthy();
  });

  test('drawer view mode button calls onViewModeChange', () => {
    const onViewModeChange = vi.fn();
    render(<ControlPanel {...defaultProps} viewMode="wire" onViewModeChange={onViewModeChange} />);
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    const drawer = screen.getByRole('region', { name: /settings drawer/i });
    fireEvent.click(within(drawer).getByRole('button', { name: /^SOLID$/i }));
    expect(onViewModeChange).toHaveBeenCalledWith('solid');
  });

  test('drawer contains speed, anim, and opacity sliders', () => {
    render(<ControlPanel {...defaultProps} rotationSpeed={1.2} animIntensity={2.0} opacity={0.5} />);
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    const drawer = screen.getByRole('region', { name: /settings drawer/i });
    const sliders = drawer.querySelectorAll('input[type="range"]');
    expect(sliders.length).toBe(3);
    expect(sliders[0].value).toBe('1.2'); // speed
    expect(sliders[1].value).toBe('2.0'); // anim
    expect(sliders[2].value).toBe('0.5'); // opacity
  });

  test('drawer contains surface and bg color inputs', () => {
    render(<ControlPanel {...defaultProps} color="#ff0000" bgColor="#0000ff" />);
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    const drawer = screen.getByRole('region', { name: /settings drawer/i });
    const colorInputs = drawer.querySelectorAll('input[type="color"]');
    expect(colorInputs.length).toBe(2);
    const vals = Array.from(colorInputs).map(i => i.value);
    expect(vals).toContain('#ff0000');
    expect(vals).toContain('#0000ff');
  });

  test('clicking the backdrop closes the drawer', () => {
    render(<ControlPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    expect(screen.getByRole('region', { name: /settings drawer/i })).toBeTruthy();
    fireEvent.click(screen.getByTestId('mobile-backdrop'));
    expect(screen.queryByRole('region', { name: /settings drawer/i })).toBeNull();
  });

  test('clicking Close settings closes the drawer', () => {
    render(<ControlPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    expect(screen.getByRole('region', { name: /settings drawer/i })).toBeTruthy();
    const mobileBar = screen.getByTestId('mobile-bar');
    fireEvent.click(within(mobileBar).getByRole('button', { name: /close settings/i }));
    expect(screen.queryByRole('region', { name: /settings drawer/i })).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --reporter=verbose 2>&1 | tail -30
```

Expected: the new drawer tests FAIL ("drawer is not present when closed" passes; the rest fail because the drawer doesn't exist yet).

- [ ] **Step 3: Add backdrop and drawer to ControlPanel.jsx**

Inside the `<>` fragment in `ControlPanel.jsx`, add the backdrop and drawer between the desktop bar and the mobile bar (so the mobile bar sits on top in z-order):

```jsx
      {/* ── Mobile backdrop ── */}
      {drawerOpen && (
        <div
          data-testid="mobile-backdrop"
          className="fixed inset-0 md:hidden z-10"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div
          role="region"
          aria-label="Settings drawer"
          className="fixed bottom-11 left-0 right-0 md:hidden z-20 px-5 py-3 flex flex-col gap-4"
          style={{ background: 'rgba(8,8,18,0.9)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* View mode */}
          <div className="flex flex-col gap-2">
            <span className="text-white/20 text-xs uppercase tracking-widest">View</span>
            <div className="flex gap-1.5">
              {[['wire', 'WIRE'], ['overlay', 'OVL'], ['solid', 'SOLID']].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
                  aria-pressed={viewMode === mode}
                  className={`flex-1 py-2 rounded text-xs tracking-wide transition-colors ${
                    viewMode === mode
                      ? 'bg-white/20 text-white/75 font-semibold'
                      : 'bg-white/5 text-white/25'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Motion */}
          <div className="flex flex-col gap-3">
            <SliderControl
              label="Speed"
              min={0} max={2} step={0.05}
              value={rotationSpeed}
              onChange={onSpeedChange}
              unit="×"
            />
            <SliderControl
              label="Anim"
              min={0} max={3} step={0.1}
              value={animIntensity}
              onChange={onAnimIntensityChange}
              unit="×"
            />
          </div>

          {/* Appearance */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-6">
              <ColorSwatch label="Surface" value={color} onChange={onColorChange} />
              <ColorSwatch label="BG" value={bgColor} onChange={onBgColorChange} />
            </div>
            <SliderControl
              label="Opacity"
              min={0} max={1} step={0.01}
              value={opacity}
              onChange={onOpacityChange}
            />
          </div>
        </div>
      )}
```

The full `<>` fragment order is: desktop bar → backdrop → drawer → mobile bar. (Mobile bar must be last so its `z-10` stacks above the backdrop `z-10` due to DOM order; the drawer is `z-20`.)

- [ ] **Step 4: Run tests**

```bash
npm test -- --reporter=verbose 2>&1 | tail -30
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/ControlPanel.jsx src/test/ControlPanel.test.jsx
git commit -m "feat: add mobile settings drawer with backdrop"
```
