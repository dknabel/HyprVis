const TWO_PI = Math.PI * 2;

function frenetTube(curveFn, u, v, r) {
  const s = u * TWO_PI;
  const theta = v * TWO_PI;
  const ds = 0.0001;

  const p = curveFn(s);
  const p2 = curveFn(s + ds);

  const tx = (p2.x - p.x) / ds;
  const ty = (p2.y - p.y) / ds;
  const tz = (p2.z - p.z) / ds;
  const tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
  const Tx = tx / tl, Ty = ty / tl, Tz = tz / tl;

  let upX = 0, upY = 1, upZ = 0;
  if (Math.abs(Ty) > 0.9) { upX = 1; upY = 0; upZ = 0; }

  const Nx = Ty * upZ - Tz * upY;
  const Ny = Tz * upX - Tx * upZ;
  const Nz = Tx * upY - Ty * upX;
  const nl = Math.sqrt(Nx * Nx + Ny * Ny + Nz * Nz) || 1;
  const nx = Nx / nl, ny = Ny / nl, nz = Nz / nl;

  const bx = Ty * nz - Tz * ny;
  const by = Tz * nx - Tx * nz;
  const bz = Tx * ny - Ty * nx;

  return {
    x: p.x + r * (Math.cos(theta) * nx + Math.sin(theta) * bx),
    y: p.y + r * (Math.cos(theta) * ny + Math.sin(theta) * by),
    z: p.z + r * (Math.cos(theta) * nz + Math.sin(theta) * bz),
  };
}

