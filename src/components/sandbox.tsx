import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LandscapeWell } from "@/components/landscape-well";
import { TrajectoryChart } from "@/components/trajectory-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ANNUAL_DEFORESTATION_RATE,
  ANNUAL_DEFORESTATION_RATE_OBSERVED_2025,
  CURRENT_DEFORESTATION_FRACTION,
  CURRENT_FOREST_FRACTION,
  END_YEAR,
  GAMMA_AMAZON,
  H_FOREST_ATTRACTOR,
  H_SAVANNA_ATTRACTOR,
  PRODES_CLEARED_2025_KM2,
  PRODES_DEFORESTED_2025_KM2,
  PRODES_ORIGINAL_AREA_KM2,
  PRODES_YOY_DROP_PCT,
  RATE_PRESETS,
  R_FOREST,
  START_YEAR,
} from "@/lib/amazon/constants";
import {
  formatGamma,
  formatH,
  formatInt,
  formatPct,
  formatRatePct,
  formatSigned,
  formatYear,
} from "@/lib/amazon/format";
import {
  integrateTrajectory,
  LEGACY_TRAJECTORY,
  OBSERVED_TRAJECTORY,
  sampleAt,
  tippingYearsLinear,
  type Trajectory,
} from "@/lib/amazon/integrate";
import { cubicOde } from "@/lib/amazon/landscape";
import { cn } from "@/lib/utils";

const YEARS_PER_SEC = 10;
const RATE_EPS = 1e-5;

function sameRate(a: number, b: number) {
  return Math.abs(a - b) < RATE_EPS;
}

function yearOrDash(y: number | null) {
  if (y === null || !Number.isFinite(y)) return "nicht bis 2105";
  return formatYear(y, 0);
}

