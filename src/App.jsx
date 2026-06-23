import { useState, useEffect } from 'react';
import Scene from './Scene.jsx';
import { presets } from './presets.js';
import ControlPanel from './ControlPanel.jsx';

export default function App() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % presets.length), 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Scene preset={presets[idx]} rotationSpeed={0.5} wireframe={false} />
      <ControlPanel
        presets={presets}
        activeIndex={0}
        rotationSpeed={0.5}
        wireframe={false}
        onPresetChange={() => {}}
        onSpeedChange={() => {}}
        onWireframeChange={() => {}}
      />
    </div>
  );
}
