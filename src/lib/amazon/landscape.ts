/**
 * Dual-attractor landscape — port of amazon_utac.savanna_attractor.DualAttractorLandscape.
 *
 *   dH/dt = −r · (H − H_s) · (H − H_saddle(Γ)) · (H − H_f)
 *
 *   H_saddle(Γ) = H_saddle0 + (H_f − H_saddle0) · tanh(σ · Γ)
 */

import {
  CREP_SIGMA,
  GAMMA_AMAZON,
  H_FOREST_ATTRACTOR,
  H_SADDLE0,
  H_SAVANNA_ATTRACTOR,
  R_FOREST,
} from "./constants";

export function effectiveSaddle(gamma: number): number {
  const shift =
    (H_FOREST_ATTRACTOR - H_SADDLE0) * Math.tanh(CREP_SIGMA * gamma);
  return H_SADDLE0 + shift;
}

/** Γ at which the saddle has climbed 95 % of the way to the forest attractor. */
export function tippingGamma95(): number {
  return Math.atanh(0.95) / CREP_SIGMA;
}

/**
 * Analytical antiderivative of
 *   dV/dH = r · (H − H_s)(H − H_saddle)(H − H_f)
 */
export function potential(H: number, hSaddle: number): number {
  const a = H_SAVANNA_ATTRACTOR;
  const b = hSaddle;
  const c = H_FOREST_ATTRACTOR;
  const s1 = a + b + c;
  const s2 = a * b + a * c + b * c;
  const s3 = a * b * c;
  const H2 = H * H;
  const H3 = H2 * H;
  const H4 = H3 * H;
  return R_FOREST * (H4 / 4 - (s1 * H3) / 3 + (s2 * H2) / 2 - s3 * H);
}

export function cubicOde(H: number, gamma: number): number {
  const hSaddle = effectiveSaddle(gamma);
  return (
    -R_FOREST *
    (H - H_SAVANNA_ATTRACTOR) *
    (H - hSaddle) *
    (H - H_FOREST_ATTRACTOR)
  );
}

export function isInForestBasin(H: number, gamma: number): boolean {
  return H > effectiveSaddle(gamma);
}

export function barrierHeight(gamma: number): number {
  const hSaddle = effectiveSaddle(gamma);
  return (
    potential(hSaddle, hSaddle) - potential(H_FOREST_ATTRACTOR, hSaddle)
  );
}

export function samplePotential(
  gamma: number,
  n = 240,
): { H: number[]; V: number[]; vMin: number; vMax: number; hSaddle: number } {
  const hSaddle = effectiveSaddle(gamma);
  const H: number[] = [];
  const V: number[] = [];
  let vMin = Infinity;
  let vMax = -Infinity;
  for (let i = 0; i < n; i++) {
    const h = (i / (n - 1)) * 1.0;
    const v = potential(h, hSaddle);
    H.push(h);
    V.push(v);
    if (v < vMin) vMin = v;
    if (v > vMax) vMax = v;
  }
  return { H, V, vMin, vMax, hSaddle };
}

export function landscapeAt(gamma = GAMMA_AMAZON) {
  const hSaddle = effectiveSaddle(gamma);
  return {
    gamma,
    hSaddle,
    hForest: H_FOREST_ATTRACTOR,
    hSavanna: H_SAVANNA_ATTRACTOR,
    barrier: barrierHeight(gamma),
    forestBasin: Math.max(0, 1 - hSaddle),
    savannaBasin: Math.max(0, hSaddle),
  };
}
