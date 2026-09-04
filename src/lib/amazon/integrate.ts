/**
 * RK4 integration of the amazon-utac double-well ODE plus deforestation:
 *
 *   dH/dt = −r (H − H_s)(H − H_saddle(Γ))(H − H_f) − rate · H
 *
 *   Γ(t) = Γ₀ + 0.5 · max(0, (1 − H) − D₀)
 *
 * Matches AmazonUTAC._integrate_ode (Euler/RK path in system.py).
 */

import {
  ANNUAL_DEFORESTATION_RATE,
  ANNUAL_DEFORESTATION_RATE_OBSERVED_2025,
  CURRENT_DEFORESTATION_FRACTION,
  CURRENT_FOREST_FRACTION,
  DEFORESTATION_THRESHOLD_HIGH,
  DEFORESTATION_THRESHOLD_LOW,
  DEFORESTATION_THRESHOLD_MID,
  END_YEAR,
  GAMMA_AMAZON,
  GAMMA_GROWTH,
  HORIZON_YEARS,
  START_YEAR,
} from "./constants";
import { cubicOde, effectiveSaddle } from "./landscape";

export type Trajectory = {
  rate: number;
  years: number[];
  H: number[];
  gamma: number[];
  saddle: number[];
  dH: number[];
  /** First year H drops below 0.80 (20 % deforestation). */
  year20: number | null;
  year225: number | null;
  year25: number | null;
  /** First year H falls below the moving saddle. */
  yearSaddle: number | null;
};

function gammaFromH(H: number, gamma0: number): number {
  const defor = 1 - H;
  return gamma0 + GAMMA_GROWTH * Math.max(0, defor - CURRENT_DEFORESTATION_FRACTION);
}

function dHdt(H: number, rate: number, gamma0: number): number {
  const gamma = gammaFromH(H, gamma0);
  return cubicOde(H, gamma) - rate * H;
}

function rk4Step(H: number, rate: number, gamma0: number, dt: number): number {
  const k1 = dHdt(H, rate, gamma0);
  const k2 = dHdt(H + 0.5 * dt * k1, rate, gamma0);
  const k3 = dHdt(H + 0.5 * dt * k2, rate, gamma0);
  const k4 = dHdt(H + dt * k3, rate, gamma0);
  const next = H + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
  return Math.min(1, Math.max(0, next));
}

export function integrateTrajectory(
  rate: number,
  horizonYears = HORIZON_YEARS,
  H0 = CURRENT_FOREST_FRACTION,
  gamma0 = GAMMA_AMAZON,
  startYear = START_YEAR,
  substeps = 20,
): Trajectory {
  const n = horizonYears + 1;
  const years = new Array<number>(n);
  const H = new Array<number>(n);
  const gamma = new Array<number>(n);
  const saddle = new Array<number>(n);
  const dH = new Array<number>(n);

  let h = H0;
  const dt = 1 / substeps;

  years[0] = startYear;
  H[0] = h;
  gamma[0] = gammaFromH(h, gamma0);
  saddle[0] = effectiveSaddle(gamma[0]);
  dH[0] = dHdt(h, rate, gamma0);

  let year20: number | null = null;
  let year225: number | null = null;
  let year25: number | null = null;
  let yearSaddle: number | null = null;

  const mark = (
    prev: number,
    next: number,
    t0: number,
    threshold: number,
    current: number | null,
  ): number | null => {
    if (current !== null) return current;
    if (prev >= threshold && next < threshold) {
      const span = prev - next;
      const frac = span > 1e-12 ? (prev - threshold) / span : 0;
      return t0 + frac;
    }
    return null;
  };

  for (let y = 1; y <= horizonYears; y++) {
    const prev = h;
    const t0 = startYear + y - 1;
    for (let s = 0; s < substeps; s++) {
      h = rk4Step(h, rate, gamma0, dt);
    }
    years[y] = startYear + y;
    H[y] = h;
    gamma[y] = gammaFromH(h, gamma0);
    saddle[y] = effectiveSaddle(gamma[y]);
    dH[y] = dHdt(h, rate, gamma0);

    year20 = mark(prev, h, t0, 0.8, year20);
    year225 = mark(prev, h, t0, 0.775, year225);
    year25 = mark(prev, h, t0, 0.75, year25);
    if (yearSaddle === null && h < saddle[y]! && prev >= saddle[y - 1]!) {
      yearSaddle = t0 + 0.5;
    }
  }

  return { rate, years, H, gamma, saddle, dH, year20, year225, year25, yearSaddle };
}

export type Sample = {
  year: number;
  H: number;
  gamma: number;
  saddle: number;
  dH: number;
  deforested: number;
  inForest: boolean;
};

export function sampleAt(traj: Trajectory, year: number): Sample {
  const t = Math.min(END_YEAR, Math.max(START_YEAR, year));
  const x = t - START_YEAR;
  const i0 = Math.floor(x);
  const i1 = Math.min(traj.H.length - 1, i0 + 1);
  const f = x - i0;
  const lerp = (a: number[], i: number) => a[i0]! * (1 - f) + a[i]! * f;
  const H = lerp(traj.H, i1);
  const gamma = lerp(traj.gamma, i1);
  const saddle = lerp(traj.saddle, i1);
  const dH = lerp(traj.dH, i1);
  return {
    year: t,
    H,
    gamma,
    saddle,
    dH,
    deforested: 1 - H,
    inForest: H > saddle,
  };
}

/**
 * Linear UTAC formula from ProdesDeforestation.years_to_threshold:
 * remaining / (rate · forest_fraction)
 */
export function yearsToThreshold(
  annualRate: number,
  threshold = DEFORESTATION_THRESHOLD_LOW,
  current = CURRENT_DEFORESTATION_FRACTION,
): number {
  if (current >= threshold) return 0;
  if (annualRate <= 0) return Number.POSITIVE_INFINITY;
  const remaining = threshold - current;
  const forest = 1 - current;
  return remaining / (annualRate * forest);
}

export function tippingYearsLinear(annualRate: number, baseYear = START_YEAR) {
  const y = (th: number) => {
    const dt = yearsToThreshold(annualRate, th);
    if (!Number.isFinite(dt)) return null;
    return baseYear + dt;
  };
  return {
    lower: y(DEFORESTATION_THRESHOLD_LOW),
    midpoint: y(DEFORESTATION_THRESHOLD_MID),
    upper: y(DEFORESTATION_THRESHOLD_HIGH),
  };
}

export const OBSERVED_TRAJECTORY = integrateTrajectory(
  ANNUAL_DEFORESTATION_RATE_OBSERVED_2025,
);
export const LEGACY_TRAJECTORY = integrateTrajectory(ANNUAL_DEFORESTATION_RATE);
