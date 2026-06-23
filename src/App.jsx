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
