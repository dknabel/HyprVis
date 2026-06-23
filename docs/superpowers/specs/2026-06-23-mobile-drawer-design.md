# Mobile Drawer Design

**Date:** 2026-06-23
**Scope:** Mobile-only UI for the parametric surface visualizer

## Problem

The desktop bottom bar is a single fixed-height (`h-11`) horizontal row with `shrink-0` on every section. On narrow mobile screens it overflows, clipping most controls out of view.

## Solution

Add a mobile-specific layout that replaces the bottom bar on screens below `768px` (`md` breakpoint). Desktop layout is entirely unchanged.

## Layout

### Desktop (`md` and above)
Exactly as today: single `h-11` bottom bar with all controls inline.

### Mobile (below `md`)

**Collapsed state (always visible):**
- Same `h-11` fixed bottom strip
- Left/center: `‹ PRESET NAME ›` navigation (arrows + fixed-width name)
- Right: ⚙ settings icon button that toggles the drawer
- All other controls are hidden

**Drawer (open state):**
- Slides up from the bottom bar as a fixed overlay panel
- Height: `auto`, roughly half the screen, sitting above the collapsed bar
- Dark background matching the bottom bar (`rgba(8,8,18,0.9)`) with a top border
- Controls stacked vertically with comfortable touch sizing (`py-3` rows, `gap-3`):
  1. View mode — WIRE / OVL / SOLID as a full-width segmented button row
  2. Speed slider
  3. Anim slider
  4. Surface color swatch + BG color swatch (side by side)
  5. Opacity slider
- Close affordance: ⚙ icon toggles closed, tapping the backdrop closes it

**Backdrop:**
- Semi-transparent dark overlay (`rgba(0,0,0,0.4)`) rendered between the canvas and the drawer
- Covers the full screen; tap closes the drawer

## Implementation

All changes in `src/ControlPanel.jsx`. No new files.

- Add `drawerOpen` state (`useState(false)`)
- Render two sibling elements inside the fixed wrapper:
  1. Backdrop `div` (conditional on `drawerOpen`, mobile only, `md:hidden`)
  2. Drawer panel `div` (conditional on `drawerOpen`, mobile only, `md:hidden`)
- Existing bottom bar: add `hidden md:flex` to hide on mobile; render a separate mobile bar with `flex md:hidden`
- Use Tailwind `md:` prefix for all responsive switching — no JS breakpoint detection needed
- `drawerOpen` only affects mobile elements; desktop renders nothing related to it

## Out of Scope

- Gesture/swipe to open drawer
- Remembering drawer open state across sessions
- Any change to desktop layout
