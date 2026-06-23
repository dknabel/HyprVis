import { useRef } from 'react';

function SliderControl({ label, min, max, step, value, onChange, unit = '' }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-white/20 text-xs uppercase tracking-widest whitespace-nowrap">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
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
  const prev = () => onPresetChange((activeIndex - 1 + presets.length) % presets.length);
  const next = () => onPresetChange((activeIndex + 1) % presets.length);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10 flex items-center h-11 px-5 gap-3"
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
  );
}
