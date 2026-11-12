"""Build data/catalogue/*.json: the building parts the player can place.

Physics values are typical design values from European standards (EN ISO 10456 for materials,
EN ISO 6946 for surface resistances, EN 673 / EN ISO 10077 for windows, EN 14825 / Ecodesign for
heat generators). They are generic, not product-specific; product-specific values (e.g. BCRG
declarations) can override them later.

"coins" is a game currency for relative cost, NOT euros.
Usage: python scripts/build_catalogue.py
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "data" / "catalogue"
STD = "typical design value (EN ISO 10456 / manufacturer ranges)"

# ------------------------------------------------------------------ materials
# lambda in W/(m.K), density kg/m3, heat capacity J/(kg.K)
MATERIALS = {
    # structure
    "brick_clay":        {"name": "Clay brick",            "lambda": 0.80, "rho": 1800, "c": 840, "kind": "structure"},
    "sand_lime":         {"name": "Sand-lime block",       "lambda": 1.00, "rho": 1800, "c": 840, "kind": "structure"},
    "concrete":          {"name": "Reinforced concrete",   "lambda": 2.30, "rho": 2400, "c": 1000, "kind": "structure"},
    "aerated_concrete":  {"name": "Aerated concrete",      "lambda": 0.11, "rho": 450,  "c": 1000, "kind": "structure"},
    "porotherm":         {"name": "Insulating clay block", "lambda": 0.09, "rho": 700,  "c": 1000, "kind": "structure"},
    "clt":               {"name": "Cross-laminated timber", "lambda": 0.13, "rho": 470, "c": 1600, "kind": "structure"},
    "timber_frame":      {"name": "Timber stud (frame)",   "lambda": 0.13, "rho": 500,  "c": 1600, "kind": "structure"},
    # insulation
    "mineral_wool":      {"name": "Mineral wool",          "lambda": 0.035, "rho": 30,  "c": 1030, "kind": "insulation"},
    "eps":               {"name": "EPS",                   "lambda": 0.032, "rho": 20,  "c": 1450, "kind": "insulation"},
    "pir":               {"name": "PIR board",             "lambda": 0.022, "rho": 32,  "c": 1400, "kind": "insulation"},
    "xps":               {"name": "XPS",                   "lambda": 0.034, "rho": 35,  "c": 1450, "kind": "insulation"},
    "wood_fibre":        {"name": "Wood fibre",            "lambda": 0.040, "rho": 160, "c": 2100, "kind": "insulation", "biobased": True},
    "hemp":              {"name": "Hemp batts",            "lambda": 0.040, "rho": 40,  "c": 1700, "kind": "insulation", "biobased": True},
    "cellulose":         {"name": "Blown cellulose",       "lambda": 0.039, "rho": 50,  "c": 2000, "kind": "insulation", "biobased": True},
    "straw":             {"name": "Straw bale",            "lambda": 0.052, "rho": 100, "c": 1600, "kind": "insulation", "biobased": True},
    # finishes
    "gypsum_board":      {"name": "Gypsum board",          "lambda": 0.25, "rho": 900,  "c": 1000, "kind": "finish"},
    "plaster":           {"name": "Lime plaster",          "lambda": 0.70, "rho": 1600, "c": 1000, "kind": "finish"},
    "timber_cladding":   {"name": "Timber cladding",       "lambda": 0.13, "rho": 500,  "c": 1600, "kind": "finish"},
    "screed":            {"name": "Cement screed",         "lambda": 1.40, "rho": 2000, "c": 1000, "kind": "finish"},
    "roof_tiles":        {"name": "Roof tiles (ventilated, not counted)", "lambda": None, "rho": 2000, "c": 800, "kind": "finish"},
}

# surface resistances EN ISO 6946 (m2.K/W)
RS = {"wall": (0.13, 0.04), "roof": (0.10, 0.04), "floor_ground": (0.17, 0.0), "floor_crawl": (0.17, 0.17)}

# ------------------------------------------------------------------ constructions (layers outside -> inside)
# Insulation thickness is the player's lever; others are fixed per build-up.
CONSTRUCTIONS = {
    "wall_cavity_brick": {"name": "Cavity brick wall", "element": "wall", "style": "Dutch/Belgian classic",
        "layers": [["brick_clay", 0.10], ["INSULATION", None], ["sand_lime", 0.10], ["plaster", 0.01]],
        "insulation_options": ["mineral_wool", "pir", "eps"], "coins_base": 9},
    "wall_etics_block": {"name": "Block wall + external insulation (ETICS)", "element": "wall", "style": "Central Europe",
        "layers": [["plaster", 0.01], ["INSULATION", None], ["sand_lime", 0.175], ["plaster", 0.01]],
        "insulation_options": ["eps", "mineral_wool", "wood_fibre"], "coins_base": 7},
    "wall_monolithic": {"name": "Monolithic insulating block", "element": "wall", "style": "Southern Germany/Austria",
        "layers": [["plaster", 0.02], ["porotherm", 0.425], ["plaster", 0.015]], "insulation_options": [], "coins_base": 8},
    "wall_aerated": {"name": "Aerated concrete wall", "element": "wall", "style": "Nordic/Baltic/Central",
        "layers": [["plaster", 0.01], ["aerated_concrete", 0.365], ["plaster", 0.01]], "insulation_options": [], "coins_base": 7},
    "wall_timber_frame": {"name": "Timber frame wall", "element": "wall", "style": "Nordic/Ireland",
        "layers": [["timber_cladding", 0.022], ["wood_fibre", 0.06], ["INSULATION_FRAMED", None], ["gypsum_board", 0.0125]],
        "insulation_options": ["mineral_wool", "cellulose", "hemp"], "frame_fraction": 0.12, "coins_base": 6},
    "wall_clt": {"name": "CLT wall", "element": "wall", "style": "Alpine / modern",
        "layers": [["timber_cladding", 0.022], ["INSULATION", None], ["clt", 0.10]],
        "insulation_options": ["wood_fibre", "mineral_wool"], "coins_base": 10},
    "wall_straw": {"name": "Straw bale wall", "element": "wall", "style": "Biobased",
        "layers": [["plaster", 0.03], ["straw", 0.45], ["plaster", 0.03]], "insulation_options": [], "coins_base": 6},
    "roof_pitched_rafters": {"name": "Pitched roof, insulation between rafters", "element": "roof",
        "layers": [["roof_tiles", 0], ["wood_fibre", 0.04], ["INSULATION_FRAMED", None], ["gypsum_board", 0.0125]],
        "insulation_options": ["mineral_wool", "cellulose", "wood_fibre"], "frame_fraction": 0.10, "coins_base": 7},
    "roof_flat_concrete": {"name": "Flat roof, warm deck on concrete", "element": "roof",
        "layers": [["INSULATION", None], ["concrete", 0.20], ["plaster", 0.01]], "insulation_options": ["pir", "eps", "mineral_wool"], "coins_base": 8},
    "floor_slab_ground": {"name": "Ground-bearing slab", "element": "floor",
        "layers": [["screed", 0.06], ["INSULATION", None], ["concrete", 0.20]], "insulation_options": ["xps", "eps", "pir"], "coins_base": 6},
    "floor_crawlspace": {"name": "Floor over crawl space", "element": "floor",
        "layers": [["screed", 0.06], ["concrete", 0.20], ["INSULATION", None]], "insulation_options": ["eps", "pir", "mineral_wool"], "coins_base": 6},
}
INSULATION_STEPS_M = [0.0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40]

# ------------------------------------------------------------------ windows (EN 673 glazing, EN ISO 10077 whole window)
WINDOWS = {
    "single":       {"name": "Single glazing",            "U_w": 5.2, "g": 0.85, "frame_fraction": 0.25, "coins_per_m2": 2},
    "double_old":   {"name": "Double glazing (old)",      "U_w": 2.9, "g": 0.75, "frame_fraction": 0.25, "coins_per_m2": 3},
    "double_hr":    {"name": "Double HR++ (low-e, argon)", "U_w": 1.4, "g": 0.60, "frame_fraction": 0.25, "coins_per_m2": 4},
    "triple":       {"name": "Triple glazing",            "U_w": 0.9, "g": 0.50, "frame_fraction": 0.25, "coins_per_m2": 6},
    "triple_passive": {"name": "Triple, passive-house frame", "U_w": 0.7, "g": 0.50, "frame_fraction": 0.22, "coins_per_m2": 8},
}
# A window = frame + glass. U_w is computed per window with EN ISO 10077-1 (area method):
#   U_w = (A_g U_g + A_f U_f + l_g psi_g) / (A_g + A_f)
# Glass: centre-of-glass U_g (EN 673) and g (EN 410), plus the linear loss psi_g of its edge spacer.
GLAZING = {
    "single":         {"name": "Single glass",                 "U_g": 5.8, "g": 0.85, "psi_g": 0.0,  "coins_per_m2": 1},
    "double_old":     {"name": "Double glass (air, old)",      "U_g": 2.8, "g": 0.76, "psi_g": 0.06, "coins_per_m2": 2},
    "double_hr":      {"name": "Double HR++ (low-e, argon)",   "U_g": 1.1, "g": 0.60, "psi_g": 0.06, "coins_per_m2": 3},
    "triple":         {"name": "Triple glass",                 "U_g": 0.6, "g": 0.50, "psi_g": 0.05, "coins_per_m2": 4},
    "triple_passive": {"name": "Triple, warm-edge spacer",     "U_g": 0.5, "g": 0.50, "psi_g": 0.035, "coins_per_m2": 5},
}
# psi_g: EN ISO 10077-1 Annex E, aluminium spacer in a wood/PVC frame = 0.06 (uncoated double); modern low-e units
# come with warm-edge spacers as standard, so 0.06 / 0.05 / 0.035 are typical warm-edge values (secondary).
# Frames: U_f (EN ISO 10077-1 Annex D: metal without thermal break 5.9, PVC 2-3 chambers 2.2-2.0, hardwood 68 mm about 1.8;
# multi-chamber PVC 1.3 and passive frames 0.8 are typical manufacturer / PHI values) and the visible frame + sash width.
FRAMES = {
    "aluminium_old": {"name": "Aluminium, no thermal break", "U_f": 5.9, "width_m": 0.08, "coins_per_m2": 1},
    "aluminium_tb":  {"name": "Aluminium, thermal break",    "U_f": 2.2, "width_m": 0.09, "coins_per_m2": 3},
    "wood":          {"name": "Wood (68 mm hardwood)",       "U_f": 1.8, "width_m": 0.11, "coins_per_m2": 3},
    "pvc":           {"name": "PVC, multi-chamber",          "U_f": 1.3, "width_m": 0.12, "coins_per_m2": 2},
    "passive":       {"name": "Passive-house frame",         "U_f": 0.8, "width_m": 0.13, "coins_per_m2": 5},
}
DOORS = {"door_standard": {"name": "Insulated door", "U": 1.6, "coins": 3}, "door_passive": {"name": "Passive-house door", "U": 0.8, "coins": 5}}
SHADING = {"none": {"F_sh": 1.0}, "overhang": {"F_sh": 0.85, "summer_only": True}, "external_blinds": {"F_sh": 0.30, "summer_only": True}}

# ------------------------------------------------------------------ airtightness and thermal bridges
AIRTIGHTNESS = {  # n50 in 1/h
    "leaky": {"name": "Standard (no test)", "n50": 6.0, "coins": 0},
    "good": {"name": "Good (taped)", "n50": 3.0, "coins": 2},
    "very_good": {"name": "Very good (tested)", "n50": 1.0, "coins": 4},
    "passive": {"name": "Passive house level", "n50": 0.6, "coins": 6},
}
THERMAL_BRIDGES = {  # surcharge on all U-values, W/(m2.K), EN ISO 13789 simplified approach
    "default": {"name": "Not detailed", "dU": 0.10, "coins": 0},
    "standard": {"name": "Standard details", "dU": 0.05, "coins": 2},
    "free": {"name": "Thermal-bridge free", "dU": 0.0, "coins": 4},
}

# ------------------------------------------------------------------ ventilation (fixed per country in v1, still listed)
VENTILATION = {
    "natural": {"name": "Natural (windows/vents)", "eta_hr": 0.0, "fan_W_per_m3h": 0.0},
    "exhaust": {"name": "Mechanical exhaust", "eta_hr": 0.0, "fan_W_per_m3h": 0.10},
    "balanced_hr": {"name": "Balanced with heat recovery", "eta_hr": 0.80, "fan_W_per_m3h": 0.25},
}

# ------------------------------------------------------------------ heat generators
# eff_* = seasonal efficiency (delivered heat / delivered energy). Heat pumps: SCOP by supply temperature.
HEATING = {
    "gas_condensing": {"name": "Gas condensing boiler", "carrier": "gas", "eff_heating": 0.92, "eff_dhw": 0.80, "fossil": True, "coins": 4,
                       "note": "Seasonal on gross calorific value; ~0.98 on net"},
    "oil_boiler": {"name": "Oil boiler", "carrier": "oil", "eff_heating": 0.88, "eff_dhw": 0.75, "fossil": True, "coins": 4},
    "biomass_pellet": {"name": "Pellet boiler", "carrier": "wood", "eff_heating": 0.85, "eff_dhw": 0.75, "fossil": False, "coins": 7},
    "hp_air_water": {"name": "Air-to-water heat pump", "carrier": "electricity", "fossil": False, "coins": 8,
                     "scop": {"35": 3.4, "45": 3.0, "55": 2.6}, "scop_dhw": 2.4, "climate_correction": True,
                     "note": "In-use seasonal values (below EN 14825 lab SCOP ~4.0), calibrated so the RVO reference house L lands near its NTA 8800 BENG 2"},
    "hp_ground_water": {"name": "Ground-source heat pump", "carrier": "electricity", "fossil": False, "coins": 12,
                        "scop": {"35": 4.2, "45": 3.7, "55": 3.2}, "scop_dhw": 2.8, "note": "In-use seasonal values"},
    "hp_hybrid": {"name": "Hybrid heat pump + gas boiler", "carrier": "electricity+gas", "fossil": True, "coins": 7,
                  "share_hp": 0.70, "scop": {"35": 3.3, "45": 2.9, "55": 2.5}, "backup": "gas_condensing"},
    "direct_electric": {"name": "Direct electric heaters", "carrier": "electricity", "eff_heating": 1.0, "eff_dhw": 0.95, "fossil": False, "coins": 2},
    "district_heat": {"name": "District heating", "carrier": "district_heat", "eff_heating": 0.97, "eff_dhw": 0.90, "fossil": "per_country", "coins": 5},
}
EMITTERS = {"radiators_hT": {"name": "High-temperature radiators", "supply_C": 55}, "radiators_lt": {"name": "Low-temperature radiators", "supply_C": 45},
            "floor_heating": {"name": "Floor heating", "supply_C": 35}}

# ------------------------------------------------------------------ renewables
PV = {"panel_Wp_per_m2": 210, "loss_default": 0.14, "coins_per_kWp": 4,
      "note": "Yield per country/orientation from data/climate (PVGIS, 1 kWp at 35deg south); scale by orientation factor"}
SOLAR_THERMAL = {"collector_yield_kWh_m2a": {"north_eu": 350, "central_eu": 400, "south_eu": 550}, "max_dhw_share": 0.60, "coins_per_m2": 3,
                 "status": "assumption", "note": "Simplified: yield capped at 60% of DHW demand"}

# ------------------------------------------------------------------ common demand assumptions (overridden by country conventions)
DEFAULTS = {
    "heating_setpoint_C": 20, "internal_gains_W_m2": 3.0, "dhw_kWh_m2a": 15, "occupancy_note": "per m2 values; country conventions override",
    "household_electricity_kWh_m2a": 25, "status": "assumption",
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {"generated": "2026-11-10", "status": "typical", "basis": STD}
    files = {
        "materials.json": {"meta": meta, "surface_resistance": {k: {"Rsi": a, "Rse": b} for k, (a, b) in RS.items()}, "materials": MATERIALS},
        "constructions.json": {"meta": meta, "insulation_steps_m": INSULATION_STEPS_M, "constructions": CONSTRUCTIONS},
        "openings.json": {"meta": {**meta, "basis": "EN 673 / EN 410 glazing, EN ISO 10077-1 frames (typical values); whole windows computed per size in the app. windows = legacy whole-window values"}, "windows": WINDOWS, "glazing": GLAZING, "frames": FRAMES, "doors": DOORS, "shading": SHADING},
        "envelope_quality.json": {"meta": meta, "airtightness": AIRTIGHTNESS, "thermal_bridges": THERMAL_BRIDGES},
        "systems.json": {"meta": {**meta, "basis": "EN 14825 / Ecodesign typical seasonal values"}, "ventilation": VENTILATION,
                         "heating": HEATING, "emitters": EMITTERS, "pv": PV, "solar_thermal": SOLAR_THERMAL},
        "defaults.json": {"meta": meta, "defaults": DEFAULTS},
    }
    for name, data in files.items():
        (OUT / name).write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    # quick check: U-values of each construction at 0.15 m of its first insulation option
    for cid, c in CONSTRUCTIONS.items():
        rsi, rse = RS["wall" if c["element"] == "wall" else ("roof" if c["element"] == "roof" else "floor_ground")]
        r = rsi + rse
        ins = c["insulation_options"][0] if c["insulation_options"] else None
        for mat, d in c["layers"]:
            if mat.startswith("INSULATION"):
                lam = MATERIALS[ins]["lambda"]
                if mat == "INSULATION_FRAMED":  # parallel path with timber studs
                    ff = c["frame_fraction"]
                    lam = (1 - ff) * lam + ff * MATERIALS["timber_frame"]["lambda"]
                r += 0.15 / lam
            elif MATERIALS[mat]["lambda"]:
                r += d / MATERIALS[mat]["lambda"]
        print(f"{cid:22s} U = {1 / r:.2f} W/m2K  (Rc = {r - rsi - rse:.1f})")


if __name__ == "__main__":
    main()
