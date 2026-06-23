import { useState } from 'react';
import Scene from './Scene.jsx';
import { presets } from './presets.js';

export default function App() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Scene
        preset={presets[0]}
        rotationSpeed={0.5}
        wireframe={false}
      />
    </div>
  );
}
