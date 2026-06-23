import { useState } from 'react';
import Scene from './Scene.jsx';
import ControlPanel from './ControlPanel.jsx';
import { presets } from './presets.js';

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [wireframe, setWireframe] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Scene
        preset={presets[activeIndex]}
        rotationSpeed={rotationSpeed}
        wireframe={wireframe}
      />
      <ControlPanel
        presets={presets}
        activeIndex={activeIndex}
        rotationSpeed={rotationSpeed}
        wireframe={wireframe}
        onPresetChange={setActiveIndex}
        onSpeedChange={setRotationSpeed}
        onWireframeChange={setWireframe}
      />
    </div>
  );
}
