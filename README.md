# Amazonas-Kipppunkt

[![GenesisAeon](https://img.shields.io/badge/GenesisAeon-P19-blue)](https://github.com/GenesisAeon/amazon-utac)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Interaktive Sandbox zum Amazonas-Wald–Savanne-Kipppunkt. Die ODE kommt aus dem
kalibrierten Paket [amazon-utac](https://github.com/GenesisAeon/amazon-utac)
(GenesisAeon P19) — keine erfundenen Zahlen.

Zwei Zahlenreihen bleiben bewusst getrennt: die **alte Modellannahme 1 %/Jahr**
und die **PRODES-Realität 2025 von 0,17 %/Jahr**.

## Gleichung

Aus `amazon_utac/savanna_attractor.py` / `system.py`:

```
dH/dt = −r · (H − H_s) (H − H_saddle(Γ)) (H − H_f) − ρ · H

H_saddle(Γ) = H_saddle0 + (H_f − H_saddle0) · tanh(σ · Γ)
```

Kalibrierung (`amazon_utac/constants.py`, Stand PRODES 2025):

| Größe | Wert | Quelle |
|---|---|---|
| H_Wald | 0,80 | Wald-Attraktor |
| H_Savanne | 0,15 | Savannen-Attraktor |
| H_Sattel₀ | 0,50 | instabiles Gleichgewicht bei Γ = 0 |
| r | 0,05 a⁻¹ | Forest-Rate |
| σ | 2,2 | CREP-Kopplung |
| Γ_Amazon | arctanh(0,25) / 2,2 ≈ 0,116 | η = 25 %-Schwelle |
| H heute | 0,839 | ~16,1 % entwaldet (PRODES 2025) |
| ρ_Modell | 0,01 a⁻¹ | Legacy-Annahme, 1 % des Restwaldes |
| ρ_PRODES | 0,0016 a⁻¹ | INPE 2024/25, 5.731 km² (konsolidiert) |
| Schwelle | 20–25 % | Lovejoy & Nobre 2019 |

Γ wächst mit zusätzlicher Entwaldung wie in `system.py`:

```
Γ(t) = Γ₀ + 0,5 · max(0, (1 − H) − D₀)
```

## Zwei Zahlenreihen

- **PRODES 0,17 %/Jahr** — beobachtete Rate 2024/25 (niedrigster Jahreswert seit 11 Jahren). Kein stiller Ersatz der 1-%-Annahme.
- **Modell 1 %/Jahr** — Legacy-Default in amazon-utac, für bestehende Szenariovergleiche.

Die UTAC-Formel `years_to_threshold` (linear) und die ODE-Sattelkreuzung stehen nebeneinander. Die 1-%-Falsifikation im Paket lautet 2038 ± 5 Jahre; mit der PRODES-Rate 2025 rückt dieselbe 20-%-Schwelle um Jahrzehnte. 0,17 % ist ein politischer Trend, kein Naturgesetz.

## Kontext, keine Vorhersage dieser Sandbox

Lovejoy & Nobre (2019), DOI [10.1126/sciadv.aba2949](https://doi.org/10.1126/sciadv.aba2949):
Entwaldungsschwelle 20–25 %. Boulton, Lenton & Boers (2022),
DOI [10.1038/s41558-022-01287-8](https://doi.org/10.1038/s41558-022-01287-8):
Resilienzverlust. Flächen: INPE PRODES.

Kein Prognoseprodukt — eine interaktive Form der veröffentlichten kubischen ODE.

## Lokal starten

Voraussetzung: Node.js 22+.

```bash
git clone https://github.com/GenesisAeon/amazon-kipppunkt.git
cd amazon-kipppunkt
npm install
npm run dev
```

```bash
npm run build
npm run typecheck
```

## Auth (derzeit ungenutzt)

Das Scaffolding unter `src/lib/auth` (better-auth, PGlite) ist **nicht aktiv**.
Keine Konten, keine Login-Seite, keine serverseitigen Nutzerdaten.

## Lizenz

[MIT](LICENSE). Passend zum Rest des GenesisAeon-Ökosystems und zu
[amazon-utac](https://github.com/GenesisAeon/amazon-utac) (MIT).
