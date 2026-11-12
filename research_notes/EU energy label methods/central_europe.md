# EPC schemes for new single-family dwellings in Central Europe (PL, CZ, SK, HU, SI): fit with one shared monthly EN ISO 52016/52000 engine

Research date: 2026-11-10. Sources are mainly the official legal databases (zakonyprolidi.cz, slov-lex.sk, njt.jog.gov.hu, uradni-list.si), plus Polish and Hungarian trade press where the official text could not be machine-read. Several key PDFs (BPIE EPC report v5 June 2026, Slovenian TSG-1-004:2022, MNB/Csoknyai article, Polish draft regulation) could not be extracted: too large, or compressed or CID-encoded. Those items are marked as gaps.

**Important correction to the brief:** Hungary's AA++..JJ scale (7/2006 TNM) is **obsolete**. Since 1 Nov 2023 the scale is **A+++ ... I**, set as a percentage of the requirement value (see HU below).

---

## 1. National calculation method/standard and legal basis

### Takeaway
All five countries use a monthly (quasi-)stationary method for energy need, in line with EN ISO 52016-1. They differ in the legal instrument and in the indicator that drives the class. Poland still has no classes in force, as far as the sources found show.

### Cited Findings
**Poland (PL)**
- Legal basis: Act of 29 August 2014 on the energy performance of buildings (ustawa o charakterystyce energetycznej budynków), consolidated text Dz.U. 2024 poz. 101, marked in force as of 17.07.2026 — [lexlege.pl](https://lexlege.pl/charakt-energ-budynkow/rozdzial-1-przepisy-ogolne/8798/)
- A new MRiT regulation on the methodology and certificates is being drafted under Art. 15(1) of that Act. The draft is dated 29.05.2025, after consultation — [PIIB draft PDF](https://lbs.piib.org.pl/wp-content/uploads/2025/06/Projekt-rozporzadzenia-28.05.2025_Po-uwagach.pdf); compliance table vs. Directive 2024/1275, dated 03.06.2025 — [PIIB](https://lbs.piib.org.pl/wp-content/uploads/2025/06/tabela-zgodnosci-metodologia-dyrektywa-2024-1275-03.06.2025.docx)
- The draft methodology implements PN-EN ISO 52016-1:2017 for energy demand calculations — [GLOBEnergia, 01.03.2024](https://globenergia.pl/nowe-swiadectwo-i-klasy-energetyczne-wiemy-juz-kiedy-wejda-w-zycie/)
- Does PL have classes? Not in force under the current scheme. The certificate shows an EP "slider" (suwak) against the requirement. The draft regulation would introduce classes **A+ to G** — [GLOBEnergia, 22.07.2025](https://globenergia.pl/klasy-energetyczne-budynkow-juz-w-czerwcu-2026-roku/); [gramwzielone.pl](https://www.gramwzielone.pl/dom-energooszczedny/20322573/nowe-przepisy-o-klasach-energetycznych-budynkow-budza-sprzeciw-organizacji-spolecznych)

**Czechia (CZ)**
- Vyhláška č. 264/2020 Sb., o energetické náročnosti budov, transposes Directive 2018/844. It amended or replaced vyhláška 78/2013 Sb. — [zakonyprolidi.cz 264/2020](https://www.zakonyprolidi.cz/cs/2020-264); [Korenkova 2024, VUT Brno](https://juniorstav.fce.vutbr.cz/wp-content/uploads/2024/04/01_DOI_24018_FINAL-Veronika-Korenkova.pdf)
- The decree cites ČSN EN ISO 52016-1 for calculation procedures (footnote 3, Annex 1 Tab. 1). It uses ČSN 73 0540-2/-3 for U-value requirements and design temperatures — [zakonyprolidi.cz 264/2020](https://www.zakonyprolidi.cz/cs/2020-264)
- Requirements for new buildings are set against a **reference building** (§6(1)). For nZEB / buildings from 1 Jan 2022, the primary energy, delivered energy and Uem indicators must not exceed the reference values. Reduction factor fR = 0.7 for nZEB. Tab. 6 gives reference primary-energy reductions of 20–80%, interpolated linearly by reference heating demand and building type — [zakonyprolidi.cz 264/2020](https://www.zakonyprolidi.cz/cs/2020-264)

**Slovakia (SK)**
- Zákon 555/2005 Z. z. o energetickej hospodárnosti budov (consolidated version 01.04.2025) — [slov-lex](https://static.slov-lex.sk/static/SK/ZZ/2005/555/20250401.html)
- Implementing decree vyhláška 364/2012 Z. z., amended by vyhláška 35/2020 Z. z. (in force 10.03.2020) — [slov-lex 35/2020](https://static.slov-lex.sk/static/SK/ZZ/2020/35/20200310.html); [slov-lex 364/2012 consolidated 2020](https://static.slov-lex.sk/static/SK/ZZ/2012/364/20200310.html)
- 35/2020 added §6(11): an nZEB that exports or stores energy is placed in subclass **A0+** — [slov-lex 35/2020](https://static.slov-lex.sk/static/SK/ZZ/2020/35/20200310.html)

**Hungary (HU)**
- 9/2023. (V. 25.) ÉKM rendelet on determining the energy performance of buildings. It replaced 7/2006 TNM and is in force from 1 Nov 2023 — [njt.jog.gov.hu](https://njt.jog.gov.hu/jogszabaly/2023-9-20-8X); [bankmonitor.hu](https://bankmonitor.hu/mediatar/cikk/novembertol-eletbe-lepnek-az-uj-energiatanusitvany-szabalyok-mutatjuk-mi-valtozik/)
- The certification procedure (and the advertising rule) is in 176/2008. (VI. 30.) Korm. rendelet — [energiamernok.hu](https://energiamernok.hu/energetikai-besorolas-tablazat/)
- The simplified method requires a **monthly** calculation of net heating and cooling need (Annex 6, point 4.6). Detailed methods may use MSZ standards. The decree text does not name MSZ EN ISO 52016 — [njt.jog.gov.hu](https://njt.jog.gov.hu/jogszabaly/2023-9-20-8X)

**Slovenia (SI)**
- Pravilnik o metodologiji izdelave in izdaji energetskih izkaznic stavb, Uradni list RS 4/2023, in force 1 Feb 2023 (Art. 23) — [uradni-list.si](https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2023-01-0094)
- The calculated EPC uses the methodology of the rules on efficient energy use in buildings (PURES; Art. 8(1)), with stationary modelling (Art. 8(2)). Non-stationary modelling is allowed if it was used in design (Art. 8(3)). The measured EPC cites SIST EN ISO 52000-1 — [uradni-list.si](https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2023-01-0094)
- Technical guideline TSG-1-004:2022 (Učinkovita raba energije) replaces TSG-1-004:2010. PURES-3 software uses the "PURES 3_2022" file for new projects — [gov.si TSG-1-004:2022](https://www.gov.si/assets/ministrstva/MNVP/Dokumenti/Graditev/TSG-1-004_2022_ure.pdf); [PURES 3 navodila](https://www.gov.si/assets/ministrstva/MNVP/Dokumenti/Graditev/PURES_3_Navodila_za_uporabo_GF.pdf)

### Inferences
- All five rest on monthly balances compatible with an EN ISO 52016-1 monthly engine. CZ and PL cite ISO 52016-1 explicitly; HU mandates monthly; SI is stationary/monthly via PURES/TSG.

### Gaps
- Exact PL methodology currently in force could not be verified online here. Unverified recollection: Rozporządzenie MRiT of 2023 (Dz.U. 2023 poz. 697). WT2021 (Warunki Techniczne) set EP ≤ 70 kWh/(m²·a) for single-family houses (unverified recollection, not cited).
- Whether SI's PURES-3 cites SIST EN ISO 52016-1 monthly method explicitly (TSG PDF too large to fetch).

---

## 2. Label scale and exact class thresholds

### Takeaway
SI (heating need) and SK (primary energy) have **absolute** published kWh/(m²·a) thresholds. CZ uses **multiples of a reference-building value**. HU uses **% of the requirement value**, which for residential is a fixed 76 kWh/(m²·a), so it is effectively absolute. PL has **no official class thresholds**: the draft is unpublished, and blog values conflict.

### Cited Findings
**CZ (Příloha 2, vyhl. 264/2020)**: upper limits as multiples of ER (reference building value). The first value is non-renewable primary energy; the second is total delivered energy — [zakonyprolidi.cz](https://www.zakonyprolidi.cz/cs/2020-264)
- A "mimořádně úsporná" ≤ 0.8·ER (PE) / 0.7·ER (delivered)
- B "velmi úsporná" ≤ 1.2 / 0.9
- C "úsporná" ≤ 1.6 / 1.2
- D "méně úsporná" ≤ 2.3 / 1.5
- E "nehospodárná" ≤ 3.0 / 2.0
- F "velmi nehospodárná" ≤ 3.7 / 2.5
- G "mimořádně nehospodárná" > F
- (Partial classifications for heating/cooling, DHW, lighting, ventilation and Uem also exist. The table layout was garbled in the fetch.)

**SK (príloha 3, vyhl. 364/2012 as amended by 35/2020): global indicator = primary energy, rodinné domy (single-family houses), kWh/(m²·a)** — [slov-lex 35/2020](https://static.slov-lex.sk/static/SK/ZZ/2020/35/20200310.html); [annex PDF](https://static.slov-lex.sk/pdf/prilohy/SK/ZZ/2020/35/20200310_5228103-2.pdf)
- A0 ≤ 54 | A1 55–108 | B 109–216 | C 217–324 | D 325–432 | E 433–540 | F 541–648 | G > 648. Subclass A0+ applies to an nZEB that exports or stores energy. (Values come from a text extraction of the annex; verify against the official PDF.)

**HU (since 1 Nov 2023), 12 classes A+++ ... I**, as % of the requirement value — [energiamernok.hu](https://energiamernok.hu/energetikai-besorolas-tablazat/)
- A+++ ≤ 0% (zero energy) | A++ 1–50% | A+ 51–90% | A 91–100% ("better than nZEB requirement") | B 101–130% ("meets nZEB requirement") | C 131–160% | D 161–200% | E 201–250% | F 251–310% | G 311–390% | H 391–500% | I > 500%
- The same scale in kWh/(m²·a) for residential (requirement 76), from the peer-reviewed Magyar Épületgépészet 2024/11-12 article (Csoknyai): A++ up to 38, A+ up to 68, A up to 76, B up to 98.8, C up to 122, D up to 152, E up to 190, F up to 236, G up to 296, H up to 380, I up to 500 (sic; >380) — [MNB/Csoknyai PDF](https://zoldpenzugyek.mnb.hu/sw/static/file/20241210_csoknayi_jogszabalyi_valtozasok_kovetkezmenyei_lakoingatlanok_besorolasara.pdf) (figures obtained via search snippet; the PDF itself was not text-extractable)
- Old vs new: the old AA+ band was 40–60 kWh/(m²·a); the new A+ band is 38–68 — same source.
- The 25% renewable-share condition no longer applies to new buildings after 1 Nov 2023 — [energiamernok.hu](https://energiamernok.hu/energetikai-besorolas-tablazat/)
- Conflict: energiamernok.hu says a 72 kWh/(m²·a) 100 m² house is A+. That is inconsistent with A+ ≤ 68 (72/76 = 95%, which is class A). There is also a 2026 blog table with an "A up to 76" and "C 130–160" scale — [energetikai-tanusitvany-veszprem.hu](https://energetikai-tanusitvany-veszprem.hu/energetikai-besorolasok/). Treat blogs as unreliable.

**SI (Art. 6, Pravilnik UL RS 4/2023): classes on specific heating need Q'H,nd,an, kWh/(m²·a)** — [uradni-list.si](https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2023-01-0094)
- A1 0–10 | A2 >10–15 | B1 >15–25 | B2 >25–35 | C >35–60 | D >60–105 | E >105–150 | F >150–210 | G >210

**PL (draft only)**: A+ to G, two classifications: EP (non-renewable primary) and ED (net delivered energy, a new indicator that credits on-site PV) — [GLOBEnergia 22.07.2025](https://globenergia.pl/klasy-energetyczne-budynkow-juz-w-czerwcu-2026-roku/)
- Thresholds circulating on blogs conflict. One gives single-family A+ EP ≤ 0, A ≤ 68, B 68–75, C 75–117, D 117–159, E 159–235, F 235–330, G > 330. Another gives a general scale with A+ ≤ 63 … G > 150. A third gives G > 400 — [certwell.pl](https://certwell.pl/nowy-wzor-swiadectwa-2026/); [przejdznaoze.pl](https://przejdznaoze.pl/efektywnosc-energetyczna/klasy-energetyczne-budynkow-2026-kompletny-przewodnik-co-oznaczaja-litery-a-g-dla-twojego-domu/); [certyfikatomat.pl](https://certyfikatomat.pl/jak-czytac-swiadectwo-energetyczne/). None of these is official.

### Inferences
- HU's class bands are ratios of 76 for residential, so 98.8 = 1.3×76, 152 = 2×76, 380 = 5×76. This supports the % scale being applied to a fixed residential requirement of 76 kWh/(m²·a) (lighting excluded).
- CZ needs a parallel reference-building run: same geometry, reference U-values and systems per Annex 1. That is feasible in a shared engine, but adds work.

### Gaps
- The official PL class thresholds (unpublished draft annex; PDF text not extractable).
- Verified SK thresholds from the official annex PDF (only a text-extract snippet was obtained). Possible post-2020 amendments to SK annex 3 were not checked.
- Which HU legal annex (176/2008 Korm. r. amended in 2023, or 9/2023 ÉKM Annex) formally contains the A+++..I table. The njt text of 9/2023 itself contains **no** class table.
- Whether the HU 76 kWh/(m²·a) requirement is a flat value or formula-based for small single-family houses (njt says residential requirement formulas appear only as images).

---

## 3. Indicator and reference floor area

### Takeaway
The class indicator differs per country: SI uses **energy need for heating**; SK, HU and CZ use **(non-renewable) primary energy**, with CZ also classifying delivered energy; PL (draft) uses EP non-renewable primary plus ED net delivered. Only SI maps directly onto the raw output of the energy-need engine.

### Cited Findings
- CZ: indicators per m² of "energeticky vztažná plocha" (§3(1)). Classes are given for non-renewable primary energy and for total delivered energy — [zakonyprolidi.cz](https://www.zakonyprolidi.cz/cs/2020-264)
- SK: "globálny ukazovateľ – primárna energia" in kWh/(m²·a) — [slov-lex 35/2020](https://static.slov-lex.sk/static/SK/ZZ/2020/35/20200310.html)
- HU: "összesített energetikai jellemző" = specific non-renewable primary energy demand per unit of useful floor area (hasznos alapterület, as defined in the certification Korm. rendelet) per year (§2). For residential it excludes lighting. The new method requirement is 76 kWh/(m²·a) — [njt.jog.gov.hu](https://njt.jog.gov.hu/jogszabaly/2023-9-20-8X); [MNB Q&A](https://zoldpenzugyek.mnb.hu/sw/static/file/20250225_zlt_qa.pdf); [energiamernok.hu new requirements](https://energiamernok.hu/uj-epuletenergetikai-kovetelmenyek/)
- SI: the classified indicator is Q'H,nd,an (specific heating need). The calculated EPC also shows E'del,an (delivered energy for technical systems), E'Ptot,an (total primary energy) and MCO2,an on a colour semi-scale, without classes. The normalising area is the conditioned area Ause (Art. 5(4)) — [uradni-list.si](https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2023-01-0094)
- PL draft: EP (non-renewable primary) and ED (net delivered energy) — [GLOBEnergia](https://globenergia.pl/klasy-energetyczne-budynkow-juz-w-czerwcu-2026-roku/)

### Inferences
- For SK, HU, CZ and PL, the shared engine must be extended with a simplified systems layer: generation efficiency, DHW, auxiliary energy, PEF. Energy need alone is not enough.

### Gaps
- Exact definitions of CZ "energeticky vztažná plocha" (gross external, per ČSN 73 0331-1) and PL Af (area with regulated temperature) were not verified in the fetched text.

---

## 4. Reference climate data

### Takeaway
CZ uses standard climate data from ČSN 73 0331. HU uses a reference year. SK, SI and PL climate inputs were not verified.

### Cited Findings
- CZ: "klimatická data uvedená v ČSN 730331" (Příloha 5, part A) — [zakonyprolidi.cz](https://www.zakonyprolidi.cz/cs/2020-264)
- HU: reference meteorological data = "referenciaév" (Annex 5, point 1.7.7). No degree-days are given in the decree text — [njt.jog.gov.hu](https://njt.jog.gov.hu/jogszabaly/2023-9-20-8X)

### Inferences
- CZ and HU appear to use a single national reference climate (an assumption for HU), which suits a shared engine with one climate file per country.

### Gaps
- SK climate data (STN 73 0540-3 / STN EN ISO 52016-1 national annex?), SI climate (location-specific ARSO data via PURES/TSG?), and PL (typical meteorological years per station published by the ministry): none was verified with a fetched source.

---

## 5. Primary energy factors

### Cited Findings
- **CZ** (Příloha 3, non-renewable factors): natural gas 1.0; electricity 2.1; heating oil 1.2; LPG 1.2; solid fossil 1.0; wood pellets/logs/chips 0.1. District heating: >80% RES 0.1, ≤80% RES 0.7, other 1.3. Ambient energy 0. Exported electricity −2.1 — [zakonyprolidi.cz](https://www.zakonyprolidi.cz/cs/2020-264) (version 3 of the consolidated text; the electricity factor may reflect a later amendment to the original 2020 value: verify)
- **HU** (9/2023 Annex 7 Tab. 2; f_nren / f_ren / f_tot / CO2 g/kWh): natural gas 1.1/0/1.1/297; electricity 2.3/0.3/2.6/455; district heating 1.38/0/1.38/374; solid biomass 0.6/0.6/1.2/40 — [njt.jog.gov.hu](https://njt.jog.gov.hu/jogszabaly/2023-9-20-8X)
- **SI**: factors are in Table 1 of Annex 1 of PURES-3. The electricity factor comes from the ministry (MOPE); others follow SIST EN ISO 52000-1 — [PURES-3 Q&A 2024](https://www.gov.si/assets/ministrstva/MNVP/Dokumenti/Graditev/PURES-3_Odgovori_2024.pdf)

### Gaps
- SK and PL factor values were not found in the fetched sources. SI numeric values were not extracted (PDF too large).

---

## 6. Absolute vs relative thresholds

### Cited Findings
- CZ: relative (multiples of the reference-building ER) — [zakonyprolidi.cz](https://www.zakonyprolidi.cz/cs/2020-264)
- SK: absolute kWh/(m²·a) per building category — [slov-lex 35/2020](https://static.slov-lex.sk/static/SK/ZZ/2020/35/20200310.html)
- HU: % of the requirement value; residential requirement 76 kWh/(m²·a), so effectively absolute — [energiamernok.hu](https://energiamernok.hu/energetikai-besorolas-tablazat/); [MNB Q&A](https://zoldpenzugyek.mnb.hu/sw/static/file/20250225_zlt_qa.pdf)
- SI: absolute kWh/(m²·a) on heating need — [uradni-list.si](https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2023-01-0094)
- PL: unknown (draft)

---

## 7. Transposition of EPBD recast (Directive (EU) 2024/1275)

### Takeaway
The transposition deadline was 29 May 2026. None of the five was confirmed to have adopted the harmonised A–G scale with A = ZEB. PL is closest, with a draft A+..G regulation planned for 30 June 2026, but its publication was not confirmed.

### Cited Findings
- PL: the transposition deadline is cited as 29 May 2026 — [przejdznaoze.pl](https://przejdznaoze.pl/efektywnosc-energetyczna/klasy-energetyczne-budynkow-2026-kompletny-przewodnik-co-oznaczaja-litery-a-g-dla-twojego-domu/). Entry into force of the draft classes was planned for 30 June 2026 (MRiT's P. Perczyński, July 2025) — [GLOBEnergia](https://globenergia.pl/klasy-energetyczne-budynkow-juz-w-czerwcu-2026-roku/). An earlier plan was Q1 / 1 Jan 2026 — [GLOBEnergia 2024](https://globenergia.pl/nowe-swiadectwo-i-klasy-energetyczne-wiemy-juz-kiedy-wejda-w-zycie/). In March 2026 the ministry was still being asked whether it would be ready — [gramwzielone.pl](https://www.gramwzielone.pl/dom-energooszczedny/20322573/nowe-przepisy-o-klasach-energetycznych-budynkow-budza-sprzeciw-organizacji-spolecznych)
- PL: the proposed scale is A+..G, not the EPBD's "A0/A = ZEB" logic. An A+ class with EP ≤ 0 appears on one blog only — [certwell.pl](https://certwell.pl/nowy-wzor-swiadectwa-2026/)
- HU: the 9/2023 text contains no zero-emission building provisions — [njt.jog.gov.hu](https://njt.jog.gov.hu/jogszabaly/2023-9-20-8X). An NGO (MTVSZ) EPBD questionnaire leaflet from summer 2026 exists but was not read — [mtvsz.hu](https://mtvsz.hu/uploads/files/2026/BW-EPBD-questionnaire_HUleaflet-MTVSZmagyarford_2026nyar_honlapra.pdf)
- SK: no transposition act was found on slov-lex.

### Gaps
- CZ, SK, SI and HU EPBD-recast transposition status as of late 2026: no reliable source found. The BPIE "Energy Performance Certificates" v5 (June 2026) likely covers this but exceeded the fetch size limit — [BPIE](https://www.bpie.eu/wp-content/uploads/2026/06/Energy-Performance-Certificates-v5-Compressed.pdf)
- Whether the PL regulation was published in the Dziennik Ustaw: not confirmed (ISAP not checked successfully).

---

## 8. Documentation quality

### Cited Findings
- CZ: the full decree, including class multipliers and PEF, is freely available in HTML on zakonyprolidi.cz (Czech only) — [link](https://www.zakonyprolidi.cz/cs/2020-264). An English EPBD-CA country report exists — [CA EPBD CZ](https://cdn1.gopublic.dk/epbd/Media/638373601463026175/Implementation-of-the-EPBD-in-the-Czech-Republic.pdf)
- SK: free HTML and PDF annexes on slov-lex (Slovak) — [slov-lex](https://static.slov-lex.sk/static/SK/ZZ/2020/35/20200310.html)
- HU: free decree text on njt.jog.gov.hu. Key formulas and annexes are images or linked PDFs, and the class table is not in the decree text — [njt](https://njt.jog.gov.hu/jogszabaly/2023-9-20-8X)
- SI: free on uradni-list.si (archival after 28.02.2026; newer issues on PISRS). Thresholds are in plain text (Slovene) — [uradni-list.si](https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2023-01-0094)
- PL: the draft regulation is available only as signed consultation PDFs or DOCX; the final text was not found — [PIIB](https://lbs.piib.org.pl/wp-content/uploads/2025/06/Projekt-rozporzadzenia-28.05.2025_Po-uwagach.pdf)

---

## 9. Recommendation

- **SI: KEEP.** Classes A1..G use absolute thresholds on specific heating need Q'H,nd,an per Ause. This is a direct output of a monthly ISO 52016 engine, and the thresholds are officially published.
- **SK: KEEP (with caveat).** Classes A0..G use absolute primary-energy thresholds for single-family houses (A0 ≤ 54 kWh/(m²·a)). This needs a simplified systems and PEF layer, and SK PEF values still need sourcing.
- **HU: KEEP (with caveat).** The A+++..I scale is a % of a fixed 76 kWh/(m²·a) non-renewable PE requirement for residential (lighting excluded). PEF are published. The legal home of the class table and the requirement formula still need verifying. The brief's AA++..JJ scale is obsolete.
- **CZ: UNCERTAIN.** The relative scale (0.8/1.2/1.6/2.3/3.0/3.7 × ER) is well documented, but each case needs a reference-building run with Annex 1 reference parameters. That is doable, but the mapping is not a simple lookup.
- **PL: UNCERTAIN (lean DROP for now).** No official class scale is confirmed in force. The draft A+..G thresholds are unpublished and blog values conflict. Revisit once the MRiT regulation appears in the Dziennik Ustaw.
