# EPC label schemes for new single-family dwellings: Croatia, Romania, Bulgaria, Greece, Cyprus

Scope: whether each country's EPC label can be reproduced with one shared simplified monthly EN ISO 52016/52000-style engine plus a country-specific mapping to that country's label scale. Research date: Nov 2026. Many of the sources are from 2017–2022 and are marked as older where that matters. Search and tool budget was limited, so the Gaps sections matter.

Overall picture: two families of schemes.
- Absolute kWh/m² scales: Croatia (heating need Q''H,nd, single reference climate per region) and Romania (primary energy, Mc 001-2022). These map directly onto an engine output.
- Relative-to-reference scales: Greece (EP/EP_ref ratio, KENAK), Bulgaria (EP compared with the reference values Rr,ref/Rs,ref, RD-02-20-3) and Cyprus (SBEMcy reference-building ratio). To map these, the engine also has to compute the national reference building (Greece, Cyprus) or needs the published reference values (Bulgaria).

---

## 1. Calculation method/standard and legal basis

### Takeaway
Croatia: Technical Regulation (OG 128/2015 + amendments) and EPC Ordinance OG 88/2017, with a national algorithm and software. Romania: Mc 001-2022 methodology. Bulgaria: Ordinance RD-02-20-3/2022 (consolidated 1.03.2024), which explicitly references EN ISO 52000-family standards. Greece: KENAK 2017 + TOTEE 20701-1/2017, monthly quasi-steady ISO 13790. Cyprus: national methodology run in SBEMcy (CEN-based).

