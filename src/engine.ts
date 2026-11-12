// One shared, simplified monthly energy balance (EN ISO 13790 / 52016 monthly style), then each
// country's own indicator, floor area, factors and label scale. Results are provisional.

import {
  AIRTIGHTNESS, BUILDING_CODE, CLIMATES, CONVENTIONS, COUNTRIES, Climate, Country, DOORS, Factor, GRID_CO2,
  PRICES, SYSTEMS, THERMAL_BRIDGES, mapId,
} from "./data";
import { FACADES, Facade, House, PANEL_KWP, geometry, layerU, windowProps } from "./house";
import { classify, LabelResult } from "./labels";

const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Every modelling choice that is ours, not a country's, with its value. Shown in the expert view. */
export const ASSUMPTIONS = {
  infiltration_e: 0.07, // EN 12831 shielding coefficient: n_inf = n50 * e
  ground_b: 0.6, // slab on ground: reduction for the ground buffer (EN ISO 13370 simplified)
  crawl_b: 0.8,
  solar_frame_shading: 0.9, // non-perpendicular incidence (EN ISO 13790 F_w)
  solar_obstruction: 0.9,
  emission_distribution_loss: 1.1,
  hydronic_pump_kWh: 150, // circulation pump and controls of a water-based heating system
  summer_extra_ach: 1.5, // windows opened on warm days (cooling need only)
  hp_climate_slope: 0.025, // SCOP change per K of the heating-season mean outdoor temperature vs 4 °C
  pv_self_use: "monthly match, export not credited (except NL net metering)",
  dhw_L_to_kWh: 0.0523, // 1 L heated by 45 K
  heat_capacity_kJ_m2K: { heavy: 250, medium: 180, mixed_light: 130, light: 90 } as Record<string, number>,
  cooling_setpoint_C: 24,
  es_reference_cooling_EER: 2.6, // Spain counts a reference cooling system when none is installed
};

export interface Delivered {
  electricity: number;
  gas: number;
  oil: number;
  wood: number;
  district_heat: number;
}

export interface CountryResult {
  country: Country;
  climate: Climate;
  area: number;
  areaCode: string;
  heatNeed: number; // kWh/yr
  coolNeed: number; // kWh/yr
  massKey: string;
  heatNeedMonthly: number[];
  dhwNeed: number;
  delivered: Delivered;
  pv: { generated: number; selfUsed: number; exported: number };
  indicator: { name: string; value: number; unit: string };
  label: LabelResult;
  second?: { name: string; label: LabelResult; value: number };
  perM2: { heatNeed: number; final: number; peTot: number; peNren: number; co2: number };
  co2: number; // kg/yr
  cost: number; // EUR/yr
  flags: { item: string; status: string }[];
  code: CodeCheck[];
  U: { wall: number; roof: number; floor: number; window: number; door: number };
  Htr: number;
  Hve: number;
}

export interface CodeCheck {
  element: string;
  value: number;
  limit: number;
  unit: string;
  ok: boolean;
  kind: string;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = v.match(/\d+(\.\d+)?/g)?.map(Number);
    if (n && n.length) return n.reduce((a, b) => a + b, 0) / n.length;
  }
  return undefined;
}

interface Conv {
  setpoint: number;
  gains: number;
  dhw: number;
  ach: number;
  /** outdoor air flow per m2 of usable area, dm3/(s.m2); replaces ach where a country sets it (FI) */
  qVent?: number;
  /** hot-water need cap per dwelling, kWh/yr (FI) */
  dhwCap?: number;
  status: string;
}

