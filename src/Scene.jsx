import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const RESOLUTION = 96;

function buildPositions(fn, t) {
  const count = (RESOLUTION + 1) * (RESOLUTION + 1);
  const positions = new Float32Array(count * 3);
  let i = 0;
  for (let row = 0; row <= RESOLUTION; row++) {
    for (let col = 0; col <= RESOLUTION; col++) {
      const u = col / RESOLUTION;
      const v = row / RESOLUTION;
      const { x, y, z } = fn(u, v, t);
      positions[i++] = x;
      positions[i++] = y;
      positions[i++] = z;
    }
  }
  return positions;
}

function buildIndices() {
  const indices = [];
  for (let row = 0; row < RESOLUTION; row++) {
    for (let col = 0; col < RESOLUTION; col++) {
      const a = row * (RESOLUTION + 1) + col;
      const b = a + 1;
      const c = a + (RESOLUTION + 1);
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }
  return new Uint32Array(indices);
}

export default function Scene({ preset, rotationSpeed, wireframe }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x050505);
    mount.appendChild(renderer.domElement);

    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100);
    camera.position.set(0, 0, 5);

    // Lights
    const dirLight = new THREE.DirectionalLight(0xfff4e0, 2.5);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x222233, 1.5));

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Geometry
    const geo = new THREE.BufferGeometry();
    geo.setIndex(new THREE.BufferAttribute(buildIndices(), 1));
    const posAttr = new THREE.BufferAttribute(
      buildPositions(preset.fn, 0), 3
    );
    geo.setAttribute('position', posAttr);
    geo.computeVertexNormals();

    // Material
    const solidMat = new THREE.MeshPhongMaterial({
      color: preset.color,
      shininess: 60,
      side: THREE.DoubleSide,
    });
    const wireMat = new THREE.MeshBasicMaterial({
      color: preset.color,
      wireframe: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, wireframe ? wireMat : solidMat);
    scene.add(mesh);

    // Store mutable state in ref so the animation loop always reads fresh values
    stateRef.current = { preset, rotationSpeed, wireframe, solidMat, wireMat };

    let t = 0;
    let rafId;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const s = stateRef.current;
      t += 0.005;

      // Recompute positions from current fn + t
      const pos = buildPositions(s.preset.fn, t);
      posAttr.array.set(pos);
      posAttr.needsUpdate = true;
      geo.computeVertexNormals();

      // Auto-rotate
      mesh.rotation.y += 0.002 * s.rotationSpeed;

      // Wireframe swap
      mesh.material = s.wireframe ? s.wireMat : s.solidMat;

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    function onResize() {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      geo.dispose();
      solidMat.dispose();
      wireMat.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []); // runs once — preset/speed/wireframe changes handled via stateRef

  // Sync prop changes into the ref without restarting the loop
  useEffect(() => {
    if (stateRef.current.solidMat) {
      stateRef.current.solidMat.color.set(preset.color);
      stateRef.current.wireMat.color.set(preset.color);
    }
    stateRef.current.preset = preset;
  }, [preset]);

  useEffect(() => {
    stateRef.current.rotationSpeed = rotationSpeed;
  }, [rotationSpeed]);

  useEffect(() => {
    stateRef.current.wireframe = wireframe;
  }, [wireframe]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100vw', height: '100vh', display: 'block' }}
    />
  );
}
