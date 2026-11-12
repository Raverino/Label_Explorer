// Pictures and plain-language explanations: build-up cross-sections, materials, glazing and systems.

import { CONSTRUCTIONS, MATERIALS } from "./data";
import { Layered, WindowSize, windowDims } from "./house";

/** What each material is, in one or two plain sentences. */
export const MATERIAL_INFO: Record<string, string> = {
  brick_clay: "Fired clay bricks. Strong and weatherproof, the classic outer leaf in the Netherlands and Belgium, but a poor insulator.",
  sand_lime: "Calcium-silicate (sand-lime) blocks: heavy, cheap and strong. They carry the floors and store heat, which evens out temperatures.",
  concrete: "Reinforced concrete: very strong and heavy. Stores a lot of heat but insulates almost nothing.",
  aerated_concrete: "Aerated (cellular) concrete, full of tiny air bubbles. Light, easy to saw, and it insulates on its own, so thick blocks need no extra layer.",
  porotherm: "Clay blocks with many vertical air chambers, sometimes filled with insulation. Common in Southern Germany and Austria as a single-layer wall.",
  clt: "Cross-laminated timber: wooden boards glued in crossing layers into solid panels. Stores carbon and is quick to build.",
  timber_frame: "Wooden studs that carry the wall, with insulation in between.",
  mineral_wool: "Glass or stone wool: spun mineral fibres in soft batts. Does not burn, absorbs sound, moderate insulator (λ 0.035).",
  eps: "Expanded polystyrene, the white foam made of small beads. Cheap and light (λ 0.032). Made from oil and burns, so it is covered by plaster or masonry.",
  pir: "PIR board (polyisocyanurate): a rigid foam board faced with aluminium foil. One of the best common insulators (λ 0.022), so it can be thin. Made from oil, and more expensive.",
  xps: "Extruded polystyrene: a closed, dense foam that does not soak up water, so it is used under floors and against the ground (λ 0.034).",
  wood_fibre: "Boards of pressed wood fibres. Bio-based, heavier than foam, so it also slows summer heat (λ 0.040).",
  hemp: "Hemp fibre batts: a bio-based, renewable insulator that handles moisture well (λ 0.040).",
  cellulose: "Recycled newspaper flakes, blown into cavities. Cheap and bio-based (λ 0.039).",
  straw: "Compressed straw bales, plastered both sides. Very low-carbon and thick (λ 0.052).",
  gypsum_board: "Plasterboard: the smooth inside finish of timber walls and roofs.",
  plaster: "A thin plaster coat as the finish.",
  timber_cladding: "Wooden boards on the outside, with a ventilated gap behind them.",
  screed: "A sand-cement layer on top of a floor; floor heating pipes are often cast in it.",
  roof_tiles: "Clay or concrete tiles. They keep the rain out but do not insulate (they sit on a ventilated layer).",
  air: "A small air cavity that lets rainwater that gets through the brick run down and out.",
};

export const CONSTRUCTION_INFO: Record<string, string> = {
  wall_cavity_brick: "The typical Dutch and Belgian wall: an outer brick leaf, a cavity with insulation and an air gap, and an inner leaf of sand-lime blocks that carries the house.",
  wall_etics_block: "A solid block wall with insulation boards glued to the outside and plastered over (ETICS). Common in Germany and Central Europe.",
  wall_monolithic: "One thick layer of insulating clay blocks, plastered both sides. No separate insulation layer.",
  wall_aerated: "One thick layer of aerated concrete blocks. Light and insulating by itself.",
  wall_timber_frame: "A wooden frame filled with insulation, closed with fibre board outside and plasterboard inside. Light, fast and low-carbon; common in Scandinavia.",
  wall_clt: "Solid cross-laminated timber panels with insulation outside and wooden cladding.",
  wall_straw: "Thick straw bales, plastered inside and out. A low-carbon, home-grown wall.",
  roof_pitched_rafters: "Tiles on battens, with insulation between and over the wooden rafters. The space under the roof becomes a usable attic.",
  roof_flat_concrete: "A concrete deck with insulation boards on top and a waterproof layer.",
  floor_slab_ground: "A concrete slab poured on the ground, with insulation underneath.",
  floor_crawlspace: "A concrete floor above a shallow crawl space, insulated on its underside. Common in the Netherlands.",
};