function conventions(id: string): Conv {
  const d = CONVENTIONS._default;
  const c = CONVENTIONS[id] ?? CONVENTIONS[mapId(id)] ?? {};
  let gains = num(c.internal_gains_W_m2);
  if (c.internal_gains_W_m2 && typeof c.internal_gains_W_m2 === "object") {
    const g = c.internal_gains_W_m2;
    const f: number[] = g.usage_factors ?? [1, 1, 1];
    gains = g.persons * f[0] + g.appliances * f[1] + g.lighting * f[2];
  }
  const dhw = num(c.dhw_kWh_m2a) ?? (num(c.dhw_L_m2a) !== undefined ? num(c.dhw_L_m2a)! * ASSUMPTIONS.dhw_L_to_kWh : undefined);
  return {
    setpoint: num(c.setpoint_C) ?? d.setpoint_C,
    gains: gains ?? d.internal_gains_W_m2,
    dhw: dhw ?? d.dhw_kWh_m2a,
    ach: num(c.air_change_h) ?? d.air_change_h,
    qVent: num(c.vent_dm3_s_m2),
    dhwCap: num(c.dhw_max_kWh_per_dwelling),
    status: c.status ?? d.status,
  };
}

type Carrier = keyof Delivered;
const ALIASES: Record<Carrier, string[]> = {
  electricity: ["electricity"],
  gas: ["gas", "fossil_fuels"],
  oil: ["oil", "fossil_fuels"],
  wood: ["wood", "biomass", "wood_pellets", "renewable_fuels"],
  district_heat: ["district_heat", "district_heat_nonrenewable", "district_heat_gas", "district_heat_renewable"],
};
/** Fallbacks where a country gives no factor (flagged "proxy"). */
const FALLBACK: Record<Carrier, { pe: number; co2: number }> = {
  electricity: { pe: 2.0, co2: 0.3 },
  gas: { pe: 1.1, co2: 0.202 },
  oil: { pe: 1.1, co2: 0.267 },
  wood: { pe: 0.2, co2: 0.02 },
  district_heat: { pe: 1.0, co2: 0.2 },
};

type Kind = "pe_tot" | "pe_nren" | "pe_fossil" | "weight" | "co2";
const ORDER: Record<Kind, Kind[]> = {
  pe_tot: ["pe_tot", "pe_nren", "pe_fossil", "weight"],
  pe_nren: ["pe_nren", "pe_fossil", "pe_tot", "weight"],
  pe_fossil: ["pe_fossil", "pe_nren", "pe_tot", "weight"],
  weight: ["weight", "pe_nren", "pe_tot", "pe_fossil"],
  co2: ["co2"],
};

function factor(c: Country, carrier: Carrier, kind: Kind, flags: { item: string; status: string }[]): number {
  for (const name of ALIASES[carrier]) {
    const f = c.factors[name] as Factor | undefined;
    if (!f || typeof f !== "object") continue;
    for (const k of ORDER[kind]) {
      const v = f[k];
      if (typeof v === "number") {
        if (k !== kind || name !== ALIASES[carrier][0]) flags.push({ item: `${carrier} ${kind}: uses ${name} ${k}`, status: "proxy" });
        if (f.status && f.status !== "official") flags.push({ item: `${carrier} factor`, status: f.status });
        return v;
      }
    }
  }
  if (kind === "co2") {
    if (carrier === "electricity") {
      const g = GRID_CO2.countries[mapId(c.id)];
      if (g) {
        flags.push({ item: "electricity CO2 from Ember grid average", status: "proxy" });
        return g.g_per_kWh / 1000;
      }
    }
    flags.push({ item: `${carrier} CO2 default`, status: "proxy" });
    return FALLBACK[carrier].co2;
  }
  flags.push({ item: `${carrier} ${kind} default ${FALLBACK[carrier].pe}`, status: "proxy" });
  return FALLBACK[carrier].pe;
}

function areaFor(c: Country, g: ReturnType<typeof geometry>) {
  switch (c.floor_area.basis) {
    case "gross_external":
      return g.grossFloor;
    case "volume":
      return 0.32 * g.volume;
    default:
      return g.usable;
  }
}

