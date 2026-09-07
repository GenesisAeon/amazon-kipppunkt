export type Locale = "de" | "en";

export type RatePresetId = "recovery" | "zero" | "prodes" | "legacy" | "fast";

export type Messages = {
  language: string;
  documentTitle: string;
  eyebrow: string;
  title: string;
  lead: string;
  forest: string;
  savanna: string;
  notUntil2105: string;
  wellCaption: string;
  rateHeading: string;
  rateAria: string;
  rateFoot: (cleared: string, yoy: string) => string;
  timeHeading: string;
  timeAria: string;
  play: string;
  pause: string;
  reset: string;
  metricForestH: string;
  metricDeforested: string;
  metricSaddle: string;
  metricBasin: string;
  basinForest: string;
  basinSavanna: string;
  basinHintForest: string;
  basinHintSavanna: string;
  trajTitle: string;
  legendProdes: string;
  legendLegacy: string;
  legendCustom: string;
  ballProdes: string;
  ballLegacy: string;
  ballChosen: string;
  threshTitle: string;
  threshLead: (startYear: number, remaining: string) => string;
  threshProdes: string;
  threshLegacy: string;
  threshCustom: string;
  threshFoot: string;
  odeTitle: string;
  odeCubic: string;
  odeDefor: string;
  odeTotal: string;
  odeHToday: string;
  odeFoot: string;
  state2025Title: string;
  factCumul: string;
  factSeason: string;
  factOriginal: string;
  factBuffer: string;
  footer: string;
  statusCrossed: string;
  statusSafe: string;
  statusMeta: (year: string, H: string, defor: string, rate: string) => string;
  ratePresets: Record<RatePresetId, { label: string; hint: string }>;
  wellAria: string;
  markerSavanna: string;
  markerSavannaFull: string;
  markerSaddle: string;
  markerSaddleFull: (h: string) => string;
  markerForest: string;
  markerForestFull: string;
  markerToday: string;
  odeSaddle: string;
};

