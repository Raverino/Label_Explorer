"""Build data/countries/*.json and data/countries/index.json for Label Explorer.

Every value carries a quality flag:
  official   - read from a legal text, standard or the issuing agency's own publication
  secondary  - from a certifier, trade site, research paper or news (not the legal text)
  unverified - from memory, a search snippet or a garbled extraction; must be checked
  proxy      - a stand-in we chose (e.g. EU-average), not the national value
  assumption - an app modelling choice, documented

All label limits are UPPER limits (value <= max gets that class), unless "lt": true (strictly below).
Research basis: reports/EU energy label methods.md (2026-11-10) and the factor checks of 2026-11-10.
Usage: python scripts/build_countries.py
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "data" / "countries"

S = {  # sources used more than once
    "nl_bijlage9": "https://wetten.overheid.nl/jci1.3:c:BWBR0045528&bijlage=IX",
    "nl_a0": "https://zoek.officielebekendmakingen.nl/stcrt-2026-18123.pdf",
    "nl_nta_draft": "https://www.internetconsultatie.nl/epg2026/document/14147",
    "nl_umgo": "https://www.rvo.nl/sites/default/files/2026-08/WE30102%20Uniforme%20Maatlat%20Gebouwde%20Omgeving%205.3.pdf",
    "nl_beng": "https://www.rvo.nl/sites/default/files/2019/06/De%20BENG%20eisen%20juni%202019.pdf",
    "nl_bcrg": "https://bcrg.nl/nl/databanken/energieprestaties/databank/emg-verklaringen/",
    "de_anl10": "https://www.buzer.de/Anlage_10_GModG.htm",
    "de_anl4": "https://www.gesetze-im-internet.de/geg/anlage_4.html",
    "de_anl9": "https://www.gesetze-im-internet.de/geg/anlage_9.html",
    "at_rl6": "https://www.ris.bka.gv.at/Dokumente/LgblAuth/LGBLA_TI_20260715_59/Anlage_59_TBV2026_Anlage6_KM.pdf",
    "at_brochure": "https://www.tirol.gv.at/fileadmin/themen/bauen-wohnen/baupolizei/20260219_Zentrale_%C3%84nderungen_der_OIB_Richtlinie_6_im_Jahr_2025.pdf",
    "ie_adv": "https://www.seai.ie/sites/default/files/2026-07/BER-Combined-Advertising-Guidelines.pdf",
    "ie_deap": "https://www.seai.ie/sites/default/files/publications/DEAP_Manual.pdf",
    "ie_sbem": "https://seai.ie/sites/default/files/2026-07/Introduction-to-SBEMie-version5.7b.pdf",
    "dk_ens": "https://ens.dk/media/7592/download",
    "dk_br18": "https://www.bygningsreglementet.dk/tekniske-bestemmelser/11/krav/259/",
    "simson": "https://vbn.aau.dk/ws/files/485547054/e3sconf_roomvent2022_01017.pdf",
    "fi_decree": "https://finlex.fi/api/media/statute/53865/mainPdf/main.pdf",
    "ee_annex3": "https://www.riigiteataja.ee/aktilisa/1210/7202/6006/KLIM_m63_lisa3.pdf",
    "si_rule": "https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2023-01-0094",
    "si_factors": "https://www.uradni-list.si/files/RS_-2022-070-01635-OB~P002-0000.PDF",
    "hr_rule": "https://www.zakon.hr/c/podzakonski-propis/45373/nn-88-2017-%281.9.2017.%29%2C-pravilnik-o-energetskom-pregledu-zgrade-i-energetskom-certificiranju",
    "hr_dg": "https://www.montazneidrvenekuce.info/energetika/sto-je-energetski-razred-zgrade/261",
    "hr_pef": "https://mpgi.gov.hr/UserDocsImages/dokumenti/EnergetskaUcinkovitost/meteoroloski_podaci/Metodologija_izracuna_faktora_primarne_energije_2017.pdf",
    "es_calif": "https://www.eic.cat/promocio/e_serveis/normativa/doc_reconocidos_certificado_eficiencia_energetica/Calificaci%C3%B3n%20de%20la%20eficiencia%20energ%C3%A9tica%20de%20los%20edificios.pdf",
    "wa_scale": "https://www.certinergie.be/en/energy-performance-certificate/epc-certificate-wallonia/",
    "wa_qzen": "https://energie.wallonie.be/files/PEB/B%c3%a2timents%20r%c3%a9sidentiels/Nouvelle%20construction/Outils/Conseils%20pratiques%20-%20publications/Guide%20pratique%20pour%20construire%20votre%20logement%20QZen/brochure%20QZen_2026.pdf",
    "bru_cert": "https://immo.notaire.be/immoplatform-public-service_v1/api/attachments/356739/289057/730423.pdf",
    "bru_iea": "https://www.iea.org/policies/2493",
    "bru_method": "https://document.environnement.brussels/opac_css/elecfile/Annexe1_Methode_calcul_certificationPEB_habitations_individuelles",
    "bru_req": "https://environnement.brussels/citoyen/reglementation/obligations-et-autorisations/exigences-et-procedure-de-la-reglementation-travaux-peb",
    "sk_annex_classes": "https://static.slov-lex.sk/pdf/prilohy/SK/ZZ/2020/35/20200310_5228103-2.pdf",
    "sk_annex_factors": "https://static.slov-lex.sk/pdf/prilohy/SK/ZZ/2012/364/20200310_4720140-2.pdf",
    "hu_decree": "https://njt.jog.gov.hu/jogszabaly/2023-9-20-8X",
    "hu_scale": "https://zoldpenzugyek.mnb.hu/sw/static/file/20241210_csoknayi_jogszabalyi_valtozasok_kovetkezmenyei_lakoingatlanok_besorolasara.pdf",
    "hu_pct": "https://energiamernok.hu/energetikai-besorolas-tablazat/",
    "es_factors": "https://www.certificadosenergeticos.com/wp-content/uploads/2018/12/Factores_emision_CO2.pdf",
    "wa_annexA1": "https://energie.wallonie.be/files/PEB/Pour%20les%20professionnels/Outils/La%20r%c3%a9glementation%20wallonne%20-%20PEB/Exigences%20PEB/R%c3%a9gl.%20PEB%20apd%2001.01.26/AGW%20PEB%202026_Annexe%20A1%20(PER).pdf",
    "dk_br18_252": "https://www.bygningsreglementet.dk/media/mxzlfopn/energiforbrug.pdf",
    "ee_taltech": "https://digikogu.taltech.ee/et/Download/5995a1fa-d455-4d5e-916e-831544ecb051",
    "ee_co2": "https://kliimaministeerium.ee/rohereform-kliima/rohereform/organisatsioonide-jalajalg#mudel",
    # added 2026-11-12 (database check)
    "nl_bbl": "https://wetten.overheid.nl/BWBR0041297/2026-09-24/#Hoofdstuk4_Afdeling4.5_Paragraaf4.5.2",
    "nl_tojuli": "https://www.rvo.nl/onderwerpen/wetten-en-regels-gebouwen/beng/indicatoren",
    "de_anl10_geg": "https://www.gesetze-im-internet.de/geg/anlage_10.html",
    "de_par20": "https://www.gesetze-im-internet.de/geg/__20.html",
    "ie_deap427": "https://www.seai.ie/sites/default/files/publications/DEAP_Manual.pdf#page=55",
    "ee_reg63": "https://estlex.ee/oigusakt/hoone-energiatohususe-miinimumnouded",
    "ee_study2026": "https://kliimaministeerium.ee/sites/default/files/documents/2026-08/Kaalumistegurite-uuringu-raport-2026.pdf",
    "fi_1010": "https://www.finlex.fi/fi/lainsaadanto/saadoskokoelma/2017/1010",
    "hr_classes": "https://narodne-novine.nn.hr/clanci/sluzbeni/full/2017_09_88_2093.html",
    "hu_cert": "https://njt.jog.gov.hu/jogszabaly/2008-176-20-22",
    "bru_classes": "https://environnement.brussels/citoyen/reglementation-et-inspection/obligations-et-autorisations/objectifs-peb-pour-chaque-logement-et-exigences-peb-en-cas-de-travaux",
    "bru_explain": "https://document.environnement.brussels/opac_css/elecfile/IF_NRJ_ResultatCertificatPEB_FR",
    "at_brochure_p21": "https://www.tirol.gv.at/fileadmin/themen/bauen-wohnen/baupolizei/20260219_Zentrale_%C3%84nderungen_der_OIB_Richtlinie_6_im_Jahr_2025.pdf#page=21",
    "es_dbhe": "https://www.codigotecnico.org/pdf/Documentos/HE/DBHE.pdf",
    "dk_sbi213": "https://www.innobyg.dk/media/75610/branchevejledning-for-energiberegninger-20_2018_final.pdf",
}


def f(pe_tot=None, pe_nren=None, co2=None, status="official", src=None, note=None, pe_fossil=None, weight=None):
    """One energy-carrier factor record. co2 in kg/kWh delivered."""
    d = {k: v for k, v in dict(pe_tot=pe_tot, pe_nren=pe_nren, pe_fossil=pe_fossil, weight=weight, co2=co2).items() if v is not None}
    d["status"] = status
    if src:
        d["source"] = src
    if note:
        d["note"] = note
    return d


def classes(pairs, status="official", lt=False):
    out = [{"class": c, "max": m} for c, m in pairs]
    return {"classes": out, "status": status, "strictly_below": lt}


COUNTRIES = []

# ---------------------------------------------------------------- Netherlands
COUNTRIES.append({
    "id": "NL", "name": "Netherlands", "available": True,
    "scheme": "Energielabel (NTA 8800) + BENG", "method": "NTA 8800:2025+C1:2026 (monthly, CEN EPB based)",
    "legal_basis": "Besluit bouwwerken leefomgeving (Bbl), Omgevingsregeling Bijlage IX",
    "climate": ["NL"],
    "floor_area": {"code": "Ag", "name": "gebruiksoppervlakte (usable floor area)", "basis": "internal", "status": "official"},
    "label": {
        "version": "NL-2021 scale, Omgevingsregeling version 2026-10-06", "valid_from": "2021-01-01", "valid_to": "2029-12-31",
        "indicator": "pe_fossil", "indicator_name": "EP2 primary fossil energy", "unit": "kWh/m2.yr",
        "scale": classes([("A++++", 0), ("A+++", 50), ("A++", 75), ("A+", 105), ("A", 160), ("B", 190),
                          ("C", 250), ("D", 290), ("E", 335), ("F", 380), ("G", None)]),
        "source": S["nl_bijlage9"],
        "marks": [{"mark": "A0", "rule": "single-family new build, permit after 2026-05-29: EP2 <= 27, BENG 1 and 3 met, no on-site fossil combustion",
                   "status": "official", "source": S["nl_a0"]}],
        "next_change": "2030-01-01: A-G scale on total primary energy with a new method (thresholds not yet published)",
    },
    "factors": {
        "valid_from": "2026", "source_doc": "NTA 8800:2026 tabel 5.2/5.3/5.4 (consultation draft) and RVO UMGO 5.3",
        "electricity": f(pe_tot=1.35, pe_fossil=1.45, co2=0.268, src=S["nl_umgo"],
                         note="fP;del = fP;exp = 1.45 (fossil). Total PE factor 1.35, export 1.00. CO2 0.340 under NTA 8800:2025, 0.268 from 2026. "
                              "Confirmed by a private NTA 8800 tool run (numbers kept offline); CO2 applies to net metered electricity after PV."),
        "gas": f(pe_fossil=1.0, co2=0.183, src=S["nl_nta_draft"], status="official",
                 note="Factors on gross calorific value (HHV). CO2: 0.183 in the 2024/2025 tables; the 2026 draft lists 0.183 and 0.218 in track changes - which is final is unverified."),
        "oil": f(pe_fossil=1.0, src=S["nl_nta_draft"]),
        "biomass": f(pe_fossil=0.5, src=S["nl_nta_draft"], note="Stoves/boilers <=500 kW meeting Annex R emission criteria; 1.0 if not; 0.0 above 500 kW."),
        "district_heat": f(pe_fossil=0.9, co2=None, src=S["nl_nta_draft"],
                           note="Default (forfaitair) value without a BCRG declaration; renewable factor 0. Networks with a BCRG EMG declaration use their own values (e.g. Klaprozenbuurt Amsterdam: fP;del 0.41, fPren 0.70, CO2 0.076)."),
        "renewable_factors": {"pv_electricity": 1.45, "ambient_heat": 1.0, "status": "official", "source": S["nl_nta_draft"], "note": "Table 5.4, used for BENG 3"},
    },
    "pv_rule": "Self-used and exported PV both credited at the electricity factor 1.45 (net metering in EP2).",
    "requirements": {
        "BENG1_heat_demand": {"formula": "55 if Als/Ag<=1.5; 55+30*(Als/Ag-1.5) up to 3.0; 100+50*(Als/Ag-3.0) above", "unit": "kWh/m2.yr", "status": "official", "source": S["nl_bbl"],
                              "note": "Bbl art. 4.149 and tabel 4.148A, row 'andere woonfunctie' (houses), version 2026-09-24. +5 kWh/m2.yr when the specific internal heat capacity is 180 kJ/m2K or less (art. 4.149 lid 4)."},
        "BENG2_primary_fossil": {"max": 30, "unit": "kWh/m2.yr", "status": "official", "source": S["nl_bbl"]},
        "BENG3_renewable_share": {"min": 50, "unit": "%", "status": "official", "source": S["nl_bbl"]},
        "TOjuli": {"max": 1.2, "status": "official", "source": S["nl_tojuli"], "note": "Per orientation and calculation zone; GTO <= 450 h as alternative (RVO, checked 2026-11-09)"},
    },
    "conventions": {"heating_setpoint_C": {"value": 20, "status": "unverified"}},
    "gaps": ["NTA 8800 internal gains, DHW demand and ventilation defaults (in the paid NTA text)",
             "Final 2026 gas CO2 factor (0.183 vs 0.218)", "De Bilt reference year confirmed only as common knowledge"],
})

# ---------------------------------------------------------------- Germany
COUNTRIES.append({
    "id": "DE", "name": "Germany", "available": True,
    "scheme": "Energieausweis (Bedarfsausweis)", "method": "DIN V 18599:2018-09 (monthly); DIN/TS 18599:2025-10 from 2027",
    "legal_basis": "Gebäudemodernisierungsgesetz (GModG, ex-GEG), BGBl. 2026 I Nr. 226",
    "climate": ["DE"],
    "floor_area": {"code": "A_N", "name": "Gebäudenutzfläche", "basis": "volume", "formula": "A_N = 0.32 * V_e (heated gross volume)",
                   "status": "secondary", "note": "GModG § 3 Nr. 10 defines A_N by DIN V 18599:2018-09; the 0.32 factor sits in the DIN text (paid), not in the law. Typically 1.2-1.35 x living area."},
    "label": {
        "version": "GEG/GModG Anlage 10", "valid_from": "2020-11-01", "indicator": "final", "indicator_name": "Endenergiebedarf (final energy)",
        "unit": "kWh/m2.a",
        "scale": classes([("A+", 30), ("A", 50), ("B", 75), ("C", 100), ("D", 130), ("E", 160), ("F", 200), ("G", 250), ("H", None)]),
        "source": S["de_anl10_geg"],
        "note": "The July 2026 GModG kept A+..H for residential buildings; A-G applies only to non-residential from 2027.",
    },
    "factors": {
        "valid_from": "2024", "source_doc": "GEG Anlage 4 (PE, non-renewable) and Anlage 9 (CO2)",
        "electricity": f(pe_nren=1.8, co2=0.560, src=S["de_anl4"]),
        "gas": f(pe_nren=1.1, co2=0.240, src=S["de_anl4"]),
        "oil": f(pe_nren=1.1, co2=0.310, src=S["de_anl4"], note="CO2 from Anlage 9 (310 g/kWh)"),
        "lpg": f(pe_nren=1.1, co2=0.270, src=S["de_anl4"], note="CO2 from Anlage 9"),
        "wood": f(pe_nren=0.2, co2=0.020, src=S["de_anl4"], note="CO2 from Anlage 9 (20 g/kWh)"),
        "district_heat": f(pe_nren=0.7, co2=0.180, status="secondary",
                           note="Anlage 4 has no district-heat row (network operators publish their own factor). CO2 0.180 is Anlage 9 'KWK, gaseous/liquid fuels' (official); "
                                "Anlage 9 also lists KWK coal 0.300, KWK renewable 0.040, heating plant gas 0.300, renewable 0.060. PE 0.7 is a secondary-source default."),
        "next_change": "2027-01-01: requirements move to total PE, electricity 1.5 (secondary source, unverified)",
    },
    "pv_rule": "PV self-consumption reduces final energy; label is on final energy so factors do not change the class.",
    "requirements": {"primary_energy_vs_reference": {"max_ratio": 0.55, "status": "official", "source": "https://www.gesetze-im-internet.de/geg/__15.html"}},
    "conventions": {"heating_setpoint_C": {"value": 20, "status": "unverified"},
                    "dhw_kWh_m2a": {"value": 12.5, "status": "official", "source": S["de_par20"], "note": "GModG § 20 Abs. 2: 12.5 kWh per m2 A_N and year"}},
    "gaps": ["DIN V 18599-10 usage profile (internal gains, DHW) is paywalled", "Potsdam reference climate confirmed only by snippet"],
})

# ---------------------------------------------------------------- Austria
COUNTRIES.append({
    "id": "AT", "name": "Austria", "available": True,
    "scheme": "Energieausweis (OIB-RL 6, 2025)", "method": "ÖNORM B 8110-6-1 / H 5056-1 (monthly, mapped to EN ISO 52016-1)",
    "legal_basis": "OIB-Richtlinie 6 (Sept 2025) as adopted by each Land (e.g. Tir. LGBl. 59/2026)",
    "climate": ["AT"], "climate_note": "Label uses the site climate; Vienna is the default site in the app.",
    "floor_area": {"code": "BGF", "name": "Bruttogrundfläche (gross floor area)", "basis": "gross_external", "status": "official"},
    "label": {
        "version": "OIB-RL 6 2025", "valid_from": "2026-01-01", "indicator": "dual",
        "indicator_name": "HWB_Ref,SK (heating need) and EEB_SK (final energy incl. household electricity)", "unit": "kWh/m2.a",
        "dual_scale": {
            "HWB_Ref_SK": [{"class": "A", "max": 40}, {"class": "B", "max": 60}, {"class": "C", "max": 75}, {"class": "D", "max": 85},
                           {"class": "E", "max": 100}, {"class": "F", "max": 120}, {"class": "G", "max": None}],
            "EEB_SK": [{"class": "A", "max": 90}, {"class": "B", "max": 110}, {"class": "C", "max": 125}, {"class": "D", "max": 140},
                       {"class": "E", "max": 155}, {"class": "F", "max": 175}, {"class": "G", "max": None}],
            "status": "official",
        },
        "combine_rule": {"rule": "worse_of", "status": "assumption", "source": S["at_brochure_p21"],
                         "note": "Official (OIB-RL 6 2025, page 1 of the Energieausweis): the scale shows BOTH the reference heating need and the final energy, site climate; there is no single headline class. The app needs one letter for the comparison and uses the worse of the two (app choice)."},
        "fossil_rule": "Fossil-heated buildings are labelled 'B fossil' .. 'G fossil' and cannot reach A.",
        "source": S["at_rl6"],
    },
    "factors": {
        "valid_from": "2026", "valid_to": "2035", "source_doc": "OIB-RL 6 2025",
        "electricity": f(pe_tot=1.43, pe_nren=0.43, co2=0.074, src=S["at_brochure"]),
        "gas": f(pe_tot=1.10, pe_nren=1.10, co2=0.201, src=S["at_brochure"]),
        "district_heat_renewable": f(pe_tot=1.27, pe_nren=0.07, co2=0.025, src=S["at_brochure"]),
        "district_heat_nonrenewable": f(pe_tot=1.19, pe_nren=0.80, src=S["at_brochure"]),
        "district_heat_chp": f(pe_tot=0.71, pe_nren=0.05, co2=0.022, src=S["at_brochure"]),
    },
    "requirements": {"HWB_Ref_RK": {"formula": "9*(1+3.0/lc)  (8*(1+3.0/lc) from 2030)", "unit": "kWh/m2.a", "status": "official", "source": S["at_rl6"]}},
    "conventions": {"heating_setpoint_C": {"value": 20, "status": "official", "source": S["at_brochure"]},
                    "heating_limit_C": {"value": 12, "status": "official", "source": S["at_brochure"]}},
    "gaps": ["HWB/EEB combination rule", "Household electricity default in EEB", "Site climate data (ÖNORM B 8110-5) paywalled; PVGIS proxy used"],
})

# ---------------------------------------------------------------- Ireland
COUNTRIES.append({
    "id": "IE", "name": "Ireland", "available": True,
    "scheme": "Building Energy Rating (BER)", "method": "DEAP 4.2.7 (monthly, single zone, IS EN 13790; cooling EN ISO 52016-1)",
    "legal_basis": "EPBD regulations signed April 2026 (S.I. number not found)",
    "climate": ["IE"],
    "floor_area": {"code": "TFA", "name": "total floor area, internal dimensions", "basis": "internal", "status": "official"},
    "label": {
        "version": "BER 2026 (A0-G)", "valid_from": "2026-05-24", "indicator": "pe_tot", "indicator_name": "total primary energy", "unit": "kWh/m2.yr",
        "scale": classes([("A0", 42), ("A", 75), ("B", 150), ("C", 225), ("D", 275), ("E", 325), ("F", 375), ("G", None)]),
        "source": S["ie_adv"],
        "a0_criteria": ["<= 5 kgCO2eq/m2.yr", "no on-site fossil fuel", "grid responsive", "carbon-free supply", "NZEB compliant"],
        "note": "'<=' boundary convention inferred from the certificate mock-up. Old 15-band A1-G scale for BERs issued before 2026-05-24.",
    },
    "factors": {
        "valid_from": "2026-05-25", "source_doc": "SEAI SBEMie 5.7 notes (electricity) and DEAP manual Table 8 (fuels)",
        "electricity": f(pe_tot=1.5, co2=0.1685, src=S["ie_sbem"],
                         note="Stated for SBEMie 5.7a (non-domestic, from 2026-05-25); DEAP uses the same SEAI electricity factors (DEAP manual 4.2.7 Table 8 note 8 points to one SEAI publication for both). "
                              "The 2023 SEAI factors were about 1.75 and 0.224 (secondary). Export PEF 1.0."),
        "gas": f(pe_tot=1.1, pe_nren=1.1, co2=0.203, src=S["ie_deap"], note="DEAP 4.2.7 (June 2025) Table 8"),
        "lpg": f(pe_tot=1.1, pe_nren=1.1, co2=0.232, src=S["ie_deap"], note="DEAP 4.2.7 Table 8"),
        "oil": f(pe_tot=1.1, pe_nren=1.1, co2=0.272, src=S["ie_deap"], note="DEAP 4.2.7 Table 8"),
        "wood": f(pe_tot=1.1, pe_nren=0.1, co2=0.025, src=S["ie_deap"], note="DEAP 4.2.7 Table 8, wood pellets bulk / logs / chips"),
        "district_heat": f(pe_tot=1.1, pe_nren=1.1, co2=0.057, status="official", src=S["ie_deap"],
                           note="DEAP 4.2.7 Table 8 'heat from boilers - waste combustion'; waste heat from power stations 1.05 / 0.018; scheme-specific factors from SEAI otherwise"),
    },
    "requirements": {"EPC": {"max_ratio": 0.30}, "CPC": {"max_ratio": 0.35}, "RER": {"min": 0.20}, "status": "official", "source": S["ie_deap"]},
    "conventions": {"heating_setpoint_C": {"value": "21 living area / 18 rest", "status": "official", "source": S["ie_deap427"],
                                           "note": "DEAP 4.2.7 §7.1: heating 07-09 and 17-23 every day (56 h/week)"},
                    "occupancy": {"formula": "N = 1 + 1.76*(1-exp(-0.000349*(TFA-13.9)^2)) + 0.0013*(TFA-13.9), N = 1 if TFA <= 13.9", "status": "official", "source": S["ie_deap427"]}},
    "gaps": ["DEAP 2026 electricity factors are read from the SBEMie note, not a DEAP document"],
})

# ---------------------------------------------------------------- Denmark
COUNTRIES.append({
    "id": "DK", "name": "Denmark", "available": True,
    "scheme": "Energimærke", "method": "SBi 213 / Be18 (monthly)", "legal_basis": "BR18 §259; ENS energy labelling rules",
    "climate": ["DK"],
    "floor_area": {"code": "A", "name": "heated gross floor area", "basis": "gross_external", "status": "official"},
    "label": {
        "version": "BR18 label", "valid_from": "2018", "indicator": "weighted", "indicator_name": "weighted delivered energy (primary-energy weighted)",
        "unit": "kWh/m2.yr", "scale_type": "area_formula",
        "formulas": [{"class": "A2020", "c": 27, "k": 0}, {"class": "A2015", "c": 30, "k": 1000}, {"class": "A2010", "c": 52.5, "k": 1650},
                     {"class": "B", "c": 70, "k": 2200}, {"class": "C", "c": 110, "k": 3200}, {"class": "D", "c": 150, "k": 4200},
                     {"class": "E", "c": 190, "k": 5200}, {"class": "F", "c": 240, "k": 6500}, {"class": "G", "c": None, "k": None}],
        "formula_note": "max = c + k / A (strictly below)", "status": "official", "source": S["dk_ens"],
    },
    "factors": {
        "electricity": f(weight=1.9, src=S["dk_br18_252"], note="BR18 §252"),
        "district_heat": f(weight=0.85, src=S["dk_br18_252"]),
        "gas": f(weight=1.0, src=S["dk_br18_252"], note="BR18 §252: 1.0 for other forms of heat"),
    },
    "requirements": {"energy_frame": {"formula": "30 + 1000/A", "unit": "kWh/m2.yr", "status": "official", "source": S["dk_br18"]}},
    "gaps": ["CO2 factors (not part of the label; grid fallback used)", "Whether 2025-26 BR18 revisions changed the label"],
})

# ---------------------------------------------------------------- Finland
COUNTRIES.append({
    "id": "FI", "name": "Finland", "available": True,
    "scheme": "Energiatodistus (E-luku)", "method": "Ympäristöministeriö decree 1048/2017 + calculation guideline",
    "legal_basis": "Decree 1048/2017 Annex 2", "climate": ["FI"],
    "floor_area": {"code": "A_netto", "name": "net heated area", "basis": "internal", "status": "official"},
    "label": {
        "version": "1048/2017", "valid_from": "2018-01-01", "indicator": "weighted", "indicator_name": "E-luku (weighted purchased energy)",
        "unit": "kWhE/m2.a", "scale_type": "area_formula",
        "area_bands": [
            {"area_min": 50, "area_max": 150, "formulas": [
                {"class": "A", "c": 110, "k": -0.2}, {"class": "B", "c": 215, "k": -0.6}, {"class": "C", "c": 252, "k": -0.6},
                {"class": "D", "c": 332, "k": -0.6}, {"class": "E", "c": 462, "k": -0.6}, {"class": "F", "c": 532, "k": -0.6},
                {"class": "G", "c": None, "k": None}]},
            {"area_min": 150, "area_max": 600, "formulas": [
                {"class": "A", "c": 83, "k": -0.02}, {"class": "B", "c": 131, "k": -0.04}, {"class": "C", "c": 173, "k": -0.07},
                {"class": "D", "c": 253, "k": -0.07}, {"class": "E", "c": 383, "k": -0.07}, {"class": "F", "c": 453, "k": -0.07},
                {"class": "G", "c": None, "k": None}]},
            {"area_min": 600, "area_max": None, "formulas": [
                {"class": "A", "c": 70, "k": 0}, {"class": "B", "c": 106, "k": 0}, {"class": "C", "c": 130, "k": 0},
                {"class": "D", "c": 210, "k": 0}, {"class": "E", "c": 340, "k": 0}, {"class": "F", "c": 410, "k": 0},
                {"class": "G", "c": None, "k": None}]},
        ],
        "formula_note": "max = c + k * A_netto. E-luku is rounded UP to an integer before classing. >600 m2 A limit (70) inferred from B starting at 71.",
        "status": "official", "source": S["fi_decree"],
    },
    "factors": {
        "electricity": f(weight=1.2, src=S["fi_decree"]), "district_heat": f(weight=0.5, src=S["fi_decree"]),
        "fossil_fuels": f(weight=1.0, src=S["fi_decree"]), "renewable_fuels": f(weight=0.5, src=S["fi_decree"]),
    },
    "pv_rule": "Only self-consumed PV is credited; export is not.",
    "gaps": ["March 2026 draft amendment", "Usage values from decree 1010/2017 (stored values are unverified)"],
})

# ---------------------------------------------------------------- Estonia
COUNTRIES.append({
    "id": "EE", "name": "Estonia", "available": True,
    "scheme": "Energiamärgis (ETA)", "method": "Regulation 58 (simulation based)", "legal_basis": "Regulation 36 Annex 3 (reworded 2026-07-09)",
    "climate": ["EE"],
    "floor_area": {"code": "A_heated", "name": "heated area", "basis": "internal", "status": "unverified"},
    "label": {
        "version": "2026-07-09", "valid_from": "2026-07-09", "indicator": "weighted", "indicator_name": "ETA weighted energy", "unit": "kWh/m2.a",
        "scale_type": "area_bands",
        "bands": [
            {"area_max": 120, **classes([("A", 135), ("B", 160), ("C", 185), ("D", 235), ("E", 285), ("F", 350), ("G", None)])},
            {"area_max": 220, **classes([("A", 120), ("B", 140), ("C", 160), ("D", 210), ("E", 260), ("F", 330), ("G", None)])},
            {"area_max": None, **classes([("A", 100), ("B", 120), ("C", 140), ("D", 200), ("E", 250), ("F", 320), ("G", None)])},
        ],
        "source": S["ee_annex3"],
    },
    "factors": {
        "source_doc": "Regulation nr 63 (2018) 'Hoone energiatõhususe miinimumnõuded' § 9 lg 1, version in force 2026-09-01; listed as 'kehtiv' in the Climate Ministry study of May 2026. CO2 from the Climate Ministry 2025 footprint model",
        "electricity": f(weight=2.0, co2=0.612, src=S["ee_reg63"],
                         note="The May 2026 Climate Ministry study proposes 1.8 and 0.215 kg CO2/kWh; not adopted as of 2026-11-12"),
        "district_heat_efficient": f(weight=0.65, co2=0.157, src=S["ee_reg63"], note="'Tõhus kaugküte': at least 50% renewable, 50% waste heat or 75% CHP heat"),
        "district_heat": f(weight=0.9, co2=0.157, src=S["ee_reg63"]),
        "gas": f(weight=1.0, co2=0.195, src=S["ee_reg63"]),
        "renewable_fuels": f(weight=0.65, src=S["ee_reg63"], note="Wood, wood-based fuel and other biofuel (not peat)"),
        "oil": f(co2=0.267, status="official", src=S["ee_co2"]),
        "lpg": f(co2=0.228, status="official", src=S["ee_co2"]),
    },
    "gaps": ["Weighting factors read in the Estlex consolidation (Riigi Teataja page did not load)", "Whether the method is hourly", "CO2 factors are from the ministry footprint model, not the label method"],
})

# ---------------------------------------------------------------- Slovenia
COUNTRIES.append({
    "id": "SI", "name": "Slovenia", "available": True,
    "scheme": "Energetska izkaznica", "method": "PURES-3 / TSG-1-004:2022 (monthly)", "legal_basis": "Pravilnik, Uradni list RS 4/2023",
    "climate": ["SI"],
    "floor_area": {"code": "A_use", "name": "conditioned (useful) floor area", "basis": "internal", "status": "official"},
    "label": {
        "version": "UL RS 4/2023", "valid_from": "2023-02-01", "indicator": "heat_need", "indicator_name": "Q'H,nd,an heating need", "unit": "kWh/m2.a",
        "scale": classes([("A1", 10), ("A2", 15), ("B1", 25), ("B2", 35), ("C", 60), ("D", 105), ("E", 150), ("F", 210), ("G", None)]),
        "source": S["si_rule"],
    },
    "factors": {
        "source_doc": "Uradni list RS 70/2022, Tabela 1",
        "electricity": f(pe_tot=2.5, pe_nren=1.5, co2=0.420, src=S["si_factors"], status="official", note="Electricity row read from search extract of Tabela 1"),
        "gas": f(pe_tot=1.1, pe_nren=1.1, co2=0.220, src=S["si_factors"]),
        "oil": f(pe_tot=1.1, pe_nren=1.1, co2=0.290, src=S["si_factors"]),
        "wood": f(pe_tot=1.2, pe_nren=0.2, co2=0.040, src=S["si_factors"]),
        "district_heat_nonrenewable": f(pe_tot=1.3, pe_nren=1.3, co2=0.260, src=S["si_factors"]),
        "district_heat_biomass": f(pe_tot=1.61, pe_nren=0.33, src=S["si_factors"]),
    },
    "gaps": ["National climate data source (ARSO)"],
})

# ---------------------------------------------------------------- Croatia
COUNTRIES.append({
    "id": "HR", "name": "Croatia", "available": True,
    "scheme": "Energetski certifikat", "method": "Algoritam (monthly, HRN EN ISO 13790 based)", "legal_basis": "Pravilnik NN 88/2017 (+NN 90/2020)",
    "climate": ["HR_cont", "HR_coast"], "climate_note": "Reference stations, not site climate: Zagreb-Maksimir (continental), Split-Marjan (littoral)",
    "floor_area": {"code": "A_K", "name": "useful heated floor area", "basis": "internal", "status": "official"},
    "label": {
        "version": "NN 88/2017", "valid_from": "2017-09-01", "indicator": "heat_need", "indicator_name": "Q''H,nd,ref heating need at reference climate",
        "unit": "kWh/m2.a",
        "scale": classes([("A+", 15), ("A", 25), ("B", 50), ("C", 100), ("D", 150), ("E", 200), ("F", 250), ("G", None)]),
        "source": S["hr_classes"], "note": "NN 88/2017 Prilog 1 Tablica 1 (all classes A+..G, read 2026-11-12). Tablica 2 adds a second A+..G scale on primary energy (limits in an image, not modelled).",
    },
    "factors": {
        "source_doc": "Metodologija izračuna faktora primarne energije 2017",
        "electricity": f(pe_tot=1.614, src=S["hr_pef"]),
        "gas": f(pe_tot=1.097, co2=0.220, src=S["hr_pef"], note="CO2 61.17 kg/GJ = 0.220 kg/kWh"),
    },
    "requirements": {"nzeb_Eprim": {"continental": 45, "littoral": 35, "unit": "kWh/m2.a", "status": "official"}},
    "gaps": ["Electricity CO2 factor", "Primary-energy scale (Tablica 2) limits", "No replacement of NN 88/2017 found (2026-11-12)"],
})

# ---------------------------------------------------------------- Spain
COUNTRIES.append({
    "id": "ES", "name": "Spain", "available": True,
    "scheme": "Certificado de eficiencia energética", "method": "CTE DB-HE 2019 tools (HULC / CE3X)", "legal_basis": "RD 390/2021",
    "climate": ["ES"], "climate_note": "v1 uses climate zone D3 (Madrid). ~40 zones exist.",
    "floor_area": {"code": "S_util", "name": "useful floor area", "basis": "internal", "status": "official"},
    "label": {
        "version": "Calificación (Annex IV) zone D3, single-family", "valid_from": "2021-06-01", "indicator": "pe_nren",
        "indicator_name": "non-renewable primary energy (heating, cooling, DHW)", "unit": "kWh/m2.yr",
        "scale": classes([("A", 54.2), ("B", 87.8), ("C", 136.1), ("D", 209.3), ("E", 375.6), ("F", 473.2), ("G", None)], lt=True),
        "second_rating": {"indicator": "co2", "unit": "kgCO2/m2.yr",
                          **classes([("A", 12.2), ("B", 19.9), ("C", 30.8), ("D", 47.3), ("E", 83.7), ("F", 100.4), ("G", None)], lt=True)},
        "source": S["es_calif"], "note": "Downloaded copy may be a pre-publication version (cover date 'XX'). Other zones: C2, E1, A3 tables in the same annex.",
    },
    "factors": {
        "source_doc": "Documento Reconocido RITE: Factores de emisión de CO2 y coeficientes de paso a energía primaria (2016)",
        "electricity": f(pe_tot=2.368, pe_nren=1.954, co2=0.331, src=S["es_factors"], note="Peninsular grid"),
        "gas": f(pe_tot=1.195, pe_nren=1.190, co2=0.252, src=S["es_factors"]),
        "oil": f(pe_tot=1.182, pe_nren=1.179, co2=0.311, src=S["es_factors"]),
        "lpg": f(pe_tot=1.204, pe_nren=1.201, co2=0.254, src=S["es_factors"]),
    },
    "gaps": ["Tables for other climate zones"],
})

# ---------------------------------------------------------------- Belgium - Wallonia
COUNTRIES.append({
    "id": "BE-WAL", "name": "Belgium - Wallonia", "map_id": "BE", "available": True,
    "scheme": "Certificat PEB", "method": "PEB / PER method (AGW PEB 2026 Annex A1)", "legal_basis": "Décret PEB 28 Nov 2013; AGW PEB",
    "climate": ["BE"],
    "floor_area": {"code": "Ach", "name": "heated floor area", "basis": "gross_external", "status": "unverified"},
    "label": {
        "version": "Wallonia PEB", "valid_from": "2016", "indicator": "pe_tot", "indicator_name": "Espec total primary energy", "unit": "kWh/m2.yr",
        "scale": classes([("A++", 0), ("A+", 45), ("A", 85), ("B", 170), ("C", 255), ("D", 340), ("E", 425), ("F", 510), ("G", None)], status="secondary"),
        "source": S["wa_scale"],
        "note": "Same limits at Certinergie, Atlas Contrôle and the 2026 Certinergie barometer (2026-11-12); the SPW annex itself not read. Some sites show a table shifted by one class - those are wrong.",
    },
    "factors": {
        "source_doc": "AGW PEB 2026 Annex A1 (PER), Annexe F, Tableau [29]",
        "electricity": f(pe_tot=2.5, src=S["wa_annexA1"], note="Same 2.5 for PV and CHP electricity. Table CO2 0.179 (unit per MJ; basis unverified)"),
        "gas": f(pe_tot=1.0, src=S["wa_annexA1"], note="NCV/GCV 0.90; table CO2 0.056 kg/MJ = 0.202 kg/kWh"),
        "oil": f(pe_tot=1.0, src=S["wa_annexA1"], note="table CO2 0.073 kg/MJ"),
        "wood": f(pe_tot=1.0, co2=0.0, src=S["wa_annexA1"]),
        "district_heat": f(pe_tot=2.0, src=S["wa_annexA1"], note="Default when not determined in detail"),
        "ambient_heat": f(pe_tot=1.0, co2=0.0, src=S["wa_annexA1"]),
    },
    "requirements": {"Ew": {"max": 45}, "Espec": {"max": 85}, "status": "official", "source": S["wa_qzen"]},
    "gaps": ["Official band table from SPW", "Floor-area definition", "CO2 column unit basis"],
})

# ---------------------------------------------------------------- Belgium - Brussels
COUNTRIES.append({
    "id": "BE-BRU", "name": "Belgium - Brussels", "map_id": "BE", "available": True,
    "scheme": "Certificat PEB", "method": "Bruxelles Environnement certification method", "legal_basis": "COBRACE / PEB",
    "climate": ["BE"],
    "floor_area": {"code": "A_brut", "name": "gross floor area of the PEB unit", "basis": "gross_external", "status": "official", "source": S["bru_method"]},
    "label": {
        "version": "Brussels PEB", "valid_from": "2011", "indicator": "pe_tot", "indicator_name": "total primary energy", "unit": "kWhEP/m2.yr",
        "scale": classes([("A+", 15), ("A", 30), ("A-", 45), ("B", 95), ("C", 150), ("D", 210), ("E", 275), ("F", 345), ("G", None)], status="official"),
        "source": S["bru_classes"], "secondary_source": S["bru_explain"],
        "note": "Main bands official (Bruxelles Environnement: A <=45, B 46-95, C 96-150, D 151-210, E 211-275, F 276-345, G >345). Each class has +/0/- thirds: "
                "Bruxelles Environnement gives C- = 133-150; the A+/A/A- limits 15/30 follow the same thirds rule (derived). From 2033 every home must reach 275 (class E).",
    },
    "factors": {
        "electricity": f(pe_tot=2.5, status="official", src="https://document.environnement.brussels/opac_css/elecfile/IF_NRJ_ResultatCertificatPEB_FR",
                         note="Stated on Bruxelles Environnement's certificate explanation"),
        "gas": f(pe_tot=1.0, status="secondary", note="Belgian EPB methods share fossil fp = 1.0 (Wallonia and Flanders official)"),
    },
    "requirements": {"CEP": {"max": 45}, "heating_need": {"max": 15}, "status": "official", "source": S["bru_req"]},
    "conventions": {"heating_setpoint_C": {"value": 18, "status": "official", "source": S["bru_explain"],
                                           "note": "Mean 18 C in all rooms through the heating season, 365 days a year (Bruxelles Environnement, certificate explanation, Jan 2025)"}},
    "gaps": ["Gas/DH factors", "CO2 factors", "A sub-level limits derived from the thirds rule"],
})

# ---------------------------------------------------------------- Slovakia
COUNTRIES.append({
    "id": "SK", "name": "Slovakia", "available": True,
    "scheme": "Energetický certifikát", "method": "STN 73 0540 / STN EN ISO 52016-1", "legal_basis": "Vyhláška 364/2012 as amended by 35/2020",
    "climate": ["SK"],
    "floor_area": {"code": "A_f", "name": "floor area", "basis": "internal", "status": "unverified"},
    "label": {
        "version": "35/2020", "valid_from": "2020-03-10", "indicator": "pe_nren", "indicator_name": "global indicator - primary energy", "unit": "kWh/m2.a",
        "scale": classes([("A0", 54), ("A1", 108), ("B", 216), ("C", 324), ("D", 432), ("E", 540), ("F", 648), ("G", None)]),
        "source": S["sk_annex_classes"], "note": "Annex table F (global indicator, rodinné domy), checked in the annex PDF text 2026-11-10. A0+ for an A0 building that exports/stores energy.",
        "partial_scale_heating": {"indicator": "heat_need", **classes([("A", 43), ("B", 86), ("C", 129), ("D", 172), ("E", 215), ("F", 258), ("G", None)])},
    },
    "factors": {
        "source_doc": "Vyhláška 364/2012 Príloha 2 (as of 2020-03-10)",
        "electricity": f(pe_nren=2.2, co2=0.167, src=S["sk_annex_factors"]),
        "gas": f(pe_nren=1.1, co2=0.220, src=S["sk_annex_factors"]),
        "wood_pellets": f(pe_nren=0.20, co2=0.020, src=S["sk_annex_factors"]),
        "district_heat_gas": f(pe_nren=1.3, co2=0.220, src=S["sk_annex_factors"]),
        "district_heat_chp": f(pe_nren=0.7, co2=0.220, src=S["sk_annex_factors"]),
        "pv": f(pe_nren=0.0, co2=0.0, src=S["sk_annex_factors"]),
        "heat_pump_default_cop": {"air_water_radiator": 2.6, "air_water_lowtemp": 2.9, "ground_water_radiator": 2.9, "ground_water_lowtemp": 3.4,
                                  "status": "official", "source": S["sk_annex_factors"]},
    },
    "conventions": {"min_air_change_h": {"value": 0.5, "status": "official", "source": S["sk_annex_classes"]},
                    "nzeb_heat_recovery_min": {"value": 0.60, "status": "official", "source": S["sk_annex_classes"]}},
    "gaps": ["Climate data (STN 73 0540)"],
})

# ---------------------------------------------------------------- Hungary
COUNTRIES.append({
    "id": "HU", "name": "Hungary", "available": True,
    "scheme": "Energetikai tanúsítvány", "method": "9/2023 ÉKM decree (monthly)", "legal_basis": "9/2023. (V. 25.) ÉKM rendelet",
    "climate": ["HU"],
    "floor_area": {"code": "A_N", "name": "useful floor area", "basis": "internal", "status": "official"},
    "label": {
        "version": "9/2023", "valid_from": "2023-11-01", "indicator": "pe_nren", "indicator_name": "non-renewable primary energy excl. lighting",
        "unit": "kWh/m2.a", "reference_requirement": 76,
        "scale": classes([("A+++", 0), ("A++", 38), ("A+", 68.4), ("A", 76), ("B", 98.8), ("C", 121.6), ("D", 152), ("E", 190),
                          ("F", 235.6), ("G", 296.4), ("H", 380), ("I", None)], status="official"),
        "source": S["hu_cert"], "secondary_source": S["hu_scale"],
        "note": "Classes A+++2023..I2023 at 0/50/90/100/130/160/200/250/310/390/500 % of the requirement value: 176/2008 Korm. rendelet 3. melléklet (version 2026-01-06), read 2026-11-12. "
                "The 76 kWh/m2.a requirement for homes comes from the chamber of engineers (secondary); the decree gives it as a formula in an image.",
        "reference_requirement_status": "secondary",
    },
    "factors": {
        "source_doc": "9/2023 ÉKM",
        "source_doc": "9/2023 ÉKM 7. melléklet 2. pont (factors on net calorific value), read 2026-11-12",
        "electricity": f(pe_tot=2.6, pe_nren=2.3, co2=0.455, src=S["hu_decree"]),
        "gas": f(pe_tot=1.1, pe_nren=1.1, co2=0.297, src=S["hu_decree"]),
        "oil": f(pe_tot=1.1, pe_nren=1.1, co2=0.308, src=S["hu_decree"]),
        "wood": f(pe_tot=1.2, pe_nren=0.6, co2=0.040, src=S["hu_decree"], note="0.2 non-renewable for qualifying boilers (EU 2015/1189, pellet stoves <=50 kW)"),
        "district_heat": f(pe_tot=1.38, pe_nren=1.38, co2=0.374, src=S["hu_decree"], note="Default when the supplier publishes no own factor"),
    },
    "gaps": ["Whether the 76 kWh/m2.a requirement is flat for small houses (formula is an image in 9/2023 ÉKM 5. melléklet)"],
})

# ---------------------------------------------------------------- not available (map greys)
COMING_SOON = {
    "FR": ("France", "Needs the DPE CO2 factors; will be shown as an indicative DPE."),
    "BE-VLG": ("Belgium - Flanders", "Only class A is official; the full scale and the A-G switch date are pending."),
    "LU": ("Luxembourg", "Official class table (RGD 2021 Annex I) not yet confirmed."),
    "SE": ("Sweden", "New Etal method and scale since 1 Oct 2026; values not yet published."),
    "LV": ("Latvia", "Class limits published only as an image; being transcribed."),
    "CZ": ("Czechia", "Classes are relative to a reference building; reference values pending."),
    "IT": ("Italy", "Classes are relative to a reference building; reference values pending."),
    "GR": ("Greece", "Classes are relative to a reference building; reference values pending."),
    "PT": ("Portugal", "Reference-building scale; official annexes not yet read."),
    "RO": ("Romania", "Official single-family class table not yet confirmed."),
    "BG": ("Bulgaria", "Reference values for houses not yet extracted."),
    "PL": ("Poland", "No energy classes in force yet."),
    "LT": ("Lithuania", "Class depends on several tests, not one energy value."),
    "MT": ("Malta", "No classes defined for dwellings."),
    "CY": ("Cyprus", "Class limits not published."),
}


# ---------------------------------------------------------------- usage conventions
# Shared fallback = EN ISO 52016-1 / EN 16798-1 style residential values; country entries override.
U = "unverified"
CONVENTIONS = {
    "_default": {"setpoint_C": 20, "internal_gains_W_m2": 3.0, "dhw_kWh_m2a": 15, "air_change_h": 0.5, "status": "assumption",
                 "note": "Used where a country value is missing; documented as an app assumption"},
    "NL": {"setpoint_C": 20, "status": U, "note": "NTA 8800 values pending (OPEN_DATA_GAPS A2)"},
    "DE": {"setpoint_C": 20, "internal_gains_W_m2": 1.875, "dhw_kWh_m2a": 12.5, "status": "official (hot water) / secondary (gains)", "source": S["de_par20"],
           "note": "Hot water 12.5 kWh/(m2.a) per A_N: GModG § 20 Abs. 2. Internal gains 45 Wh/(m2.d) = 1.875 W/m2: DIN V 18599-10 single-family (paid standard; secondary)"},
    "AT": {"setpoint_C": 20, "heating_limit_C": 12, "internal_gains_W_m2": 3.75, "status": "official (setpoints) / unverified (gains)", "source": S["at_brochure"]},
    "IE": {"setpoint_C": "21 living / 18 rest", "status": "official (setpoints, occupancy) / default (gains, hot water)", "source": S["ie_deap427"],
           "note": "DEAP 4.2.7: 21 C living area / 18 C rest, 56 h/week; occupancy N(TFA) formula official. Gains and hot water depend on N inside the DEAP software; the app keeps its EN default"},
    "DK": {"setpoint_C": 20, "internal_gains_W_m2": 5.0, "dhw_L_m2a": 250, "status": "secondary", "source": S["dk_sbi213"],
           "note": "SBi 213 dwelling defaults: persons 1.5 W/m2 + equipment incl. lighting 3.5 W/m2 (min 90 / 210 W per home), hot water 250 L/(m2.a). SBi 213 itself is paid; values from the industry guide"},
    "FI": {"setpoint_C": 21, "internal_gains_W_m2": {"persons": 2, "appliances": 3, "lighting": 6, "usage_factors": [0.6, 0.6, 0.1]},
           "dhw_kWh_m2a": 35, "dhw_max_kWh_per_dwelling": 4200, "vent_dm3_s_m2": 0.4, "status": "official", "source": S["fi_1010"],
           "note": "Decree 1010/2017 class 1 (small residential): §10 outdoor air 0.4 dm3/(s.m2), heating limit 21 C; §11 lighting 6 / appliances 3 / people 2 W/m2 with usage 0.1 / 0.6 / 0.6; §12 hot water 35 kWh/(m2.a), at most 4200 kWh per dwelling"},
    "SK": {"air_change_h": 0.5, "status": "official", "source": S["sk_annex_classes"]},
    "BE-BRU": {"setpoint_C": 18, "status": "official (setpoint) / default (gains, hot water)", "source": S["bru_explain"],
               "note": "Brussels certificate: 18 C mean in all rooms, 365 days; hot water scales with home size (about 150 L/day for 170 m2)"},
}

# ---------------------------------------------------------------- building code: envelope limits for new houses
# U-values W/(m2.K). Used for the game goal "meets the building code". Mostly unverified - see status.
# kind: element_max = every element must stay at or below the value; reference_building = values of the
# national reference house the real house is compared with (not a hard limit); reference_values = the
# national reference house (FI); envelope_average = one limit for the whole envelope, no element limits.
# confidence: high = read in the legal text itself; medium = consistent secondary sources; low = needs deep research.
BUILDING_CODE = {
    "NL": {"kind": "element_max", "Rc_floor_min": 3.7, "Rc_wall_min": 4.7, "Rc_roof_min": 6.3, "U_window_max": 1.65,
           "U_window_note": "area-weighted average of all windows and doors; 2.2 for a single element",
           "status": "official", "confidence": "high",
           "note": "Bbl new-build minimums (Rc in m2K/W); confirmed by IPLO and in a 2026 tool run",
           "source": "https://iplo.nl/regelgeving/regels-voor-activiteiten/bouwen/energiezuinigheid/"},
    "FI": {"kind": "reference_values", "U_wall": 0.17, "U_floor_ground": 0.16, "U_roof": 0.09, "U_window": 1.0, "U_door": 1.0, "q50": 4.0,
           "status": "official", "confidence": "high",
           "note": "Reference values for permits from 2018 (decree 1048/2017 Table 1)", "source": S["fi_decree"]},
    "DE": {"kind": "reference_building", "U_wall": 0.28, "U_roof": 0.20, "U_floor": 0.35, "U_window": 1.3, "g_window": 0.60,
           "status": "official", "confidence": "high",
           "note": "GEG Anlage 1 reference building. Not maximums: the real house must not use more primary energy than this reference.",
           "source": "https://www.gesetze-im-internet.de/geg/anlage_1.html"},
    "AT": {"kind": "element_max", "U_wall_max": 0.35, "U_roof_max": 0.20, "U_floor_max": 0.40, "U_window_max": 1.4,
           "status": "secondary", "confidence": "medium",
           "note": "OIB-RL 6 point 4.5.1 table. Window 1.4 and wall 0.35 seen in 2025 university slides; roof and floor from 2019/2023 energy certificates. The Tirol 2025 guide says these maximums are far from enough for a zero-emission building (about 0.15 opaque and 0.8 windows needed).",
           "source": "https://www.tirol.gv.at/fileadmin/themen/bauen-wohnen/baupolizei/20260219_Zentrale_%C3%84nderungen_der_OIB_Richtlinie_6_im_Jahr_2025.pdf"},
    "IE": {"kind": "element_max", "U_wall_max": 0.18, "U_roof_max": 0.16, "U_roof_flat_max": 0.20, "U_floor_max": 0.18, "U_window_max": 1.4,
           "U_single_element_max": {"opaque": 0.6, "roof": 0.3, "window": 3.0},
           "status": "official", "confidence": "high",
           "note": "TGD L Dwellings Table 1, area-weighted average elemental U-values (same table in the 2022 edition and the 2025 consultation draft)",
           "source": "https://technical-regulation-information-system.ec.europa.eu/es/notification/26494/text/D/EN"},
    "DK": {"kind": "element_max", "U_wall_max": 0.30, "U_roof_max": 0.20, "U_floor_max": 0.20, "U_door_max": 1.0,
           "window_rule": {"type": "energy_balance", "formula": "196.4*g_w - 90.36*U_w", "min_kWh_m2": 0.0,
                           "reference_size_m": [1.23, 1.48], "roof_window_formula": "345*g_w - 90.36*U_w", "roof_window_min": 10.0},
           "psi_max": {"foundation": 0.40, "wall_window": 0.06},
           "status": "official", "confidence": "high",
           "note": "BR18 par. 257 (minimum requirements) and par. 258 (windows: energy balance, no U limit)",
           "source": "https://www.bygningsreglementet.dk/media/e1yd0sbm/krav.pdf"},
    "ES": {"kind": "element_max", "U_wall_max": 0.41, "U_roof_max": 0.35, "U_ground_max": 0.65, "U_window_max": 1.8,
           "status": "official", "confidence": "high",
           "note": "CTE DB-HE Tabla 3.1.1.a-HE1, climate zone D (Madrid): walls and floors to outside air 0.41, roofs 0.35, elements against ground or unheated spaces 0.65, windows (frame + glass + shutter box) 1.8. Read in the DB-HE PDF 2026-11-12.",
           "source": S["es_dbhe"]},
    "SI": {"kind": "envelope_average", "Htr_formula": "0.25 + theta_an/300 + 0.04/f0 + z/8",
           "Htr_vars": {"theta_an": "mean annual outdoor temp, clamped 7-11 C", "f0": "envelope area / gross volume, clamped 0.2-1.2", "z": "glazed area / envelope area"},
           "reference_building_U_window": 1.0,
           "status": "official", "confidence": "medium",
           "note": "TSG-1-004:2022 par. 8.1.6: no element maximums, only a limit on whole-envelope transmission loss H'tr (W/m2K). Formula read from the PDF layout; fraction placement to be checked.",
           "source": "https://www.gov.si/assets/ministrstva/MNVP/Dokumenti/Graditev/TSG-1-004_2022_ure.pdf"},
    "HR": {"kind": "element_max", "U_wall_max": 0.30, "U_roof_max": 0.25, "U_floor_max": 0.40, "U_window_max": 1.60, "U_glass_max": 1.10, "U_door_max": 2.00,
           "coastal": {"U_wall_max": 0.45, "U_roof_max": 0.30, "U_floor_max": 0.50, "U_window_max": 1.80},
           "status": "official", "confidence": "high",
           "note": "NN 128/15 Annex B Table 1, heated >=18 C, coldest month <=3 C (continental); 'coastal' = coldest month >3 C. Later amendments (70/18, 102/20) keep wall 0.30 and roof 0.25 per a municipal source; window not rechecked.",
           "source": "https://narodne-novine.nn.hr/clanci/sluzbeni/dodatni/438515.pdf"},
    "SK": {"kind": "element_max", "U_wall_max": 0.15, "U_roof_max": 0.10, "U_window_max": 1.0,
           "status": "secondary", "confidence": "medium",
           "note": "STN 73 0540-2 (paid). The standard's author (Sternová, TZB-info 2013) lists target values U_r2 that became the normalized values from 2021: wall 0.15, flat/low-pitch roof 0.10, ceiling to unheated space 0.15. "
                   "Windows: the same article gives 0.60 for the 2012 edition, a Velux note on the +Z1+Z2 edition gives 1.00 for 2021; 1.00 is used.",
           "source": "https://normy.normoff.gov.sk/norma/139404/nahlad"},
    "HU": {"kind": "element_max", "U_wall_max": 0.24, "U_roof_max": 0.17, "U_floor_max": 0.30, "U_window_max": 1.1, "U_window_metal_max": 1.4,
           "U_glass_max": 1.0, "U_door_max": 1.4, "U_roof_window_max": 1.3,
           "status": "official", "confidence": "high",
           "note": "9/2023 (V. 25.) EKM Annex 1 point 1.1 (window 1.1 = wood/PVC frame >0.5 m2; floor 0.30 = slab on ground, new buildings)",
           "source": "https://njt.jog.gov.hu/jogszabaly/2023-9-20-8X"},
    "BE-WAL": {"kind": "element_max", "U_wall_max": 0.24, "U_roof_max": 0.24, "U_floor_max": 0.24, "U_window_max": 1.5, "U_glass_max": 1.1, "U_door_max": 2.0,
               "status": "secondary", "confidence": "medium",
               "note": "PEB Umax since 2021 (AGW annex C1); seen in the Wallonia PEB leaflet, Test-Achats and 2021 PEB reports",
               "source": "https://energie.wallonie.be/servlet/Repository/depliant-peb.pdf?ID=45799"},
    "BE-BRU": {"kind": "element_max", "U_wall_max": 0.24, "U_roof_max": 0.24, "U_floor_max": 0.24, "U_window_max": 1.5, "U_glass_max": 1.1, "U_door_max": 2.0,
               "status": "secondary", "confidence": "medium",
               "note": "Same Umax as Wallonia per Test-Achats (all three regions); Brussels annex not read",
               "source": "https://www.test-achats.be/maison-energie/isolation/dossier/peb"},
    "EE": {"kind": "none", "status": "official", "confidence": "high", "note": "No element limits; only the ETA energy requirement"},
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "conventions.json").write_text(json.dumps(CONVENTIONS, indent=1, ensure_ascii=False), encoding="utf-8")
    (OUT / "building_code.json").write_text(json.dumps(BUILDING_CODE, indent=1, ensure_ascii=False), encoding="utf-8")
    index = []
    for c in COUNTRIES:
        (OUT / f"{c['id']}.json").write_text(json.dumps(c, indent=1, ensure_ascii=False), encoding="utf-8")
        index.append({"id": c["id"], "map_id": c.get("map_id", c["id"]), "name": c["name"], "available": True,
                      "scheme": c["scheme"], "indicator": c["label"]["indicator"]})
    for cid, (name, reason) in COMING_SOON.items():
        index.append({"id": cid, "map_id": cid.split("-")[0], "name": name, "available": False, "reason": reason})
    (OUT / "index.json").write_text(json.dumps({"generated": "2026-11-11", "countries": index}, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"{len(COUNTRIES)} available, {len(COMING_SOON)} coming soon")


if __name__ == "__main__":
    main()