/** Monthly heating need of the house in a climate with a country's usage conventions. */
export function heatBalance(h: House, cl: Climate, conv: Conv) {
  const g = geometry(h);
  const wall = layerU(h.wall, "wall");
  const roof = layerU(h.roofBuild, "roof");
  const floorSurface = h.floor.construction === "floor_crawlspace" ? "floor_crawl" : "floor_ground";
  const floor = layerU(h.floor, floorSurface);
  const win = windowProps(h);
  const door = DOORS[h.door];
  const tb = THERMAL_BRIDGES[h.thermalBridges];
  const winTotal = FACADES.reduce((s, f) => s + g.windowArea[f], 0);
  const b = h.floor.construction === "floor_crawlspace" ? ASSUMPTIONS.crawl_b : ASSUMPTIONS.ground_b;
  const Htr = wall.U * g.wallOpaque + roof.U * g.roofArea + b * floor.U * g.floorArea + win.U_w * winTotal + door.U * g.doorArea + tb.dU * g.envelope;
  const vent = SYSTEMS.ventilation[h.ventilation];
  const nInf = AIRTIGHTNESS[h.airtightness].n50 * ASSUMPTIONS.infiltration_e;
  const ach = conv.qVent !== undefined && g.airVolume > 0 ? (conv.qVent * 3.6 * g.usable) / g.airVolume : conv.ach;
  const nEff = ach * (1 - vent.eta_hr) + nInf;
  const Hve = 0.34 * nEff * g.airVolume;
  // Thermal mass class (EN ISO 13790 / NTA 8800 style): massive walls and floor, mixed, or light.
  const massKey = wall.heavy && floor.heavy ? "heavy" : wall.heavy ? "medium" : floor.heavy ? "mixed_light" : "light";
  const C = (ASSUMPTIONS.heat_capacity_kJ_m2K[massKey] * 1000 * g.usable) / 3600; // Wh/K
  const tau = C / Math.max(1, Htr + Hve);
  const a = 1 + tau / 15;
  const irrKey: Record<Facade, "N90" | "E90" | "S90" | "W90"> = { N: "N90", E: "E90", S: "S90", W: "W90" };
  const monthly: number[] = [];
  const monthlyCool: number[] = [];
  for (let m = 0; m < 12; m++) {
    const hours = DAYS[m] * 24;
    const internal = (conv.gains * g.usable * hours) / 1000;
    let solar = 0;
    for (const f of FACADES) {
      solar += g.windowArea[f] * win.g * ASSUMPTIONS.solar_frame_shading * (1 - win.frame_fraction) * ASSUMPTIONS.solar_obstruction * cl.irr_kWh_m2[irrKey[f]][m];
    }
    const gains = internal + solar;
    // Heating
    const loss = ((Htr + Hve) * Math.max(0, conv.setpoint - cl.temp_C[m]) * hours) / 1000;
    if (loss <= 0) monthly.push(0);
    else {
      const gamma = gains / loss;
      const eta = Math.abs(gamma - 1) < 1e-6 ? a / (a + 1) : (1 - Math.pow(gamma, a)) / (1 - Math.pow(gamma, a + 1));
      monthly.push(Math.max(0, loss - eta * gains));
    }
    // Cooling need (no cooling system is assumed; the need is reported and used where a method counts it)
    const lossC = ((Htr + Hve + 0.34 * ASSUMPTIONS.summer_extra_ach * g.airVolume) * (ASSUMPTIONS.cooling_setpoint_C - cl.temp_C[m]) * hours) / 1000;
    if (gains <= 0) monthlyCool.push(0);
    else if (lossC <= 0) monthlyCool.push(gains - lossC);
    else {
      const lam = lossC / gains;
      const etaL = Math.abs(lam - 1) < 1e-6 ? a / (a + 1) : (1 - Math.pow(lam, a)) / (1 - Math.pow(lam, a + 1));
      monthlyCool.push(Math.max(0, gains - etaL * lossC));
    }
  }
  return { g, monthly, monthlyCool, massKey, Htr, Hve, U: { wall: wall.U, roof: roof.U, floor: floor.U, window: win.U_w, door: door.U }, R: { wall: wall.R, roof: roof.R, floor: floor.R }, nEff, vent, windowKey: h.window, win, ach };
}

