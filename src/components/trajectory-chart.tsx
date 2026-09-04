import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  END_YEAR,
  H_FOREST_ATTRACTOR,
  H_SAVANNA_ATTRACTOR,
  H_TIPPING_LOW,
  START_YEAR,
} from "@/lib/amazon/constants";
import { formatH, formatPct, formatYear } from "@/lib/amazon/format";
import type { Trajectory } from "@/lib/amazon/integrate";

type Props = {
  observed: Trajectory;
  legacy: Trajectory;
  custom: Trajectory | null;
  year: number;
};

type Row = {
  year: number;
  observed: number;
  legacy: number;
  custom: number | null;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const names: Record<string, string> = {
    observed: "PRODES 0,17 %/Jahr",
    legacy: "Modell 1 %/Jahr",
    custom: "Gewählte Rate",
  };
  return (
    <div className="rounded-md bg-surface-2 px-3 py-2 text-xs shadow-[var(--shadow-border)]">
      <p className="mb-1 font-medium text-foreground">{formatYear(label ?? 0, 0)}</p>
      {payload.map((p) =>
        p.value == null ? null : (
          <p key={p.dataKey} style={{ color: p.color }} className="tabular-nums">
            {names[p.dataKey] ?? p.dataKey}: H = {formatH(p.value)} (
            {formatPct(1 - p.value)})
          </p>
        ),
      )}
    </div>
  );
}

export function TrajectoryChart({ observed, legacy, custom, year }: Props) {
  const data = useMemo<Row[]>(() => {
    return observed.years.map((y, i) => ({
      year: y,
      observed: observed.H[i]!,
      legacy: legacy.H[i]!,
      custom: custom ? custom.H[i]! : null,
    }));
  }, [observed, legacy, custom]);

  return (
    <div className="h-[220px] w-full min-w-0 sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="year"
            type="number"
            domain={[START_YEAR, END_YEAR]}
            ticks={[2025, 2045, 2065, 2085, 2105]}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            stroke="var(--color-border)"
            tickFormatter={(v: number) => String(v)}
          />
          <YAxis
            domain={[0.1, 0.9]}
            ticks={[0.15, 0.5, 0.8]}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            stroke="var(--color-border)"
            tickFormatter={(v: number) => formatH(v, 2)}
            width={36}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "var(--color-muted-foreground)", strokeDasharray: "3 3" }}
          />
          <ReferenceArea
            y1={H_TIPPING_LOW}
            y2={H_FOREST_ATTRACTOR}
            fill="var(--color-legacy)"
            fillOpacity={0.08}
            ifOverflow="extendDomain"
          />
          <ReferenceLine
            y={H_FOREST_ATTRACTOR}
            stroke="var(--color-forest)"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />
          <ReferenceLine
            y={H_SAVANNA_ATTRACTOR}
            stroke="var(--color-savanna)"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />
          <ReferenceLine
            x={year}
            stroke="var(--color-foreground)"
            strokeOpacity={0.55}
          />
          <Line
            type="monotone"
            dataKey="observed"
            stroke="var(--color-observed)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="PRODES 0,17 %"
          />
          <Line
            type="monotone"
            dataKey="legacy"
            stroke="var(--color-legacy)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Modell 1 %"
          />
          {custom ? (
            <Line
              type="monotone"
              dataKey="custom"
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              isAnimationActive={false}
              connectNulls
              name="Gewählte Rate"
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
