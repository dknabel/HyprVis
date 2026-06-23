import { describe, it, expect } from 'vitest';
import { presets } from './presets.js';

describe('presets', () => {
  it('exports exactly 30 presets', () => {
    expect(presets).toHaveLength(30);
  });

  it.each(presets)('$name has a name, hex color, and fn', ({ name, color, fn }) => {
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(typeof fn).toBe('function');
  });

  it.each(presets)('$name fn returns finite {x,y,z} for sample u,v inputs', ({ fn }) => {
    const samples = [
      [0, 0], [0.5, 0.5], [1, 1], [0.1, 0.9], [0.99, 0.01], [0.25, 0.75],
    ];
    for (const [u, v] of samples) {
      const result = fn(u, v, 0);
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
      expect(typeof result.z).toBe('number');
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
      expect(Number.isFinite(result.z)).toBe(true);
    }
  });

  it.each(presets)('$name fn does not crash at t=10', ({ fn }) => {
    const r0 = fn(0.5, 0.5, 0);
    const r1 = fn(0.5, 0.5, 10);
    expect(Number.isFinite(r0.x)).toBe(true);
    expect(Number.isFinite(r0.y)).toBe(true);
    expect(Number.isFinite(r0.z)).toBe(true);
    expect(Number.isFinite(r1.x)).toBe(true);
    expect(Number.isFinite(r1.y)).toBe(true);
    expect(Number.isFinite(r1.z)).toBe(true);
  });
});