export const presets = [
  {
    name: 'Torus',
    color: '#6366f1',
    fn(u, v, t) {
      const U = u * TWO_PI, V = v * TWO_PI;
      const R = 1.5, r = 0.5 + 0.08 * Math.sin(t * 0.8);
      return {
        x: (R + r * Math.cos(V)) * Math.cos(U),
        y: r * Math.sin(V),
        z: (R + r * Math.cos(V)) * Math.sin(U),
      };
    },
  },
  {
    name: 'Enneper',
    color: '#14b8a6',
    fn(u, v, t) {
      const s = 2.5 + 0.3 * Math.sin(t * 0.5);
      const U = (u - 0.5) * s, V = (v - 0.5) * s;
      return {
        x: (U - (U ** 3) / 3 + U * V * V) * 0.3,
        y: (V - (V ** 3) / 3 + V * U * U) * 0.3,
        z: (U * U - V * V) * 0.3,
      };
    },
  },
  {
    name: 'Möbius Strip',
    color: '#f59e0b',
    fn(u, v, t) {
      const U = u * TWO_PI;
      const V = (v - 0.5) * 1.5;
      const twist = t * 0.2;
      return {
        x: (1.5 + V * Math.cos(U / 2 + twist)) * Math.cos(U),
        y: (1.5 + V * Math.cos(U / 2 + twist)) * Math.sin(U),
        z: V * Math.sin(U / 2 + twist),
      };
    },
  },
  {
    name: 'Trefoil',
    color: '#f43f5e',
    fn(u, v, t) {
      const anim = t * 0.15;
      return frenetTube(
        (s) => ({
          x: (Math.sin(s + anim) + 2 * Math.sin(2 * s)) * 0.45,
          y: (Math.cos(s + anim) - 2 * Math.cos(2 * s)) * 0.45,
          z: -Math.sin(3 * s) * 0.45,
        }),
        u, v, 0.12
      );
    },
  },
  {
    name: 'Roman Surface',
    color: '#a855f7',
    fn(u, v, t) {
      const U = u * Math.PI, V = v * Math.PI;
      const s = 1.2 + 0.1 * Math.sin(t * 0.6);
      return {
        x: s * Math.sin(2 * U) * Math.cos(V) ** 2,
        y: s * Math.sin(U) * Math.sin(2 * V),
        z: s * Math.cos(U) * Math.sin(2 * V),
      };
    },
  },
  {
    name: 'Seashell',
    color: '#10b981',
    fn(u, v, t) {
      const V = v * TWO_PI * 2;
      const U = u * TWO_PI;
      const r = Math.exp(0.15 * V) * 0.5;
      return {
        x: r * Math.cos(V) * (1 + Math.cos(U)),
        y: r * Math.sin(V) * (1 + Math.cos(U)),
        z: r * Math.sin(U) + t * 0,
      };
    },
  },
  {
    name: 'Sphere Harmonic',
    color: '#06b6d4',
    fn(u, v, t) {
      const theta = u * Math.PI;
      const phi = v * TWO_PI;
      const st = Math.sin(theta);
      const r = 1.5 + 0.5 * Math.abs(Math.sin(3 * phi) * st ** 3 * Math.cos(theta))
              + 0.12 * Math.sin(t * 1.2);
      return {
        x: r * st * Math.cos(phi),
        y: r * Math.cos(theta),
        z: r * st * Math.sin(phi),
      };
    },
  },
  {
    name: "Dini's Surface",
    color: '#f97316',
    fn(u, v, t) {
      const a = 1, b = 0.2 + 0.08 * Math.sin(t * 0.7);
      const U = u * 4 * Math.PI;
      const V = 0.05 + v * (Math.PI - 0.1);
      return {
        x: a * Math.cos(U) * Math.sin(V) * 0.7,
        y: a * Math.sin(U) * Math.sin(V) * 0.7,
        z: a * (Math.cos(V) + Math.log(Math.tan(V / 2))) * 0.7 + b * U,
      };
    },
  },
  {
    name: 'Klein Bottle',
    color: '#84cc16',
    fn(u, v, t) {
      const U = u * TWO_PI, V = v * TWO_PI;
      const a = 2.5 + 0.15 * Math.sin(t * 0.5);
      return {
        x: (a + Math.cos(U / 2) * Math.sin(V) - Math.sin(U / 2) * Math.sin(2 * V)) * Math.cos(U) * 0.4,
        y: (a + Math.cos(U / 2) * Math.sin(V) - Math.sin(U / 2) * Math.sin(2 * V)) * Math.sin(U) * 0.4,
        z: (Math.sin(U / 2) * Math.sin(V) + Math.cos(U / 2) * Math.sin(2 * V)) * 0.4,
      };
    },
  },
  {
    name: 'Lissajous',
    color: '#0ea5e9',
    fn(u, v, t) {
      const U = u * TWO_PI, V = v * TWO_PI;
      const a = Math.sin(3 * U + t * 0.4) + 2;
      return {
        x: a * Math.cos(V),
        y: a * Math.sin(V),
        z: Math.sin(5 * U + t * 0.6) * Math.cos(2 * V),
      };
    },
  },
  {
    name: 'Breather',
    color: '#eab308',
    fn(u, v, t) {
      const omega = 0.45;
      const aa = Math.sqrt(1 - omega * omega);
      const U = (u - 0.5) * 13;
      const V = v * TWO_PI * 0.75 + t * 0.08;
      const denom = omega * ((1 - omega * omega) * Math.cosh(omega * U) ** 2 + omega * omega * Math.sin(aa * V) ** 2);
      if (Math.abs(denom) < 1e-8) return { x: 0, y: 0, z: 0 };
      return {
        x: (-U + (2 * (1 - omega * omega) * Math.cosh(omega * U) * Math.sinh(omega * U)) / denom) * 0.3,
        y: (2 * aa * Math.cosh(omega * U) * (-aa * Math.cos(V) * Math.cos(aa * V) - Math.sin(V) * Math.sin(aa * V))) / denom * 0.3,
        z: (2 * aa * Math.cosh(omega * U) * (-aa * Math.sin(V) * Math.cos(aa * V) + Math.cos(V) * Math.sin(aa * V))) / denom * 0.3,
      };
    },
  },
  {
    name: 'Supertoroid',
    color: '#ec4899',
    fn(u, v, t) {
      const U = u * TWO_PI, V = v * TWO_PI;
      const e = 0.4 + 0.3 * Math.abs(Math.sin(t * 0.4));
      const R = 1.5, a = 0.5;
      const sgn = (x) => (x >= 0 ? 1 : -1);
      const cpow = (x, p) => sgn(x) * Math.pow(Math.abs(x) + 1e-10, p);
      return {
        x: (R + a * cpow(Math.cos(U), e)) * cpow(Math.cos(V), e),
        y: (R + a * cpow(Math.cos(U), e)) * cpow(Math.sin(V), e),
        z: a * cpow(Math.sin(U), e),
      };
    },
  },
];
