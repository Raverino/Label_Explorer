// The house the player builds, and its geometry (areas per element and orientation).

import { CONSTRUCTIONS, FRAMES, GLAZING, MATERIALS, SURFACE_R } from "./data";

export type Facade = "N" | "E" | "S" | "W";
export const FACADES: Facade[] = ["N", "E", "S", "W"];

export interface Layered {
  construction: string;
  /** insulation material key (ignored when the construction has no insulation layer) */
  insulation: string;
  /** insulation thickness in m */
  thickness: number;
}

export interface House {
  /** footprint cells on the 1 m grid, as "x,z" (x grows east, z grows south) */
  cells: Set<string>;
  storeys: number;
  storeyHeight: number;
  roof: "gable" | "flat";
  wall: Layered;
  roofBuild: Layered;
  floor: Layered;
  /** glass type (U_g, g) in all windows */
  window: string;
  /** window frame type (U_f, frame width) */
  frame: string;
  /** windows placed on exterior wall faces */
  windows: PlacedWindow[];
  door: string;
  /** front door size, m */
  doorW: number;
  doorH: number;
  airtightness: string;
  thermalBridges: string;
  ventilation: string;
  heating: string;
  emitter: string;
  pvPanels: number;
  solarThermal_m2: number;
}

/** A window in one 1 m wide wall face: cell (x, z), storey and the facade it looks out to. */
export interface PlacedWindow {
  x: number;
  z: number;
  storey: number;
  facade: Facade;
  size: WindowSize;
  /** custom size only: width and height in m (a window wider than 1 m spans the next wall faces) */
  w?: number;
  h?: number;
}

export type WindowSize = "small" | "standard" | "tall" | "custom";
/** Window area (frame + glass) per size, m2. A wall face is 1 m wide and one storey high. */
export const WINDOW_SIZES: Record<Exclude<WindowSize, "custom">, { name: string; area: number; w: number; h: number; sill: number }> = {
  small: { name: "Small window", area: 0.8, w: 0.8, h: 1.0, sill: 1.1 },
  standard: { name: "Window", area: 1.5, w: 0.9, h: 1.65, sill: 0.75 },
  tall: { name: "Glass door / tall window", area: 2.2, w: 0.92, h: 2.4, sill: 0.1 },
};
export const CUSTOM_LIMITS = { w: [0.4, 2.8], h: [0.4, 2.4] } as const;

/** Width, height and sill height (m) of a placed window. Custom windows end at about 2.2 m (the lintel). */
export function windowDims(w: { size: WindowSize; w?: number; h?: number }) {
  if (w.size !== "custom") return WINDOW_SIZES[w.size];
  const W = w.w ?? 1.2, H = w.h ?? 1.4;
  return { name: "Custom window", area: W * H, w: W, h: H, sill: Math.min(1.1, Math.max(0.1, 2.3 - H)) };
}

/** Number of 1 m wall faces a window covers. */
export const windowSpan = (w: { size: WindowSize; w?: number }) => Math.max(1, Math.ceil(windowDims(w as PlacedWindow).w - 0.05));

/** The wall faces a window covers: its anchor face and the next ones along the facade (eastward on N/S, southward on E/W). */
export function windowFaces(w: PlacedWindow) {
  const n = windowSpan(w);
  const along = w.facade === "N" || w.facade === "S";
  return Array.from({ length: n }, (_, i) => ({ x: w.x + (along ? i : 0), z: w.z + (along ? 0 : i), storey: w.storey, facade: w.facade }));
}

/** Whole-window U (EN ISO 10077-1): glass, frame and glass-edge loss, weighted by area. */
export function windowU(frameKey: string, glassKey: string, W: number, H: number) {
  const f = FRAMES[frameKey] ?? FRAMES.pvc, gl = GLAZING[glassKey] ?? GLAZING.double_hr;
  const bf = f.width_m;
  const gw = Math.max(0, W - 2 * bf), gh = Math.max(0, H - 2 * bf);
  const A = W * H, Ag = gw * gh, Af = A - Ag, lg = 2 * (gw + gh);
  const U = (Ag * gl.U_g + Af * f.U_f + lg * gl.psi_g) / A;
  return { U, Ag, Af, A, lg, frameFraction: Af / A, g: gl.g };
}

/** Area-weighted U_w, g and frame share of all windows (a standard window if there are none). */
export function windowProps(h: House) {
  const list = validWindows(h);
  if (!list.length) {
    const s = WINDOW_SIZES.standard;
    const u = windowU(h.frame, h.window, s.w, s.h);
    return { U_w: u.U, g: u.g, frame_fraction: u.frameFraction };
  }
  let A = 0, UA = 0, Af = 0;
  for (const w of list) {
    const d = windowDims(w);
    const u = windowU(h.frame, h.window, d.w, d.h);
    A += u.A;
    UA += u.U * u.A;
    Af += u.Af;
  }
  return { U_w: UA / A, g: GLAZING[h.window]?.g ?? 0.6, frame_fraction: Af / A };
}