### Cited Findings
**Croatia (HR)**
- Legal basis: Technical regulation on energy savings and thermal protection in buildings (OG 128/2015, 70/2018, 73/2018, 86/2018, 102/2020). Ordinance on energy audit and energy certification (OG 88/2017). EPC control ordinance (OG 73/2015, 54/2020) — [EPBD-CA Croatia 2020](https://cdn1.gopublic.dk/epbd/Media/638373602039208336/Implementation-of-the-EPBD-in-Croatia-2020.pdf)
- Croatia has a national software tool for EPC calculation and an electronic EPC database — [EPBD-CA Croatia 2020](https://cdn1.gopublic.dk/epbd/Media/638373602039208336/Implementation-of-the-EPBD-in-Croatia-2020.pdf)
- The EPC is 4 pages. The energy class is expressed in two ways: Q''H,nd [kWh/(m²·a)] and Eprim [kWh/(m²·a)] — [EPBD-CA Croatia 2020](https://cdn1.gopublic.dk/epbd/Media/638373602039208336/Implementation-of-the-EPBD-in-Croatia-2020.pdf)
- EPC ordinance text (NN 88/2017, consolidated with NN 90/2020) — [zakon.hr](https://www.zakon.hr/c/podzakonski-propis/45406/pravilnik-o-energetskom-pregledu-zgrade-i-energetskom-certificiranju-%E2%80%93-procisceni-tekst); [PDF copy with amendments](http://thoriumaplus.com/wp-content/uploads/2020/08/Pravilnik-o-energetskom-pregledu-zgrade-i-energetskom-certificiranju-NN-88-17-NN-90-20-izvorni-s-izmjenama.pdf)
- A new Law on Energy Efficiency in Buildings is reported to be in force since 1 January 2026. This is a secondary real-estate source, not verified against Narodne novine — [regent.hr](https://regent.hr/en/blog/green-building-and-nzeb-standard-what-are-nearly-zero-energy-houses-and-why-does-the-eu-want-them-by-2030). A related parliamentary bill (PZE 217, Dec 2025) is on the Sabor site — [sabor.hr PZE 217](https://www.sabor.hr/sites/default/files/uploads/sabor/2025-12-04/154307/PZE_217.pdf)

**Romania (RO)**
- Mc 001-2022 is the national methodology for calculating building energy performance. It was approved by Ordin 16/2023 (per a Scribd copy of the document) — [Scribd Mc 001-2022](https://ro.scribd.com/document/620570595/Mc-001-2022-Metodologie-Calcul-Performanta-Energetica-Cladiri); [Forbes RO on publication](https://www.forbes.ro/?p=310286)
- Classification is based on total annual specific primary energy consumption (kWh/m²/year) on usable floor area. A separate CO2 class (kg CO2/m²·year) is also shown — [CLIMA 2022 paper, TU Delft proceedings](https://proceedings.open.tudelft.nl/clima2022/article/download/37/26/33)
- Eight classes A+..G apply to the total and also to each system (heating, DHW, cooling, ventilation, lighting) — [energynomics.ro](https://www.energynomics.ro/en/?p=178639)
- Older methodology (2006/2014 version) for comparison — [Metodologie iulie 2014](https://www.agendaconstructiilor.ro/files/files/2021/Metodologie_calcul_performanta_energetica_iulie2014.pdf); [EPBD-CA Romania 2018](https://cdn1.gopublic.dk/epbd/Media/638373596703127937/CA-EPBD-IV-Romania-2018.pdf)

**Bulgaria (BG)**
- Ordinance No. RD-02-20-3 of 9 Nov 2022 on technical requirements for the energy performance of buildings (State Gazette 92/2022) replaced Ordinance No. 7/2005. It was amended in State Gazette 18 of 1.03.2024. Official consolidated text — [SEEA consolidated RD-02-20-3 (1.03.2024)](https://www.seea.government.bg/documents/%D0%A0%D0%94-02-20-3_%D0%9D%D0%B0%D1%80%20%D0%B7%D0%B0%20%D0%95%D0%A5%20%D0%BD%D0%B0%20%D1%81%D0%B3%D1%80%D0%B0%D0%B4%D0%B8-%D0%9A%D0%BE%D0%BD%D1%81%D0%BE%D0%BB%D0%B8%D0%B4%D0%B8%D1%80%D0%B0%D0%BD%D0%B0%20%D1%81%20%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%D1%82%201.03.2024.pdf); [original text, eneffect.bg](https://www.eneffect.bg/storage/library/7_SiwTJZus.pdf); [NAMRB news](https://www.namrb.org/en/topical-information/v-sila-e-nova-naredba-za-tehnitcheskite-iziskvaniya-kam-energiynite-harakteristiki-na-sgradi)
- The ordinance text cites EN ISO 52000-1, EN ISO 52003-1, EN ISO 52010-1, EN ISO 52016-1, EN ISO 52018-1 and ISO/TR 52016-2. It uses the fP,tot / fP,nren / fP,ren factor notation and the RER (renewable energy ratio) of the EN ISO 52000 family. This came from my pdftotext extraction of the SEEA consolidated text; the Cyrillic did not decode, but the standard numbers and symbols did — [SEEA consolidated RD-02-20-3](https://www.seea.government.bg/documents/%D0%A0%D0%94-02-20-3_%D0%9D%D0%B0%D1%80%20%D0%B7%D0%B0%20%D0%95%D0%A5%20%D0%BD%D0%B0%20%D1%81%D0%B3%D1%80%D0%B0%D0%B4%D0%B8-%D0%9A%D0%BE%D0%BD%D1%81%D0%BE%D0%BB%D0%B8%D0%B4%D0%B8%D1%80%D0%B0%D0%BD%D0%B0%20%D1%81%20%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%D1%82%201.03.2024.pdf)
- Companion ordinance for certification: Ordinance E-RD-04-2/2022 on energy efficiency inspection, certification and assessment of energy savings — [Climate Laws of the World](https://climate-laws.org/document/ordinance-e-rd-04-2-2022-on-energy-efficiency-inspection-certification-and-assessment-of-energy-savings-in-buildings_2626?cfn=renewable+energy)

**Greece (GR)**
- KENAK revision: M.D. DEPEA/oik. 178581, GoG B' 2367/12.07.2017. TOTEE technical guidelines: M.D. DEPEA/oik.182365, GoG B' 4003/17.11.2017 — [EPBD-CA Greece 2020](https://cdn1.gopublic.dk/epbd/Media/638373599786588364/Implementation-of-the-EPBD-in-Greece-2020.pdf); [KENAK FEK B2367/2017 (ypen.gov.gr)](https://ypen.gov.gr/wp-content/uploads/2020/11/KENAK_FEK_B2367_2017.pdf)
- The method is a monthly quasi-steady-state approach (ISO 13790:2008, E2). Engineers enter data in the central buildingcert.gr system with the national software (TEE-KENAK). The methodology was last updated in 2017 — [BPIE EPBD.wise Greece (2026)](https://www.bpie.eu/wp-content/uploads/2026/05/EPBD_wise_Greece_05.pdf)
- TOTEE 20701-1/2017 (calculation guideline) — [easykenak docs mirror](https://docs.easykenak.gr/lib/exe/fetch.php?media=kenak%3Atotee_20701-1_2017_tee_1st_edition.pdf)

**Cyprus (CY)**
- The 'Methodology for Calculating the Energy Performance of Buildings' (MECI) documents all algorithms. It covers heating, cooling, ventilation, DHW and lighting, expressed in primary energy. It was revised in 2015 and is based on CEN standards — [EPBD-CA Cyprus 2020](https://cdn.ca-epbd.eu/epbd/Media/638373601753670260/Implementation-of-the-EPBD-in-Cyprus.pdf)
- SBEMcy is the only software approved by the Energy Service. Buildings are rated on calculated (asset) primary energy (kWh/m²·year) — [BUILD UP Cyprus CA report](https://build-up.ec.europa.eu/sites/default/files/Cyprus.pdf)

### Inferences
- Bulgaria is the only country of the five whose current legal text is explicitly built on the EN ISO 52000/52016 family. Greece and Cyprus use ISO 13790 monthly or SBEM-type methods. Croatia's algorithm is HRN EN ISO 13790-based (see Gaps). All are monthly or quasi-steady, so the methods are compatible with a shared simplified monthly engine.

### Gaps
- I did not verify the exact current Croatian algorithm document ("Algoritam za proračun potrebne energije za grijanje i hlađenje prostora zgrade prema HRN EN ISO 13790") or its version. Whether the 2026 Law changed the methodology is also unverified.
- Mc 001-2022 standards basis (52016 vs 13790): not confirmed from primary text.

---

## 2. Label scale and exact class thresholds

### Takeaway
HR: A+..G on Q''H,nd,ref (absolute, 15/25/50/100/150/200/250). RO: A+..G on primary energy, absolute and building-type specific; the numeric grid is not reliably confirmed. BG: A+..G relative to Rr,ref and Rs,ref. GR: A+..H as ratio EP/EP_ref (0.33/0.50/0.75/1.00/1.41/1.82/2.27/2.73). CY: A..G-type scale vs reference building; numeric bands not found.

### Cited Findings
**Croatia** — residential class by Q''H,nd,ref [kWh/(m²·a)] at reference climate data (NN 88/2017):
| Class | A+ | A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|---|---|
| Q''H,nd,ref ≤ | 15 | 25 | 50 | 100 | 150 | 200 | 250 | >250 |
- A+..C values — [zakon.hr NN 88/2017](https://www.zakon.hr/c/podzakonski-propis/45373/nn-88-2017-%281.9.2017.%29%2C-pravilnik-o-energetskom-pregledu-zgrade-i-energetskom-certificiranju); D..G values — [montazneidrvenekuce.info](https://www.montazneidrvenekuce.info/energetika/sto-je-energetski-razred-zgrade/261), [H2 Centar](http://www.h2centar.hr/energetski-certifikati/). These came from search snippets; the table should be checked in the official PDF.
- The EPC also shows an Eprim-based class — [EPBD-CA Croatia 2020](https://cdn1.gopublic.dk/epbd/Media/638373602039208336/Implementation-of-the-EPBD-in-Croatia-2020.pdf)
- Do NOT confuse with the FBiH (Bosnia) scale (A ≤45, B ≤95), which uses the same terminology — [ee.fmpu.gov.ba](http://ee.fmpu.gov.ba/razred/)

**Romania** — eight classes A+..G on total primary energy, with separate grids for individual houses and apartment blocks (Mc 001-2022 Table 5.7 for individual residential) — [Scribd Mc 001-2022](https://ro.scribd.com/document/620570595/Mc-001-2022-Metodologie-Calcul-Performanta-Energetica-Cladiri)
- Commercial sites give conflicting individual-house thresholds: A+ ≤ 86, A 86–122, B 122–243 kWh/m²·a; another source gives A+ ≤ 86 (with cooling) or ≤ 73 (without cooling) — [certificat-rapid.ro](https://www.certificat-rapid.ro/nseamna-clasele-energetice/); [certificat-energetic-rapid.ro](https://certificat-energetic-rapid.ro/blog/metodologia-mc-001-2022/); [cpeproiect.ro](https://www.cpeproiect.ro/mc-001-2022-vs-mc-001-2006/). UNVERIFIED.

**Bulgaria** — Art. 17 RD-02-20-3. Classes run from G (worst) to A/A+ (best). Table 1 thresholds are in terms of EP and two reference values per EN ISO 52003-1: Rr,ref (regulatory reference, the new-building requirement) and Rs,ref (building-stock reference). My best reading of the extracted table, with class labels lost in extraction and the order inferred:
| Class | Condition |
|---|---|
| A+ | EPmin ≤ EP < EPmax (separate definition, linked to the nZEB/RES criteria) |
| A | EP < 0.5·Rr,ref |
| B | 0.5·Rr,ref ≤ EP < Rr,ref |
| C | Rr,ref ≤ EP < 0.5·(Rr,ref + Rs,ref) |
| D | 0.5·(Rr,ref + Rs,ref) ≤ EP < Rs,ref |
| E | Rs,ref ≤ EP < 1.25·Rs,ref |
| F | 1.25·Rs,ref ≤ EP < 1.5·Rs,ref |
| G | EP ≥ 1.5·Rs,ref |
— [SEEA consolidated RD-02-20-3](https://www.seea.government.bg/documents/%D0%A0%D0%94-02-20-3_%D0%9D%D0%B0%D1%80%20%D0%B7%D0%B0%20%D0%95%D0%A5%20%D0%BD%D0%B0%20%D1%81%D0%B3%D1%80%D0%B0%D0%B4%D0%B8-%D0%9A%D0%BE%D0%BD%D1%81%D0%BE%D0%BB%D0%B8%D0%B4%D0%B8%D1%80%D0%B0%D0%BD%D0%B0%20%D1%81%20%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%D1%82%201.03.2024.pdf). A search summary independently confirms that class A is EP < 0.5·Rr,ref and class B is 0.5·Rr,ref to Rr,ref.
- New residential buildings must reach at least class B — [SEEA RD-02-20-3 search summary / NAMRB](https://www.namrb.org/en/topical-information/v-sila-e-nova-naredba-za-tehnitcheskite-iziskvaniya-kam-energiynite-harakteristiki-na-sgradi)
- OLDER (Ordinance 7, pre-2022) absolute residential scale: A < 95 (nZEB A band 48–95), B 96–190, C 191–240 kWh/m²·a primary energy — [EPBD-CA Bulgaria 2020](https://cdn1.gopublic.dk/epbd/Media/638373602326024100/Implementation-of-the-EPBD-in-Bulgaria-2020.pdf)

**Greece** — nine classes (Greek letters Α+, Α, Β+, Β, Γ, Δ, Ε, Ζ, Η, usually rendered A+..H) by ratio R = EP/EP_ref:
| Class | A+ | A | B+ | B | C (Γ) | D (Δ) | E | F (Ζ) | G/H (Η) |
|---|---|---|---|---|---|---|---|---|---|
| EP/EP_ref ≤ | 0.33 | 0.50 | 0.75 | 1.00 | 1.41 | 1.82 | 2.27 | 2.73 | >2.73 |
— [KENAK FEK B2367/2017](https://ypen.gov.gr/wp-content/uploads/2020/11/KENAK_FEK_B2367_2017.pdf); [KENAK draft 2017 (sate.gr)](https://sate.gr/nea/KENAK_09062017.pdf); the class bands were corroborated by [agrolisi.gr](https://agrolisi.gr/ti-einai-i-energeiaki-klasi-vathmides-p/) and [spitogatos.gr](https://www.spitogatos.gr/blog/ti-einai-i-energeiaki-katigoria-sta-akinita)
- New-building minimum was class B. nZEB = at least class A (new) and B+ (existing) — [EPBD-CA Greece 2020](https://cdn1.gopublic.dk/epbd/Media/638373599786588364/Implementation-of-the-EPBD-in-Greece-2020.pdf)

**Cyprus** — the energy class is set by the "reference value principle". New buildings need class B, and nZEB (from 2020/2021) means class A with ≥25% of primary energy from RES — [EPBD-CA Cyprus 2020](https://cdn.ca-epbd.eu/epbd/Media/638373601753670260/Implementation-of-the-EPBD-in-Cyprus.pdf)
- An older study cites an nZEB max of 100 kWh/m²·a primary energy for residential (2014 decree). Treat as OLD — [ResearchGate, Cyprus retrofit study](https://www.researchgate.net/publication/296307353_Retrofitting_towards_nZEB_-_a_Cyprus_case_study_for_residential_buildings)
- Secondary sources disagree on whether the scale is A–G or A–H — [estatefy.com](https://www.estatefy.com/cyprus/energy-certificate-in-cyprus-energy-certificate)

### Inferences
- HR maps trivially to an engine output (heating need per m² at a fixed reference climate). GR and CY need a second engine run for the national reference building (same geometry, prescribed U-values and systems), with the ratio then mapped. BG needs the published Rr,ref/Rs,ref values per building type and climate.

### Gaps
- Romania: the authoritative Table 5.7 total-primary-energy grid for individual houses was not confirmed.
- Bulgaria: numeric Rr,ref and Rs,ref values for single-family houses, and the exact A+ (EPmin/EPmax) definition. The Cyrillic text did not extract, so the PDF needs manual reading.
- Cyprus: numeric class bands (the ratio thresholds vs the reference building) were not found. The current EPC template was not checked.

---

## 3. Indicator and reference floor area

### Takeaway
HR: heating need Q''H,nd at reference climate (plus Eprim shown). RO: total primary energy (plus CO2 class). BG: primary energy EP (kWh/m²·a). GR: primary energy ratio to reference building. CY: primary energy relative to reference building. Area is usable/useful (conditioned) floor area everywhere, with differing definitions.

### Cited Findings
- HR: Q''H,nd and Eprim are per "useful area of the heated part of the building, AK (m²)". The 2018 amendment redefined AK — [EPBD-CA Croatia 2020](https://cdn1.gopublic.dk/epbd/Media/638373602039208336/Implementation-of-the-EPBD-in-Croatia-2020.pdf)
- HR Eprim for residential covers heating, cooling, ventilation and DHW. Lighting is added only for non-residential buildings — [EPBD-CA Croatia 2020](https://cdn1.gopublic.dk/epbd/Media/638373602039208336/Implementation-of-the-EPBD-in-Croatia-2020.pdf)
- RO: total primary energy per usable floor area, plus a GHG class in kg CO2/m²·a — [CLIMA 2022](https://proceedings.open.tudelft.nl/clima2022/article/download/37/26/33)
- BG: "integrated energy efficiency indicator", i.e. specific annual primary energy in kWh/m² — [EPBD-CA Bulgaria 2020](https://cdn1.gopublic.dk/epbd/Media/638373602326024100/Implementation-of-the-EPBD-in-Bulgaria-2020.pdf)
- GR: class determined by comparison with a national reference building, not by an absolute numeric indicator — [BPIE EPBD.wise Greece](https://www.bpie.eu/wp-content/uploads/2026/05/EPBD_wise_Greece_05.pdf). The reference building has the same geometry as the assessed building but standardised technical characteristics — [agrolisi.gr](https://agrolisi.gr/ti-einai-i-energeiaki-klasi-vathmides-p/)
- CY: reference building with predetermined U-values, thermal mass and system assumptions. Heating, cooling, DHW and lighting are included in primary energy — [BUILD UP Cyprus](https://build-up.ec.europa.eu/sites/default/files/Cyprus.pdf)

### Gaps
- Exact floor-area definitions (internal vs gross, treatment of unheated spaces) were not verified for RO, BG, GR, CY.

---

## 4. Reference climate data

### Takeaway
HR: two reference stations (Zagreb-Maksimir continental, Split-Marjan littoral). GR: 4 zones A–D. RO: climate zones I–V (the nZEB limits differ by zone). BG: climatic zones (number not verified in this pass; historically 9). CY: SBEMcy climate regions (not verified).

### Cited Findings
- HR: the class is computed with reference climate data. Littoral Croatia uses the Split (Marjan) station and continental Croatia uses Zagreb (Maksimir) — [zakon.hr NN 88/2017](https://www.zakon.hr/c/podzakonski-propis/45373/nn-88-2017-%281.9.2017.%29%2C-pravilnik-o-energetskom-pregledu-zgrade-i-energetskom-certificiranju) (via search snippet)
- HR requirements are split continental/littoral. Family-house NZEB Eprim ≤ 45 (continental) / 35 (littoral) kWh/m²·a. Pre-NZEB new family house Eprim ≤ 115 / 70 — [EPBD-CA Croatia 2020](https://cdn1.gopublic.dk/epbd/Media/638373602039208336/Implementation-of-the-EPBD-in-Croatia-2020.pdf)
- PassREg lists Q''H,nd requirement figures of 41 (continental) / 33 (littoral) kWh/m²·a. They are older and unverified — [PassREg wiki EPBD in Croatia](https://passregsos.passiv.de/wiki/EPBD_in_Croatia.html)
- GR: 4 climatic zones A–D. New-building U-value limits, e.g. external wall 0.55/0.45/0.40/0.35 and roof 0.45/0.40/0.35/0.30 W/m²K. Max mean Um depends on F/V — [EPBD-CA Greece 2020](https://cdn1.gopublic.dk/epbd/Media/638373599786588364/Implementation-of-the-EPBD-in-Greece-2020.pdf)
- RO: nZEB primary-energy maxima for individual houses quoted as 120.1 (zone I), 127.9 (zone II), 133.3 (zone III) kWh/m²·a. Commercial source, unverified — [cpeproiect.ro nZEB 2026](https://www.cpeproiect.ro/cerinte-nzeb-pentru-locuinta-individuala-2026-ce-verifica-autoritatile-la-dtac/)
- BG: the long-term strategy refers to cost-effective approaches "relevant to the building type and climatic zone" — [EPBD-CA Bulgaria 2020](https://cdn1.gopublic.dk/epbd/Media/638373602326024100/Implementation-of-the-EPBD-in-Bulgaria-2020.pdf)

### Inferences
- HR is ideal for a demo: the label uses a single reference climate per region, independent of the actual site.

### Gaps
- Degree-day values per zone were not collected for any country. Number and definition of BG and CY climate zones, and of RO zones I–V, were not verified from primary text.

---

## 5. Primary energy factors

### Takeaway
Only partial data. BG uses EN ISO 52000-1 fP,tot/fP,nren/fP,ren notation. The RO values found come from a 2026 BPIE scenario table, not confirmed as Mc 001-2022 legal values. HR, GR and CY PEFs were not verified in this pass.

### Cited Findings
- RO (BPIE 2026 modelling assumptions): electricity 2.5 (base) falling to 2.4 (2027), 2.3 (2030), 2.2 (2033), 2.1 (2035), 2.0. District heating 1.5 to 1.45, 1.4, 1.35, 1.3, 1.25. Gas about 1.1. Oil 1.1, biomass 1.13. The table layout is garbled in extraction — [BPIE D3.2 Romania (2026)](https://www.bpie.eu/wp-content/uploads/2026/05/Report_D3.2_Romania_v3.pdf)
- BG: factors are defined as fP,tot = fP,nren + fP,ren per energy carrier, EN ISO 52000-1 style. Numeric values were not extracted — [SEEA consolidated RD-02-20-3](https://www.seea.government.bg/documents/%D0%A0%D0%94-02-20-3_%D0%9D%D0%B0%D1%80%20%D0%B7%D0%B0%20%D0%95%D0%A5%20%D0%BD%D0%B0%20%D1%81%D0%B3%D1%80%D0%B0%D0%B4%D0%B8-%D0%9A%D0%BE%D0%BD%D1%81%D0%BE%D0%BB%D0%B8%D0%B4%D0%B8%D1%80%D0%B0%D0%BD%D0%B0%20%D1%81%20%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%D1%82%201.03.2024.pdf)
- CY: an EPISCOPE report gives electricity PEF 2.5 for buildings meeting the 2010/2015 requirements. Electricity comes from a single carrier (EAC). OLD — [EPISCOPE SR1 (CUT mirror)](http://web.cut.ac.cy/episcope/wp-content/uploads/sites/25/2015/07/EPISCOPE_SR1_NewBuildingsInTypologies.pdf)

### Gaps
- HR, GR and CY official PEF tables were not verified. From memory, and NOT verified: GR TOTEE 20701-1/2017 uses electricity 2.9, natural gas 1.05, heating oil 1.1, district heating about 0.7. Do not use without checking TOTEE 20701-1.
- RO official Mc 001-2022 PEFs, and BG numeric fP values, still need extraction.

---

## 6. Absolute thresholds or relative to a reference building?

### Takeaway
Absolute: HR (Q''H,nd,ref), RO (primary energy). Relative: GR (EP/EP_ref ratio), CY (reference building), BG (relative to tabulated reference values Rr,ref/Rs,ref, which are fixed numbers per building type, so the result is effectively absolute once known).

### Cited Findings
- GR: relative to the reference building — [BPIE EPBD.wise Greece](https://www.bpie.eu/wp-content/uploads/2026/05/EPBD_wise_Greece_05.pdf)
- CY: "reference value principle" — [EPBD-CA Cyprus 2020](https://cdn.ca-epbd.eu/epbd/Media/638373601753670260/Implementation-of-the-EPBD-in-Cyprus.pdf)
- BG: Rr,ref/Rs,ref per EN ISO 52003-1 — [SEEA consolidated RD-02-20-3](https://www.seea.government.bg/documents/%D0%A0%D0%94-02-20-3_%D0%9D%D0%B0%D1%80%20%D0%B7%D0%B0%20%D0%95%D0%A5%20%D0%BD%D0%B0%20%D1%81%D0%B3%D1%80%D0%B0%D0%B4%D0%B8-%D0%9A%D0%BE%D0%BD%D1%81%D0%BE%D0%BB%D0%B8%D0%B4%D0%B8%D1%80%D0%B0%D0%BD%D0%B0%20%D1%81%20%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%D1%82%201.03.2024.pdf)
- HR, RO: absolute kWh/m²·a — sources as in Q2.

### Gaps
- Whether BG's Rr,ref is a fixed tabulated value or computed per building from a notional building was not confirmed.

---

## 7. Transposition of the EPBD recast (Directive (EU) 2024/1275)

### Takeaway
Under the recast, the harmonised A–G scale with A = ZEB applies from 29 May 2026. Member States that rescaled after 2019 may defer to 31 Dec 2029. I found no confirmation that any of the five countries has adopted the new scale by Nov 2026. Greece explicitly still needs to rescale.

### Cited Findings
- Recast requirements: A–G harmonised by 29 May 2026 (derogations apply), A = ZEB, G = worst performers in the national stock, optional A+. Rescaling can be deferred to 31 Dec 2029 for post-2019 rescales — [BPIE EPBD.wise Greece](https://www.bpie.eu/wp-content/uploads/2026/05/EPBD_wise_Greece_05.pdf)
- GR: the existing scale "will have to be recalibrated". A ZEB-linked class A and a numeric kWh/m²·a indicator are not yet in place. Status table: "Need to rescale by 29 May 2026" — [BPIE EPBD.wise Greece](https://www.bpie.eu/wp-content/uploads/2026/05/EPBD_wise_Greece_05.pdf)
- RO: BPIE 2026 report on Article 9 transposition notes the requirement to recalibrate EPC classes (A–G) by 2026 — [BPIE D3.2 Romania](https://www.bpie.eu/wp-content/uploads/2026/05/Report_D3.2_Romania_v3.pdf)
- HR: a new Law on Energy Efficiency in Buildings is reportedly in force from 1 Jan 2026 (secondary source). Whether it rescales to A–G is unverified — [regent.hr](https://regent.hr/en/blog/green-building-and-nzeb-standard-what-are-nearly-zero-energy-houses-and-why-does-the-eu-want-them-by-2030); [sabor.hr PZE 217](https://www.sabor.hr/sites/default/files/uploads/sabor/2025-12-04/154307/PZE_217.pdf)
- BG: RD-02-20-3 (2022, amended 2024) already uses EN ISO 52003-1 reference-value logic, which could ease rescaling — [SEEA consolidated RD-02-20-3](https://www.seea.government.bg/documents/%D0%A0%D0%94-02-20-3_%D0%9D%D0%B0%D1%80%20%D0%B7%D0%B0%20%D0%95%D0%A5%20%D0%BD%D0%B0%20%D1%81%D0%B3%D1%80%D0%B0%D0%B4%D0%B8-%D0%9A%D0%BE%D0%BD%D1%81%D0%BE%D0%BB%D0%B8%D0%B4%D0%B8%D1%80%D0%B0%D0%BD%D0%B0%20%D1%81%20%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%D1%82%201.03.2024.pdf)

### Inferences
- All five scales are likely to change between 2026 and 2029. Build the label mapping as a versioned per-country config ("current scale" vs "EPBD-2024 scale, pending").

### Gaps
- No primary source found on the adoption status of the recast scale in any of the five countries as of Nov 2026. Cyprus and Bulgaria rescaling status: nothing found.

---

## 8. Documentation quality

### Takeaway
HR: good (official texts free on narodne-novine/zakon.hr, thresholds simple; Croatian only). GR: good (FEK and TOTEE free, Greek only; ratios published). BG: official text free but long (11k lines), Bulgarian only, reference values buried. RO: Mc 001-2022 is hard to get freely (Scribd/commercial copies), numbers conflict online. CY: weak (thresholds not found; SBEMcy-bound).

### Cited Findings
- EPBD-CA 2020 English country reports exist for all five, for example [HR](https://cdn1.gopublic.dk/epbd/Media/638373602039208336/Implementation-of-the-EPBD-in-Croatia-2020.pdf), [BG](https://cdn1.gopublic.dk/epbd/Media/638373602326024100/Implementation-of-the-EPBD-in-Bulgaria-2020.pdf), [GR](https://cdn1.gopublic.dk/epbd/Media/638373599786588364/Implementation-of-the-EPBD-in-Greece-2020.pdf), [CY](https://cdn.ca-epbd.eu/epbd/Media/638373601753670260/Implementation-of-the-EPBD-in-Cyprus.pdf), and [RO 2018](https://cdn1.gopublic.dk/epbd/Media/638373596703127937/CA-EPBD-IV-Romania-2018.pdf). They do not contain the class tables (GR, HR) or give only older scales (BG).
- BPIE EPBD.wise (2026) gives an English summary for GR — [BPIE](https://www.bpie.eu/wp-content/uploads/2026/05/EPBD_wise_Greece_05.pdf)

### Gaps
- Free official MDLPA download of Mc 001-2022 was not located.

---

## 9. Recommendation

| Country | Rec. | One-line reason |
|---|---|---|
| Croatia | **KEEP** | Absolute A+..G scale on heating need Q''H,nd at fixed reference climate (Zagreb/Split): an ideal fit for a monthly 52016-style heating-need engine. Thresholds 15/25/50/100/150/200/250 are well documented. |
| Greece | **KEEP (with reference-building run)** | Published ratio thresholds (0.33…2.73) and 4 zones with tabulated reference U-values. The engine runs twice (actual and reference) and maps EP/EP_ref. A rescale is pending. |
| Romania | **UNCERTAIN** | Absolute primary-energy A+..G scale fits well, but the authoritative Mc 001-2022 house grid and PEFs were not verified (online figures conflict). |
| Bulgaria | **UNCERTAIN** | Method is explicitly EN ISO 52000/52016-based (best methodological fit), but classes are relative to Rr,ref/Rs,ref values not yet extracted from a Bulgarian-only text. |
| Cyprus | **DROP** (or low priority) | Rating is tied to SBEMcy reference-building logic, numeric bands are unpublished or unfound, and it is a small market. |

### Gaps
- The recommendations for RO and BG would move to KEEP once Mc 001-2022 Table 5.7 and the BG Rr,ref/Rs,ref values for single-family houses are extracted.
