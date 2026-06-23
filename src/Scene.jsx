import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const RESOLUTION = 96;
const MORPH_DURATION = 800;

function buildPositions(fn, t) {
  const count = (RESOLUTION + 1) * (RESOLUTION + 1);
  const positions = new Float32Array(count * 3);
  let i = 0;
  for (let row = 0; row <= RESOLUTION; row++) {
    for (let col = 0; col <= RESOLUTION; col++) {
      const { x, y, z } = fn(col / RESOLUTION, row / RESOLUTION, t);
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
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x050505);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60, mount.clientWidth / mount.clientHeight, 0.01, 100
    );
    camera.position.set(0, 0, 5);

    const dirLight = new THREE.DirectionalLight(0xfff4e0, 2.5);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight, new THREE.AmbientLight(0x222233, 1.5));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const geo = new THREE.BufferGeometry();
    geo.setIndex(new THREE.BufferAttribute(buildIndices(), 1));
    const posAttr = new THREE.BufferAttribute(buildPositions(preset.fn, 0), 3);
    geo.setAttribute('position', posAttr);
    geo.computeVertexNormals();

    const solidMat = new THREE.MeshPhongMaterial({
      color: preset.color, shininess: 60, side: THREE.DoubleSide,
    });
    const wireMat = new THREE.MeshBasicMaterial({
      color: preset.color, wireframe: true, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, solidMat);
    scene.add(mesh);

    stateRef.current = {
      preset, rotationSpeed, wireframe,
      solidMat, wireMat, posAttr,
      morph: { from: null, target: null, start: null },
    };

    let t = 0, rafId;

    function animate(now) {
      rafId = requestAnimationFrame(animate);
      const s = stateRef.current;
      const morph = s.morph;
      t += 0.005;

      if (morph.target) {
        const progress = Math.min((now - morph.start) / MORPH_DURATION, 1);
        const ease = progress < 0.5
          ? 4 * progress ** 3
          : 1 - (-2 * progress + 2) ** 3 / 2;
        const arr = s.posAttr.array;
        for (let i = 0; i < arr.length; i++) {
          arr[i] = morph.from[i] + (morph.target[i] - morph.from[i]) * ease;
        }
        if (progress >= 1) { morph.from = null; morph.target = null; }
      } else {
        s.posAttr.array.set(buildPositions(s.preset.fn, t));
      }

      s.posAttr.needsUpdate = true;
      geo.computeVertexNormals();
      mesh.rotation.y += 0.002 * s.rotationSpeed;
      mesh.material = s.wireframe ? s.wireMat : s.solidMat;
      controls.update();
      renderer.render(scene, camera);
    }
    animate(performance.now());

    function onResize() {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
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
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    if (!s.morph || !s.posAttr) return;
    s.morph.from = new Float32Array(s.posAttr.array);
    s.morph.target = buildPositions(preset.fn, 0);
    s.morph.start = performance.now();
    if (s.solidMat) {
      s.solidMat.color.set(preset.color);
      s.wireMat.color.set(preset.color);
    }
    s.preset = preset;
  }, [preset]);

  useEffect(() => { stateRef.current.rotationSpeed = rotationSpeed; }, [rotationSpeed]);
  useEffect(() => { stateRef.current.wireframe = wireframe; }, [wireframe]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
}
