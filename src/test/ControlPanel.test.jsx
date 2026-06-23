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
