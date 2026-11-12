# EPC schemes for new single-family dwellings: France and Ireland (state as of Nov 2026)

Research date: 2026-11-10. Items marked "(unverified)" come from background knowledge and were not confirmed by a source fetched in this session; they are repeated under Gaps.

## Q1. National calculation method and legal basis

### Takeaway
France runs two separate calculations: RE2020 (Th-BCE 2020 engine) for new-build compliance and the DPE (3CL-DPE-2021 method, set by the arrêté of 31 March 2021) for the A-G label. Ireland uses one tool, DEAP (v4.2.7, June 2025), for both the BER label and Part L compliance. DEAP is a monthly, single-zone calculation based on EN 13790. That makes it structurally close to a simplified EN ISO 52016 monthly engine.

### Cited Findings
**France**
- The DPE for dwellings rests on the arrêté of 31 March 2021, the "socle du DPE des logements en France métropolitaine". It was amended by the arrêté of 11 June 2026 (NOR VLOL2607636A, JORF n°0188, 13 Aug 2026), which applies to DPEs issued from 1 Jan 2027 — [MySweetImmo](https://www.mysweetimmo.com/2026/08/18/diagnostic-immobilier-ce-que-le-dpe-europeen-dira-en-plus-au-1er-janvier-2027/); [Seban Avocats](https://www.seban-associes.avocat.fr/?p=127429)
- The thresholds for small dwellings were changed by the arrêté of 25 March 2024 (amending Annex 5 of the 2021 arrêté), applicable from 1 July 2024 — [Légifrance JORFARTI000049446339](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049446339)
- RE2020 is the new-build regulation. Its indicators are Bbio (bioclimatic need, points), Cep (total primary energy), Cep,nr (non-renewable primary energy), plus carbon indicators (Ic_énergie, Ic_construction) and a summer comfort indicator (DH). The official guide was last updated in January 2024 — [Guide RE2020, ecologie.gouv.fr](https://www.ecologie.gouv.fr/sites/default/files/documents/guide_re2020_version_janvier_2024.pdf); [Wikipedia FR RE2020](https://fr.wikipedia.org/wiki/R%C3%A9glementation_environnementale_2020)
- A draft decree notified to the European Commission (TRIS notification 28008) transposes EPBD Articles 7 and 11 (zero-emission new buildings, fossil fuels) for new buildings — [EC TRIS 28008](https://technical-regulation-information-system.ec.europa.eu/en/notification/28008); a draft text on banning fossil fuels in new buildings went to public consultation in May 2026 — [consultation docx](https://www.consultations-publiques.developpement-durable.gouv.fr/IMG/docx/2026-05-05_dce_interdiction_fossile_neuf_v2.docx)

**Ireland**
- DEAP Manual v4.2.7 (June 2025) applies to BERs for new and existing dwellings from 2 June 2025 — [SEAI DEAP Manual 4.2.7](https://www.seai.ie/sites/default/files/publications/DEAP_Manual.pdf)
- From the same manual:
  - "The DEAP calculation framework is based on IS EN 13790" and draws heavily on the UK SAP.
  - The calculation is single zone, with one average mean internal temperature.
  - Space cooling is calculated "according to … EN ISO 52016-1:2017".
  - The manual also references EN ISO 52010-1 and 52018-1.
- Legal basis for BER display and advertising: S.I. 243 of 2012 (European Union (Energy Performance of Buildings) Regulations 2012) — [SEAI BER Advertising Guidelines, Issue 3, July 2026](https://www.seai.ie/sites/default/files/2026-07/BER-Combined-Advertising-Guidelines.pdf)
- New-dwelling compliance is set by Building Regulations Part L, TGD L 2022 (NZEB). It requires MPEPC 0.30, MPCPC 0.35 and RER ≥ 0.20, each calculated in DEAP — [TGD L 2022](https://assets.gov.ie/static/documents/technical-guidance-document-l-conservation-of-fuel-and-energy-dwellings-2022.pdf); [SEAI DEAP Guidance Document](https://www.seai.ie/sites/default/files/publications/DEAP_Guidance_Document.pdf)
- In April 2026 the housing minister signed new regulations transposing the recast EPBD. They introduce a new BER scale for ratings published from 24 May 2026 — [Passive House Plus](https://passivehouseplus.ie/news/government/new-ber-takes-effect-while-zeb-details-remain-unclear); [gov.ie press release](https://www.gov.ie/en/department-of-housing-local-government-and-heritage/press-releases/simplified-building-energy-ratings-ber-for-residential-properties-to-be-introduced-from-may-2026/)

### Inferences
- In Ireland one calculation drives both the label and compliance, so a shared engine can reproduce the BER logic directly.
- In France the label (DPE) and the new-build regulation (RE2020) are different calculations. For the web app, the DPE A-G thresholds are the ones to map to. RE2020 Cep is a compliance limit, not a label.

### Gaps
- Not fetched this session: the NOR or Légifrance URL of the base arrêté of 31 March 2021, and the decree number (décret 2020-1609, unverified).
- How a DPE is produced for a new RE2020 dwelling (unverified: it is generated from the RE2020 / Th-BCE study data rather than the 3CL method) was not confirmed.
- The number of the Irish S.I. signed in April 2026 was not found.

## Q2. Label scale and exact class thresholds

### Takeaway
- **France:** DPE classes A-G use a double threshold. The class is the worse of primary energy (kWhEP/m²/an) and GHG (kgCO2eq/m²/an).
  - Standard grid (> 40 m²), as CEP / EGES upper bounds:
    - A 70 / 6
    - B 110 / 11
    - C 180 / 30
    - D 250 / 50
    - E 330 / 70
    - F 420 / 100
  - G is anything at or above the F bound on either indicator.
  - Dwellings of 40 m² or less use an interpolated table.
- **Ireland:** BERs issued from 24 May 2026 use an 8-band primary energy scale, upper bounds in kWh/m²/yr:
  - A0 ≤ 42 (plus ZEB criteria)
  - A ≤ 75
  - B ≤ 150
  - C ≤ 225
  - D ≤ 275
  - E ≤ 325
  - F ≤ 375
  - G > 375
- The old 15-band A1-G3 scale applied to BERs issued up to 23 May 2026.

### Cited Findings
**France (arrêté of 25 March 2024 table, below 800 m altitude)**
- Thresholds for S_REF > 40 m², in kWh/m²/an and kg eqCO2/m²/an — [Légifrance](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049446339):

  | Threshold | CEP | EGES |
  |---|---|---|
  | a | 70 | 6 |
  | b | 110 | 11 |
  | c | 180 | 30 |
  | d | 250 | 50 |
  | e | 330 | 70 |
  | f | 420 | 100 |

- Class rules from the same text: A requires "CEP < CEP_a et EGES < EGES_a"; G applies if "CEP ≥ CEP_f ou EGES ≥ EGES_f". Classes B-F follow the same worst-of-both pattern — [Légifrance](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049446339)
- Small dwellings (S_REF ≤ 40 m²): thresholds come from a lookup table with one row per m² from 8 to 40 m². Intermediate values use linear interpolation ("Les valeurs intermédiaires sont déterminées par interpolation linéaire") — [Légifrance](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049446339). Selected rows (CEP/EGES upper bounds, A to F):

  | S_REF | A | B | C | D | E | F |
  |---|---|---|---|---|---|---|
  | ≤ 8 m² | 146/11 | 186/16 | 386/44 | 505/68 | 622/90 | 739/122 |
  | 20 m² | 88/8 | 128/13 | 230/34 | 300/54 | 385/74 | 476/104 |
  | 40 m² | 70/6 | 110/11 | 180/30 | 250/50 | 330/70 | 420/100 |

- Altitude rule: above 800 m in zones H1b, H1c and H2d, only the E and F thresholds change. For > 40 m² they become E 390/80 and F 500/110 — [Légifrance](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049446339)
- The climate label (étiquette climat) uses the EGES thresholds only — [Légifrance](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049446339)
- Source conflict: secondary sites give different small-dwelling values; for 25 m² one ladder reads ≤81/121/210/280/363/454 — [search summary pointing to dpe3cl.fr](https://dpe3cl.fr/classedpe). Use the Légifrance table.
- From 1 Jan 2027 the A-G thresholds are unchanged. A DPE in class A or B can carry an additional "A0" mention when all energy is renewable, electric or from an efficient network and no fossil-capable heating or DHW system is present. "« A0 » n'est pas une huitième classe" — [MySweetImmo](https://www.mysweetimmo.com/2026/08/18/diagnostic-immobilier-ce-que-le-dpe-europeen-dira-en-plus-au-1er-janvier-2027/)

**Ireland**
- New scale (BERs issued on or after 24 May 2026): A0, A, B, C, D, E, F, G. Upper bounds are 42*, 75, 150, 225, 275, 325, 375 and >375 kWh/(m²·y), where "* & ZEB2 Criteria" applies to A0 — [SEAI BER Advertising Guidelines, July 2026](https://www.seai.ie/sites/default/files/2026-07/BER-Combined-Advertising-Guidelines.pdf). Extracted from the certificate mock-up in that PDF; the bounds are read as "≤" by the same convention as the old scale.
- The new scale replaces 15 classes with 8 and removes the subcategories — [Passive House Plus](https://passivehouseplus.ie/news/government/new-ber-takes-effect-while-zeb-details-remain-unclear); [William Fry](https://www.williamfry.com/knowledge/new-ber-system-from-24-may-2026-what-do-you-need-to-know/)
- A0 needs all six ZEB criteria — [Engineers Ireland](https://www.engineersireland.ie/Engineers-Journal/News/six-locks-on-one-door-why-almost-nothing-in-ireland-will-earn-an-a0):
  - primary energy ≤ 42 kWh/m²/yr
  - ≤ 5 kgCO2eq/m²/yr
  - no on-site fossil fuel
  - ability to respond to grid signals
  - demand met by carbon-free sources
  - NZEB compliance (EPC, CPC and RER checks)
- Engineers Ireland also notes that because DEAP models the national grid supply, an all-electric dwelling currently meets the 42 kWh criterion by default — [Engineers Ireland](https://www.engineersireland.ie/Engineers-Journal/News/six-locks-on-one-door-why-almost-nothing-in-ireland-will-earn-an-a0)
- Old scale (BERs issued up to 23 May 2026; certificates stay valid for 10 years), lower bounds in kWh/m²/yr — [CSO background notes](https://www.cso.ie/en/releasesandpublications/ep/p-dber/domesticbuildingenergyratingsquarter12025/backgroundnotes); [SEAI Advertising Guidelines Section B](https://www.seai.ie/sites/default/files/2026-07/BER-Combined-Advertising-Guidelines.pdf):
  - A1 ≤ 25
  - A2 > 25, A3 > 50
  - B1 > 75, B2 > 100, B3 > 125
  - C1 > 150, C2 > 175, C3 > 200
  - D1 > 225, D2 > 260
  - E1 > 300, E2 > 340
  - F > 380
  - G > 450
- The old certificate also showed a CO2 indicator (kgCO2/m²/yr) that did not affect the class — [SEAI Advertising Guidelines](https://www.seai.ie/sites/default/files/2026-07/BER-Combined-Advertising-Guidelines.pdf)

### Inferences
- The Irish label is a single-indicator lookup on primary energy. A0 additionally needs boolean ZEB checks, which a web app can approximate (no fossil fuel, CO2 ≤ 5, PE ≤ 42).
- The French label needs both primary energy and CO2 per m². The engine must therefore carry carrier-specific CO2 factors, and dwellings under 40 m² need the interpolation table. That rarely matters for single-family houses.

### Gaps
- No primary SEAI or Statutory Instrument text was found that states the "≤" vs "<" convention at the new-scale boundaries. The seai.ie scale page returned 403.

## Q3. Indicator and reference floor area

### Takeaway
- **France (DPE):** the indicator is primary energy (CEP) and GHG emissions (EGES) per m² of S_REF, the surface habitable. RE2020 instead uses Bbio (need, points), Cep and Cep,nr.
- **Ireland (BER):** the indicator is primary energy per m² of total floor area (TFA), measured at internal dimensions. The certificate from May 2026 also shows final energy, energy demand, renewables share and operational GHG.

### Cited Findings
- The DPE class variables are CEP (kWh/m²/an) and EGES (kg eqCO2/m²/an), indexed by S_REF — [Légifrance](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049446339)
- The RE2020 indicators are Bbio, Cep, Cep,nr, Ic and DH — [Guide RE2020](https://www.ecologie.gouv.fr/sites/default/files/documents/guide_re2020_version_janvier_2024.pdf)
- The BER is "expressed as primary energy use per unit floor area per year (kWh/m2/yr)". It covers space heating, water heating, ventilation and lighting under standard occupancy — [SEAI Advertising Guidelines](https://www.seai.ie/sites/default/files/2026-07/BER-Combined-Advertising-Guidelines.pdf)
- DEAP results are given "both total and per m2 of total floor area". Standard occupancy is N = 1 + 1.76·(1−exp(−0.000349·(TFA−13.9)²)) + 0.0013·(TFA−13.9), with N = 1 for TFA ≤ 13.9 m² — [DEAP Manual 4.2.7](https://www.seai.ie/sites/default/files/publications/DEAP_Manual.pdf)
- Floor areas entered in DEAP are "the internal floor areas for each level", and element areas use internal dimensions — [DEAP Manual 4.2.7](https://www.seai.ie/sites/default/files/publications/DEAP_Manual.pdf)
- The new-scale certificate shows annual primary energy, final energy, building energy demand, renewable share and production, operational GHG (kgCO2eq/(m²·y)) and GWP — [SEAI Advertising Guidelines](https://www.seai.ie/sites/default/files/2026-07/BER-Combined-Advertising-Guidelines.pdf); [Passive House Plus](https://passivehouseplus.ie/news/government/new-ber-takes-effect-while-zeb-details-remain-unclear)

### Gaps
- Not confirmed with a primary source:
  - The exact DPE definition of S_REF (surface habitable per CCH R.156-1, unverified).
  - The RE2020 reference area (SREF, unverified), and whether the DPE for new builds uses SHAB or SREF.
  - The end uses in the French CEP (5 uses: heating, cooling, DHW, lighting, auxiliaries — unverified for the DPE).

## Q4. Reference climate data

### Takeaway
- **France:** zoned climate, with 8 zones (H1a, H1b, H1c, H2a, H2b, H2c, H2d, H3) and altitude corrections. The DPE thresholds themselves depend on altitude only for E and F above 800 m.
- **Ireland:** BER uses a single national climate, Dublin Airport (Met Éireann long-term averages).

### Cited Findings
- The DPE text references zones H1b, H1c and H2d for the altitude rule above 800 m — [Légifrance](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049446339)
- DEAP uses a solar algorithm "based on Met Eireann long term average records for Dublin Airport". The heat pump calculation uses "climate data for Dublin" from ASHRAE IWEC v2.0 — [DEAP Manual 4.2.7](https://www.seai.ie/sites/default/files/publications/DEAP_Manual.pdf)

### Inferences
- Ireland is trivial for a shared engine: one monthly climate file (Dublin).
- France needs 8 monthly climate datasets, or a simplified subset such as H1a, H2b and H3.

### Gaps
- The official 3CL-2021 monthly temperature and irradiance tables per zone (in the Annex of the 31 March 2021 arrêté) were not fetched.
- The RE2020 Cep_max modulation by zone (Mcgéo) was not retrieved.

## Q5. Primary energy and CO2 factors

### Takeaway
- **France (DPE):** the electricity primary energy factor was 2.3 from 2021 and 1.9 from 1 Jan 2026 (arrêté of 13 Aug 2025). It drops to 1.7 for DPEs from 1 Jan 2027 (arrêté of 19 Aug 2026, which repeals the 2025 arrêté). Gas and oil are unaffected. RE2020 keeps 2.3.
- **Ireland (DEAP 4.2.7):** mains gas has PEF 1.1 and 0.203 kgCO2/kWh. Electricity factors are published separately by SEAI and updated as the national energy balance changes. The 2017 value was 2.08; a later reported update was 2.19 / 0.473.

### Cited Findings
**France**
- Electricity factor history: about 2.58 → 2.3 (2021) → 1.9 (1 Jan 2026) → 1.7 (1 Jan 2027). The final arrêté of 19 Aug 2026 was published in JORF n°0198 on 26 Aug 2026 and repeals the arrêté of 13 Aug 2025. DPEs issued up to 31 Dec 2026 are still calculated at 1.9. Gas and fuel oil are not affected — [Selectra](https://selectra.info/energie/actualites/renovation-energetique/dpe-2027-coefficient-electricite-passoires-sans-travaux); [MySweetImmo 27 Aug 2026](https://www.mysweetimmo.com/2026/08/27/dpe-immobilier-2027-300-000-logements-pourraient-sortir-de-f-ou-g/)
- The 2.3 → 1.9 change took effect on 1 Jan 2026 for the DPE; the government framed it as favouring electric heating — [economie.gouv.fr](https://economie.gouv.fr/actualites/un-nouveau-dpe-au-1er-janvier-2026-pour-favoriser-le-chauffage-electrique) (page returned 403; title and date from search listing); [draft arrêté consultation](https://www.consultations-publiques.developpement-durable.gouv.fr/IMG/docx/projet_arrete_changement_de_facteur_electricite.docx)
- Source conflict: according to MySweetImmo, the arrêté of 11 June 2026 (content update from 1 Jan 2027) leaves "primary energy conversion coefficients" unchanged — [MySweetImmo 18 Aug 2026](https://www.mysweetimmo.com/2026/08/18/diagnostic-immobilier-ce-que-le-dpe-europeen-dira-en-plus-au-1er-janvier-2027/). The separate arrêté of 19 Aug 2026 does change electricity to 1.7 — [Selectra](https://selectra.info/energie/actualites/renovation-energetique/dpe-2027-coefficient-electricite-passoires-sans-travaux). Both apply from 1 Jan 2027, so the "unchanged" statement refers only to the June arrêté.
- RE2020 for new builds keeps the 2.3 electricity coefficient — [search summary citing etude-bet.fr](https://www.etude-bet.fr/news/2026/re2020-tout-electrique-difficultes.php); [conseils-thermiques.org](https://conseils-thermiques.org/contenu/conversion_energie_primaire_finale.php) (secondary sources)

**Ireland**
- DEAP 4.2.7 Table 8 (renewable PEF / non-renewable PEF / total PEF / kgCO2 per kWh) — [DEAP Manual 4.2.7](https://www.seai.ie/sites/default/files/publications/DEAP_Manual.pdf):

  | Fuel | Ren. PEF | Non-ren. PEF | Total PEF | kgCO2/kWh |
  |---|---|---|---|---|
  | Mains gas | 0 | 1.1 | 1.1 | 0.203 |
  | Bulk / bottled LPG | 0 | 1.1 | 1.1 | 0.232 |
  | Heating oil | 0 | 1.1 | 1.1 | 0.272 |
  | Wood logs / pellets / chips | 1 | 0.1 | 1.1 | 0.025 |
  | House coal | 0 | 1.1 | 1.1 | 0.361 |
  | DH, waste-combustion boilers | 0 | 1.1 | 1.1 | 0.057 |
  | DH, waste heat from power stations | 0 | 1.05 | 1.05 | 0.018 |

- Electricity in Table 8 is footnote (8): factors "are published here" and "updated as new national energy balance figures become available". Specific district heating schemes use scheme-specific default factors — [DEAP Manual 4.2.7](https://www.seai.ie/sites/default/files/publications/DEAP_Manual.pdf); [SEAI DH factors](https://www.seai.ie/sites/default/files/ber/support-for-ber-assessors/deap/District-Heating-factors-for-BER-calculations.pdf)
- 2017 SEAI derivation: electricity PEF 2.08, based on 2018 forecasts — [SEAI DEAP-Elec-Factors-2017](https://www.seai.ie/sites/default/files/publications/DEAP-Elec-Factors-2017.pdf). An SEAI document gives 2022-2030 forecasts and says DEAP software updates the electricity factors annually — [SEAI PrimaryEnergyCO2FactorsElectricity](https://www.seai.ie/sites/default/files/publications/PrimaryEnergyCO2FactorsElectricity.pdf)
- A third-party post reports electricity PEF 2.19 and 0.473 kgCO2/kWh, down from 2.37 / 0.522 (older; date unclear) — [LinkedIn, S. Kavanagh](https://www.linkedin.com/pulse/deap-updates-electricity-heat-pumps-shay-kavanagh)

### Inferences
- Both countries use time-varying electricity factors. The app should store factors per country and per year rather than hard-code them.
- For Ireland, the current (2026) electricity PEF must be taken from the SEAI factors document.

### Gaps
- Not found:
  - The current (2026) DEAP electricity PEF and CO2 factor; the PDF numbers were not extracted.
  - The French DPE CO2 factors (unverified: electricity heating about 0.079 kgCO2/kWh, gas 0.227).
  - The PEF for French district heating networks (network-specific per arrêté, unverified).

## Q6. Absolute thresholds or relative to a reference building?

### Takeaway
Both labels use absolute thresholds: fixed kWh/m² bands, plus kgCO2/m² in France. The new-build compliance rules differ. Ireland's Part L is relative to a reference dwelling (EPC/CPC ratios). France's RE2020 sets absolute maxima, modulated by location, size and other factors.

### Cited Findings
- The DPE classes are fixed CEP and EGES values — [Légifrance](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049446339)
- The BER bands are fixed kWh/m²/yr values — [SEAI Advertising Guidelines](https://www.seai.ie/sites/default/files/2026-07/BER-Combined-Advertising-Guidelines.pdf)
- Part L new dwellings: EPC ≤ 0.30 and CPC ≤ 0.35, each relative to a reference dwelling, and RER ≥ 0.20 — [TGD L 2022](https://assets.gov.ie/static/documents/technical-guidance-document-l-conservation-of-fuel-and-energy-dwellings-2022.pdf); [SEAI DEAP Guidance](https://www.seai.ie/sites/default/files/publications/DEAP_Guidance_Document.pdf)
- RE2020 average maxima for maisons individuelles are Bbio_max 63, Cep_max 75 and Cep,nr_max 55 kWhep/m²/an. These are modulated by project (location, surface) — secondary sources [re2020-enligne.fr](https://re2020-enligne.fr/comprendre-la-re2020/re2020-maison-individuelle/); [construires.fr](https://www.construires.fr/reglementation-thermique/rt-cep/)

### Gaps
- The exact RE2020 modulation formulas (Bbio_maxmoyen × (1 + Mbgéo + Mbcombles + Mbsurf_moy + Mbsurf_tot + Mbbruit), unverified) were not fetched from the arrêté of 4 Aug 2021.

## Q7. EPBD recast (2024/1275) transposition status

### Takeaway
- **Ireland:** transposed. It is the first of the two to move to an EPBD-style A0-G scale, live from 24 May 2026, with A0 = ZEB.
- **France:** partial and late. The DPE keeps A-G unchanged. From 1 Jan 2027 an "A0" mention is added to class A or B, but it is not an eighth class. Content updates (renewables, flexibility, low-temperature readiness) come via the arrêté of 11 June 2026. New-build ZEB rules are still a draft decree.

### Cited Findings
- Ireland: regulations signed April 2026 transpose the recast EPBD; the new scale applies from 24 May 2026; the IEQ parameters of the ZEB definition were still being finalised ("work is ongoing on this matter"); ZEB is due for public buildings by 1 Jan 2028 — [Passive House Plus](https://passivehouseplus.ie/news/government/new-ber-takes-effect-while-zeb-details-remain-unclear)
- Ireland: the government says every new home must reach A0 by 2030 — [search summary of gov.ie / CIF](https://cif.ie/?p=78843)
- France: the transposition deadline was 29 May 2026, and France said it could not meet it — [REHVA Journal](https://www.rehva.eu/rehva-journal/chapter/epbd-the-french-implementation-process); [MySweetImmo](https://www.mysweetimmo.com/2026/08/18/diagnostic-immobilier-ce-que-le-dpe-europeen-dira-en-plus-au-1er-janvier-2027/)
- France, arrêté of 11 June 2026 (applies to DPEs from 1 Jan 2027):
  - six new items: on-site renewable production, renewable share, main energy vector, remaining equipment life, grid flexibility, low-temperature readiness
  - the "A0" mention is added to class A or B
  - thresholds, coefficients and emission factors are unchanged by that arrêté
  
  — [MySweetImmo](https://www.mysweetimmo.com/2026/08/18/diagnostic-immobilier-ce-que-le-dpe-europeen-dira-en-plus-au-1er-janvier-2027/)
- France: the draft decree for new ZEB buildings and fossil-fuel rules (Art. 7 and 11) was notified to the EC — [EC TRIS 28008](https://technical-regulation-information-system.ec.europa.eu/en/notification/28008)

### Gaps
- Not found:
  - Whether France will ever re-scale the DPE so that A = ZEB.
  - The adoption status of the TRIS-notified decree as of Nov 2026.

## Q8. Documentation quality

### Takeaway
- **Ireland:** excellent. The full DEAP manual (≈ 200+ pages, English, free) includes fuel factor tables, and the band tables appear in SEAI and CSO publications. Some seai.ie / deapguide.seai.ie pages block automated access (403).
- **France:** thresholds are freely published on Légifrance (French only). The 3CL-2021 method is in long French annexes. Th-BCE / RE2020 engine documentation is large and French-only. English material is mostly secondary (estate agents, news).

### Cited Findings
- DEAP Manual 4.2.7 is a free PDF on seai.ie and cites the EN 13790 / EN ISO 52016 basis — [SEAI](https://www.seai.ie/sites/default/files/publications/DEAP_Manual.pdf)
- Irish BER band tables are published by the CSO and SEAI — [CSO](https://www.cso.ie/en/releasesandpublications/ep/p-dber/domesticbuildingenergyratingsquarter12025/backgroundnotes); [SEAI](https://www.seai.ie/sites/default/files/2026-07/BER-Combined-Advertising-Guidelines.pdf)
- The French DPE threshold tables are on Légifrance — [Légifrance](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049446339)
- English-language summaries exist only as secondary sources — [service-public.fr EN](https://www.service-public.gouv.fr/particuliers/vosdroits/F16096?lang=en); [The Local](https://www.thelocal.fr/20250915/what-dpe-energy-rating-change-means-for-some-french-homeowners)

## Q9. Recommendation

### Takeaway
- **Ireland: KEEP.** DEAP is itself a monthly EN 13790 / ISO 52016-family single-zone method with a single Dublin climate, absolute primary-energy bands (new A0-G, from 24 May 2026) and free English documentation. The one open input is the current electricity PEF from SEAI.
- **France: UNCERTAIN, leaning KEEP for the DPE label only.** The thresholds are absolute, public and simple. The app would need:
  - CO2 per m² as a second indicator
  - 8 climate zones
  - a year-dependent electricity PEF (2.3 / 1.9 / 1.7 from 2027)

  The real new-build path (RE2020 / Th-BCE, hourly, PEF 2.3) cannot be reproduced by a simplified monthly engine.

### Inferences
- A shared monthly engine can produce a credible "indicative DPE" for France. It should be clearly labelled as not RE2020 compliance. It would also differ from 3CL in its conventions: intermittency, DHW per m², and the 3CL auxiliaries.
- For Ireland, mapping the engine's PE/m² (Dublin climate, DEAP occupancy formula, Table 8 factors) onto the A0-G bands is close to the official method in structure.

### Gaps
- No peer-reviewed comparison of 3CL-2021 or DEAP against EN ISO 52016 monthly results was found in this session.
