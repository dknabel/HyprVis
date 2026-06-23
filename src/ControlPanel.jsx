import { useState, useRef } from 'react';

function SliderControl({ label, min, max, step, value, onChange, unit = '' }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-white/20 text-xs uppercase tracking-widest whitespace-nowrap">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isInteger(value) ? value.toFixed(1) : value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-14 cursor-pointer accent-white/50"
      />
      <span className="text-white/20 text-xs min-w-[28px]">{(+value || 0).toFixed(1)}{unit}</span>
    </div>
  );
}

function ColorSwatch({ label, value, onChange }) {
  const inputRef = useRef(null);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-white/20 text-xs uppercase tracking-widest">{label}</span>
      <div
        aria-label={`${label} color picker`}
        role="button"
        className="w-4 h-4 rounded-full cursor-pointer border border-white/15"
        style={{ background: value }}
        onClick={() => inputRef.current?.click()}
      />
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="sr-only"
      />
    </div>
  );
}

const Divider = () => (
  <div className="self-stretch w-px mx-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
);

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
