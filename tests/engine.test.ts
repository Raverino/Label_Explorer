// Engine checks: hand calculations, label boundaries, and a validation against published
// NTA 8800 results for the RVO BENG reference house "woning L vrij" (RVO / DGMR 2021,
// "BENG voorbeeldconcepten woningbouw", bijlage 1 and 3).

import { describe, expect, it } from "vitest";
import { AIRTIGHTNESS, CLIMATES, COUNTRIES, MATERIALS, SURFACE_R } from "../src/data";
import { evaluate, evaluateAll, heatBalance } from "../src/engine";
import { House, Layered, fillWindows, geometry, key, layerU, starterHouse } from "../src/house";
import { classify } from "../src/labels";

/** Set a layered element's insulation thickness so that its Rc hits the target (continuous). */
function setRc(l: Layered, surface: keyof typeof SURFACE_R, target: number) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    l.thickness = (lo + hi) / 2;
    if (layerU(l, surface).R < target) lo = l.thickness;
    else hi = l.thickness;
  }
}

// qv10 0.4 dm3/s.m2 (Ag 181, ~470 m3 air) is roughly n50 = 1.6 /h.
AIRTIGHTNESS.nl_ref = { name: "NL reference qv10 0.4", n50: 1.6, coins: 0 };

const AG_REF = 181; // RVO 2016 table 1: woning L vrij, BVO 264, Ag 181

/** RVO woning L vrij: 8 x 11 m, two storeys + pitched roof, Rc 3.7 / 4.7 / 6.3, HR++ 1.4 / 0.6, 27% glass. */
function referenceL(opts: { glass?: number; light?: boolean; triple?: boolean } = {}): House {
  const h = starterHouse();
  h.cells = new Set();
  for (let x = 0; x < 11; x++) for (let z = 0; z < 8; z++) h.cells.add(key(x, z));
  h.storeys = 2;
  h.roof = "gable";
  h.wall = opts.light
    ? { construction: "wall_timber_frame", insulation: "mineral_wool", thickness: 0.2 }
    : { construction: "wall_cavity_brick", insulation: "mineral_wool", thickness: 0.15 };
  h.roofBuild = { construction: "roof_pitched_rafters", insulation: "mineral_wool", thickness: 0.2 };
  h.floor = { construction: "floor_crawlspace", insulation: "eps", thickness: 0.1 };
  setRc(h.wall, "wall", opts.triple ? 7 : 4.7);
  setRc(h.roofBuild, "roof", opts.triple ? 8 : 6.3);
  setRc(h.floor, "floor_crawl", opts.triple ? 6 : 3.7);
  h.window = opts.triple ? "triple" : "double_hr";
  const g = opts.glass ?? 0.27;
  fillWindows(h, { N: g, E: g, S: g, W: g });
  h.airtightness = "nl_ref";
  h.thermalBridges = "default"; // NTA forfaitaire psi-waarden
  h.ventilation = "exhaust";
  h.heating = "hp_air_water";
  h.emitter = "floor_heating";
  return h;
}

/** BENG 1 = heating + cooling need per m2 Ag. We divide by our own Ag (the shape is close to the reference). */
const beng1 = (h: House) => {
  const r = evaluate(h, "NL");
  return (r.heatNeed + r.coolNeed) / r.area;
};

describe("U-values (EN ISO 6946 layer sum)", () => {
  it("cavity brick wall with 15 cm mineral wool", () => {
    const l: Layered = { construction: "wall_cavity_brick", insulation: "mineral_wool", thickness: 0.15 };
    const R = 0.1 / MATERIALS.brick_clay.lambda + 0.15 / MATERIALS.mineral_wool.lambda + 0.1 / MATERIALS.sand_lime.lambda + 0.01 / MATERIALS.plaster.lambda;
    const r = layerU(l, "wall");
    expect(r.R).toBeCloseTo(R, 6);
    expect(r.U).toBeCloseTo(1 / (0.13 + 0.04 + R), 6);
  });
});