function latitudeRegion(lat: number) {
  return lat >= 55 ? "north_eu" : lat <= 45 ? "south_eu" : "central_eu";
}

export function evaluate(h: House, countryId: string): CountryResult {
  const c = COUNTRIES[countryId];
  const cl = CLIMATES[c.climate[0]];
  const conv = conventions(countryId);
  const flags: { item: string; status: string }[] = [];
  if (conv.status !== "official") flags.push({ item: "usage conventions (gains, hot water, setpoint)", status: String(conv.status) });

  const hb = heatBalance(h, cl, conv);
  const { g } = hb;
  const heatNeed = hb.monthly.reduce((s, v) => s + v, 0);
  const coolNeed = hb.monthlyCool.reduce((s, v) => s + v, 0);
  const dhwNeed = Math.min(conv.dhw * g.usable, conv.dhwCap ?? Infinity);

  // Solar thermal covers part of the hot water first.
  const st = SYSTEMS.solar_thermal;
  const solarDhw = Math.min(h.solarThermal_m2 * st.collector_yield_kWh_m2a[latitudeRegion(cl.lat)], st.max_dhw_share * dhwNeed);
  const dhwLeft = dhwNeed - solarDhw;

  const sys = SYSTEMS.heating[h.heating];
  const supply = String(SYSTEMS.emitters[h.emitter].supply_C);
  const del: Delivered = { electricity: 0, gas: 0, oil: 0, wood: 0, district_heat: 0 };
  const elecMonthly = new Array(12).fill(0);
  const heatShare = hb.monthly.map((v) => (heatNeed > 0 ? v / heatNeed : 0));
  const heatGross = heatNeed * ASSUMPTIONS.emission_distribution_loss;

  // Heating-season mean outdoor temperature, for the heat-pump climate correction.
  const tHeat = heatNeed > 0 ? hb.monthly.reduce((s, v, m) => s + v * cl.temp_C[m], 0) / heatNeed : 5;
  const climateCorr = Math.min(1.15, Math.max(0.85, 1 + ASSUMPTIONS.hp_climate_slope * (tHeat - 4)));

  const addElec = (kwh: number, profile?: number[]) => {
    del.electricity += kwh;
    for (let m = 0; m < 12; m++) elecMonthly[m] += kwh * (profile ? profile[m] : DAYS[m] / 365);
  };

  if (sys.scop) {
    const scop = (sys.scop[supply] ?? sys.scop["45"]) * (sys.climate_correction ? climateCorr : 1);
    if (sys.share_hp) {
      const backup = SYSTEMS.heating[sys.backup];
      addElec((heatGross * sys.share_hp) / scop, heatShare);
      del.gas += (heatGross * (1 - sys.share_hp)) / backup.eff_heating + dhwLeft / backup.eff_dhw;
    } else {
      addElec(heatGross / scop, heatShare);
      addElec(dhwLeft / (sys.scop_dhw ?? 2.5));
    }
  } else {
    const carrier = sys.carrier as Carrier;
    if (carrier === "electricity") {
      addElec(heatGross / sys.eff_heating, heatShare);
      addElec(dhwLeft / sys.eff_dhw);
    } else {
      del[carrier] += heatGross / sys.eff_heating + dhwLeft / sys.eff_dhw;
    }
  }
  // Fans and pumps
  const vent = hb.vent;
  const airflow = hb.ach * g.airVolume; // m3/h
  addElec((vent.fan_W_per_m3h * airflow * 8760) / 1000);
  if (h.solarThermal_m2 > 0) addElec(h.solarThermal_m2 * 5);
  if (h.heating !== "direct_electric") addElec(ASSUMPTIONS.hydronic_pump_kWh, heatShare);

  if (c.id === "ES" && coolNeed > 0) {
    // CTE: without an installed system, a reference cooling system is counted.
    addElec(coolNeed / ASSUMPTIONS.es_reference_cooling_EER, hb.monthlyCool.map((v) => v / coolNeed));
    flags.push({ item: "ES: reference cooling system (EER 2.6) counted", status: "assumption" });
  }
  // PV
  const roofFactor = h.roof === "flat" ? 0.92 : g.ridgeAlongX ? 1.0 : 0.85;
  const kWp = h.pvPanels * PANEL_KWP;
  const pvMonthly = cl.pv_kWh_per_kWp.map((v) => v * kWp * roofFactor);
  const pvGen = pvMonthly.reduce((s, v) => s + v, 0);
  let pvSelf = 0;
  for (let m = 0; m < 12; m++) pvSelf += Math.min(pvMonthly[m], elecMonthly[m]);
  const pvExport = pvGen - pvSelf;
  const netMetering = c.id === "NL";

  const elecNet = netMetering ? del.electricity - pvGen : del.electricity - pvSelf;
  if (!netMetering && pvGen > 0) flags.push({ item: "PV: only self-used PV counted (monthly match)", status: "assumption" });
  const net: Delivered = { ...del, electricity: elecNet };

  const area = areaFor(c, g);
  const carriers = Object.keys(net) as Carrier[];
  // Flags are kept for the label indicator and CO2 only; the other figures are context in the details panel.
  const sumF = (kind: Kind, fl = flags) => carriers.reduce((s, k) => (net[k] !== 0 ? s + net[k] * factor(c, k, kind, fl) : s), 0);
  const final = carriers.reduce((s, k) => s + net[k], 0);
  const peTot = sumF("pe_tot", []);
  const peNren = sumF("pe_nren", []);
  const co2 = sumF("co2");

  const L = c.label;
  let value: number;
  let second: CountryResult["second"];
  let label: LabelResult;
  const unit = L.unit ?? "kWh/m²·yr";
  switch (L.indicator) {
    case "pe_fossil":
      value = sumF("pe_fossil") / area;
      break;
    case "pe_tot":
      value = sumF("pe_tot") / area;
      break;
    case "pe_nren":
      value = sumF("pe_nren") / area;
      break;
    case "final":
      value = final / area;
      break;
    case "weighted":
      value = sumF("weight") / area;
      break;
    case "heat_need":
      value = heatNeed / area;
      break;
    case "dual": {
      const hwb = heatNeed / area;
      const eeb = (final + 25 * area) / area; // household electricity default (OIB uses a fixed value)
      flags.push({ item: "AT: household electricity default 25 kWh/m²·yr in EEB", status: "assumption" });
      const a1 = classify({ scale: { classes: L.dual_scale.HWB_Ref_SK } }, hwb, area);
      const a2 = classify({ scale: { classes: L.dual_scale.EEB_SK } }, eeb, area);
      label = a1.index > a2.index ? a1 : a2; // worse of
      label = { ...label, note: `HWB ${a1.cls} · EEB ${a2.cls}` };
      second = { name: "HWB heating need", label: a1, value: hwb };
      value = eeb;
      return finish();
    }
    default:
      value = peNren / area;
  }
  if (c.id === "FI") value = Math.ceil(value);
  label = classify(L, value, area);
  if (L.second_rating) {
    second = { name: "CO₂ rating", label: classify({ scale: { classes: L.second_rating.classes, strictly_below: L.scale?.strictly_below } }, co2 / area, area), value: co2 / area };
  }
  if (L.scale?.status && L.scale.status !== "official") flags.push({ item: "label class limits", status: L.scale.status });
  return finish();

  function finish(): CountryResult {
    const p = PRICES;
    const id = mapId(c.id);
    const pe = p.electricity[id]?.value ?? 0.25;
    const pg = p.gas[id]?.value ?? 0.1;
    // Bill: NL still nets PV against use in 2026; elsewhere exported PV earns ~30% of the retail price (assumption).
    const billed = netMetering ? Math.max(0, del.electricity - pvGen) : del.electricity - pvSelf;
    const exportPay = netMetering ? Math.max(0, pvGen - del.electricity) * pe * 0.3 : pvExport * pe * 0.3;
    const cost = billed * pe - exportPay + del.gas * pg + del.oil * 0.11 + del.wood * 0.08 + del.district_heat * 0.12;
    return {
      country: c,
      climate: cl,
      area,
      areaCode: c.floor_area.code,
      heatNeed,
      coolNeed,
      massKey: hb.massKey,
      heatNeedMonthly: hb.monthly,
      dhwNeed,
      delivered: del,
      pv: { generated: pvGen, selfUsed: pvSelf, exported: pvExport },
      indicator: { name: L.indicator_name ?? L.indicator, value, unit },
      label,
      second,
      perM2: { heatNeed: heatNeed / area, final: final / area, peTot: peTot / area, peNren: peNren / area, co2: co2 / area },
      co2,
      cost,
      flags: dedupe(flags),
      code: codeCheck(c.id, hb, g),
      U: hb.U,
      Htr: hb.Htr,
      Hve: hb.Hve,
    };
  }
}

