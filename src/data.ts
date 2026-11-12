// Loads the database in ../data (built by ../scripts). Everything is small, so it is bundled.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = any;

const countryFiles = import.meta.glob("../data/countries/*.json", { eager: true, import: "default" }) as Record<string, Json>;
const climateFiles = import.meta.glob("../data/climate/*.json", { eager: true, import: "default" }) as Record<string, Json>;
const catalogueFiles = import.meta.glob("../data/catalogue/*.json", { eager: true, import: "default" }) as Record<string, Json>;
const economicsFiles = import.meta.glob("../data/economics/*.json", { eager: true, import: "default" }) as Record<string, Json>;

const base = (p: string) => p.split("/").pop()!.replace(".json", "");
const byName = (files: Record<string, Json>) => Object.fromEntries(Object.entries(files).map(([p, v]) => [base(p), v]));

const countriesRaw = byName(countryFiles);

export type Status = "official" | "secondary" | "unverified" | "proxy" | "assumption" | string;

export interface ClassLimit {
  class: string;
  max: number | null;
}
export interface Formula {
  class: string;
  c: number | null;
  k: number | null;
}

export interface Factor {
  pe_tot?: number;
  pe_nren?: number;
  pe_fossil?: number;
  weight?: number;
  co2?: number;
  status?: Status;
  source?: string;
  note?: string;
}

export interface Country {
  id: string;
  name: string;
  scheme: string;
  method: string;
  legal_basis?: string;
  climate: string[];
  floor_area: { code: string; name: string; basis: "internal" | "gross_external" | "volume"; status?: Status };
  label: Json;
  factors: Record<string, Factor | Json>;
  pv_rule?: string;
  requirements?: Json;
  gaps?: Json;
}

export interface IndexEntry {
  id: string;
  map_id: string;
  name: string;
  available: boolean;
  scheme?: string;
  indicator?: string;
  reason?: string;
}

export const INDEX: IndexEntry[] = countriesRaw["index"].countries;
export const COUNTRIES: Record<string, Country> = Object.fromEntries(
  INDEX.filter((e) => e.available).map((e) => [e.id, countriesRaw[e.id] as Country]),
);
export const CONVENTIONS: Record<string, Json> = countriesRaw["conventions"];
export const BUILDING_CODE: Record<string, Json> = countriesRaw["building_code"];

export interface Climate {
  id: string;
  station: string;
  lat: number;
  lon: number;
  temp_C: number[];
  irr_kWh_m2: Record<"H" | "S90" | "E90" | "W90" | "N90" | "S35", number[]>;
  pv_kWh_per_kWp: number[];
  pv_kWh_per_kWp_year: number;
}
export const CLIMATES: Record<string, Climate> = byName(climateFiles);

const cat = byName(catalogueFiles);
export const MATERIALS: Record<string, { name: string; lambda: number; rho: number; c: number; kind: string }> = cat.materials.materials;
export const SURFACE_R: Record<string, { Rsi: number; Rse: number }> = cat.materials.surface_resistance;
export const CONSTRUCTIONS: Record<string, { name: string; element: "wall" | "roof" | "floor"; style?: string; layers: [string, number | null][]; insulation_options: string[]; coins_base: number }> =
  cat.constructions.constructions;
export const INSULATION_STEPS: number[] = cat.constructions.insulation_steps_m;
export const WINDOWS: Record<string, { name: string; U_w: number; g: number; frame_fraction: number; coins_per_m2: number }> = cat.openings.windows;
export const DOORS: Record<string, { name: string; U: number; coins: number }> = cat.openings.doors;
/** Glass only: centre-of-glass U_g, solar factor g, edge-spacer loss psi_g (W/mK). */
export const GLAZING: Record<string, { name: string; U_g: number; g: number; psi_g: number; coins_per_m2: number }> = cat.openings.glazing;
/** Window frames: U_f and the visible frame + sash width (m). */
export const FRAMES: Record<string, { name: string; U_f: number; width_m: number; coins_per_m2: number }> = cat.openings.frames;
export const AIRTIGHTNESS: Record<string, { name: string; n50: number; coins: number }> = cat.envelope_quality.airtightness;
export const THERMAL_BRIDGES: Record<string, { name: string; dU: number; coins: number }> = cat.envelope_quality.thermal_bridges;
export const SYSTEMS = cat.systems as {
  ventilation: Record<string, { name: string; eta_hr: number; fan_W_per_m3h: number }>;
  heating: Record<string, Json>;
  emitters: Record<string, { name: string; supply_C: number }>;
  pv: { panel_Wp_per_m2: number; loss_default: number; coins_per_kWp: number };
  solar_thermal: { collector_yield_kWh_m2a: Record<string, number>; max_dhw_share: number; coins_per_m2: number };
};
export const DEFAULTS = cat.defaults.defaults as { household_electricity_kWh_m2a: number };

export const PRICES = economicsFiles[Object.keys(economicsFiles).find((k) => k.includes("energy_prices"))!] as Json;
export const GRID_CO2 = economicsFiles[Object.keys(economicsFiles).find((k) => k.includes("grid_co2"))!] as Json;

/** Map code used by Eurostat / GISCO for a scheme id (BE-WAL → BE). */
export const mapId = (id: string) => id.split("-")[0];
