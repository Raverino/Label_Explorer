# Open data gaps (updated 2026-11-16)

What the database still misses, split into what needs **you** (paid standards, professional tools, or Dutch practice knowledge) and what **I** can still look up. The ones marked ★ change labels the most.

## A. Needs you

| # | Item | Why it matters | Where it lives |
|---|---|---|---|
| A1 ★ | *2026-11-11: engine checked against the RVO reference house L (NTA 8800 results), see `validation/NL_reference_L.json`: BENG 1 within 1-22%, BENG 2 about 30% low.* *Partly done: a private NTA 8800 tool run (kept offline) confirms electricity 1.45, CO₂ 0.268 on net metered electricity, and the PV export credit. Still needed: a single-family case (user will provide later).* **Two Dutch validation houses**: run the reference house below in Uniec 3 / Vabi (or any NTA 8800 tool) and send the results: BENG 1/2/3, EP2, label, heat demand, delivered electricity/gas. | The only way to check the engine against an official tool before other countries are built on it. | Your EP software |
| A2 ★ | **NTA 8800 usage conventions for dwellings**: internal heat gains (W/m² or formula per Ag), hot-water demand (formula per Ag), indoor set temperature, default ventilation rate per system type (natural / C / D). | They drive heat demand and DHW, so they drive every Dutch result. | NTA 8800 chapters 7, 11, 13 (NEN, paid). If you can see them, the numbers alone are enough. |
| A3 | Dutch gas CO₂ factor in the final NTA 8800:2026: **0.183 or 0.218** kg/kWh? | The CO₂ result in the details panel. | NTA 8800:2026 table 5.3 |
| A4 | The TOjuli limit (summer overheating) and whether the game should show it. | Optional "too hot in summer" warning. | Bbl / NTA 8800 |
| A5 | Whether the forfaitair district-heat factor **0.9** in the 2026 table is the one you see in practice, and one or two typical Dutch heat-network BCRG values you'd like as examples. | District-heat choice in the game. | BCRG / practice |
| A6 | Germany: DIN V 18599-10 single-family usage profile (internal gains, hot water 12 kWh/m²a?). Only if you or a colleague has DIN access. | German final energy. | DIN V 18599-10 (paid) |