export const faceKey = (w: { x: number; z: number; storey: number; facade: Facade }) => `${w.x},${w.z},${w.storey},${w.facade}`;

/** Exterior wall faces of the house (one per cell edge and storey). */
export function exteriorFaces(h: House) {
  const out: { x: number; z: number; storey: number; facade: Facade }[] = [];
  for (const k of h.cells) {
    const [x, z] = parse(k);
    for (let s = 0; s < h.storeys; s++) {
      if (!h.cells.has(key(x, z - 1))) out.push({ x, z, storey: s, facade: "N" });
      if (!h.cells.has(key(x, z + 1))) out.push({ x, z, storey: s, facade: "S" });
      if (!h.cells.has(key(x + 1, z))) out.push({ x, z, storey: s, facade: "E" });
      if (!h.cells.has(key(x - 1, z))) out.push({ x, z, storey: s, facade: "W" });
    }
  }
  return out;
}

/** The face that holds the front door: middle of the ground floor on the south (else east) facade. */
export function doorFace(h: House) {
  const faces = exteriorFaces(h).filter((f) => f.storey === 0);
  const pick = (fac: Facade) => {
    const list = faces.filter((f) => f.facade === fac).sort((a, b) => a.x - b.x || a.z - b.z);
    return list[Math.floor(list.length / 2)];
  };
  return pick("S") ?? pick("E") ?? pick("W") ?? pick("N");
}

/** Windows that still sit on an exterior face (the shape may have changed since they were placed). */
export function validWindows(h: House) {
  const faces = new Set(exteriorFaces(h).map(faceKey));
  const door = doorFace(h);
  const dk = door ? faceKey(door) : "";
  return h.windows.filter((w) => windowFaces(w).every((f) => faces.has(faceKey(f)) && faceKey(f) !== dk));
}

/** Can this window go here? (all its faces exterior, none of them the door) */
export function canPlace(h: House, w: PlacedWindow) {
  const faces = new Set(exteriorFaces(h).map(faceKey));
  const door = doorFace(h);
  const dk = door ? faceKey(door) : "";
  return windowFaces(w).every((f) => faces.has(faceKey(f)) && faceKey(f) !== dk);
}

/** Place a window, removing any window it would overlap. Returns false if it does not fit. */
export function placeWindow(h: House, w: PlacedWindow) {
  if (!canPlace(h, w)) return false;
  const mine = new Set(windowFaces(w).map(faceKey));
  h.windows = h.windows.filter((o) => !windowFaces(o).some((f) => mine.has(faceKey(f))));
  h.windows.push(w);
  return true;
}

/** Fill facades with windows up to a target glass share of each facade (spread evenly). */
export function fillWindows(h: House, share: Record<Facade, number>, size: Exclude<WindowSize, "custom"> = "standard") {
  const door = doorFace(h);
  const dk = door ? faceKey(door) : "";
  const faces = exteriorFaces(h).filter((f) => faceKey(f) !== dk);
  const out: PlacedWindow[] = [];
  for (const fac of FACADES) {
    const list = faces.filter((f) => f.facade === fac).sort((a, b) => a.storey - b.storey || a.x - b.x || a.z - b.z);
    const wall = list.length * h.storeyHeight;
    const n = Math.min(list.length, Math.round((share[fac] * wall) / WINDOW_SIZES[size].area));
    const step = list.length / Math.max(1, n);
    for (let i = 0; i < n; i++) out.push({ ...list[Math.floor(i * step + step / 2) % list.length], size });
  }
  h.windows = out;
}

export const PANEL_KWP = 0.4;
export const PANEL_M2 = 1.95;
export const DOOR_M2 = 2.2;

export function starterHouse(): House {
  const cells = new Set<string>();
  for (let x = 0; x < 9; x++) for (let z = 0; z < 8; z++) cells.add(`${x},${z}`);
  return {
    cells,
    storeys: 2,
    storeyHeight: 2.8,
    roof: "gable",
    wall: { construction: "wall_cavity_brick", insulation: "mineral_wool", thickness: 0.15 },
    roofBuild: { construction: "roof_pitched_rafters", insulation: "mineral_wool", thickness: 0.2 },
    floor: { construction: "floor_slab_ground", insulation: "eps", thickness: 0.1 },
    window: "double_hr",
    frame: "pvc",
    windows: [],
    door: "door_standard",
    doorW: 0.95,
    doorH: 2.3,
    airtightness: "good",
    thermalBridges: "standard",
    ventilation: "exhaust",
    heating: "gas_condensing",
    emitter: "radiators_lt",
    pvPanels: 0,
    solarThermal_m2: 0,
  };
}

export const key = (x: number, z: number) => `${x},${z}`;
export const parse = (k: string) => k.split(",").map(Number) as [number, number];

/** Share of timber in a framed insulation layer (studs/rafters); assumption. */
const FRAME_FRACTION = 0.12;

export interface LayerResult {
  /** thermal resistance of the layers only (no surface resistances), m2K/W */
  R: number;
  U: number;
  /** heat capacity of the inner layers, kJ/m2K (for the thermal mass class) */
  heavy: boolean;
}

