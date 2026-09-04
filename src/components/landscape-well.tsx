import { useEffect, useRef } from "react";
import {
  CURRENT_FOREST_FRACTION,
  H_FOREST_ATTRACTOR,
  H_SAVANNA_ATTRACTOR,
  H_TIPPING_LOW,
} from "@/lib/amazon/constants";
import { formatH } from "@/lib/amazon/format";
import type { Sample } from "@/lib/amazon/integrate";
import { potential } from "@/lib/amazon/landscape";

type Ball = {
  sample: Sample;
  label: string;
  colorVar: "--color-observed" | "--color-legacy" | "--color-primary";
};

type Props = {
  gamma: number;
  hSaddle: number;
  balls: Ball[];
};

type Palette = {
  bg: string;
  fg: string;
  muted: string;
  border: string;
  forest: string;
  savanna: string;
  observed: string;
  legacy: string;
  primary: string;
};

function readPalette(el: HTMLElement): Palette {
  const s = getComputedStyle(el);
  const v = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback;
  return {
    bg: v("--color-background", "#0b0e0c"),
    fg: v("--color-foreground", "#e8ece6"),
    muted: v("--color-muted-foreground", "#8b958c"),
    border: v("--color-border", "#252c28"),
    forest: v("--color-forest", "#6a9a7c"),
    savanna: v("--color-savanna", "#c17a55"),
    observed: v("--color-observed", "#7eb89a"),
    legacy: v("--color-legacy", "#c17a55"),
    primary: v("--color-primary", "#dfe6e0"),
  };
}

function colorOf(pal: Palette, key: Ball["colorVar"]): string {
  if (key === "--color-observed") return pal.observed;
  if (key === "--color-legacy") return pal.legacy;
  return pal.primary;
}