export const GLAZING_INFO: Record<string, string> = {
  single: "One pane of glass. Feels cold, mists up, and loses five times more heat than triple glazing.",
  double_old: "Two panes with air between them, typical of the 1980s-1990s.",
  double_hr: "HR++: two panes with an invisible metal coating and argon gas between them. Today's minimum in most of Europe.",
  triple: "Three panes and two coatings. Warm to stand next to, standard in new Nordic and German homes.",
  triple_passive: "Triple glazing in an insulated passive-house frame: the best available.",
};

export const SYSTEM_INFO: Record<string, string> = {
  gas_condensing: "A gas boiler that also captures heat from its own exhaust. Efficient, but it burns fossil gas.",
  oil_boiler: "Burns heating oil from a tank. Common in rural areas; high CO₂.",
  biomass_pellet: "Burns wood pellets. Counted as (partly) renewable in most countries.",
  hp_air_water: "Takes heat from the outside air and pumps it into water for radiators or floor heating. Gives 3-4 kWh of heat for each kWh of electricity.",
  hp_ground_water: "Takes heat from the ground through pipes drilled 50-150 m deep. The ground stays mild all year, so it is more efficient than air.",
  hp_hybrid: "A small heat pump does most of the work; a gas boiler helps on the coldest days and for hot water.",
  direct_electric: "Electric heaters in each room. Cheap to install, but every kWh of heat needs a kWh of electricity.",
  district_heat: "Hot water piped in from a central plant (waste heat, a power station or biomass). How green it is depends on the network.",
  radiators_hT: "Classic radiators that need water at about 55 °C.",
  radiators_lt: "Larger, low-temperature radiators (about 45 °C).",
  floor_heating: "Pipes in the floor at about 35 °C. Comfortable, and the low temperature lets a heat pump work at its best.",
  natural: "Fresh air through vents and windows; stale air leaves through ducts by itself. No fans, but warm air is lost.",
  exhaust: "A fan pulls stale air out of kitchen and bathroom; fresh air comes in through vents. Typical in Dutch homes (system C).",
  balanced_hr: "Two fans: one blows fresh air in, one pulls stale air out, and a heat exchanger passes about 80% of the warmth to the fresh air (system D).",
  pv: "Solar panels make electricity. Most schemes subtract the part you use yourself; a few (like the Dutch one) count all of it.",
  solar_thermal: "Solar collectors heat water for showers and taps. They can cover about half of the hot water in a year.",
};

// ---------- Cross-sections ----------

const FILL: Record<string, string> = {
  brick_clay: "url(#p-brick)", sand_lime: "url(#p-block)", concrete: "url(#p-concrete)", aerated_concrete: "url(#p-aerated)",
  porotherm: "url(#p-poro)", clt: "url(#p-wood)", timber_frame: "url(#p-wood)", mineral_wool: "url(#p-wool)", eps: "url(#p-eps)",
  pir: "url(#p-pir)", xps: "#a9cfee", wood_fibre: "url(#p-fibre)", hemp: "url(#p-hemp)", cellulose: "url(#p-cell)", straw: "url(#p-straw)",
  gypsum_board: "#f4f1ea", plaster: "#efe4cf", timber_cladding: "url(#p-wood)", screed: "#b9bcc2", roof_tiles: "#b5523f", air: "#ffffff",
};