function dedupe(f: { item: string; status: string }[]) {
  const seen = new Set<string>();
  return f.filter((x) => (seen.has(x.item) ? false : (seen.add(x.item), true)));
}

function codeCheck(id: string, hb: ReturnType<typeof heatBalance>, g: ReturnType<typeof geometry>): CodeCheck[] {
  const bc = BUILDING_CODE[id];
  if (!bc) return [];
  const out: CodeCheck[] = [];
  const u = hb.U;
  const kind = bc.kind as string;
  const add = (element: string, value: number, limit: number | undefined, unit = "W/m²K", higherIsBetter = false) => {
    if (limit === undefined || limit === null) return;
    out.push({ element, value, limit, unit, ok: higherIsBetter ? value >= limit - 1e-9 : value <= limit + 1e-9, kind });
  };
  if (kind === "element_max") {
    if (bc.Rc_wall_min !== undefined) {
      add("Wall Rc", hb.R.wall, bc.Rc_wall_min, "m²K/W", true);
      add("Roof Rc", hb.R.roof, bc.Rc_roof_min, "m²K/W", true);
      add("Floor Rc", hb.R.floor, bc.Rc_floor_min, "m²K/W", true);
      add("Windows + door (average U)", u.window, bc.U_window_max);
    } else {
      add("Wall U", u.wall, bc.U_wall_max);
      add("Roof U", u.roof, bc.U_roof_max);
      add("Floor U", u.floor, bc.U_floor_max ?? bc.U_ground_max);
      add("Window U", u.window, bc.U_window_max);
      add("Door U", u.door, bc.U_door_max);
    }
    if (bc.window_rule?.type === "energy_balance") {
      // Denmark: energy balance of the reference window must be >= 0 kWh/m2.yr
      const w = hb.win;
      const e = 196.4 * w.g - 90.36 * w.U_w;
      out.push({ element: "Window energy balance", value: e, limit: 0, unit: "kWh/m²·yr", ok: e >= 0, kind });
    }
  } else if (kind === "reference_building" || kind === "reference_values") {
    add("Wall U (reference)", u.wall, bc.U_wall);
    add("Roof U (reference)", u.roof, bc.U_roof);
    add("Floor U (reference)", u.floor, bc.U_floor ?? bc.U_floor_ground);
    add("Window U (reference)", u.window, bc.U_window);
  } else if (kind === "envelope_average") {
    const cl = CLIMATES[COUNTRIES[id].climate[0]];
    const tan = Math.min(11, Math.max(7, cl.temp_C.reduce((s, v) => s + v, 0) / 12));
    const f0 = Math.min(1.2, Math.max(0.2, g.envelope / g.volume));
    const win = FACADES.reduce((s, f) => s + g.windowArea[f], 0);
    const z = win / g.envelope;
    const limit = 0.25 + tan / 300 + 0.04 / f0 + z / 8;
    out.push({ element: "Whole envelope H′tr", value: hb.Htr / g.envelope, limit, unit: "W/m²K", ok: hb.Htr / g.envelope <= limit, kind });
  }
  return out;
}

export function evaluateAll(h: House) {
  return Object.keys(COUNTRIES).map((id) => evaluate(h, id));
}
