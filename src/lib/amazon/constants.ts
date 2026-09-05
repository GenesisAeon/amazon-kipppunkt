/**
 * Physical and model constants from amazon-utac (GenesisAeon Package 19).
 * Port of src/amazon_utac/constants.py — values kept identical.
 */

export const CREP_SIGMA = 2.2;
export const K_FOREST = 1.0;

/** Stable forest fixed point */
export const H_FOREST_ATTRACTOR = 0.8;
/** Stable savanna fixed point */
export const H_SAVANNA_ATTRACTOR = 0.15;
/** Unstable equilibrium at Γ = 0 */
export const H_SADDLE0 = 0.5;

/** H at 20 % deforestation — first tipping signals (Lovejoy & Nobre 2019) */
export const H_TIPPING_LOW = 0.75;
/** H at ~25 % deforestation */
export const H_TIPPING_HIGH = 0.8;
/** Lovejoy & Nobre midpoint (22.5 % deforested → H = 0.775) */
export const H_TIPPING_MIDPOINT = 0.775;

/** ~83.9 % of original Amazon remains (PRODES 2025) */
export const CURRENT_FOREST_FRACTION = 0.839;
/** ~16.1 % deforested (PRODES, 2025) */
export const CURRENT_DEFORESTATION_FRACTION = 0.161;

/** Legacy model default: ~1 %/yr of remaining forest */
export const ANNUAL_DEFORESTATION_RATE = 0.01;
/**
 * Actual INPE PRODES 2024/2025 rate (consolidated figure): 5,731 km² /
 * 3,483,495 km² remaining ≈ 0.16 %/yr — kept separate from
 * ANNUAL_DEFORESTATION_RATE on purpose.
 */
export const ANNUAL_DEFORESTATION_RATE_OBSERVED_2025 = 0.0016;

export const DEFORESTATION_THRESHOLD_LOW = 0.2;
export const DEFORESTATION_THRESHOLD_HIGH = 0.25;
export const DEFORESTATION_THRESHOLD_MID = 0.225;

export const ETA_AMAZON = 0.25;
/** Γ_Amazon = arctanh(0.25) / 2.2 ≈ 0.116 */
export const GAMMA_AMAZON = Math.atanh(ETA_AMAZON) / CREP_SIGMA;

export const R_FOREST = 0.05;

export const PRODES_ORIGINAL_AREA_KM2 = 4_153_741;
export const PRODES_DEFORESTED_2025_KM2 = 670_181;
/** Consolidated INPE figure, revised down from an earlier 5,796 km² preliminary estimate. */
export const PRODES_CLEARED_2025_KM2 = 5_731;
export const PRODES_YOY_DROP_PCT = 12.07;

export const START_YEAR = 2025;
export const HORIZON_YEARS = 80;
export const END_YEAR = START_YEAR + HORIZON_YEARS;

/** Gamma growth with additional deforestation (system.py) */
export const GAMMA_GROWTH = 0.5;

export const RATE_PRESETS = [
  {
    id: "recovery",
    label: "Erholung",
    rate: -0.005,
    hint: "Netto-Aufforstung −0,5 %/Jahr",
  },
  {
    id: "zero",
    label: "Null",
    rate: 0,
    hint: "Kein Netto-Verlust",
  },
  {
    id: "prodes",
    label: "PRODES 0,16 %",
    rate: ANNUAL_DEFORESTATION_RATE_OBSERVED_2025,
    hint: "INPE 2024/25, 5.731 km²",
  },
  {
    id: "legacy",
    label: "Modell 1 %",
    rate: ANNUAL_DEFORESTATION_RATE,
    hint: "Alte Modellannahme",
  },
  {
    id: "fast",
    label: "2×",
    rate: ANNUAL_DEFORESTATION_RATE * 2,
    hint: "Beschleunigt, 2 %/Jahr",
  },
] as const;

export type RatePresetId = (typeof RATE_PRESETS)[number]["id"];