const DEFS = `<defs>
<pattern id="p-brick" width="20" height="12" patternUnits="userSpaceOnUse"><rect width="20" height="12" fill="#c8664a"/><path d="M0 0.5H20M0 6.5H20M5 0.5V6.5M15 6.5V12" stroke="#f1d8c8" stroke-width="1"/></pattern>
<pattern id="p-block" width="24" height="16" patternUnits="userSpaceOnUse"><rect width="24" height="16" fill="#e2e1dc"/><path d="M0 0.5H24M12 0.5V16" stroke="#b8b7b0" stroke-width="1"/></pattern>
<pattern id="p-concrete" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#a9adb4"/><circle cx="3" cy="3" r="1" fill="#7d828a"/><circle cx="8" cy="7" r="1.3" fill="#8d9199"/></pattern>
<pattern id="p-aerated" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#e7e6e1"/><circle cx="2" cy="2" r="1.1" fill="#c9c7c0"/><circle cx="6" cy="5" r="0.8" fill="#c9c7c0"/></pattern>
<pattern id="p-poro" width="10" height="14" patternUnits="userSpaceOnUse"><rect width="10" height="14" fill="#cf7a54"/><rect x="2" y="2" width="2" height="10" fill="#8d4a30"/><rect x="6" y="2" width="2" height="10" fill="#8d4a30"/></pattern>
<pattern id="p-wood" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#c99a62"/><path d="M0 3Q6 1 12 3M0 9Q6 7 12 9" stroke="#9c7040" fill="none"/></pattern>
<pattern id="p-wool" width="12" height="10" patternUnits="userSpaceOnUse"><rect width="12" height="10" fill="#f3d36b"/><path d="M0 5L3 1L6 5L9 1L12 5M0 10L3 6L6 10L9 6L12 10" stroke="#d1a92e" fill="none"/></pattern>
<pattern id="p-eps" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fbfbf8"/><circle cx="2" cy="2" r="1.6" fill="none" stroke="#d4d4cc" stroke-width="0.7"/><circle cx="6" cy="6" r="1.6" fill="none" stroke="#d4d4cc" stroke-width="0.7"/></pattern>
<pattern id="p-pir" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#f7e9a8"/><circle cx="5" cy="5" r="0.8" fill="#e2cd70"/></pattern>
<pattern id="p-fibre" width="10" height="6" patternUnits="userSpaceOnUse"><rect width="10" height="6" fill="#b88a55"/><path d="M0 2H6M4 5H10" stroke="#8e6538"/></pattern>
<pattern id="p-hemp" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#c2c48a"/><path d="M1 1L4 4M5 6L7 3" stroke="#8d8f50"/></pattern>
<pattern id="p-cell" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#c9cdd2"/><rect x="1" y="2" width="2" height="1" fill="#8b9097"/><rect x="5" y="5" width="2" height="1" fill="#8b9097"/></pattern>
<pattern id="p-straw" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#e7cf8c"/><path d="M0 8L8 0" stroke="#c4a54f"/></pattern>
</defs>`;

/** Layers of a construction, outside first, with the visual-only air cavity of a cavity wall. */
export function layersOf(l: Layered): { mat: string; d: number; framed?: boolean }[] {
  const c = CONSTRUCTIONS[l.construction];
  const out: { mat: string; d: number; framed?: boolean }[] = [];
  for (const [mat, d] of c.layers) {
    if (mat === "INSULATION" || mat === "INSULATION_FRAMED") {
      if (l.thickness > 0) out.push({ mat: l.insulation, d: l.thickness, framed: mat === "INSULATION_FRAMED" });
    } else if (d) out.push({ mat, d });
  }
  if (l.construction === "wall_cavity_brick") out.splice(1, 0, { mat: "air", d: 0.04 });
  if (l.construction === "roof_pitched_rafters") out.unshift({ mat: "roof_tiles", d: 0.03 });
  return out;
}

