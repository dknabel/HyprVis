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
  {
    name: 'Helicoid',
    color: '#22d3ee',
    fn(u, v, t) {
      const U = (u - 0.5) * 4;
      const V = v * TWO_PI * 1.5 + t * 0.12;
      return {
        x: U * Math.cos(V),
        y: U * Math.sin(V),
        z: V * 0.2 - Math.PI * 0.15,
      };
    },
  },
  {
    name: 'Catenoid',
    color: '#34d399',
    fn(u, v, t) {
      const U = (u - 0.5) * 4;
      const V = v * TWO_PI;
      const s = 0.65 + 0.07 * Math.sin(t * 0.5);
      return {
        x: s * Math.cosh(U) * Math.cos(V),
        y: s * Math.cosh(U) * Math.sin(V),
        z: U * 0.8,
      };
    },
  },
  {
    name: 'Pseudosphere',
    color: '#fb7185',
    fn(u, v, t) {
      const U = u * 4 + 0.01;
      const V = v * TWO_PI;
      const s = 0.8 + 0.05 * Math.sin(t * 0.6);
      return {
        x: s / Math.cosh(U) * Math.cos(V),
        y: s / Math.cosh(U) * Math.sin(V),
        z: s * (U - Math.tanh(U)) - 1.5,
      };
    },
  },
  {
    name: 'Saddle',
    color: '#fbbf24',
    fn(u, v, t) {
      const U = (u - 0.5) * 3;
      const V = (v - 0.5) * 3;
      const s = 1 + 0.08 * Math.sin(t * 0.4);
      return {
        x: U * s,
        y: (U * U - V * V) * 0.3 * s,
        z: V * s,
      };
    },
  },
  {
    name: 'Monkey Saddle',
    color: '#c084fc',
    fn(u, v, t) {
      const U = (u - 0.5) * 2.8;
      const V = (v - 0.5) * 2.8;
      const s = 1 + 0.1 * Math.sin(t * 0.5);
      return {
        x: U * s,
        y: (U * U * U - 3 * U * V * V) * 0.18 * s,
        z: V * s,
      };
    },
  },
  {
    name: 'Twisted Torus',
    color: '#f472b6',
    fn(u, v, t) {
      const U = u * TWO_PI;
      const V = v * TWO_PI;
      const R = 1.5, r = 0.38;
      const angle = V + 2 * U + t * 0.18;
      return {
        x: (R + r * Math.cos(angle)) * Math.cos(U),
        y: r * Math.sin(angle),
        z: (R + r * Math.cos(angle)) * Math.sin(U),
      };
    },
  },
  {
    name: 'Cross-Cap',
    color: '#38bdf8',
    fn(u, v, t) {
      const U = u * Math.PI;
      const V = v * Math.PI;
      const s = 1.8 + 0.1 * Math.sin(t * 0.7);
      return {
        x: s * Math.sin(U) * Math.sin(2 * V) / 2,
        y: s * Math.sin(2 * U) * Math.cos(V) ** 2,
        z: s * Math.cos(2 * U) * Math.cos(V) ** 2,
      };
    },
  },
  {
    name: "Boy's Surface",
    color: '#a3e635',
    fn(u, v, t) {
      const U = u * Math.PI;
      const V = v * Math.PI + t * 0.06;
      const denom = 2 - Math.SQRT2 * Math.sin(3 * U) * Math.sin(2 * V);
      if (Math.abs(denom) < 0.01) return { x: 0, y: 0, z: 0 };
      const s = 0.55;
      return {
        x: s * (Math.SQRT2 * Math.cos(U) ** 2 * Math.cos(2 * V) + Math.cos(U) * Math.sin(2 * V)) / denom,
        y: s * (Math.SQRT2 * Math.cos(U) ** 2 * Math.sin(2 * V) - Math.cos(U) * Math.cos(2 * V)) / denom,
        z: s * 3 * Math.cos(U) ** 2 / denom - 0.9,
      };
    },
  },
  {
    name: 'Rosette',
    color: '#fb923c',
    fn(u, v, t) {
      const anim = t * 0.1;
      return frenetTube(
        (s) => {
          const r = 1.2 + 0.6 * Math.cos(4 * s);
          return {
            x: r * Math.cos(s + anim) * 0.5,
            y: 0.2 * Math.sin(6 * s),
            z: r * Math.sin(s + anim) * 0.5,
          };
        },
        u, v, 0.14
      );
    },
  },
  {
    name: 'Whitney Umbrella',
    color: '#e879f9',
    fn(u, v, t) {
      const U = (u - 0.5) * 3;
      const V = (v - 0.5) * 3;
      const s = 1 + 0.07 * Math.sin(t * 0.5);
      return {
        x: U * V * 0.5 * s,
        y: U * 0.8 * s,
        z: V * V * 0.4 * s - 0.6,
      };
    },
  },
  {
    name: 'Kuen',
    color: '#67e8f9',
    fn(u, v, t) {
      const U = (u - 0.5) * 8;
      const V = 0.05 + v * (Math.PI - 0.1);
      const drift = t * 0.04;
      const sinV = Math.sin(V), cosV = Math.cos(V);
      const denom = 1 + U * U * sinV * sinV;
      if (denom < 1e-6) return { x: 0, y: 0, z: 0 };
      const s = 0.4;
      const UU = U + drift;
      return {
        x: s * 2 * (Math.cos(UU) + UU * Math.sin(UU)) * sinV / denom,
        y: s * 2 * (Math.sin(UU) - UU * Math.cos(UU)) * sinV / denom,
        z: s * (Math.log(Math.tan(V / 2)) + 2 * cosV / denom),
      };
    },
  },
  {
    name: 'Bohemian Dome',
    color: '#4ade80',
    fn(u, v, t) {
      const U = u * TWO_PI;
      const V = v * TWO_PI;
      const a = 0.9 + 0.08 * Math.sin(t * 0.5);
      return {
        x: a * Math.cos(U),
        y: 1.1 * Math.cos(V) + a * Math.sin(U),
        z: 1.3 * Math.sin(V),
      };
    },
  },
  {
    name: 'Harmonic 2·1',
    color: '#818cf8',
    fn(u, v, t) {
      const theta = u * Math.PI;
      const phi = v * TWO_PI;
      const st = Math.sin(theta), ct = Math.cos(theta);
      const harmonic = Math.abs(st * ct * Math.cos(phi));
      const r = (1.0 + 1.8 * harmonic) * (1 + 0.07 * Math.sin(t * 1.1));
      return {
        x: r * st * Math.cos(phi),
        y: r * ct,
        z: r * st * Math.sin(phi),
      };
    },
  },
  {
    name: 'Harmonic 3·2',
    color: '#f0abfc',
    fn(u, v, t) {
      const theta = u * Math.PI;
      const phi = v * TWO_PI;
      const st = Math.sin(theta), ct = Math.cos(theta);
      const harmonic = Math.abs(st * st * ct * Math.cos(2 * phi));
      const r = (0.7 + 2.5 * harmonic) * (1 + 0.06 * Math.sin(t * 0.9));
      return {
        x: r * st * Math.cos(phi),
        y: r * ct,
        z: r * st * Math.sin(phi),
      };
    },
  },
  {
    name: 'Harmonic 4·4',
    color: '#fcd34d',
    fn(u, v, t) {
      const theta = u * Math.PI;
      const phi = v * TWO_PI;
      const st = Math.sin(theta);
      const harmonic = Math.abs(Math.pow(st, 4) * Math.cos(4 * phi));
      const r = (0.6 + 3.0 * harmonic) * (1 + 0.05 * Math.sin(t * 1.3));
      return {
        x: r * st * Math.cos(phi),
        y: r * Math.cos(theta),
        z: r * st * Math.sin(phi),
      };
    },
  },
  {
    name: 'Torus Knot',
    color: '#2dd4bf',
    fn(u, v, t) {
      const p = 3, q = 7;
      const anim = t * 0.06;
      return frenetTube(
        (s) => {
          const r = Math.cos(q * s) + 2.5;
          return {
            x: r * Math.cos(p * s + anim) * 0.38,
            y: r * Math.sin(p * s + anim) * 0.38,
            z: -Math.sin(q * s) * 0.38,
          };
        },
        u, v, 0.08
      );
    },
  },
  {
    name: 'Spring',
    color: '#a78bfa',
    fn(u, v, t) {
      const coils = 5;
      const anim = t * 0.08;
      return frenetTube(
        (s) => ({
          x: Math.cos(s * coils + anim) * 1.1,
          y: s / TWO_PI * 3.0 - 1.5,
          z: Math.sin(s * coils + anim) * 1.1,
        }),
        u, v, 0.13
      );
    },
  },
  {
    name: 'Bumpy Sphere',
    color: '#d946ef',
    fn(u, v, t) {
      const theta = u * Math.PI;
      const phi = v * TWO_PI;
      const st = Math.sin(theta);
      const r = 1.5 + 0.35 * Math.sin(5 * theta + t * 0.3) * Math.sin(5 * phi);
      return {
        x: r * st * Math.cos(phi),
        y: r * Math.cos(theta),
        z: r * st * Math.sin(phi),
      };
    },
  },
  {
    name: 'Figure-8 Knot',
    color: '#e11d48',
    fn(u, v, t) {
      const anim = t * 0.09;
      return frenetTube(
        (s) => ({
          x: (2 + Math.cos(2 * s)) * Math.cos(3 * s + anim) * 0.38,
          y: (2 + Math.cos(2 * s)) * Math.sin(3 * s + anim) * 0.38,
          z: Math.sin(4 * s) * 0.38,
        }),
        u, v, 0.1
      );
    },
  },
  {
    name: 'Astroidal Ellipsoid',
    color: '#0891b2',
    fn(u, v, t) {
      const theta = u * Math.PI;
      const phi = v * TWO_PI;
      const s = 1.5 + 0.08 * Math.sin(t * 0.6);
      return {
        x: s * Math.pow(Math.abs(Math.sin(theta)), 3) * Math.pow(Math.abs(Math.cos(phi)), 1) * Math.sign(Math.sin(theta)) * Math.sign(Math.cos(phi)),
        y: s * Math.pow(Math.abs(Math.cos(theta)), 3) * Math.sign(Math.cos(theta)),
        z: s * Math.pow(Math.abs(Math.sin(theta)), 3) * Math.pow(Math.abs(Math.sin(phi)), 1) * Math.sign(Math.sin(theta)) * Math.sign(Math.sin(phi)),
      };
    },
  },
  {
    name: 'Pillow',
    color: '#16a34a',
    fn(u, v, t) {
      const U = u * TWO_PI;
      const V = v * TWO_PI;
      const s = 1 + 0.07 * Math.sin(t * 0.5);
      return {
        x: s * Math.sin(U),
        y: s * Math.sin(V),
        z: s * Math.cos(U) * Math.cos(V),
      };
    },
  },
  {
    name: 'Snail Shell',
    color: '#ca8a04',
    fn(u, v, t) {
      const V = v * TWO_PI * 3;
      const U = u * TWO_PI;
      const r = 0.18 * Math.exp(0.2 * V);
      const drift = t * 0.04;
      return {
        x: r * Math.cos(V + drift) * (1 + Math.cos(U)),
        y: r * Math.sin(V + drift) * (1 + Math.cos(U)),
        z: r * Math.sin(U) + 0.05 * V - 2.0,
      };
    },
  },
  {
    name: 'Clifford Torus',
    color: '#7c3aed',
    fn(u, v, t) {
      const U = u * TWO_PI + t * 0.07;
      const V = v * TWO_PI + t * 0.05;
      const r = 1 / Math.SQRT2;
      return {
        x: r * Math.cos(U) * 1.8,
        y: r * Math.sin(U) * 1.8,
        z: r * Math.cos(V + U) * 1.4,
      };
    },
  },
  {
    name: 'Sine Wave Torus',
    color: '#0284c7',
    fn(u, v, t) {
      const U = u * TWO_PI;
      const V = v * TWO_PI;
      const R = 1.4, r = 0.45 + 0.12 * Math.sin(4 * U + t * 0.4);
      return {
        x: (R + r * Math.cos(V)) * Math.cos(U),
        y: r * Math.sin(V),
        z: (R + r * Math.cos(V)) * Math.sin(U),
      };
    },
  },
  {
    name: 'Steiner Surface',
    color: '#be185d',
    fn(u, v, t) {
      const U = u * Math.PI;
      const V = v * Math.PI;
      const s = 1.4 + 0.08 * Math.sin(t * 0.6);
      const su = Math.sin(U), cu = Math.cos(U);
      const sv = Math.sin(V), cv = Math.cos(V);
      return {
        x: s * su * su * sv * cv,
        y: s * su * cu * sv * sv,
        z: s * su * cu * cv,
      };
    },
  },
  {
    name: 'Hyperboloid',
    color: '#059669',
    fn(u, v, t) {
      const U = (u - 0.5) * 4;
      const V = v * TWO_PI + t * 0.1;
      const a = 0.7 + 0.08 * Math.sin(t * 0.4);
      const r = Math.sqrt(1 + U * U * 0.25);
      return {
        x: a * r * Math.cos(V),
        y: U * 0.6,
        z: a * r * Math.sin(V),
      };
    },
  },
  {
    name: 'Paraboloid',
    color: '#b45309',
    fn(u, v, t) {
      const U = u * 1.6;
      const V = v * TWO_PI;
      const s = 1 + 0.08 * Math.sin(t * 0.5);
      return {
        x: s * U * Math.cos(V),
        y: U * U * 0.5 * s - 1.3,
        z: s * U * Math.sin(V),
      };
    },
  },
  {
    name: 'Henneberg',
    color: '#9333ea',
    fn(u, v, t) {
      const U = (u - 0.5) * 2;
      const V = v * Math.PI;
      const drift = t * 0.04;
      return {
        x: (2 * Math.sinh(U) * Math.cos(V) - (2 / 3) * Math.sinh(3 * U) * Math.cos(3 * V + drift)) * 0.3,
        y: (2 * Math.cosh(2 * U) * Math.cos(2 * V) - 0.5) * 0.3,
        z: (2 * Math.sinh(U) * Math.sin(V) - (2 / 3) * Math.sinh(3 * U) * Math.sin(3 * V + drift)) * 0.3,
      };
    },
  },
  {
    name: 'Ripple Plane',
    color: '#0e7490',
    fn(u, v, t) {
      const U = (u - 0.5) * 5;
      const V = (v - 0.5) * 5;
      const d = Math.sqrt(U * U + V * V);
      const s = 1 + 0.04 * Math.sin(t * 0.3);
      return {
        x: U * s,
        y: 0.5 * Math.sin(d * 2.5 - t * 1.2) / (d + 0.5),
        z: V * s,
      };
    },
  },
  {
    name: 'Lemniscate Tube',
    color: '#d97706',
    fn(u, v, t) {
      const anim = t * 0.07;
      return frenetTube(
        (s) => {
          const r = Math.sqrt(Math.abs(Math.cos(2 * s))) * 1.2;
          return {
            x: r * Math.cos(s + anim) * 0.6,
            y: 0.15 * Math.sin(2 * s),
            z: r * Math.sin(s + anim) * 0.6,
          };
        },
        u, v, 0.11
      );
    },
  },
  {
    name: 'Catalan',
    color: '#6d28d9',
    fn(u, v, t) {
      const U = (u - 0.5) * 4;
      const V = (v - 0.5) * 4;
      const drift = t * 0.03;
      return {
        x: (U - Math.sin(U) * Math.cosh(V + drift)) * 0.28,
        y: (1 - Math.cos(U) * Math.cosh(V + drift)) * 0.28,
        z: (-4 * Math.sin(U / 2) * Math.sinh((V + drift) / 2)) * 0.28,
      };
    },
  },
  {
    name: 'Spiraloid',
    color: '#dc2626',
    fn(u, v, t) {
      const U = u * TWO_PI * 2;
      const V = (v - 0.5) * 3;
      const drift = t * 0.1;
      const r = 1.0 + 0.5 * Math.cos(U + drift);
      return {
        x: r * Math.cos(U),
        y: V + 0.3 * Math.sin(3 * U + drift),
        z: r * Math.sin(U),
      };
    },
  },
  {
    name: 'Petal Surface',
    color: '#10b981',
    fn(u, v, t) {
      const theta = u * Math.PI;
      const phi = v * TWO_PI;
      const petals = 5;
      const r = (1.2 + 0.8 * Math.pow(Math.abs(Math.sin(petals * phi / 2)), 1.5)) * (1 + 0.06 * Math.sin(t * 0.8));
      const st = Math.sin(theta);
      return {
        x: r * st * Math.cos(phi),
        y: r * Math.cos(theta),
        z: r * st * Math.sin(phi),
      };
    },
  },
  {
    name: 'Bour',
    color: '#0369a1',
    fn(u, v, t) {
      const U = u * 1.6;
      const V = v * TWO_PI + t * 0.05;
      const n = 2;
      return {
        x: (U * Math.cos(V) - (Math.pow(U, 2 * n - 1) / (2 * n - 1)) * Math.cos((2 * n - 1) * V)) * 0.5,
        y: (-U * Math.sin(V) - (Math.pow(U, 2 * n - 1) / (2 * n - 1)) * Math.sin((2 * n - 1) * V)) * 0.5,
        z: (Math.pow(U, n) / n) * Math.cos(n * V) * 0.5,
      };
    },
  },
  {
    name: 'Sievert–Enneper',
    color: '#b91c1c',
    fn(u, v, t) {
      const c = 1;
      const U = (u - 0.5) * Math.PI * 1.8;
      const V = 0.05 + v * (Math.PI - 0.1);
      const drift = t * 0.03;
      const cotV = Math.cos(V) / (Math.sin(V) + 1e-8);
      const denom = 1 + c * c * Math.cos(U + drift) ** 2 * Math.sin(V) ** 2;
      if (Math.abs(denom) < 1e-6) return { x: 0, y: 0, z: 0 };
      return {
        x: (1 / c) * (1 / Math.tan(V)) + (c / denom) * Math.sin(V) * Math.cos(U + drift) * (-Math.cos(V) * Math.cos(U + drift) + Math.sin(U + drift) * Math.sqrt(1 + c * c * Math.sin(V) ** 2)),
        y: (c / denom) * Math.sin(V) * Math.sin(U + drift) * (Math.cos(V) * Math.cos(U + drift) + Math.sin(U + drift) * Math.sqrt(1 + c * c * Math.sin(V) ** 2)),
        z: Math.log(Math.tan(V / 2)) / c + (1 / denom) * Math.sin(V) * Math.cos(V),
      };
    },
  },
  {
    name: 'Twisted Cylinder',
    color: '#7e22ce',
    fn(u, v, t) {
      const U = (u - 0.5) * 4;
      const V = v * TWO_PI;
      const twist = U * 1.2 + t * 0.12;
      const r = 0.7 + 0.15 * Math.sin(3 * V + t * 0.3);
      return {
        x: r * Math.cos(V + twist),
        y: U * 0.7,
        z: r * Math.sin(V + twist),
      };
    },
  },
  {
    name: 'Hypotrochoid',
    color: '#065f46',
    fn(u, v, t) {
      const U = u * TWO_PI;
      const V = (v - 0.5) * 1.2;
      const R = 1.0, r = 0.4, d = 0.7;
      const drift = t * 0.08;
      return {
        x: ((R - r) * Math.cos(U + drift) + d * Math.cos((R - r) / r * U + drift)) * 0.7,
        y: V + 0.1 * Math.sin(5 * U),
        z: ((R - r) * Math.sin(U + drift) - d * Math.sin((R - r) / r * U + drift)) * 0.7,
      };
    },
  },
  {
    name: 'Nautilus',
    color: '#0f766e',
    fn(u, v, t) {
      const U = u * TWO_PI * 4;
      const V = v * TWO_PI;
      const r = 0.12 * Math.exp(0.18 * U);
      const drift = t * 0.05;
      return {
        x: r * Math.cos(U + drift) * (1.2 + Math.cos(V)),
        y: r * Math.sin(U + drift) * (1.2 + Math.cos(V)),
        z: r * Math.sin(V) * 0.6,
      };
    },
  },
];