/** U-value of a layered element (EN ISO 6946, simple layer sum; framed layers by area-weighted lambda). */
export function layerU(l: Layered, surface: keyof typeof SURFACE_R): LayerResult {
  const c = CONSTRUCTIONS[l.construction];
  let R = 0;
  let mass = 0;
  for (const [mat, d0] of c.layers) {
    if (mat === "INSULATION" || mat === "INSULATION_FRAMED") {
      const ins = MATERIALS[l.insulation] ?? MATERIALS[c.insulation_options[0]];
      if (!ins || l.thickness <= 0) continue;
      const lambda = mat === "INSULATION_FRAMED" ? (1 - FRAME_FRACTION) * ins.lambda + FRAME_FRACTION * MATERIALS.timber_frame.lambda : ins.lambda;
      R += l.thickness / lambda;
    } else {
      const m = MATERIALS[mat];
      if (!m || !d0) continue;
      R += d0 / m.lambda;
      if (m.kind === "structure") mass += d0 * m.rho;
    }
  }
  const s = SURFACE_R[surface];
  return { R, U: 1 / (s.Rsi + s.Rse + R), heavy: mass > 150 };
}

export interface Geometry {
  footprint: number;
  /** exterior wall edges (m) per facade */
  edges: Record<Facade, number>;
  wallGross: Record<Facade, number>;
  windowArea: Record<Facade, number>;
  doorArea: number;
  wallOpaque: number;
  roofArea: number;
  floorArea: number;
  envelope: number;
  grossFloor: number;
  /** usable floor area (inside the walls), assumption 85% of gross */
  usable: number;
  /** heated gross volume, m3 */
  volume: number;
  /** air volume, m3 */
  airVolume: number;
  ridgeAlongX: boolean;
  bbox: { x0: number; x1: number; z0: number; z1: number };
}

export const USABLE_SHARE = 0.85;

export function geometry(h: House): Geometry {
  const edges: Record<Facade, number> = { N: 0, E: 0, S: 0, W: 0 };
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const k of h.cells) {
    const [x, z] = parse(k);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); z0 = Math.min(z0, z); z1 = Math.max(z1, z + 1);
    if (!h.cells.has(key(x, z - 1))) edges.N++;
    if (!h.cells.has(key(x, z + 1))) edges.S++;
    if (!h.cells.has(key(x + 1, z))) edges.E++;
    if (!h.cells.has(key(x - 1, z))) edges.W++;
  }
  const H = h.storeys * h.storeyHeight;
  const ridgeAlongX = x1 - x0 >= z1 - z0;
  const span = ridgeAlongX ? z1 - z0 : x1 - x0;
  const wallGross = { N: edges.N * H, E: edges.E * H, S: edges.S * H, W: edges.W * H };
  // Pitched roof (45°): the attic is heated and lived in, like the Dutch reference houses. Its two
  // gable-end triangles add wall area on the facades the ridge points to.
  if (h.roof === "gable") {
    const tri = (span * span) / 4;
    if (ridgeAlongX) { wallGross.E += tri; wallGross.W += tri; } else { wallGross.N += tri; wallGross.S += tri; }
  }
  const windowArea: Record<Facade, number> = { N: 0, E: 0, S: 0, W: 0 };
  for (const w of validWindows(h)) windowArea[w.facade] += windowDims(w).area;
  const footprint = h.cells.size;
  const totalWall = wallGross.N + wallGross.E + wallGross.S + wallGross.W;
  const totalWin = windowArea.N + windowArea.E + windowArea.S + windowArea.W;
  const doorArea = footprint > 0 ? (h.doorW ?? 0.95) * (h.doorH ?? 2.3) : 0;
  const wallOpaque = Math.max(0, totalWall - totalWin - doorArea);
  // Gable roof: insulated along the slope (45°), so the heat-loss area is the slope area.
  const roofArea = h.roof === "gable" ? footprint * Math.SQRT2 : footprint;
  // Attic floor counts where the room is at least 1.5 m high (NTA 8800 / NEN 2580 style).
  const atticFloor = h.roof === "gable" ? footprint * Math.max(0, span - 3) / span : 0;
  const grossFloor = footprint * h.storeys + atticFloor;
  const usable = grossFloor * USABLE_SHARE;
  const volume = footprint * H + (h.roof === "gable" ? (footprint * span) / 4 : 0);
  return {
    footprint, edges, wallGross, windowArea, doorArea, wallOpaque, roofArea, floorArea: footprint,
    envelope: totalWall + roofArea + footprint, grossFloor, usable, volume, airVolume: volume * 0.8,
    ridgeAlongX, bbox: { x0, x1, z0, z1 },
  };
}

/** Max PV panels that fit on the roof (south slope of a gable, 60% of a flat roof). */
export function maxPanels(h: House) {
  const g = geometry(h);
  const area = h.roof === "gable" ? (g.footprint * Math.SQRT2) / 2 : g.footprint * 0.6;
  return Math.floor((area * 0.8) / PANEL_M2);
}
