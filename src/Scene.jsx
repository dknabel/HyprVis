import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MORPH_DURATION = 800;
const RESOLUTION = 96;

function buildPositions(fn, t, resolution) {
  const count = (resolution + 1) * (resolution + 1);
  const positions = new Float32Array(count * 3);
  let i = 0;
  for (let row = 0; row <= resolution; row++) {
    for (let col = 0; col <= resolution; col++) {
      const { x, y, z } = fn(col / resolution, row / resolution, t);
      positions[i++] = x;
      positions[i++] = y;
      positions[i++] = z;
    }
  }
  return positions;
}

function buildIndices(resolution) {
  const indices = new Uint32Array(resolution * resolution * 6);
  let idx = 0;
  for (let row = 0; row < resolution; row++) {
    for (let col = 0; col < resolution; col++) {
      const a = row * (resolution + 1) + col;
      const b = a + 1;
      const c = a + (resolution + 1);
      const d = c + 1;
      indices[idx++] = a;
      indices[idx++] = b;
      indices[idx++] = c;
      indices[idx++] = b;
      indices[idx++] = d;
      indices[idx++] = c;
    }
  }
  return indices;
}

export default function Scene({ preset, rotationSpeed, viewMode, color, bgColor, opacity, animIntensity }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const geoRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(bgColor);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.01, 100);
    camera.position.set(0, 0, 5);

    const dirLight = new THREE.DirectionalLight(0xfff4e0, 2.5);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight, new THREE.AmbientLight(0x222233, 1.5));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const geo = new THREE.BufferGeometry();
    geoRef.current = geo;
    geo.setIndex(new THREE.BufferAttribute(buildIndices(RESOLUTION), 1));
    const posAttr = new THREE.BufferAttribute(buildPositions(preset.fn, 0, RESOLUTION), 3);
    geo.setAttribute('position', posAttr);
    geo.computeVertexNormals();

    const solidMat = new THREE.MeshPhongMaterial({
      color, shininess: 60, side: THREE.DoubleSide,
      transparent: opacity < 1, opacity,
    });
    const wireMat = new THREE.MeshBasicMaterial({
      color, wireframe: true, side: THREE.DoubleSide,
    });

    const solidMesh = new THREE.Mesh(geo, solidMat);
    const wireMesh = new THREE.Mesh(geo, wireMat);
    scene.add(solidMesh, wireMesh);

    stateRef.current = {
      preset, rotationSpeed, viewMode, animIntensity,
      bgColor, opacity,
      solidMesh, wireMesh, solidMat, wireMat, posAttr,
      morph: { from: null, target: null, start: null },
      t: 0, rotation: 0,
      renderer,
    };

    let t = 0, rafId;

    function animate(now) {
      rafId = requestAnimationFrame(animate);
      const s = stateRef.current;
      const morph = s.morph;
      t += 0.005 * s.animIntensity;
      s.t = t;

      if (morph.target) {
        const progress = Math.min((now - morph.start) / MORPH_DURATION, 1);
        const ease = progress < 0.5
          ? 4 * progress ** 3
          : 1 - (-2 * progress + 2) ** 3 / 2;
        const arr = s.posAttr.array;
        for (let i = 0; i < arr.length; i++) {
          arr[i] = morph.from[i] + (morph.target[i] - morph.from[i]) * ease;
        }
        s.posAttr.needsUpdate = true;
        geo.computeVertexNormals();
        if (progress >= 1) {
          t = s.morph.targetT ?? t;
          s.t = t;
          morph.from = null;
          morph.target = null;
          morph.targetT = null;
        }
      } else if (s.animIntensity !== 0) {
        s.posAttr.array.set(buildPositions(s.preset.fn, t, RESOLUTION));
        s.posAttr.needsUpdate = true;
        geo.computeVertexNormals();
      }

      s.rotation += 0.002 * s.rotationSpeed;
      solidMesh.rotation.y = s.rotation;
      wireMesh.rotation.y = s.rotation;

      const vm = s.viewMode;
      solidMesh.visible = vm === 'solid' || vm === 'overlay';
      wireMesh.visible = vm === 'wire' || vm === 'overlay';

      s.solidMat.opacity = s.opacity;
      s.solidMat.transparent = s.opacity < 1;
      renderer.setClearColor(s.bgColor);

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
    if (!s.posAttr) return;
    s.morph.from = new Float32Array(s.posAttr.array);
    s.morph.target = buildPositions(preset.fn, s.t ?? 0, RESOLUTION);
    s.morph.start = performance.now();
    s.morph.targetT = s.t ?? 0;
    s.preset = preset;
  }, [preset]);

  useEffect(() => { stateRef.current.rotationSpeed = rotationSpeed; }, [rotationSpeed]);
  useEffect(() => { stateRef.current.viewMode = viewMode; }, [viewMode]);

  useEffect(() => {
    const s = stateRef.current;
    if (!s.solidMat) return;
    s.solidMat.color.set(color);
    s.wireMat.color.set(color);
  }, [color]);

  useEffect(() => { stateRef.current.animIntensity = animIntensity; }, [animIntensity]);
  useEffect(() => { stateRef.current.bgColor = bgColor; }, [bgColor]);
  useEffect(() => { stateRef.current.opacity = opacity; }, [opacity]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
}