export function sectionSVG(l: Layered, element: "wall" | "roof" | "floor", small = false): string {
  const layers = layersOf(l);
  const W = small ? 120 : 320, H = small ? 70 : 150;
  const top = small ? 6 : 26, bodyH = small ? 58 : 96;
  const left = small ? 6 : 30, avail = W - left * 2;
  const total = layers.reduce((s, x) => s + Math.max(x.d, 0.012), 0);
  let x = left;
  let rects = "";
  let marks = "";
  layers.forEach((ly, i) => {
    const w = (Math.max(ly.d, 0.012) / total) * avail;
    rects += `<rect x="${x.toFixed(1)}" y="${top}" width="${w.toFixed(1)}" height="${bodyH}" fill="${FILL[ly.mat] ?? "#ddd"}" stroke="#23262f" stroke-width="${small ? 0.6 : 1}"/>`;
    if (ly.mat === "pir") rects += `<rect x="${x.toFixed(1)}" y="${top}" width="1.6" height="${bodyH}" fill="#c9ccd2"/><rect x="${(x + w - 1.6).toFixed(1)}" y="${top}" width="1.6" height="${bodyH}" fill="#c9ccd2"/>`;
    if (ly.framed) {
      for (let y = top + 8; y < top + bodyH; y += 38) rects += `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="7" fill="url(#p-wood)" stroke="#23262f" stroke-width="0.6"/>`;
    }
    if (!small) marks += `<circle cx="${(x + w / 2).toFixed(1)}" cy="${top + bodyH + 12}" r="8" fill="#23262f"/><text x="${(x + w / 2).toFixed(1)}" y="${top + bodyH + 15.5}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${i + 1}</text>`;
    x += w;
  });
  const outLabel = element === "floor" ? "ground" : "outside";
  const labels = small ? "" : `<text x="${left}" y="16" font-size="11" fill="#646a78">← ${outLabel}</text><text x="${W - left}" y="16" font-size="11" fill="#646a78" text-anchor="end">inside →</text>
    <text x="10" y="${top + bodyH / 2}" font-size="15" fill="#56b4e9">❄</text><text x="${W - 22}" y="${top + bodyH / 2}" font-size="15" fill="#f37021">♨</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="section${small ? " small" : ""}" role="img" aria-label="Cross-section of the build-up">${DEFS}${rects}${marks}${labels}</svg>`;
}

export function sectionLegend(l: Layered): string {
  return `<ol class="layers">${layersOf(l).map((ly) => `<li><b>${ly.mat === "air" ? "Air cavity" : MATERIALS[ly.mat]?.name ?? ly.mat}</b> ${Math.round(ly.d * 100)} cm${ly.framed ? " (between timber studs)" : ""}</li>`).join("")}</ol>`;
}

export function insulationSwatch(mat: string): string {
  return `<svg viewBox="0 0 40 40" class="swatch">${DEFS}<rect x="2" y="2" width="36" height="36" rx="6" fill="${FILL[mat] ?? "#ddd"}" stroke="#23262f" stroke-width="1.5"/>${mat === "pir" ? `<rect x="2" y="2" width="3" height="36" fill="#c9ccd2"/><rect x="35" y="2" width="3" height="36" fill="#c9ccd2"/>` : ""}</svg>`;
}

// ---------- Glazing and windows ----------

export function glazingSVG(key: string): string {
  const panes = key === "single" ? 1 : key.startsWith("double") ? 2 : 3;
  const coated = key !== "single" && key !== "double_old";
  const frame = key === "triple_passive" ? 9 : 6;
  let s = `<svg viewBox="0 0 60 60" class="icon"><rect x="4" y="4" width="52" height="52" rx="4" fill="#fff" stroke="#23262f" stroke-width="${frame / 2}"/>`;
  const gap = 34 / (panes + 1);
  for (let i = 1; i <= panes; i++) {
    const x = 13 + gap * i;
    s += `<rect x="${x - 1.5}" y="10" width="3" height="40" fill="#8fc3ea" stroke="#3d6fb6" stroke-width="0.8"/>`;
    if (coated && i < panes) s += `<line x1="${x + 2.5}" y1="12" x2="${x + 2.5}" y2="48" stroke="#c2a33a" stroke-dasharray="2 2"/>`;
  }
  return s + "</svg>";
}

