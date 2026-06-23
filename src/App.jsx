import { useState, useEffect } from 'react';
import Scene from './Scene.jsx';
import { presets } from './presets.js';

export default function App() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % presets.length), 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Scene preset={presets[idx]} rotationSpeed={0.5} wireframe={false} />
    </div>
  );
}
