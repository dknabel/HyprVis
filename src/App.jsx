import { useState } from 'react';
import Scene from './Scene.jsx';
import ControlPanel from './ControlPanel.jsx';
import { presets } from './presets.js';

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [viewMode, setViewMode] = useState('wire');
  const [color, setColor] = useState(presets[0].color);
  const [bgColor, setBgColor] = useState('#050505');
  const [opacity, setOpacity] = useState(1.0);
  const [animIntensity, setAnimIntensity] = useState(1.0);

  function handlePresetChange(index) {
    setActiveIndex(index);
    setColor(currentColor =>
      currentColor === presets[activeIndex].color
        ? presets[index].color
        : currentColor
    );
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Scene
        preset={presets[activeIndex]}
        rotationSpeed={rotationSpeed}
        viewMode={viewMode}
        color={color}
        bgColor={bgColor}
        opacity={opacity}
        animIntensity={animIntensity}
      />
      <ControlPanel
        presets={presets}
        activeIndex={activeIndex}
        rotationSpeed={rotationSpeed}
        viewMode={viewMode}
        color={color}
        bgColor={bgColor}
        opacity={opacity}
        animIntensity={animIntensity}
        onPresetChange={handlePresetChange}
        onSpeedChange={setRotationSpeed}
        onViewModeChange={setViewMode}
        onColorChange={setColor}
        onBgColorChange={setBgColor}
        onOpacityChange={setOpacity}
        onAnimIntensityChange={setAnimIntensity}
      />
    </div>
  );
}
