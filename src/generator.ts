// "Ready-made house": a random house whose provisional label in the chosen country is the class
// the player asked for. Houses are drawn along a quality ladder and checked with the engine.

import { CONSTRUCTIONS, INSULATION_STEPS } from "./data";
import { evaluate } from "./engine";
import { House, fillWindows, key, layerU, maxPanels, starterHouse } from "./house";

/** Rc range (m²K/W) for random houses: roughly a 1970s house up to a passive house. */
const RC_RANGE = { wall: [0.2, 7], roof: [0.2, 9], floor: [0.15, 6.5] } as const;

const WINDOWS = ["single", "double_old", "double_hr", "triple", "triple_passive"];
const FRAME_LADDER = ["aluminium_old", "aluminium_tb", "wood", "pvc", "passive"];
const AIR = ["leaky", "good", "very_good", "passive"];
const BRIDGES = ["default", "standard", "free"];
const VENT = ["natural", "exhaust", "balanced_hr"];
const HEAT = ["direct_electric", "oil_boiler", "gas_condensing", "hp_hybrid", "district_heat", "biomass_pellet", "hp_air_water", "hp_ground_water"];
const EMIT = ["radiators_hT", "radiators_lt", "floor_heating"];

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296;
}

function pick<T>(list: T[], q: number, r: () => number, spread = 0.25): T {
  const i = Math.round(q * (list.length - 1) + (r() - 0.5) * spread * list.length);
  return list[Math.max(0, Math.min(list.length - 1, i))];
}

function randomShape(h: House, r: () => number) {
  const w = 6 + Math.floor(r() * 6), d = 6 + Math.floor(r() * 4);
  const x0 = Math.floor((16 - w) / 2), z0 = Math.floor((16 - d) / 2);
  h.cells = new Set();
  for (let x = 0; x < w; x++) for (let z = 0; z < d; z++) h.cells.add(key(x0 + x, z0 + z));
  if (r() < 0.4) {
    // An L-shaped extension at the back.
    const ew = 3 + Math.floor(r() * 3), ed = 2 + Math.floor(r() * 2);
    for (let x = 0; x < ew; x++) for (let z = 0; z < ed; z++) h.cells.add(key(x0 + x, z0 + d + z));
  }
  h.storeys = r() < 0.15 ? 1 : r() < 0.85 ? 2 : 3;
  h.roof = r() < 0.65 ? "gable" : "flat";
}

function randomHouse(q: number, r: () => number): House {
  const h = starterHouse();
  randomShape(h, r);
  // Insulation follows a target Rc between an old uninsulated house and a passive house, never
  // beyond what real projects build (RC_RANGE top ends), whatever material is drawn.
  const targetRc = (elem: keyof typeof RC_RANGE) => {
    const [lo, hi] = RC_RANGE[elem];
    return Math.min(hi, Math.max(lo, lo + (hi - lo) * (q + (r() - 0.5) * 0.2)));
  };
  /** Build-ups that can reach the target: with an insulation layer, or a solid wall whose own Rc is close to it. */
  const fitting = (elem: "wall" | "floor", target: number) => {
    const surface = elem === "floor" ? "floor_ground" : elem;
    const list = Object.keys(CONSTRUCTIONS).filter((k) => {
      const c = CONSTRUCTIONS[k];
      if (c.element !== elem) return false;
      const R0 = layerU({ construction: k, insulation: c.insulation_options[0] ?? "mineral_wool", thickness: 0 }, surface).R;
      return c.insulation_options.length ? R0 <= target + 0.5 : R0 <= RC_RANGE[elem][1] && Math.abs(R0 - target) < 1.5;
    });
    return list[Math.floor(r() * list.length)];
  };
  const layered = (construction: string, elem: keyof typeof RC_RANGE, target: number) => {
    const opts = CONSTRUCTIONS[construction].insulation_options;
    const l = { construction, insulation: opts.length ? opts[Math.floor(r() * opts.length)] : "mineral_wool", thickness: 0 };
    if (!opts.length) return l;
    const hi = RC_RANGE[elem][1];
    const surface = elem === "floor" ? "floor_ground" : elem;
    let best = 0;
    for (const t of INSULATION_STEPS) {
      const R = layerU({ ...l, thickness: t }, surface).R;
      if (R > hi + 0.3) break;
      best = t;
      if (R >= target) break;
    }
    l.thickness = best;
    return l;
  };
  const tw = targetRc("wall"), tr = targetRc("roof"), tf = targetRc("floor");
  h.wall = layered(fitting("wall", tw), "wall", tw);
  h.roofBuild = layered(h.roof === "gable" ? "roof_pitched_rafters" : "roof_flat_concrete", "roof", tr);
  h.floor = layered(fitting("floor", tf), "floor", tf);
  h.window = pick(WINDOWS, q, r);
  h.frame = pick(FRAME_LADDER, q, r);
  h.airtightness = pick(AIR, q, r);
  h.thermalBridges = pick(BRIDGES, q, r);
  h.ventilation = pick(VENT, q, r);
  h.heating = pick(HEAT, q, r, 0.4);
  h.emitter = pick(EMIT, q, r);
  const south = 0.18 + r() * 0.2, other = 0.08 + r() * 0.12;
  fillWindows(h, { N: other, E: other, S: south, W: other }, r() < 0.3 ? "tall" : "standard");
  h.pvPanels = q > 0.5 ? Math.round(maxPanels(h) * (q - 0.5) * 2 * r()) : 0;
  h.solarThermal_m2 = q > 0.6 && r() < 0.3 ? 4 : 0;
  return h;
}

/** A random house that gets class `target` (index on the country's scale) in `country`. */
export function houseForClass(country: string, target: number, seed = Date.now()): { house: House; exact: boolean } {
  const r = rng(seed);
  let best: { house: House; gap: number } | undefined;
  const hits: House[] = [];
  // Three rounds for variety; up to ten when the class is hard to hit (narrow bands).
  for (let round = 0; round < 10 && hits.length < 3 && !(round >= 3 && hits.length); round++) {
    for (let i = 0; i <= 30; i++) {
      const q = Math.min(1, Math.max(0, i / 30 + (r() - 0.5) * 0.05));
      const h = randomHouse(q, r);
      const res = evaluate(h, country);
      const gap = Math.abs(res.label.index - target);
      if (gap === 0) hits.push(h);
      if (!best || gap < best.gap) best = { house: h, gap };
    }
  }
  if (hits.length) return { house: hits[Math.floor(r() * hits.length)], exact: true };
  return { house: best!.house, exact: false };
}