/** A window drawn to scale in a one-storey wall (2.8 m high); wider windows get a wider wall. */
export function windowSizeSVG(size: WindowSize, w?: number, h?: number): string {
  const s = windowDims({ size, w, h });
  const sc = 24;
  const wallW = Math.max(1, Math.ceil(s.w - 0.05)) * sc + 2;
  const W = s.w * sc, H = s.h * sc, y = 70 - s.sill * sc - H;
  return `<svg viewBox="0 0 ${wallW + 4} 74" class="icon win-size"><rect x="2" y="2" width="${wallW}" height="68" fill="#e9d9bd" stroke="#23262f"/><rect x="${2 + wallW / 2 - W / 2}" y="${Math.max(4, y)}" width="${W}" height="${H}" fill="#8fc3ea" stroke="#23262f" stroke-width="2"/><line x1="${2 + wallW / 2}" y1="${Math.max(4, y)}" x2="${2 + wallW / 2}" y2="${Math.max(4, y) + H}" stroke="#23262f"/></svg>`;
}

// ---------- Frames ----------

export const FRAME_INFO: Record<string, string> = {
  aluminium_old: "Older aluminium frames are one solid piece of metal from inside to outside. Metal conducts heat very well, so the frame is cold and often wet with condensation in winter.",
  aluminium_tb: "Modern aluminium: the inner and outer parts are joined by a plastic \"thermal break\" so the cold does not travel straight through. Slim and strong.",
  wood: "Solid wood frames: a natural insulator and repairable, but they need paint every few years.",
  pvc: "PVC profiles with several hollow chambers of still air. Cheap, low maintenance and well insulating, the most common frame in new homes.",
  passive: "An extra-thick frame with an insulation core and the glass set deep inside. Built for passive houses.",
};
const FRAME_FILL: Record<string, string> = { aluminium_old: "#a9adb4", aluminium_tb: "#a9adb4", wood: "url(#p-wood)", pvc: "#f4f4f0", passive: "#f4f4f0" };

/** Cross-section of a frame profile (outside left), with chambers, thermal break or insulation core. */
export function frameSVG(key: string): string {
  let inner = "";
  if (key === "aluminium_old") inner = `<rect x="14" y="14" width="32" height="32" fill="#c9ccd2" stroke="#23262f"/>`;
  if (key === "aluminium_tb") inner = `<rect x="14" y="14" width="13" height="32" fill="#c9ccd2" stroke="#23262f"/><rect x="27" y="14" width="6" height="32" fill="#23262f"/><rect x="33" y="14" width="13" height="32" fill="#c9ccd2" stroke="#23262f"/>`;
  if (key === "pvc") inner = [0, 1, 2].map((i) => [0, 1].map((j) => `<rect x="${15 + i * 10.5}" y="${15 + j * 15.5}" width="9" height="14" fill="#fff" stroke="#b9bcc2"/>`).join("")).join("");
  if (key === "passive") inner = `<rect x="18" y="16" width="24" height="28" fill="#f3d36b" stroke="#23262f"/>`;
  return `<svg viewBox="0 0 60 60" class="icon">${DEFS}<rect x="8" y="8" width="44" height="44" rx="4" fill="${FRAME_FILL[key] ?? "#eee"}" stroke="#23262f" stroke-width="2"/>${inner}<rect x="52" y="20" width="6" height="20" fill="#8fc3ea" stroke="#23262f"/></svg>`;
}

/** Front view of the chosen window: frame band at its real width around the glass, with the areas. */
export function windowFrontSVG(frameKey: string, w: number, h: number, frameWidth: number): string {
  const sc = Math.min(110 / w, 110 / h);
  const W = w * sc, H = h * sc, b = frameWidth * sc;
  const x = (130 - W) / 2, y = (130 - H) / 2;
  return `<svg viewBox="0 0 130 130" class="win-front">${DEFS}<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="${FRAME_FILL[frameKey] ?? "#eee"}" stroke="#23262f" stroke-width="2"/><rect x="${x + b}" y="${y + b}" width="${Math.max(2, W - 2 * b)}" height="${Math.max(2, H - 2 * b)}" fill="#8fc3ea" stroke="#3d6fb6"/><path d="M${x + b + 6} ${y + b + 14}l14 -10" stroke="#fff" stroke-width="3" opacity="0.7"/></svg>`;
}

