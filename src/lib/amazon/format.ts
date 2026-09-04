const de = "de-DE";

export function formatPct(fraction: number, digits = 1): string {
  return `${(fraction * 100).toLocaleString(de, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} %`;
}

export function formatRatePct(fraction: number): string {
  const abs = Math.abs(fraction * 100);
  const digits = abs > 0 && abs < 1 ? 2 : abs < 10 ? 2 : 1;
  const body = (fraction * 100).toLocaleString(de, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${body} %/Jahr`;
}

export function formatH(H: number, digits = 3): string {
  return H.toLocaleString(de, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatGamma(g: number): string {
  return g.toLocaleString(de, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

export function formatYear(y: number | null | undefined, digits = 0): string {
  if (y === null || y === undefined || !Number.isFinite(y)) return "—";
  return y.toLocaleString(de, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: false,
  });
}

export function formatInt(n: number): string {
  return Math.round(n).toLocaleString(de);
}

export function formatSigned(n: number, digits = 4): string {
  const body = n.toLocaleString(de, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: "exceptZero",
  });
  return body;
}
