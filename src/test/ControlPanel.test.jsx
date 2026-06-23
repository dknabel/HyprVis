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