export function LandscapeWell({ gamma, hSaddle, balls }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ gamma, hSaddle, balls });
  stateRef.current = { gamma, hSaddle, balls };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let pal = readPalette(wrap);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pal = readPalette(wrap);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const draw = () => {
      const { hSaddle: hs, balls: live } = stateRef.current;
      const compact = width < 520;
      const padL = 16;
      const padR = 16;
      const padT = 28;
      const padB = 36;
      const innerW = Math.max(1, width - padL - padR);
      const innerH = Math.max(1, height - padT - padB);

      const n = 260;
      const Hs: number[] = [];
      const Vs: number[] = [];
      let vMin = Infinity;
      let vMax = -Infinity;
      for (let i = 0; i < n; i++) {
        const h = i / (n - 1);
        const v = potential(h, hs);
        Hs.push(h);
        Vs.push(v);
        if (v < vMin) vMin = v;
        if (v > vMax) vMax = v;
      }
      const vSpan = Math.max(1e-9, vMax - vMin);

      const xOf = (h: number) => padL + h * innerW;
      const yOf = (v: number) => padT + ((vMax - v) / vSpan) * innerH;

      ctx.clearRect(0, 0, width, height);

      const bottom = padT + innerH;

      const fillBasin = (fromH: number, toH: number, color: string) => {
        const i0 = Math.max(0, Math.floor(fromH * (n - 1)));
        const i1 = Math.min(n - 1, Math.ceil(toH * (n - 1)));
        ctx.beginPath();
        ctx.moveTo(xOf(Hs[i0]!), bottom);
        for (let i = i0; i <= i1; i++) ctx.lineTo(xOf(Hs[i]!), yOf(Vs[i]!));
        ctx.lineTo(xOf(Hs[i1]!), bottom);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, padT, 0, bottom);
        g.addColorStop(0, withAlpha(color, 0.22));
        g.addColorStop(1, withAlpha(color, 0.04));
        ctx.fillStyle = g;
        ctx.fill();
      };

      fillBasin(0, hs, pal.savanna);
      fillBasin(hs, 1, pal.forest);

      const bandX0 = xOf(H_TIPPING_LOW);
      const bandX1 = xOf(H_FOREST_ATTRACTOR);
      ctx.fillStyle = withAlpha(pal.legacy, 0.1);
      ctx.fillRect(bandX0, padT, Math.max(1, bandX1 - bandX0), innerH);

      ctx.beginPath();
      ctx.moveTo(xOf(Hs[0]!), yOf(Vs[0]!));
      for (let i = 1; i < n; i++) ctx.lineTo(xOf(Hs[i]!), yOf(Vs[i]!));
      ctx.strokeStyle = pal.fg;
      ctx.lineWidth = 1.75;
      ctx.lineJoin = "round";
      ctx.stroke();

      ctx.strokeStyle = pal.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, bottom);
      ctx.lineTo(padL + innerW, bottom);
      ctx.stroke();

      const showHeute = Math.abs(CURRENT_FOREST_FRACTION - H_FOREST_ATTRACTOR) > 0.06;
      const markers: { h: number; label: string; color: string; dashed?: boolean }[] = [
        {
          h: H_SAVANNA_ATTRACTOR,
          label: compact ? "Savanne" : "Savanne 0,15",
          color: pal.savanna,
        },
        {
          h: hs,
          label: compact ? "Sattel" : `Sattel ${formatH(hs, 2)}`,
          color: pal.muted,
          dashed: true,
        },
        {
          h: H_FOREST_ATTRACTOR,
          label: compact ? "Wald" : "Wald 0,80",
          color: pal.forest,
        },
      ];
      if (showHeute) {
        markers.push({
          h: CURRENT_FOREST_FRACTION,
          label: "Heute",
          color: pal.fg,
        });
      }

      ctx.font = "500 10px Figtree, ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const m of markers) {
        const x = xOf(m.h);
        ctx.beginPath();
        ctx.strokeStyle = withAlpha(m.color, 0.5);
        ctx.lineWidth = 1;
        ctx.setLineDash(m.dashed ? [3, 4] : []);
        ctx.moveTo(x, padT);
        ctx.lineTo(x, bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = m.color;
        ctx.fillText(m.label, clamp(x, padL + 24, padL + innerW - 24), bottom + 8);
      }

      ctx.fillStyle = pal.muted;
      ctx.font = "500 10px Figtree, ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("H →", padL, padT - 10);
      ctx.textAlign = "right";
      ctx.fillText("V(H; Γ)", padL + innerW, padT - 10);

      type Drawn = {
        x: number;
        y: number;
        r: number;
        label: string;
        color: string;
        ring: boolean;
      };
      const drawn: Drawn[] = [];
      for (const ball of live) {
        const h = clamp(ball.sample.H, 0, 1);
        const v = potential(h, hs);
        const x = xOf(h);
        const y = yOf(v);
        const color = colorOf(pal, ball.colorVar);
        const overlap = drawn.find((d) => Math.hypot(d.x - x, d.y - y) < 14);
        drawn.push({
          x,
          y,
          r: overlap ? 12 : 9,
          label: ball.label,
          color,
          ring: Boolean(overlap),
        });
      }

      for (const d of drawn) {
        ctx.beginPath();
        ctx.ellipse(d.x, d.y + 8, d.r * 0.8, 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = withAlpha("#000000", 0.3);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(d.x, d.y - d.r + 2, d.r, 0, Math.PI * 2);
        if (d.ring) {
          ctx.strokeStyle = d.color;
          ctx.lineWidth = 2.25;
          ctx.stroke();
        } else {
          const grd = ctx.createRadialGradient(
            d.x - 2.5,
            d.y - d.r - 1,
            1,
            d.x,
            d.y - d.r + 2,
            d.r,
          );
          grd.addColorStop(0, lighten(d.color, 0.35));
          grd.addColorStop(1, d.color);
          ctx.fillStyle = grd;
          ctx.fill();
          ctx.strokeStyle = withAlpha(pal.bg, 0.5);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      ctx.font = "500 11px Figtree, ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const order = [...drawn].sort((a, b) => a.x - b.x);
      const labelY: number[] = order.map((d) => d.y - d.r - 10);
      for (let i = 1; i < order.length; i++) {
        if (Math.abs(order[i]!.x - order[i - 1]!.x) < 90) {
          labelY[i] = Math.min(labelY[i]!, labelY[i - 1]! - 15);
        }
      }
      order.forEach((d, i) => {
        ctx.fillStyle = d.color;
        ctx.fillText(d.label, clamp(d.x, padL + 36, padL + innerW - 36), labelY[i]!);
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[280px] w-full min-w-0 overflow-hidden rounded-lg bg-background sm:h-[360px] lg:h-[400px]"
    >
      <canvas
        ref={canvasRef}
        className="block size-full"
        role="img"
        aria-label="Doppelmulden-Potenzial des Amazonas: zwei Senken für Wald und Savanne, getrennt durch einen Sattel. Kugeln zeigen den Waldanteil der PRODES-Rate und der alten 1-Prozent-Annahme."
      />
    </div>
  );
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function withAlpha(color: string, a: number): string {
  if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
    const hex =
      color.length === 4
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return color;
}

function lighten(color: string, t: number): string {
  if (!(color.startsWith("#") && color.length === 7)) return color;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * t);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
