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