export const messages: Record<Locale, Messages> = {
  de: {
    language: "Sprache",
    documentTitle: "Amazonas-Kipppunkt",
    eyebrow: "GenesisAeon P19 \u00b7 amazon-utac",
    title: "Amazonas-Kipppunkt",
    lead: "Kubische Doppelmulden-Gleichung aus amazon-utac. Zwei Zahlenreihen bleiben getrennt: die alte Modellannahme von 1\u00a0%/Jahr und die PRODES-Realit\u00e4t 2025 von 0,17\u00a0%/Jahr.",
    forest: "Wald",
    savanna: "Savanne",
    notUntil2105: "nicht bis 2105",
    wellCaption:
      "Die Kugel sitzt auf V(H; G). Unterhalb des Sattels rollt sie in die Savannen-Senke \u2013 die Wald-Senke ist dann verloren. Die Landschaft folgt G der gew\u00e4hlten Rate; beide PRODES-Kugeln bleiben sichtbar.",
    rateHeading: "Entwaldungsrate",
    rateAria: "J\u00e4hrliche Entwaldungsrate als Anteil des verbleibenden Waldes",
    rateFoot: (cleared, yoy) =>
      `Rate als Anteil des verbleibenden Waldes, wie in amazon-utac. 0,17\u00a0% ist die INPE-PRODES-Saison 2024/25 (${cleared}\u00a0km\u00b2, -${yoy}\u00a0% zum Vorjahr) \u2013 kein stiller Ersatz der 1-%-Annahme.`,
    timeHeading: "Zeit",
    timeAria: "Simulationsjahr",
    play: "Lauf",
    pause: "Pause",
    reset: "Reset",
    metricForestH: "Waldanteil H",
    metricDeforested: "Entwaldet",
    metricSaddle: "Sattel H(G)",
    metricBasin: "Becken",
    basinForest: "Wald",
    basinSavanna: "Savanne",
    basinHintForest: "Oberhalb des Sattels \u2013 R\u00fcckstellkraft zum Wald",
    basinHintSavanna: "Sattel unterschritten \u2013 Drift zur Savanne",
    trajTitle: "Trajektorie",
    legendProdes: "PRODES 0,17 %/Jahr",
    legendLegacy: "Modell 1 %/Jahr",
    legendCustom: "Gew\u00e4hlte Rate",
    ballProdes: "PRODES 0,17 %",
    ballLegacy: "Modell 1 %",
    ballChosen: "Gew\u00e4hlt",
    threshTitle: "Schwellen",
    threshLead: (startYear, remaining) =>
      `Lineare Sch\u00e4tzung aus amazon-utac: Rest bis Schwelle / (Rate \u00b7 Waldanteil). Basis ${startYear}, aktuell ${remaining}.`,
    threshProdes: "PRODES 0,17 %",
    threshLegacy: "Modell 1 %",
    threshCustom: "Gew\u00e4hlte Rate",
    threshFoot:
      "Die 1-%-Falsifikation im Paket lautet 2038 \u00b1 5 Jahre. Mit der PRODES-Rate 2025 r\u00fcckt dieselbe 20-%-Schwelle um Jahrzehnte. Historische Raten schwankten zwischen Regierungen um ein Vielfaches \u2013 0,17\u00a0% ist ein politischer Trend, kein Naturgesetz.",
    odeTitle: "Die Gleichung, live",
    odeCubic: "Kubischer Term",
    odeDefor: "Entwaldung -\u03b4\u00b7H",
    odeTotal: "dH/dt gesamt",
    odeHToday: "H heute (Start)",
    odeFoot:
      "H_saddle(G) = 0,50 + 0,30 \u00b7 tanh(s\u00b7G), s = 2,2. Mit steigendem G wandert der Sattel auf den Wald-Attraktor zu \u2013 eine Saddle-Node-Bifurkation, der eigentliche Kipppunkt.",
    state2025Title: "Zustand 2025 (PRODES)",
    factCumul: "Kumulativ entwaldet",
    factSeason: "Saison 2024/25",
    factOriginal: "Urspr\u00fcngliche Fl\u00e4che",
    factBuffer: "Puffer bis 20 %",
    footer:
      "Modell: GenesisAeon/amazon-utac (MIT) \u00b7 Lovejoy & Nobre 2019, 10.1126/sciadv.aba2949 \u00b7 Boulton et al. 2022, 10.1038/s41558-022-01287-8 \u00b7 INPE PRODES. Kein Prognoseprodukt \u2013 eine interaktive Form der ver\u00f6ffentlichten kubischen ODE.",
    statusCrossed: "Sattel unterschritten \u2013 Savannisierung",
    statusSafe: "Im Waldbecken \u2013 Attraktor bei H = 0,80",
    statusMeta: (year, H, defor, rate) =>
      `${year} \u00b7 H = ${H} \u00b7 entwaldet ${defor} \u00b7 Rate ${rate}`,
    ratePresets: {
      recovery: { label: "Erholung", hint: "Netto-Aufforstung -0,5 %/Jahr" },
      zero: { label: "Null", hint: "Kein Netto-Verlust" },
      prodes: { label: "PRODES 0,16 %", hint: "INPE 2024/25, 5.731 km\u00b2" },
      legacy: { label: "Modell 1 %", hint: "Alte Modellannahme" },
      fast: { label: "2\u00d7", hint: "Beschleunigt, 2 %/Jahr" },
    },
    wellAria:
      "Doppelmulden-Potenzial des Amazonas: zwei Senken f\u00fcr Wald und Savanne, getrennt durch einen Sattel. Kugeln zeigen den Waldanteil der PRODES-Rate und der alten 1-Prozent-Annahme.",
    markerSavanna: "Savanne",
    markerSavannaFull: "Savanne 0,15",
    markerSaddle: "Sattel",
    markerSaddleFull: (h) => `Sattel ${h}`,
    markerForest: "Wald",
    markerForestFull: "Wald 0,80",
    markerToday: "Heute",
    odeSaddle: "ODE-Sattel",
  },
  en: {
    language: "Language",
    documentTitle: "Amazon tipping point",
    eyebrow: "GenesisAeon P19 \u00b7 amazon-utac",
    title: "Amazon tipping point",
    lead: "Cubic double-well equation from amazon-utac. Two number series stay separate: the old model assumption of 1%/yr and the PRODES 2025 reality of 0.17%/yr.",
    forest: "Forest",
    savanna: "Savanna",
    notUntil2105: "not by 2105",
    wellCaption:
      "The ball sits on V(H; G). Below the saddle it rolls into the savanna well \u2013 the forest well is then lost. The landscape follows G of the chosen rate; both PRODES balls stay visible.",
    rateHeading: "Deforestation rate",
    rateAria: "Annual deforestation rate as a fraction of remaining forest",
    rateFoot: (cleared, yoy) =>
      `Rate as a fraction of remaining forest, as in amazon-utac. 0.17% is the INPE PRODES 2024/25 season (${cleared} km\u00b2, -${yoy}% year-on-year) \u2013 not a quiet substitute for the 1% assumption.`,
    timeHeading: "Time",
    timeAria: "Simulation year",
    play: "Run",
    pause: "Pause",
    reset: "Reset",
    metricForestH: "Forest fraction H",
    metricDeforested: "Deforested",
    metricSaddle: "Saddle H(G)",
    metricBasin: "Basin",
    basinForest: "Forest",
    basinSavanna: "Savanna",
    basinHintForest: "Above the saddle \u2013 restoring force toward forest",
    basinHintSavanna: "Saddle crossed \u2013 drift toward savanna",
    trajTitle: "Trajectory",
    legendProdes: "PRODES 0.17 %/yr",
    legendLegacy: "Model 1 %/yr",
    legendCustom: "Chosen rate",
    ballProdes: "PRODES 0.17 %",
    ballLegacy: "Model 1 %",
    ballChosen: "Chosen",
    threshTitle: "Thresholds",
    threshLead: (startYear, remaining) =>
      `Linear estimate from amazon-utac: remainder to threshold / (rate \u00b7 forest fraction). Base ${startYear}, currently ${remaining}.`,
    threshProdes: "PRODES 0.17 %",
    threshLegacy: "Model 1 %",
    threshCustom: "Chosen rate",
    threshFoot:
      "The 1% falsification in the package reads 2038 \u00b1 5 years. With the PRODES 2025 rate the same 20% threshold moves by decades. Historical rates swung by multiples between governments \u2013 0.17% is a political trend, not a law of nature.",
    odeTitle: "The equation, live",
    odeCubic: "Cubic term",
    odeDefor: "Deforestation -\u03b4\u00b7H",
    odeTotal: "dH/dt total",
    odeHToday: "H today (start)",
    odeFoot:
      "H_saddle(G) = 0.50 + 0.30 \u00b7 tanh(s\u00b7G), s = 2.2. As G rises the saddle walks toward the forest attractor \u2013 a saddle-node bifurcation, the actual tipping point.",
    state2025Title: "State 2025 (PRODES)",
    factCumul: "Cumulatively deforested",
    factSeason: "Season 2024/25",
    factOriginal: "Original area",
    factBuffer: "Buffer to 20 %",
    footer:
      "Model: GenesisAeon/amazon-utac (MIT) \u00b7 Lovejoy & Nobre 2019, 10.1126/sciadv.aba2949 \u00b7 Boulton et al. 2022, 10.1038/s41558-022-01287-8 \u00b7 INPE PRODES. Not a forecast product \u2013 an interactive form of the published cubic ODE.",
    statusCrossed: "Saddle crossed \u2013 savannization",
    statusSafe: "In the forest basin \u2013 attractor at H = 0.80",
    statusMeta: (year, H, defor, rate) =>
      `${year} \u00b7 H = ${H} \u00b7 deforested ${defor} \u00b7 rate ${rate}`,
    ratePresets: {
      recovery: { label: "Recovery", hint: "Net reforestation -0.5 %/yr" },
      zero: { label: "Zero", hint: "No net loss" },
      prodes: { label: "PRODES 0.16 %", hint: "INPE 2024/25, 5,731 km\u00b2" },
      legacy: { label: "Model 1 %", hint: "Old model assumption" },
      fast: { label: "2\u00d7", hint: "Accelerated, 2 %/yr" },
    },
    wellAria:
      "Amazon double-well potential: two basins for forest and savanna, separated by a saddle. Balls show forest fraction under the PRODES rate and the old 1-percent assumption.",
    markerSavanna: "Savanna",
    markerSavannaFull: "Savanna 0.15",
    markerSaddle: "Saddle",
    markerSaddleFull: (h) => `Saddle ${h}`,
    markerForest: "Forest",
    markerForestFull: "Forest 0.80",
    markerToday: "Today",
    odeSaddle: "ODE saddle",
  },
};
