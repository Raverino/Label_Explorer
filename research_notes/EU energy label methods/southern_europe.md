# EPC schemes for new single-family dwellings: Spain, Portugal, Italy, Malta

Research date: 10 Nov 2026. Scope: can one simplified monthly EN ISO 52016/52000-style engine compute the energy need, with the result then mapped onto each national label? Values that could not be verified against a primary or near-primary source are listed under Gaps and marked "unverified (domain knowledge)". Do not use them in the app until they are checked.

## 1. National calculation method, standard and legal basis

### Takeaway
All four countries have a national legal method with official software: ES (CTE DB-HE + RD 390/2021, HULC/CE3X), PT (DL 101-D/2020 + Portarias/Despachos, SCE), IT (DM 26/06/2015 + UNI/TS 11300) and MT (LN 47/2018, EPRDM for dwellings). Spain and Italy have the most transparent published methods.

### Cited Findings
- **ES:** The Documento Reconocido "Calificación de la eficiencia energética de los edificios" (MITECO + MITMA, February 2023 version) follows Real Decreto 390/2021, which applies Directives 2010/31/EU and 2018/844. Calculation conditions, climate files (.MET for every climate zone) and use profiles come from CTE DB-HE (Anejo D). The procedure follows the Documento Reconocido "Condiciones técnicas de los procedimientos para la evaluación de la eficiencia energética". The cover reads "Aplicación a partir de la fecha: XX de XXXX de XXXX", so the downloaded copy may be a pre-publication version. — [eic.cat copy of MITECO/MITMA document](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **ES:** The CTE climate files are published at codigotecnico.org/DocumentosCTE/AhorroEnergia.html. — [same document §2.2](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **PT:** Portaria n.º 138-I/2021 (1 July 2021, in force from 1 July 2021) "regulamenta os requisitos mínimos de desempenho energético relativos à envolvente dos edifícios e aos sistemas técnicos". It is issued under Decreto-Lei 101-D/2020 (Art. 6(12), 9(2)(f), 11(2), 13(4), 14(5)). Annex I covers the envelope and Annex II the technical systems. Thermal zones are defined in the "Manual SCE". — [vLex preview of Portaria 138-I/2021](https://vlex.pt/vid/portaria-n-138-i-870174555); official ELI: https://data.dre.pt/eli/port/138-I/2021/07/01/p/dre
- **PT (history):** DL 118/2013 created SCE, REH and RECS. Portaria 349-B/2013 set the method for determining the energy class. Both were later replaced by DL 101-D/2020. — [Informador.pt, Portaria 349-B/2013](https://informador.pt/legislacao/diploma/portaria-n-o-349-b-2013/)
- **IT:** Three DMs dated 26 June 2015 ("Requisiti Minimi", "Linee Guida" APE, "Relazioni Tecniche") were published in the GU on 15 July 2015 to implement Legge 90/2013, which transposed the 2010 EPBD. The classification is built with the reference-building (edificio di riferimento) method. — [UNI U&C n°5 May 2016 dossier, via infobuildenergia](https://www.infobuildenergia.it/Allegati/6998.pdf)
- **IT:** A decree of 28/10/2025 (Ministero dell'Ambiente e della Sicurezza Energetica) amends Art. 4 of DM 26/06/2015 and suppresses comma 2. The content could not be read because of a 403 error. — [Legislazione Tecnica listing](https://legislazionetecnica.it/lt_link/normativa/RE1BU0UyOE8yMDI1) (search snippet only)
- **IT:** Official decree page. — [MIMIT DM 26 giugno 2015 linee guida](https://www.mimit.gov.it/it/normativa/decreti-interministeriali/decreto-interministeriale-26-giugno-2015-adeguamento-linee-guida-nazionali-per-la-certificazione-energetica-degli-edifici)
- **MT:** EPCs came in with LN 261/2008 and are mandatory for dwellings built, sold or rented after 2 Jan 2009. EPRDM (Energy Performance of Residential Dwellings in Malta) for dwellings and iSBEMmt for non-dwellings became the approved national methods through Government Notices 1025 and 1035 of 2015. A design rating applies before construction and an asset rating after. Certificates are valid for 10 years and held in a central database. — [EPBD CA, Implementation of the EPBD in Malta, Status 2020](https://cdn1.gopublic.dk/epbd/Media/638373597951393601/Implementation-of-the-EPBD-in-Malta--Status-in-2020.pdf)
- **MT:** The current regulations are S.L. 623.01, Energy Performance of Buildings Regulations (LN 47/2018 as amended, incl. LN 134/2020, which transposed 2018/844). They refer to Technical Document F (2023) Part 1 for dwellings. A consolidated copy was uploaded to the BCA site in July 2026. — [bca.gov.mt SL 623.01](https://bca.gov.mt/wp-content/uploads/2026/07/sl-623-01-eng.pdf); [TD F Part 1](https://bca.gov.mt/wp-content/uploads/2025/02/technical-document-F-part-1-1.pdf) (search snippets)

### Inferences
- ES (HULC/CE3X are hourly or quasi-steady state tools following ISO 52016-type logic) and IT (UNI/TS 11300, monthly quasi-steady state, ISO 13790-derived) are structurally closest to a monthly ISO 52016 engine. Italy's UNI/TS 11300 is itself a monthly method, so it is the best fit.
- Malta's EPRDM is a national SAP/SBEM-like tool, and its documentation is thin.

### Gaps
- I did not verify whether HULC moved fully to the ISO 52016-1 hourly engine, or which version is current in 2026.
- I could not read the Portuguese annex text (DRE returned an empty page; vLex is paywalled).
- I could not read the content of the Italian DM 28/10/2025.

## 2. Label scale and exact class thresholds

### Takeaway
ES: A–G, set by indices C1/C2 against climate-zone statistics, with separate ratings for EPnren and CO2. PT: A+–F on the ratio R = Ntc/Nt. IT: A4–G as multiples of the reference building's EP_gl,nren. MT: dwellings get a numeric scale (kWh/m²·yr plus CO2), not clear A–G bands.

### Cited Findings
- **ES Table 1 (vivienda):** A: C1 < 0.15. B: 0.15 ≤ C1 < 0.50. C: 0.50 ≤ C1 < 1.00. D: 1.00 ≤ C1 < 1.75. E: C1 ≥ 1.75 and C2 < 1.00. F: C1 ≥ 1.75 and 1.00 ≤ C2 < 1.50. G: C1 ≥ 1.75 and C2 ≥ 1.50. This applies to single-family and block dwellings, for each indicator separately. — [MITECO/MITMA doc, Tabla 1](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **ES formulas:** C1 = (R·Io/Ir − 1) / (2(R − 1)) + 0.6 and C2 = (R′·Io/Is − 1) / (2(R′ − 1)) + 0.5. Io is the building's indicator. Ir is the mean of the new-dwelling reference stock. R is Ir divided by the 10th-percentile value of that stock. Is and R′ are the same for existing stock. (The PDF text extracts as "−12(R−1)", which is a broken fraction 1/2(R−1); the standard form is shown above.) — [same, eq. (1)–(2)](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **ES Annex IV** gives ready-made upper class limits by climate zone. Single-family dwellings, peninsula, zone D3, total EPnren [kWh/m²·yr]: A < 54.2, B < 87.8, C < 136.1, D < 209.3, E < 375.6, F < 473.2, G ≥ 473.2. CO2 total [kgCO2e/m²·yr]: A 12.2, B 19.9, C 30.8, D 47.3, E 83.7, F 100.4. Zone C2 EPnren: A 39.7, B 64.4, C 99.9, D 153.6, E 272.5, F 318.8. Zone E1 EPnren: A 67.7, B 104.0, C 155.2, D 231.1, E 442.6, F 517.8. Zone A3 EPnren: A 19.1, B 36.3, C 61.4, D 98.4, E 181.8, F 212.7. — [same, Tabla IV.1](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **ES reference means, Table III.1 (new single-family, peninsula):** D3 heating demand 78.0 and cooling 21.7 kWh/m²·yr. EPnren heating 113.1, cooling 22.1, DHW 11.16. CO2 heating 25.0, cooling 5.4, DHW 2.70. Dispersion R for total EPnren/CO2 (Table III.5): 1.45–1.60 depending on winter/summer zone, e.g. D3 = 1.50. — [same, Anexo III](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **ES, older source with the same C1 thresholds:** IDAE, existing-buildings scale (2011). — [IDAE](https://www.idae.es/sites/default/files/documentos/publicaciones_idae/documentos_11261_escalacalifenerg_edifexistentes_2011_accesible_c762988d.pdf)
- **PT:** The scale runs A+ to F. Bands on R = Ntc/Nt: A+ R ≤ 0.25, A 0.26–0.50, B 0.51–0.75, B- 0.76–1.00, C 1.01–1.50 (as reported from a Univ. Évora document). — [U. Évora, "Cálculo das Necessidades Globais de Energia Primária"](https://rdpc.uevora.pt/bitstream/10174/16074/56/14-C%c3%a1lculo%20das%20Necessidades%20Globais%20de%20Energia%20Prim%c3%a1ria.pdf); [Goldenergy glossary](https://goldenergy.pt/glossario/classe-eficiencia-energetica/) (both from search snippets, and the Évora document dates from the 2013 regime)
- **IT:** A4 ≤ 0.40; A3 0.40–0.60; A2 0.60–0.80; A1 0.80–1.00; B 1.00–1.20; C 1.20–1.50; D 1.50–2.00; E 2.00–2.60; F 2.60–3.50; G > 3.50, all as multiples of the reference EP_gl,nren. — [BibLus/ACCA](https://biblus.acca.it/classe-energetica-casa-come-calcolarla-come-migliolarla/)
- **IT:** The scale is built from the reference building's EP_gl,nren,rif,standard (2019/21). It varies from building to building rather than being fixed kWh/m² bands. Before 2015 the bands were fixed values differentiated only by climate zone and S/V ratio. The A class was split into A1–A4. — [UNI U&C dossier](https://www.infobuildenergia.it/Allegati/6998.pdf)
- **MT:** The dwelling EPC has "two scale bars" (energy rating and CO2 emissions), with zero as most efficient. The non-dwelling EPC uses an A–G bar. Adverts must state energy use in kWh/m²·yr. — [epc.gov.mt FAQ](https://epc.gov.mt/faqs) (search snippet; the page itself returned 403)
- **MT:** A University of Malta study states that the Maltese dwelling EPC "does not define the energy performance in terms of a band". EPRDM values on 2011 certificates ranged from 24.0 to 395.7 kWh/m²·yr, with a mean of 133.0. — [UM OAR study](https://www.um.edu.mt/library/oar//bitstream/123456789/19962/1/An%20investigation%20into%20the%20practical%20application%20of.pdf) (search snippet). An epc.gov.mt advertising guidance example shows "Energy Band: C", but it is unclear whether that applies to dwellings. — [epc.gov.mt file 142](https://epc.gov.mt/file.aspx?f=142)

### Inferences
- **ES:** the app can either (a) implement the C1 formula with Ir and R per zone, or (b) look up the Annex IV tables of absolute upper limits per zone and type. Option (b) is simple: one table of 6 limits × ~40 zones × 2 indicators.
- **IT:** strictly, the app needs to compute a second "reference building" with the same geometry, the 2019/21 notional U-values and system efficiencies. It is doable with the same engine, but it doubles the engine runs and requires the notional-building parameter tables from DM Requisiti Minimi, Appendix A.

### Gaps
- PT bands D, E and F were not confirmed from a source. From domain knowledge (unverified): D 1.51–2.00, E 2.01–2.50, F ≥ 2.51.
- I did not confirm whether Portaria 138-I/2021 or Despacho 6476-H/2021 changed the bands from the 2013 regime.
- MT: no source gives numeric band thresholds for dwellings.

## 3. Indicator and reference floor area

### Takeaway
ES rates both non-renewable primary energy and CO2e per m² useful floor area. PT uses the ratio of primary energy needs Ntc/Nt (per m² of interior useful area). IT uses EP_gl,nren in kWh/m² (useful floor area). MT uses EPRDM primary energy in kWh/m²·yr plus CO2.

### Cited Findings
- **ES:** The main indicators are annual CO2e emissions and annual non-renewable primary energy. They cover heating, cooling and DHW, with lighting excluded for dwellings, and are net of renewables. Units are kWh/m² of "superficie útil" and kgCO2e/m² of useful floor area. Complementary indicators are heating and cooling demand. — [MITECO/MITMA doc §2.1](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **IT:** The class is based on non-renewable primary energy (EP_gl,nren). Total primary energy (EP_gl,tot) is used for the legal compliance checks. All building types use kWh/m², whereas non-residential previously used kWh/m³. For residential, "gl" sums 2–4 services (heating, DHW, cooling, ventilation). — [UNI U&C dossier](https://www.infobuildenergia.it/Allegati/6998.pdf)
- **MT:** EPRDM is the calculated primary energy requirement for heating, cooling, lighting and hot water per m² per year, net of on-site alternative energy. — [UM OAR study](https://www.um.edu.mt/library/oar//bitstream/123456789/19962/1/An%20investigation%20into%20the%20practical%20application%20of.pdf) (search snippet)

### Inferences
- All four rely on a primary-energy aggregation built on top of energy need. A shared engine that outputs monthly heating and cooling need plus DHW would need country-specific system efficiencies and primary energy factors to reach each label.

### Gaps
- PT: Ntc covers heating, cooling, DHW and ventilation, net of renewables; Nt is the reference value. Area is Ap, interior useful floor area. This is domain knowledge, unverified, because the official text was not readable.
- MT floor area definition not found.

## 4. Reference climate data

### Takeaway
ES uses ~40 winter×summer zone combinations (α–E × 1–4), with separate tables for the peninsula and the Canary Islands. IT uses zones A–F by degree-days. PT uses winter zones I1–I3 and summer zones V1–V3 by NUTS III with altitude correction. MT is a single climate.

### Cited Findings
- **ES:** Zones in the reference tables run from α1–α4 (Canary Islands only) through A1–A4, B1–B4, C1–C4, D1–D3 and E1. The peninsula, Ceuta, Melilla and Balearics have their own table, and the Canary Islands use different reference values. Climate files are published in .MET format for every zone. — [MITECO/MITMA doc, Annex III and §2.2](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **PT:** Example certificates show winter zone I1 with degree-days (18 °C) of 444.5, and Faro as I1/V3. — [Informador.pt / sample certificates](https://informador.pt/?p=79308) (search snippet)
- **IT:** The scale accounts for climate zone and S/V implicitly, through the reference building in the same location. — [UNI U&C dossier](https://www.infobuildenergia.it/Allegati/6998.pdf)
- **MT:** "Mild climatic conditions"; the main design concern is avoiding summer overheating. — [EPBD CA Malta 2020](https://cdn1.gopublic.dk/epbd/Media/638373597951393601/Implementation-of-the-EPBD-in-Malta--Status-in-2020.pdf)

### Inferences
- A simple app needs, at minimum, one representative monthly climate per zone. Spain's CTE .MET files can be aggregated to monthly values. Italy can work by province or city with UNI 10349 monthly data.

### Gaps
- **IT** degree-day zones (DPR 412/1993), unverified: A ≤ 600 GG, B 601–900, C 901–1400, D 1401–2100, E 2101–3000, F > 3000.
- **PT** I1/I2/I3 thresholds, unverified (domain knowledge): GD ≤ 1300, 1300–1800, > 1800. V1/V2/V3 by summer mean exterior temperature: ≤ 20 °C, 20–22 °C, > 22 °C. The source is the Despacho on climate parameters (15793-F/2013 and its successor).
- **ES:** the winter severity (SCI) and summer severity (SCV) definitions of the CTE zones were not fetched (CTE DB-HE Anejo B).

## 5. Primary energy factors

### Takeaway
IT is confirmed: electricity fp,nren 1.95 / fp,tot 2.42, natural gas 1.05/1.05, district heating 1.5/1.5. The ES and PT values could not be verified in this session. Malta values were not found.

### Cited Findings
- **IT (DM Requisiti Minimi, Tabella 1):**

  | Carrier | fp,nren | fp,ren | fp,tot |
  |---|---|---|---|
  | Natural gas | 1.05 | 0 | 1.05 |
  | LPG | 1.05 | 0 | 1.05 |
  | Gas oil / fuel oil | 1.07 | 0 | 1.07 |
  | Coal | 1.10 | 0 | 1.10 |
  | Solid biomass | 0.20 | 0.80 | 1.00 |
  | Liquid/gaseous biomass | 0.40 | 0.60 | 1.00 |
  | Grid electricity | 1.95 | 0.47 | 2.42 |
  | District heating (default) | 1.5 | 0 | 1.5 |
  | District cooling | 0.5 | 0 | 0.5 |
  | Solar thermal / PV / ambient heat (heat pump) | 0 | 1.00 | 1.00 |

  The values are to be updated every two years based on GSE data. — [UNI U&C dossier, Tabella 3](https://www.infobuildenergia.it/Allegati/6998.pdf); also [FVG/Stefani slides](https://energia.regione.emilia-romagna.it/leggi-atti-bandi-1/documenti-e-pubblicazioni/eventi/2015/stefani_25_9)
- **IT:** Grid electricity was previously 2.174 nren. — [Emilia-Romagna presentation (search snippet)](https://energia.regione.emilia-romagna.it/leggi-atti-bandi-1/documenti-e-pubblicazioni/eventi/2015/stefani_25_9)
- **ES:** The official source is the Documento Reconocido "Factores de emisión de CO2 y coeficientes de paso a energía primaria de diferentes fuentes de energía final consumidas en el sector de edificios en España" (2016). An earlier draft dated 03/03/2014 also exists. — [certificadosenergeticos.com copy of draft](https://www.certificadosenergeticos.com/wp-content/uploads/2015/01/2014_03_03_Factores_de_emision_CO2_y_Factores_de_paso_Efinal_Eprimaria_V.pdf)
- **EU:** Delegated Regulation (EU) 2023/807 revised the default primary energy factor for electricity. — [APREN copy](https://www.apren.pt/contents/legislation/eu-pt-2023-807.pdf)

### Inferences
- Malta is ~90% electricity in dwellings (per search snippet of a UM/Frontiers study), so its label depends almost entirely on one PEF.

### Gaps
- **ES (2016 doc), unverified (domain knowledge):**
  - Peninsular electricity: fp nren 1.954, total 2.368, CO2 0.331 kg/kWh.
  - Natural gas: nren 1.190, total 1.195, CO2 0.252.
  - District heating is supplier-specific.
  - The tool did not return these numbers, so treat them as unconfirmed.
- **PT, unverified:**
  - The 2013 regime (Despacho 15793-D/2013) used electricity Fpu = 2.5 kWhEP/kWh and fuels 1.0.
  - Whether DL 101-D/2020 regulations split nren/ren or changed the electricity factor was not confirmed.
- **MT:** PEF and CO2 factor for electricity not found.

## 6. Absolute thresholds or relative to a reference building?

### Takeaway
ES uses statistically derived per-zone absolute limits (relative to stock statistics, not to a notional building). PT and IT are relative to a reference or notional building. MT appears absolute (numeric kWh/m²·yr).

### Cited Findings
- **ES:** Thresholds come from the climate-zone mean (Ir) and 10th-percentile dispersion (R) of a reference stock. They are tabulated as absolute kWh/m² limits per zone and dwelling type in Annex IV. — [MITECO/MITMA doc](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **IT:** The scale is relative to a reference building with the same geometry, orientation, location and use, "dressed" with the reference U-values and system efficiencies. The scale "varies from building to building". — [UNI U&C dossier](https://www.infobuildenergia.it/Allegati/6998.pdf); [BibLus/ACCA](https://biblus.acca.it/classe-energetica-casa-come-calcolarla-come-migliolarla/)
- **PT:** The class is the ratio of the building's primary energy needs to a reference value (R = Ntc/Nt). — [U. Évora](https://rdpc.uevora.pt/bitstream/10174/16074/56/14-C%c3%a1lculo%20das%20Necessidades%20Globais%20de%20Energia%20Prim%c3%a1ria.pdf) (snippet)
- **MT:** The building code requirement for residential is a mean primary energy balance of 85 kWh/m²·yr, varying by typology. The NZEB residential mean is 75 kWh/m²·yr. Renovations: dwellings 140 kWh/m²·yr. NZEB for semi-detached and detached houses is 55 kWh/m². — [EPBD CA Malta 2020](https://cdn1.gopublic.dk/epbd/Media/638373597951393601/Implementation-of-the-EPBD-in-Malta--Status-in-2020.pdf)

### Inferences
- **IT** is the hardest. A faithful rating needs the notional building computed in parallel, with all DM 26/06/2015 Appendix A parameters (U-values by zone, system efficiencies).
- **PT** has the same issue: Nt is computed from the reference building with the actual geometry.
- **ES** is the easiest of the three, because the Annex IV lookup tables are absolute per zone.

### Gaps
- PT Nt definition and reference-building parameters (Portaria 138-I/2021 annexes) not read.

## 7. Transposition of EPBD recast (EU) 2024/1275

### Takeaway
On 15 July 2026 the Commission sent letters of formal notice to all 27 Member States, ES, PT, IT and MT included, for failing to fully transpose the recast EPBD by 29 May 2026. None of the four has a harmonised A–G scale (A = ZEB) in force for its EPC as far as I could find.

### Cited Findings
- The Commission "decided to open infringement procedures by sending letters of formal notice to all 27 EU Member States for failing to fully transpose" Directive (EU) 2024/1275. The transposition deadline was 29 May 2026; Article 17(15) on fossil-boiler incentives was due by 1 January 2025. Member States have two months to reply. Press release dated Brussels, 15 July 2026. — [EC INF/26/1380](https://ec.europa.eu/commission/presscorner/api/files/document/print/en/inf_26_1380/INF_26_1380_EN.pdf)
- No Member State had reported full transposition by 29 May 2026 (per Renovate Europe, via search snippet). Renovate Europe announced an EPBD tracker for 5 Nov 2026. — [Renovate Europe](https://renovate-europe.eu/delivering-the-epbd/)
- Italy was named for Art. 17(15) (INFR(2025)2186), per search snippet. — [EC Nov infringements package](https://transition-pathways.europa.eu/chemicals/green-transition/november-infringements-package-key-decisions-energy)
- Directive text: Art. 19 and Annex V require a common A–G scale, with A = zero-emission building and G = worst 15% of the national stock (domain knowledge, consistent with the directive). — [EUR-Lex 2024/1275](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401275)
- **ES:** An Embuild blog says RD 853/2021 was extended by RD 326/2026 (22 Apr 2026). It is a secondary source, and RD 853/2021 is a renovation-funding decree, not the EPC scale. — [Embuild](https://embuild.eu/en/blog/epbd-revised-2024-explained)

### Inferences
- Every country will have to reshape its scale. PT (A+–F), IT (A4–G) and MT (numeric) all depart from the harmonised A–G. ES is already A–G but has no "A = ZEB" anchor. The thresholds modelled in late 2026 are therefore likely to change in 2027–2028, so the app should store national scales as versioned config.

### Gaps
- No country-specific draft transposition acts on the new EPC scale were found (e.g. a Spanish RD modifying RD 390/2021, an Italian DLgs, a Portuguese DL amending 101-D/2020, a Maltese LN).

## 8. Documentation quality

### Takeaway
ES has excellent documentation: free, with all formulas, per-zone reference values and ready-made class limit tables in one PDF, in Spanish only. IT is good: free decrees, with classes and factors widely reproduced, in Italian. PT is medium: laws are free on DRE, but annexes were hard to access and the Manual SCE is needed. MT is poor: the dwelling scale and thresholds are not published in an accessible way.

### Cited Findings
- **ES:** A single 38-page document holds the full method, formulas, Annex III reference values (Ir, R) and Annex IV class limits for every zone and indicator. It may be reproduced for professional use. — [MITECO/MITMA doc](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **IT:** The decree is on the MIMIT site. Secondary summaries (ANCE, ACCA, UNI) reproduce the class table and the PEF table. — [MIMIT](https://www.mimit.gov.it/it/normativa/decreti-interministeriali/decreto-interministeriale-26-giugno-2015-adeguamento-linee-guida-nazionali-per-la-certificazione-energetica-degli-edifici); [ANCE note](https://ance.it/wp-content/uploads/archive/21378-Nota%20di%20approfondimento_linee%20guida%20Ape.pdf)
- **PT:** The official DRE page returned empty to the fetch tool, and vLex is paywalled. — [vLex](https://vlex.pt/vid/portaria-n-138-i-870174555)
- **MT:** epc.gov.mt returned 403. Academic sources say there are no bands for dwellings. — [UM OAR](https://www.um.edu.mt/library/oar//bitstream/123456789/19962/1/An%20investigation%20into%20the%20practical%20application%20of.pdf)
- **English summaries:** EPBD Concerted Action country reports exist (Malta 2020 is English). — [EPBD CA Malta 2020](https://cdn1.gopublic.dk/epbd/Media/638373597951393601/Implementation-of-the-EPBD-in-Malta--Status-in-2020.pdf)

### Gaps
- I did not check whether EPBD CA 2022/2024 country reports for ES, PT and IT (epbd-ca.eu) have more recent English summaries.

## 9. Recommendation per country

### Takeaway
ES: KEEP. IT: KEEP (with a simplified reference building) or UNCERTAIN. PT: UNCERTAIN. MT: DROP.

### Cited Findings
(Recommendations rest on the findings above; sources as cited there.)
- **ES: KEEP.** Fully published, absolute per-zone class limits (Annex IV) for single-family dwellings on both EPnren and CO2. A monthly engine plus system efficiency plus Spanish PEFs maps directly. The cost is choosing among ~40 zones; a zone dropdown or province→zone lookup is enough. — [MITECO/MITMA doc](https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf)
- **IT: KEEP / UNCERTAIN.** The method (UNI/TS 11300) is natively monthly and the PEFs and class multipliers are published. However, classes are relative to a same-geometry notional building, so the app must run the engine twice with the reference U-values and efficiencies by zone A–F. That is feasible but adds parameter tables. — [UNI dossier](https://www.infobuildenergia.it/Allegati/6998.pdf); [ACCA](https://biblus.acca.it/classe-energetica-casa-come-calcolarla-come-migliolarla/)
- **PT: UNCERTAIN.** It is a ratio scale (Ntc/Nt) relative to a reference building, like Italy. Band and PEF values in the current Portaria/Despacho were not verified, and documentation access is poor.
- **MT: DROP.** No published A–G thresholds for dwellings: the EPC shows numeric kWh/m²·yr and CO2 bars. The EPRDM method is proprietary or thinly documented, and the PEFs were not found. A Malta label in the app would be invented.

### Inferences
- Difficulty of climate-zone-dependent relative scales for a simple app:
  - **ES:** low. A table lookup per zone, already absolute.
  - **IT and PT:** medium-high. Each needs a second notional-building calculation with zone-specific reference U-values and system efficiencies, so it is hard to do faithfully. A pragmatic shortcut is to approximate EP_rif with a fixed per-zone, per-S/V table, but that is no longer the official method and should be labelled "indicative".
  - All four will likely re-base their scales to EPBD-2024 A–G (A = ZEB) in 2027+, so the scales need versioning.

### Gaps
- Neither the IT reference-building parameter tables (DM Requisiti Minimi, Appendix A) nor the PT Nt formula were retrieved. Both are needed before implementation.