**Reference house for A1** (two-storey terraced/detached house, kept simple so it's easy to enter):

- Detached, two storeys, outside dimensions 8.0 × 9.0 m, storey height 2.8 m, gable roof at 45°, ridge parallel to the 9 m side.
- Ag ≈ 120 m².
- Rc floor 3.7, walls 4.7, roof 6.3. Windows U 1.0 / g 0.5, about 25 m², split 40% south, 30% north, 15% east, 15% west.
- Airtightness qv;10 = 0.4 dm³/s·m².
- Variant 1: air-to-water heat pump (radiators 35 °C), ventilation system C with CO₂ control, no PV.
- Variant 2: the same house with 10 PV panels (≈ 4 kWp, south 35°).

Change any detail to whatever is quickest in your tool; just tell me what you entered.

## B. Database check of 2026-11-12

Every label scale, factor table and usage convention was checked against the legal text where it is free. Read in the text itself (now `official`):

| Country | What was confirmed or corrected | Source read |
|---|---|---|
| NL | BENG 1 formula, BENG 2 ≤ 30, BENG 3 ≥ 50 %, +5 for light construction; TOjuli ≤ 1.20 | Bbl art. 4.149 / tabel 4.148A (version 2026-09-24); RVO |
| DE | Class table A+..H; oil 1.1 / 310 g, LPG 270 g, wood 0.2 / 20 g; hot water **12.5** kWh/m²a (was 12) | GModG Anlage 4, 9, 10, § 20 |
| AT | The certificate shows two classes side by side (heating need and final energy), no single headline; "worse of" stays an app choice | Tirol OIB-RL 6 2025 guide, p. 21 |
| IE | Setpoints 21/18 °C, 56 h/week, occupancy formula; fuel factors incl. wood and district heat | DEAP manual 4.2.7 (June 2025) |
| EE | Weights 2.0 / 0.9 / 0.65 / 1.0 and biomass 0.65 (all `official` now); the 2026 study proposes electricity 1.8 | Reg. 63 § 9 (Estlex consolidation); Climate Ministry study May 2026 |
| FI | **New conventions**: 21 °C, fresh air 0.4 dm³/s·m², gains 6/3/2 W/m² × 0.1/0.6/0.6, hot water **35 kWh/m²a** (max 4,200 per home) — the old stored 600 L/m²a was wrong | Decree 1010/2017 §§ 10-12 |
| HR | Full class table A+..G (D-G were secondary) | NN 88/2017 Prilog 1 Tablica 1 |
| HR (2026-11-16) | **Official conventions**: 20 °C, gains 5 W/m² A_K, minimum 0.5 air changes/h | Algoritam HRN EN 13790 (2021) Tablica 1.1, 1.3.3.1 |
| BE-WAL (2026-11-16) | **Official conventions**: 18 °C, gains 0.67 V + 220 W, hot water 64 + 16 W plus 0.275 W per m³ above 192 m³; floor area Ach on outer dimensions now official | AGW PEB 2026 Annexe A1 (PER) 7.9.2, eq. 18, definitions |
| ES (2026-11-16) | **Official conventions**: 20 °C day / 17 °C night (19 °C average), gains 4.81 W/m² weekly average; hot water still default (28 L/person/day needs bedrooms) | CTE DB-HE Anejo D, Anejo F |
| HU | Class table (% of requirement) now `official`; added oil, wood and district-heat factors | 176/2008 Korm. rendelet 3. melléklet; 9/2023 ÉKM 7. melléklet |
| BE-BRU | Main bands official; A sub-levels by the thirds rule (C- = 133-150 confirmed); setpoint **18 °C** mean | Bruxelles Environnement pages |
| ES | Envelope limits zone D now `official` (0.41 / 0.35 / 0.65 / 1.8) | CTE DB-HE Tabla 3.1.1.a-HE1 |
| SK | Envelope limits corrected to the 2021 level: wall **0.15**, roof **0.10** (were 0.22 / 0.15), window 1.0 | Standard author's summary (secondary, medium) |
| Catalogue | Frame U_f checked against EN ISO 10077-1 Annex D; "Wood" is a 68 mm hardwood frame (1.8); old double glass edge loss 0.06 (Annex E) | Secondary summaries of the standard |

Still `secondary` after the check (free text not reachable):

| Item | Why |
|---|---|
| BE-WAL band table | Five certifier sources agree; SPW annex not found online |
| DK conventions (5.0 W/m², 250 L/m²a) | SBi 213 is paid; values from the industry guide |
| DE internal gains 45 Wh/m²·d, A_N = 0.32·V_e | In DIN V 18599 (paid) |
| HU requirement 76 kWh/m²a | Formula printed as an image in 9/2023 ÉKM |
| IE electricity 1.5 / 0.1685 | Read in the SEAI SBEMie note; the DEAP page blocks automated reading |
| Brussels gas factor 1.0 | Method annex not read |
| NL usage conventions | NTA 8800 is paid; only "180 W per occupant" is public |

## D. Deep-research backlog (not blocking v1)

Values whose confidence is still not high. None of them blocks the app: the engine falls back to documented defaults, and the expert view shows the flag.

| Item | Now | What would settle it |
|---|---|---|
| Usage conventions NL, DE (gains), DK, IE (gains, hot water) | `secondary` / EN default | NTA 8800 ch. 7/11/13, DIN V 18599-10, SBi 213 (all paid) |
| Floor-area conversions DE, BE-WAL, EE, SK | `secondary` / `unverified` | National method texts |
| BE-WAL band table, Brussels gas factor | `secondary` | AGW PEB annex; Brussels method annex |
| HR primary-energy scale (Tablica 2) | not modelled | Image in NN 88/2017 |
| SK envelope limits | medium | STN 73 0540-2+Z1+Z2 (paid) |
| AT roof 0.20 / floor 0.40 | medium | OIB-RL 6 2025 PDF point 4.5.1 (official PDF moved; > 10 MB) |
| SI H′tr formula fraction placement | medium | TSG-1-004:2022 §8.1.6 |
| BE-WAL / BE-BRU Umax | medium | AGW annex C1; Brussels annex |
| Estonia electricity weight | 2.0 in force | Watch for the proposed change to 1.8 |

## C. Known approximations (documented, not blocking)

- *2026-11-15, engine:* ground floors now follow EN ISO 13370 (characteristic dimension B', equivalent thickness d_t, crawl-space U_x, periodic method so the ground lags the air; default soil λ 2.0 / ρc 2.0 MJ/m³K). Opaque walls and roof now get sun on their outer surface and lose heat to the sky (EN ISO 52016-1 monthly, α 0.6, Δθ_er 11 K). Hand checks in `tests/engine.test.ts`.
- **Reference climates** (biggest remaining method gap): every country uses its own reference year (NL NEN 5060:2018 De Bilt; DE DIN V 18599-10 table E.6, TRY 2011 region 4 Potsdam; etc.). These tables are paid or behind a free DWD account; checked 2026-11-15 that the BBSR guidance (Maas/Schlitzberger 2013) cites but does not print the Potsdam table. Until then: PVGIS long-term means (flag `proxy`).

- Climate: PVGIS long-term means instead of each national reference year.
- Spain: zone D3 (Madrid) only; Austria: Vienna only; Croatia: both reference stations.
- Catalogue values are generic typical values, not products. BCRG product declarations can replace them later.
- Construction cost is in game "coins", not euros.

## E. Still open after 2026-11-16
- SI conventions: in TSG-1-004:2022 tables 6.1.3 / 7.1.1 / 8.2.2 (official PDF over 10 MB; not read yet).
- BE-WAL hygienic ventilation (eq. 42-44 are images in Annexe A1) and the official class table (in the Moniteur belge annex).
- HR primary-energy scale (Tablica 2 image), HU and EE conventions (in linked annex PDFs / Riigi Teataja).