// ---------- Systems ----------

const ICONS: Record<string, string> = {
  gas_condensing: `<rect x="30" y="8" width="40" height="56" rx="5" fill="#fff" stroke="#23262f" stroke-width="2"/><path d="M50 50c-8-6-6-14 0-20 0 6 8 8 6 14-1 4-4 6-6 6z" fill="#f37021" stroke="#23262f"/><path d="M40 64v14M60 64v14" stroke="#23262f" stroke-width="3"/>`,
  oil_boiler: `<rect x="12" y="10" width="34" height="54" rx="5" fill="#fff" stroke="#23262f" stroke-width="2"/><path d="M29 50c-7-5-5-12 0-17 0 5 7 7 5 12-1 3-3 5-5 5z" fill="#f37021" stroke="#23262f"/><rect x="54" y="30" width="34" height="34" rx="12" fill="#6b5a3e" stroke="#23262f" stroke-width="2"/><text x="71" y="52" font-size="10" fill="#fff" text-anchor="middle">OIL</text>`,
  biomass_pellet: `<rect x="26" y="8" width="44" height="56" rx="5" fill="#fff" stroke="#23262f" stroke-width="2"/><path d="M48 50c-8-6-6-14 0-20 0 6 8 8 6 14-1 4-4 6-6 6z" fill="#f37021" stroke="#23262f"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${14 + i * 14}" y="70" width="10" height="5" rx="2" fill="#b98550" stroke="#23262f"/>`).join("")}`,
  hp_air_water: `<rect x="14" y="16" width="72" height="50" rx="5" fill="#e9edf2" stroke="#23262f" stroke-width="2"/><circle cx="42" cy="41" r="18" fill="#fff" stroke="#23262f" stroke-width="2"/><path d="M42 41l10-10M42 41l-10 10M42 41l10 10M42 41l-10-10" stroke="#5b6170" stroke-width="3"/><path d="M68 28h10M68 36h10M68 44h10M68 52h10" stroke="#5b6170" stroke-width="2"/><path d="M2 30c4-4 8 4 12 0" stroke="#56b4e9" fill="none" stroke-width="2"/>`,
  hp_ground_water: `<rect x="30" y="4" width="40" height="34" rx="5" fill="#e9edf2" stroke="#23262f" stroke-width="2"/><rect x="0" y="42" width="100" height="40" fill="#b48a5a"/><path d="M44 38v40h12v-40" stroke="#56b4e9" stroke-width="4" fill="none"/><text x="50" y="25" font-size="10" text-anchor="middle" fill="#23262f">HP</text>`,
  hp_hybrid: `<rect x="6" y="22" width="50" height="40" rx="5" fill="#e9edf2" stroke="#23262f" stroke-width="2"/><circle cx="26" cy="42" r="13" fill="#fff" stroke="#23262f" stroke-width="2"/><path d="M26 42l7-7M26 42l-7 7M26 42l7 7M26 42l-7-7" stroke="#5b6170" stroke-width="2"/><rect x="64" y="14" width="30" height="46" rx="4" fill="#fff" stroke="#23262f" stroke-width="2"/><path d="M79 50c-6-4-4-10 0-14 0 4 6 6 4 10-1 3-2 4-4 4z" fill="#f37021" stroke="#23262f"/>`,
  direct_electric: `<rect x="10" y="24" width="80" height="34" rx="5" fill="#fff" stroke="#23262f" stroke-width="2"/><path d="M48 30l-8 12h10l-6 12 14-16h-10l6-8z" fill="#f5c542" stroke="#23262f"/>`,
  district_heat: `<rect x="6" y="30" width="26" height="40" fill="#8d9099" stroke="#23262f" stroke-width="2"/><rect x="12" y="6" width="8" height="24" fill="#8d9099" stroke="#23262f" stroke-width="2"/><path d="M32 52H88" stroke="#ed1c24" stroke-width="5"/><path d="M32 62H88" stroke="#56b4e9" stroke-width="5"/><path d="M70 20l14 12v24H56V32z" fill="#fff" stroke="#23262f" stroke-width="2"/>`,
  radiators_hT: `${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${18 + i * 11}" y="16" width="8" height="48" rx="3" fill="#fff" stroke="#23262f" stroke-width="2"/>`).join("")}<text x="50" y="80" font-size="10" text-anchor="middle" fill="#ed1c24">55 °C</text>`,
  radiators_lt: `${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${8 + i * 11}" y="20" width="8" height="42" rx="3" fill="#fff" stroke="#23262f" stroke-width="2"/>`).join("")}<text x="50" y="80" font-size="10" text-anchor="middle" fill="#f37021">45 °C</text>`,
  floor_heating: `<rect x="4" y="44" width="92" height="20" fill="#b9bcc2" stroke="#23262f" stroke-width="2"/><path d="M10 54h10q4 0 4-4t4-4h8q4 0 4 4t4 4h8q4 0 4-4t4-4h8q4 0 4 4t4 4h10" stroke="#ed1c24" fill="none" stroke-width="2.5"/><path d="M30 36l4-8M50 36l4-8M70 36l4-8" stroke="#f37021" stroke-width="2"/><text x="50" y="80" font-size="10" text-anchor="middle" fill="#f5a142">35 °C</text>`,
  natural: `<rect x="10" y="12" width="80" height="60" fill="#fff" stroke="#23262f" stroke-width="2"/><path d="M0 30h22l-6-5M22 30l-6 5" stroke="#56b4e9" stroke-width="3" fill="none"/><path d="M70 22v-20M70 2l-5 6M70 2l5 6" stroke="#f37021" stroke-width="3" fill="none"/>`,
  exhaust: `<rect x="10" y="12" width="80" height="60" fill="#fff" stroke="#23262f" stroke-width="2"/><path d="M0 40h22l-6-5M22 40l-6 5" stroke="#56b4e9" stroke-width="3" fill="none"/><circle cx="70" cy="28" r="10" fill="#e9edf2" stroke="#23262f" stroke-width="2"/><path d="M70 18v-16M70 2l-5 6M70 2l5 6" stroke="#f37021" stroke-width="3" fill="none"/>`,
  balanced_hr: `<rect x="22" y="22" width="56" height="40" rx="5" fill="#e9edf2" stroke="#23262f" stroke-width="2"/><path d="M28 30l44 24M28 54l44-24" stroke="#5b6170" stroke-width="2"/><path d="M0 34h22" stroke="#56b4e9" stroke-width="3"/><path d="M78 34h22" stroke="#f37021" stroke-width="3"/><path d="M78 52h22" stroke="#f5a142" stroke-width="3"/><path d="M0 52h22" stroke="#8d9099" stroke-width="3"/>`,
  pv: `<path d="M10 64l18-46h62l-18 46z" fill="#1f3a6b" stroke="#23262f" stroke-width="2"/><path d="M24 64l18-46M38 64l18-46M52 64l18-46M19 41h62" stroke="#6f8fc7"/><circle cx="14" cy="14" r="9" fill="#f5c542"/>`,
  solar_thermal: `<path d="M10 64l18-46h62l-18 46z" fill="#2b2f36" stroke="#23262f" stroke-width="2"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${22 + i * 9} 62l16-42" stroke="#9aa0aa" stroke-width="2"/>`).join("")}<circle cx="14" cy="14" r="9" fill="#f5c542"/>`,
};

export function systemSVG(key: string): string {
  return `<svg viewBox="0 0 100 84" class="icon sys" role="img" aria-hidden="true">${ICONS[key] ?? ""}</svg>`;
}