describe("Label boundaries", () => {
  it("NL: limits are inclusive (<=)", () => {
    const L = COUNTRIES.NL.label;
    expect(classify(L, 160, 100).cls).toBe("A");
    expect(classify(L, 160.01, 100).cls).toBe("B");
    expect(classify(L, 0, 100).cls).toBe("A++++");
  });
  it("DK: c + k/A, strictly below", () => {
    const L = COUNTRIES.DK.label;
    const a2020 = 27; // k = 0
    expect(classify(L, a2020 - 0.01, 150).cls).toBe("A2020");
    expect(classify(L, a2020, 150).cls).toBe("A2015");
  });
  it("FI: c + k*A for 50-150 m2", () => {
    const L = COUNTRIES.FI.label;
    expect(classify(L, 110 - 0.2 * 120, 120).cls).toBe("A");
    expect(classify(L, 110 - 0.2 * 120 + 1, 120).cls).toBe("B");
  });
  it("every country gives a class for a normal house", () => {
    for (const r of evaluateAll(starterHouse())) {
      expect(r.label.cls, r.country.id).toBeTruthy();
      expect(Number.isFinite(r.indicator.value), r.country.id).toBe(true);
    }
  });
});

describe("Energy balance sanity", () => {
  it("with no gains, the need equals (H_tr + H_ve) x degree-hours", () => {
    const h = referenceL();
    const cl = CLIMATES.NL;
    const hb = heatBalance(h, cl, { setpoint: 20, gains: 0, dhw: 0, ach: 0.5, status: "" });
    h.windows = [];
    const hb0 = heatBalance(h, cl, { setpoint: 20, gains: 0, dhw: 0, ach: 0.5, status: "" });
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const jan = ((hb0.Htr + hb0.Hve) * (20 - cl.temp_C[0]) * days[0] * 24) / 1000;
    expect(hb0.monthly[0]).toBeCloseTo(jan, 3);
    expect(hb.Htr).toBeGreaterThan(hb0.Htr); // windows lose more than wall
  });
});

describe("Validation: RVO reference house L (NTA 8800 results)", () => {
  const base = beng1(referenceL());
  const light = beng1(referenceL({ light: true }));
  const glass50 = beng1(referenceL({ glass: 0.5 }));
  const passive = beng1(referenceL({ triple: true }));
  const g = geometry(referenceL());
  const rows = [
    ["base: code level, massive, 27% glass", 67.5, base],
    ["timber frame (HSB)", 71.5, light],
    ["50% glass", 78.9, glass50],
    ["passive envelope + triple glass", 57.8, passive],
  ] as const;
  console.table(rows.map(([name, ref, ours]) => ({ case: name, "NTA 8800 BENG 1": ref, "Label Explorer": +ours.toFixed(1), "diff %": +(((ours - ref) / ref) * 100).toFixed(0) })));
  console.log(`geometry: Als ${g.envelope.toFixed(0)} m2 (ref 2.14 x 181 = 387), usable ${g.usable.toFixed(0)} m2, cooling ${evaluate(referenceL(), "NL").coolNeed.toFixed(0)} kWh (ref Ag 181)`);

  it("BENG 1 of the base and variants within 25% (base within 15%)", () => {
    expect(Math.abs(base - 67.5) / 67.5).toBeLessThan(0.15);
    for (const [, ref, ours] of rows) expect(Math.abs(ours - ref) / ref).toBeLessThan(0.25);
  });
  it("each variant moves in the same direction as NTA 8800", () => {
    expect(light).toBeGreaterThan(base);
    expect(glass50).toBeGreaterThan(base);
    expect(passive).toBeLessThan(base);
  });
  it("BENG 2 (EP2 fossil) for air heat pump + 2,100 Wp PV within 35% of 29.5", () => {
    const h = referenceL();
    h.pvPanels = Math.round(2.1 / 0.4);
    const r = evaluate(h, "NL");
    const ep2 = r.indicator.value;
    console.log(`BENG 2 heat pump + PV: ours ${ep2.toFixed(1)} vs NTA 8800 29.5`, JSON.stringify({ heat: r.heatNeed, dhw: r.dhwNeed, del: r.delivered, pv: r.pv, area: r.area }));
    expect(Math.abs(ep2 - 29.5) / 29.5).toBeLessThan(0.35);
  });
});