export function AmazonSandbox() {
  const [rate, setRate] = useState(ANNUAL_DEFORESTATION_RATE_OBSERVED_2025);
  const [year, setYear] = useState(START_YEAR);
  const [playing, setPlaying] = useState(false);
  const yearRef = useRef(year);
  yearRef.current = year;

  const customTraj = useMemo(() => integrateTrajectory(rate), [rate]);
  const showCustom =
    !sameRate(rate, ANNUAL_DEFORESTATION_RATE_OBSERVED_2025) &&
    !sameRate(rate, ANNUAL_DEFORESTATION_RATE);

  const selected: Trajectory = showCustom
    ? customTraj
    : sameRate(rate, ANNUAL_DEFORESTATION_RATE)
      ? LEGACY_TRAJECTORY
      : OBSERVED_TRAJECTORY;

  const obs = sampleAt(OBSERVED_TRAJECTORY, year);
  const leg = sampleAt(LEGACY_TRAJECTORY, year);
  const sel = sampleAt(selected, year);
  const customSample = showCustom ? sampleAt(customTraj, year) : null;

  const linearObs = useMemo(
    () => tippingYearsLinear(ANNUAL_DEFORESTATION_RATE_OBSERVED_2025),
    [],
  );
  const linearLeg = useMemo(() => tippingYearsLinear(ANNUAL_DEFORESTATION_RATE), []);
  const linearSel = useMemo(() => tippingYearsLinear(rate), [rate]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let lastUi = last;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const next = Math.min(END_YEAR, yearRef.current + dt * YEARS_PER_SEC);
      yearRef.current = next;
      if (now - lastUi > 80) {
        setYear(next);
        lastUi = now;
      }
      if (next >= END_YEAR) {
        setPlaying(false);
        setYear(END_YEAR);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const cubic = cubicOde(sel.H, sel.gamma);
  const deforTerm = -rate * sel.H;
  const activePreset = RATE_PRESETS.find((p) => sameRate(p.rate, rate));

  const balls = [
    {
      sample: obs,
      label: "PRODES 0,17 %",
      colorVar: "--color-observed" as const,
    },
    {
      sample: leg,
      label: "Modell 1 %",
      colorVar: "--color-legacy" as const,
    },
    ...(customSample
      ? [
          {
            sample: customSample,
            label: "Gewählt",
            colorVar: "--color-primary" as const,
          },
        ]
      : []),
  ];

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                GenesisAeon P19 · amazon-utac
              </p>
              <h1 className="font-display text-3xl leading-tight tracking-[-0.03em] text-balance sm:text-4xl">
                Amazonas-Kipppunkt
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground">
                Kubische Doppelmulden-Gleichung aus amazon-utac. Zwei Zahlenreihen
                bleiben getrennt: die alte Modellannahme von 1&nbsp;%/Jahr und die
                PRODES-Realität 2025 von 0,17&nbsp;%/Jahr.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Γ ≈ {formatGamma(GAMMA_AMAZON)}</Badge>
              <Badge variant="forest">H<sub className="ml-0.5">Wald</sub> = 0,80</Badge>
              <Badge variant="savanna">H<sub className="ml-0.5">Savanne</sub> = 0,15</Badge>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
            <div className="min-w-0 rounded-xl bg-card p-2 shadow-[var(--shadow-border)] sm:p-3">
              <LandscapeWell gamma={sel.gamma} hSaddle={sel.saddle} balls={balls} />
              <p className="px-3 pb-2 pt-3 text-xs leading-relaxed text-muted-foreground">
                Die Kugel sitzt auf V(H; Γ). Unterhalb des Sattels rollt sie in die
                Savannen-Senke — die Wald-Senke ist dann verloren. Die Landschaft
                folgt Γ der gewählten Rate; beide PRODES-Kugeln bleiben sichtbar.
              </p>
            </div>

            <aside className="flex min-w-0 flex-col gap-5 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
              <div>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 className="text-sm font-medium">Entwaldungsrate</h2>
                  <span className="font-mono text-sm tabular-nums text-foreground">
                    {formatRatePct(rate)}
                  </span>
                </div>
                <Slider
                  min={-0.005}
                  max={0.025}
                  step={0.0001}
                  value={[rate]}
                  onValueChange={([v]) => setRate(v ?? 0)}
                  aria-label="Jährliche Entwaldungsrate als Anteil des verbleibenden Waldes"
                />
                <div className="mt-1 flex justify-between text-[0.6875rem] text-muted-foreground">
                  <span>−0,5 %</span>
                  <span>2,5 %</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {RATE_PRESETS.map((p) => (
                    <Tooltip key={p.id}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant={activePreset?.id === p.id ? "default" : "outline"}
                          aria-pressed={activePreset?.id === p.id}
                          onClick={() => setRate(p.rate)}
                        >
                          {p.label}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{p.hint}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Rate als Anteil des <em>verbleibenden</em> Waldes, wie in
                  amazon-utac. 0,17&nbsp;% ist die INPE-PRODES-Saison 2024/25
                  ({formatInt(PRODES_CLEARED_2025_KM2)}&nbsp;km², −
                  {PRODES_YOY_DROP_PCT.toLocaleString("de-DE")}&nbsp;% zum Vorjahr)
                  — kein stiller Ersatz der 1-%-Annahme.
                </p>
              </div>

              <Separator />

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-medium">Zeit</h2>
                  <span className="font-mono text-sm tabular-nums">
                    {formatYear(year, 0)}
                  </span>
                </div>
                <Slider
                  min={START_YEAR}
                  max={END_YEAR}
                  step={0.1}
                  value={[year]}
                  onValueChange={([v]) => {
                    setPlaying(false);
                    setYear(v ?? START_YEAR);
                    yearRef.current = v ?? START_YEAR;
                  }}
                  aria-label="Simulationsjahr"
                />
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      if (year >= END_YEAR) {
                        setYear(START_YEAR);
                        yearRef.current = START_YEAR;
                      }
                      setPlaying((p) => !p);
                    }}
                    className="min-w-28"
                  >
                    {playing ? (
                      <>
                        <Pause /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="ml-0.5" /> Abspielen
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPlaying(false);
                      setYear(START_YEAR);
                      yearRef.current = START_YEAR;
                    }}
                  >
                    <RotateCcw />
                    Zurück
                  </Button>
                </div>
                <p className="mt-2 text-[0.6875rem] text-muted-foreground">
                  10 Jahre pro Sekunde · {START_YEAR}–{END_YEAR}
                </p>
              </div>

              <Separator />

              <StatusBlock sample={sel} rate={rate} />
            </aside>
          </section>

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Waldanteil H"
              value={formatH(sel.H)}
              hint={`${formatPct(sel.H, 1)} der ursprünglichen Fläche`}
            />
            <Metric
              label="Entwaldet"
              value={formatPct(sel.deforested)}
              hint={`heute ${formatPct(CURRENT_DEFORESTATION_FRACTION)} · Schwelle 20–25 %`}
              tone={sel.deforested >= 0.2 ? "warn" : "ok"}
            />
            <Metric
              label="Sattel H(Γ)"
              value={formatH(sel.saddle)}
              hint={`Γ = ${formatGamma(sel.gamma)} · driftet mit Druck nach oben`}
            />
            <Metric
              label="Becken"
              value={sel.inForest ? "Wald" : "Savanne"}
              hint={
                sel.inForest
                  ? "Oberhalb des Sattels — Rückstellkraft zum Wald"
                  : "Sattel unterschritten — Drift zur Savanne"
              }
              tone={sel.inForest ? "ok" : "warn"}
            />
          </section>

          <section className="mt-6 min-w-0 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
            <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-display text-lg tracking-[-0.02em]">
                Zwei Zahlenreihen, bewusst getrennt
              </h2>
              <p className="text-xs text-muted-foreground">H(t) · {START_YEAR}–{END_YEAR}</p>
            </div>
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-pretty text-muted-foreground">
              Die 1-%-Annahme wäre bis 2026 schon bei etwa 17–18&nbsp;% kumulativer
              Entwaldung. PRODES liegt bei 16,1&nbsp;%, weil die Jahresrate rund
              sechsmal niedriger ist. Band: Lovejoy-&-Nobre-Schwelle 20–25&nbsp;%.
            </p>
            <div className="mb-3 flex flex-wrap gap-4 text-xs">
              <LegendDot color="bg-observed" label="PRODES 0,17 %/Jahr" />
              <LegendDot color="bg-legacy" label="Modell 1 %/Jahr" />
              {showCustom ? <LegendDot color="bg-primary" label="Gewählte Rate" dashed /> : null}
            </div>
            <TrajectoryChart
              observed={OBSERVED_TRAJECTORY}
              legacy={LEGACY_TRAJECTORY}
              custom={showCustom ? customTraj : null}
              year={year}
            />
          </section>

          <section className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
            <div className="min-w-0 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
              <h2 className="font-display text-lg tracking-[-0.02em]">
                UTAC-Formel bis zur Schwelle
              </h2>
              <p className="mt-1 mb-4 text-xs leading-relaxed text-muted-foreground">
                Lineare Schätzung aus amazon-utac{" "}
                <span className="font-mono">years_to_threshold</span>
                : Rest bis Schwelle / (Rate · Waldanteil). Basis {START_YEAR}, aktuell{" "}
                {formatPct(CURRENT_DEFORESTATION_FRACTION)} entwaldet.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ThresholdCard
                  title="PRODES 0,17 %"
                  tone="observed"
                  linear={linearObs}
                  saddleYear={OBSERVED_TRAJECTORY.yearSaddle}
                />
                <ThresholdCard
                  title="Modell 1 %"
                  tone="legacy"
                  linear={linearLeg}
                  saddleYear={LEGACY_TRAJECTORY.yearSaddle}
                />
                {showCustom ? (
                  <ThresholdCard
                    title={`Gewählt ${formatRatePct(rate)}`}
                    tone="custom"
                    linear={linearSel}
                    saddleYear={customTraj.yearSaddle}
                  />
                ) : null}
              </div>
              <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted-foreground">
                Die 1-%-Falsifikation im Paket lautet 2038 ± 5 Jahre. Mit der
                PRODES-Rate 2025 rückt dieselbe 20-%-Schwelle um Jahrzehnte.
                Historische Raten schwankten zwischen Regierungen um ein Vielfaches —
                0,17&nbsp;% ist ein politischer Trend, kein Naturgesetz.
              </p>
            </div>

            <div className="min-w-0 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
              <h2 className="font-display text-lg tracking-[-0.02em]">
                Die Gleichung, live
              </h2>
              <p className="mt-3 font-mono text-xs leading-relaxed break-words text-foreground sm:text-[0.8125rem]">
                dH/dt = −r (H − H<sub>s</sub>)(H − H<sub>Γ</sub>)(H − H<sub>f</sub>) − ρ H
              </p>
              <p className="mt-2 font-mono text-[0.6875rem] leading-relaxed break-words text-muted-foreground">
                r = {formatH(R_FOREST, 2)}/Jahr · H<sub>s</sub> = {formatH(H_SAVANNA_ATTRACTOR)} ·
                H<sub>f</sub> = {formatH(H_FOREST_ATTRACTOR)} · H<sub>Γ</sub> = {formatH(sel.saddle)}{" "}
                · ρ = {formatH(rate, 4)}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Kubischer Term</dt>
                  <dd className="font-mono tabular-nums">{formatSigned(cubic)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Entwaldung −ρ·H</dt>
                  <dd className="font-mono tabular-nums">{formatSigned(deforTerm)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">dH/dt gesamt</dt>
                  <dd className="font-mono tabular-nums">{formatSigned(sel.dH)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">H heute (Start)</dt>
                  <dd className="font-mono tabular-nums">{formatH(CURRENT_FOREST_FRACTION)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-pretty text-muted-foreground">
                H<sub>saddle</sub>(Γ) = 0,50 + 0,30 · tanh(σ·Γ), σ = 2,2. Mit steigendem
                Γ wandert der Sattel auf den Wald-Attraktor zu — eine
                Saddle-Node-Bifurkation, der eigentliche Kipppunkt.
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-lg tracking-[-0.02em]">
              Zustand 2025 (PRODES)
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Fact
                label="Kumulativ entwaldet"
                value={`${formatPct(CURRENT_DEFORESTATION_FRACTION)} · ${formatInt(PRODES_DEFORESTED_2025_KM2)} km²`}
              />
              <Fact
                label="Saison 2024/25"
                value={`${formatInt(PRODES_CLEARED_2025_KM2)} km² · −${PRODES_YOY_DROP_PCT.toLocaleString("de-DE")}\u00a0%`}
              />
              <Fact
                label="Ursprüngliche Fläche"
                value={`${formatInt(PRODES_ORIGINAL_AREA_KM2)} km²`}
              />
              <Fact
                label="Puffer bis 20 %"
                value={`${((0.2 - CURRENT_DEFORESTATION_FRACTION) * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} Prozentpunkte`}
              />
            </div>
          </section>

          <footer className="mt-10 pb-8 text-xs leading-relaxed text-muted-foreground">
            <p>
              Modell:{" "}
              <a
                className="underline decoration-border underline-offset-4 hover:text-foreground"
                href="https://github.com/GenesisAeon/amazon-utac"
                target="_blank"
                rel="noreferrer"
              >
                GenesisAeon/amazon-utac
              </a>{" "}
              (MIT) · Lovejoy & Nobre 2019,{" "}
              <a
                className="underline decoration-border underline-offset-4 hover:text-foreground"
                href="https://doi.org/10.1126/sciadv.aba2949"
                target="_blank"
                rel="noreferrer"
              >
                10.1126/sciadv.aba2949
              </a>{" "}
              · Boulton et al. 2022,{" "}
              <a
                className="underline decoration-border underline-offset-4 hover:text-foreground"
                href="https://doi.org/10.1038/s41558-022-01287-8"
                target="_blank"
                rel="noreferrer"
              >
                10.1038/s41558-022-01287-8
              </a>{" "}
              · INPE PRODES. Kein Prognoseprodukt — eine interaktive Form der
              veröffentlichten kubischen ODE.
            </p>
          </footer>
        </main>
      </div>
    </TooltipProvider>
  );
}

function StatusBlock({
  sample,
  rate,
}: {
  sample: ReturnType<typeof sampleAt>;
  rate: number;
}) {
  const crossed = !sample.inForest;
  return (
    <div
      className={cn(
        "rounded-md px-3 py-3",
        crossed ? "bg-savanna/10" : "bg-forest/10",
      )}
    >
      <p className={cn("text-sm font-medium", crossed ? "text-savanna" : "text-forest")}>
        {crossed
          ? "Sattel unterschritten — Savannisierung"
          : "Im Waldbecken — Attraktor bei H = 0,80"}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {formatYear(sample.year, 0)} · H = {formatH(sample.H)} · entwaldet{" "}
        {formatPct(sample.deforested)} · Rate {formatRatePct(rate)}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-2xl tabular-nums tracking-[-0.02em]",
          tone === "ok" && "text-forest",
          tone === "warn" && "text-savanna",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[0.6875rem] leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  );
}

function LegendDot({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <span
        className={cn("h-0.5 w-4 rounded-full", color, dashed && "opacity-80")}
        aria-hidden
      />
      {label}
    </span>
  );
}

function ThresholdCard({
  title,
  tone,
  linear,
  saddleYear,
}: {
  title: string;
  tone: "observed" | "legacy" | "custom";
  linear: { lower: number | null; midpoint: number | null; upper: number | null };
  saddleYear: number | null;
}) {
  const titleClass =
    tone === "observed"
      ? "text-observed"
      : tone === "legacy"
        ? "text-legacy"
        : "text-foreground";
  return (
    <div className="rounded-md bg-surface-2 px-3 py-3">
      <p className={cn("text-sm font-medium", titleClass)}>{title}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <dt className="text-muted-foreground">20 %</dt>
        <dd className="tabular-nums">{yearOrDash(linear.lower)}</dd>
        <dt className="text-muted-foreground">22,5 %</dt>
        <dd className="tabular-nums">{yearOrDash(linear.midpoint)}</dd>
        <dt className="text-muted-foreground">25 %</dt>
        <dd className="tabular-nums">{yearOrDash(linear.upper)}</dd>
        <dt className="text-muted-foreground">ODE-Sattel</dt>
        <dd className="tabular-nums">{yearOrDash(saddleYear)}</dd>
      </dl>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm tabular-nums text-foreground">{value}</p>
    </div>
  );
}
