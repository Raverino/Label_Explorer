import "./style.css";
import { AIRTIGHTNESS, BUILDING_CODE, CONSTRUCTIONS, COUNTRIES, DOORS, FRAMES, GLAZING, INDEX, INSULATION_STEPS, IndexEntry, MATERIALS, SYSTEMS, THERMAL_BRIDGES } from "./data";
import { ASSUMPTIONS, CountryResult, evaluate, evaluateAll } from "./engine";
import { houseForClass } from "./generator";
import { CUSTOM_LIMITS, FACADES, Facade, House, Layered, WINDOW_SIZES, WindowSize, faceKey, fillWindows, geometry, key, layerU, maxPanels, placeWindow, starterHouse, validWindows, windowDims, windowProps, windowU } from "./house";
import { Face, HouseView, Tool } from "./house3d";
import { classColor } from "./labels";
import { COUNTRY_FACTS, plainFor } from "./explain";
import { drawMap } from "./map";
import { houseFromLink, houseLink, shareImage } from "./share";
import { guideHTML } from "./guide";
import { CONSTRUCTION_INFO, FRAME_INFO, GLAZING_INFO, MATERIAL_INFO, SYSTEM_INFO, frameSVG, glazingSVG, insulationSwatch, sectionLegend, sectionSVG, systemSVG, windowFrontSVG, windowSizeSVG } from "./visuals";

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll(sel)] as T[];
const fmt = (v: number, d = 0) => v.toLocaleString("en-GB", { maximumFractionDigits: d, minimumFractionDigits: d });

const house: House = starterHouse();
house.cells = new Set();
let country = "NL";
let view: HouseView | undefined;
/** "ready": a generated house, every step open. "steps": the player builds it. */
let mode: "ready" | "steps" = "steps";
const SUBSTEPS = ["shape", "construction", "windows", "installations", "result"] as const;
type Sub = (typeof SUBSTEPS)[number];
const SUB_NAMES: Record<Sub, string> = { shape: "Shape", construction: "Construction", windows: "Windows", installations: "Installations", result: "Result" };
let sub: Sub = "shape";
/** furthest step reached (step-by-step mode keeps later steps locked) */
let reached = 0;
let element: "wall" | "roof" | "floor" | "quality" = "wall";
let windowSize: WindowSize = "standard";
const MIN_CELLS = 4;

// ---------- Phones and tablets ----------
/** A touch screen without a mouse: say "tap" instead of "click" and drop mouse-only tips. */
const TOUCH = matchMedia("(hover: none) and (pointer: coarse)").matches;
/** Screens where the 3D view is too narrow to share with a cross-section column: the cross-section goes in the panel. */
const XSEC_IN_PANEL = matchMedia("(max-width: 1200px), (max-height: 500px) and (orientation: landscape)");
const SMALL_SCREEN = Math.min(screen.width, screen.height) <= 600;
/** Phone browsers in "desktop site" mode lay the page out about 980 px wide: everything ends up tiny. */
const desktopModeOnPhone = () => TOUCH && SMALL_SCREEN && innerWidth > screen.width * 1.3;
if (desktopModeOnPhone()) {
  // Ask for the real phone width; some browsers honour a fixed width even in desktop mode.
  document.querySelector('meta[name="viewport"]')?.setAttribute("content", `width=${screen.width}, initial-scale=1, viewport-fit=cover`);
}
setTimeout(() => {
  if (desktopModeOnPhone()) $("#desktop-mode").classList.remove("hidden");
}, 400);
$("#desktop-mode button").onclick = () => $("#desktop-mode").classList.add("hidden");
if (TOUCH || SMALL_SCREEN || innerWidth < 900) $("#device-note").classList.remove("hidden");
function tw(s: string) {
  if (!TOUCH) return s;
  return s
    .replace(/Double-click \(or click the first corner\) to finish/g, "Tap ✓ Finish (or the first corner) to finish")
    .replace(/Double-click, or click the green post, to finish/g, "Tap ✓ Finish or the green post to finish")
    .replace(/double-click to finish/g, "tap ✓ Finish")
    .replace(/, or drag one from the panel/g, "")
    .replace(/drag onto a wall, or pick and click/g, "pick a size, then tap a wall")
    .replace(/Drag on the grass/g, "Swipe on the grass")
    .replace(/Click/g, "Tap")
    .replace(/click/g, "tap");
}

// ---------- Screens ----------
type Screen = 1 | 2 | 3 | 4;
let currentScreen: Screen = 1;
function setStep(n: Screen) {
  currentScreen = n;
  $("#guide").classList.add("hidden");
  $("#pick").classList.toggle("hidden", n !== 1);
  $("#start").classList.toggle("hidden", n !== 2);
  $("#build").classList.toggle("hidden", n !== 3);
  $("#compare").classList.toggle("hidden", n !== 4);
  $$("#steps li").forEach((li) => li.classList.toggle("active", Number(li.dataset.step) === n));
  if (n === 2) renderStart();
  if (n === 3) {
    if (!view) {
      view = new HouseView($("#three"));
      view.onShape = onShape;
      view.onDraft = (msg) => {
        if (sub !== "shape") return;
        const h = $("#stage-hint");
        h.textContent = tw(msg);
        h.classList.toggle("hidden", !msg);
      };
      view.onFace = onFace;
    }
    view.resize();
    setSub(sub);
  }
  if (n === 4) renderCompare();
  if (n === 1) $("#be-choice").classList.add("hidden");
  window.scrollTo({ top: 0 });
}

function pickCountry(entries: IndexEntry[]) {
  $("#be-choice").classList.add("hidden");
  if (entries.length === 1) {
    country = entries[0].id;
    setStep(2);
    return;
  }
  const box = $("#be-choice");
  box.classList.remove("hidden");
  const btns = $("#be-buttons");
  btns.innerHTML = "";
  for (const e of entries) {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = regionName(e.name);
    b.onclick = () => {
      country = e.id;
      box.classList.add("hidden");
      setStep(2);
    };
    btns.appendChild(b);
  }
  const note = document.createElement("p");
  note.className = "muted small";
  note.textContent = "Flanders uses a different method and is coming soon.";
  btns.appendChild(note);
}

/** "Belgium - Wallonia" -> "Wallonia" */
const regionName = (name: string) => name.replace(/^Belgium\s*[-–(]\s*/, "").replace(/\)$/, "");
/** Short country name for tight spots: "Belgium - Wallonia" -> "Wallonia (BE)" */
const shortName = (name: string) => (/^Belgium\s*[-–(]/.test(name) ? `${regionName(name)} (BE)` : name);
/** Class names run from "A" to "A++++" or "A2020": shrink long ones so they stay inside their box. */
const fit = (c: string) => `<span class="fit" data-len="${Math.min(6, c.length)}">${c}</span>`;

// ---------- Start choice ----------
function renderStart() {
  const c = COUNTRIES[country];
  $("#start-title").textContent = `${c.name}: how do you want to start?`;
  const probe = starterHouse();
  probe.cells = new Set([...probe.cells].map((k) => { const [x, z] = k.split(",").map(Number); return key(x + 3, z + 4); }));
  const probeResult = evaluate(probe, country);
  const classes = probeResult.label.classes;
  const plain = plainFor(String((c.label as Record<string, unknown>).indicator ?? ""));
  const strip = classes.map((cl, i) => `<i style="background:${classColor(i, classes.length)}">${fit(cl.class)}</i>`).join("");
  const fact = COUNTRY_FACTS[c.id];
  $("#label-explainer").innerHTML = `
    <div class="explain-side">
      <span class="explain-icon">${plain.icon}</span>
      <div>
        <h3>How ${c.name} grades a house: ${plain.title.toLowerCase()}</h3>
        <p>${plain.text}</p>
        ${fact ? `<p><b>${fact.icon} ${fact.title}.</b> ${fact.text}</p>` : ""}
        <div class="strip">${strip}</div>
        <p class="muted small">Measured in ${probeResult.indicator.unit}. Green is the best class, red the worst. <button class="link" data-guide-country="${c.id}">Who runs this label and how →</button></p>
      </div>
    </div>`;
  $<HTMLButtonElement>("[data-guide-country]").onclick = () => showGuide(c.id);
  const host = $("#class-buttons");
  host.innerHTML = classes.map((cl, i) => `<button class="cls" data-i="${i}" style="background:${classColor(i, classes.length)}">${fit(cl.class)}</button>`).join("");
  $("#ready-note").textContent = tw("Click the class you want.");
  $$<HTMLButtonElement>(".cls", host).forEach((b) =>
    (b.onclick = () => {
      const i = Number(b.dataset.i);
      $("#ready-note").textContent = "Looking for a house…";
      setTimeout(() => {
        const { house: h, exact } = houseForClass(country, i);
        Object.assign(house, h);
        mode = "ready";
        reached = SUBSTEPS.length - 1;
        sub = "result";
        readyMessage = exact
          ? `Here is a random class ${classes[i].class} house. Open each step to see what makes it score this way, and change anything.`
          : `No random house hit class ${classes[i].class} exactly; this is the closest one found. Try changing it yourself.`;
        syncShapeButtons();
        setStep(3);
      }, 20);
    }),
  );
}
let readyMessage = "";

$("#start-build").onclick = () => {
  const fresh = starterHouse();
  fresh.cells = new Set();
  Object.assign(house, fresh);
  mode = "steps";
  reached = 0;
  readyMessage = "";
  sub = "shape";
  element = "wall";
  syncShapeButtons();
  $$("[data-tool]").forEach((o) => o.classList.toggle("on", o.dataset.tool === "rect"));
  setStep(3);
};

function setTool(t: Tool) {
  if (view) view.tool = t;
  $$("[data-tool]").forEach((o) => o.classList.toggle("on", o.dataset.tool === t));
}
$("#start-back").onclick = () => setStep(1);

// ---------- Building: shape ----------
function onShape(cells: Set<string>, tool: Tool) {
  if (tool === "wing" && house.cells.size) {
    const touches = [...cells].some((k) => {
      const [x, z] = k.split(",").map(Number);
      return [key(x + 1, z), key(x - 1, z), key(x, z + 1), key(x, z - 1), k].some((n) => house.cells.has(n));
    });
    if (!touches) return flashHint("The wing must touch the house. Try again.");
    for (const k of cells) house.cells.add(k);
  } else {
    if (cells.size < MIN_CELLS) return flashHint(`Too small: a house needs at least ${MIN_CELLS} m².`);
    house.cells = cells;
  }
  house.pvPanels = Math.min(house.pvPanels, maxPanels(house));
  // Done drawing: stop the tool so a stray click does not start a new outline.
  setTool("look");
  const h = $("#stage-hint");
  h.textContent = TOUCH ? "Shape done! Pick storeys and a roof above." : "Shape done! Pick storeys and a roof above, or choose a drawing tool to change it.";
  h.classList.remove("hidden");
  update();
  renderBody();
  renderNav();
}

function flashHint(msg: string) {
  const h = $("#stage-hint");
  h.textContent = tw(msg);
  h.classList.remove("hidden");
  h.classList.add("warn");
  setTimeout(() => h.classList.remove("warn"), 1800);
}

function onFace(face: Face, existing: boolean) {
  const fk = faceKey(face);
  if (existing) house.windows = house.windows.filter((w) => faceKey(w) !== fk);
  else if (!placeWindow(house, { ...face, ...placing() })) {
    flashHint("That window does not fit there: it needs free wall next to it on the same floor.");
    return;
  }
  update();
}

let customW = 1.6, customH = 1.4;
const placing = () => (windowSize === "custom" ? { size: windowSize, w: customW, h: customH } : { size: windowSize });
function syncPlacing() {
  if (view) view.placing = placing();
  renderWinPreview();
}

function syncShapeButtons() {
  $$("[data-storeys]").forEach((o) => o.classList.toggle("on", Number(o.dataset.storeys) === house.storeys));
  $$("[data-roof]").forEach((o) => o.classList.toggle("on", o.dataset.roof === house.roof));
}

$$<HTMLButtonElement>("[data-tool]").forEach((b) =>
  b.addEventListener("click", () => {
    view!.tool = b.dataset.tool as Tool;
    $$("[data-tool]").forEach((o) => o.classList.toggle("on", o === b));
  }),
);
$$<HTMLButtonElement>("[data-storeys]").forEach((b) =>
  b.addEventListener("click", () => {
    house.storeys = Number(b.dataset.storeys);
    syncShapeButtons();
    update();
  }),
);
$$<HTMLButtonElement>("[data-roof]").forEach((b) =>
  b.addEventListener("click", () => {
    house.roof = b.dataset.roof as House["roof"];
    house.roofBuild = house.roof === "gable"
      ? { construction: "roof_pitched_rafters", insulation: "mineral_wool", thickness: house.roofBuild.thickness }
      : { construction: "roof_flat_concrete", insulation: "pir", thickness: house.roofBuild.thickness };
    house.pvPanels = Math.min(house.pvPanels, maxPanels(house));
    syncShapeButtons();
    update();
  }),
);
$("#shape-rect").onclick = () => {
  house.cells = new Set();
  for (let x = 4; x < 12; x++) for (let z = 5; z < 11; z++) house.cells.add(key(x, z));
  view?.cancelDraft();
  update();
  renderBody();
  renderNav();
};
$("#shape-clear").onclick = () => {
  house.cells = new Set();
  house.windows = [];
  view?.cancelDraft();
  update();
  renderBody();
  renderNav();
};
$("#shape-undo").onclick = () => view?.undoPoint();
$("#shape-finish").onclick = () => {
  if (!view) return;
  if (view.tool === "corners" && view.draft.length >= 3) view.closeCorners();
  else flashHint(view.tool === "corners" ? "Place at least 3 corners first." : "✓ Finish is for the ✎ Draw tool.");
};
$("#zoom-in").onclick = () => view?.zoom(1.2);
$("#zoom-out").onclick = () => view?.zoom(1 / 1.2);
$("#turn-left").onclick = () => view?.turn(-1);
$("#turn-right").onclick = () => view?.turn(1);
$("#back-build").onclick = () => setStep(3);
$$("#steps li").forEach((li) =>
  li.addEventListener("click", () => {
    const n = Number(li.dataset.step) as Screen;
    if (n >= 3 && house.cells.size < MIN_CELLS) return setStep(2);
    setStep(n);
  }),
);

// ---------- Sub-steps ----------
function setSub(s: Sub) {
  sub = s;
  reached = Math.max(reached, SUBSTEPS.indexOf(s));
  $$("[data-show]").forEach((el) => el.classList.toggle("hidden", el.dataset.show !== s));
  if (view) {
    const tool: Tool = s === "shape" ? (($("[data-tool].on")?.dataset.tool as Tool) ?? "rect") : s === "windows" ? "window" : "look";
    view.tool = tool;
  }
  const hints: Record<Sub, string> = {
    shape: "",
    construction: "",
    windows: "Click a wall to put a window there, or drag one from the panel. Click a window to remove it.",
    installations: "",
    result: "",
  };
  if (s !== "shape") {
    $("#stage-hint").textContent = tw(hints[s]);
    $("#stage-hint").classList.toggle("hidden", !hints[s]);
  }
  renderSubsteps();
  renderBody();
  scrollPanelTop();
  renderNav();
  update();
}

/** Back to the top of the step: the step body scrolls on a laptop, the whole panel on a phone. */
function scrollPanelTop() {
  $("#step-body").scrollTop = 0;
  $(".side").scrollTop = 0;
}

function renderSubsteps() {
  $("#substeps").innerHTML = SUBSTEPS.map((s, i) => {
    const locked = mode === "steps" && i > reached;
    return `<li><button data-sub="${s}" class="${s === sub ? "on" : ""} ${i < reached || mode === "ready" ? "done" : ""}" ${locked ? "disabled" : ""}>${SUB_NAMES[s]}</button></li>`;
  }).join("");
  $$<HTMLButtonElement>("[data-sub]").forEach((b) => (b.onclick = () => setSub(b.dataset.sub as Sub)));
}

function renderNav() {
  const i = SUBSTEPS.indexOf(sub);
  const back = $<HTMLButtonElement>("#sub-back");
  const next = $<HTMLButtonElement>("#sub-next");
  const ci = CONS_STEPS.indexOf(element);
  const inCons = sub === "construction";
  if (inCons && ci > 0) {
    back.textContent = `← ${consName(CONS_STEPS[ci - 1])}`;
    back.onclick = () => setElement(CONS_STEPS[ci - 1]);
  } else {
    back.textContent = i === 0 ? "← Start" : `← ${SUB_NAMES[SUBSTEPS[i - 1]]}`;
    back.onclick = () => (i === 0 ? setStep(2) : setSub(SUBSTEPS[i - 1]));
  }
  const last = i === SUBSTEPS.length - 1;
  const blocked = house.cells.size < MIN_CELLS;
  next.disabled = blocked;
  next.title = blocked ? `Draw at least ${MIN_CELLS} floor squares first` : "";
  if (inCons && ci < CONS_STEPS.length - 1) {
    next.textContent = `Next: ${consName(CONS_STEPS[ci + 1])} →`;
    next.onclick = () => setElement(CONS_STEPS[ci + 1]);
  } else {
    next.textContent = last ? "Compare Europe →" : `${SUB_NAMES[SUBSTEPS[i + 1]]} →`;
    next.onclick = () => {
      if (SUBSTEPS[i + 1] === "construction") {
        element = "wall";
        consVisited = new Set(["wall"]);
      }
      last ? setStep(4) : setSub(SUBSTEPS[i + 1]);
    };
  }
}

function renderBody() {
  const body = $("#step-body");
  body.innerHTML = "";
  chipRefreshers = [];
  if (readyMessage) {
    const p = el("div", "note");
    p.innerHTML = `${readyMessage} <button class="link">ok</button>`;
    p.querySelector("button")!.addEventListener("click", () => ((readyMessage = ""), p.remove()));
    body.appendChild(p);
  }
  if (sub === "shape") renderShape(body);
  else if (sub === "construction") renderConstruction(body);
  else if (sub === "windows") renderWindows(body);
  else if (sub === "installations") renderInstallations(body);
}

// ---------- Small DOM helpers ----------
function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = "", html = "") {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function slider(label: string, min: number, max: number, step: number, value: number, show: (v: number) => string, onInput: (v: number) => void) {
  const wrap = el("label", "field", `<span>${label} <b>${show(value)}</b></span>`);
  const r = document.createElement("input");
  r.type = "range";
  Object.assign(r, { min: String(min), max: String(max), step: String(step), value: String(value) });
  r.oninput = () => {
    const v = Number(r.value);
    wrap.querySelector("b")!.textContent = show(v);
    onInput(v);
  };
  wrap.appendChild(r);
  return wrap;
}

function group(title: string, note = "") {
  return el("div", "group", `<h3>${title}<small>${note}</small></h3>`);
}

/** A row of picture cards; the chosen one is highlighted and explained underneath.
 *  With `preview`, every other card shows how much the score would change if picked. */
function cards(items: { key: string; art: string; name: string; meta?: string }[], value: string, info: (k: string) => string, onPick: (k: string) => void, cls = "", preview?: (k: string) => (h: House) => void) {
  const wrap = el("div", "");
  const grid = el("div", `cards ${cls}`);
  const text = el("p", "info");
  let chosen = value;
  const paint = (v: string) => {
    chosen = v;
    grid.querySelectorAll<HTMLButtonElement>(".opt").forEach((b) => b.classList.toggle("on", b.dataset.k === v));
    text.innerHTML = info(v);
  };
  const chips = () => {
    if (!preview) return;
    grid.querySelectorAll<HTMLButtonElement>(".opt").forEach((b) => {
      const c = b.querySelector(".dchip-slot")!;
      c.innerHTML = b.dataset.k === chosen ? "" : deltaChip(scoreWith(preview(b.dataset.k!)));
    });
  };
  for (const it of items) {
    const b = el("button", "opt", `<span class="dchip-slot"></span>${it.art}<span>${it.name}</span>${it.meta ? `<small>${it.meta}</small>` : ""}`);
    b.dataset.k = it.key;
    b.onclick = () => {
      paint(it.key);
      onPick(it.key);
    };
    grid.appendChild(b);
  }
  wrap.append(grid, text);
  paint(value);
  if (preview) chipRefreshers.push(chips);
  return wrap;
}

// ---------- Score preview ----------
/** Callbacks that redraw the score-change chips after every update. */
let chipRefreshers: (() => void)[] = [];
let baseScore: number | null = null;

/** The rated value if `change` were applied to a copy of the house. */
function scoreWith(change: (h: House) => void): number | null {
  if (house.cells.size < MIN_CELLS) return null;
  const h = structuredClone(house);
  change(h);
  return evaluate(h, country).indicator.value;
}

function deltaChip(v: number | null) {
  if (v === null || baseScore === null) return "";
  const d = v - baseScore;
  if (Math.abs(d) < 0.5) return `<em class="dchip same" title="no change to the score">±0</em>`;
  return `<em class="dchip ${d < 0 ? "good" : "bad"}" title="change in the score if you pick this">${d < 0 ? "▼" : "▲"} ${fmt(Math.abs(d))}</em>`;
}

const niceUnit = (u: string) => u.replace(/m2/g, "m²").replace(/[.·]?(a|yr)$/, "·yr");

// ---------- Step: shape ----------
function renderShape(body: HTMLElement) {
  const g = group("Draw the floor plan", "1 square = 1 m");
  g.appendChild(el("ol", "how", tw(`
    <li><b>▭ Rectangle</b>: click one corner on the grass, then the opposite corner.</li>
    <li><b>✎ Draw</b>: for an L or U shape, click corner after corner. Walls snap straight and show their length. Double-click (or click the first corner) to finish; the grey line shows how it closes.</li>
    <li><b>＋ Add wing</b>: draw a rectangle against the house to extend it.</li>
    <li>Then pick storeys and a roof at the top. Drag on the grass to turn the view.</li>`)));
  const stats = el("dl", "kv");
  const gm = geometry(house);
  stats.innerHTML = house.cells.size
    ? `<dt>Footprint</dt><dd>${gm.footprint} m²</dd><dt>Storeys</dt><dd>${house.storeys}${house.roof === "gable" ? " + attic" : ""}</dd><dt>Floor area (gross)</dt><dd>${fmt(gm.grossFloor)} m²</dd><dt>Outer surface / floor</dt><dd>${fmt(gm.envelope / Math.max(1, gm.grossFloor), 2)}</dd>`
    : `<dt>Footprint</dt><dd>empty</dd>`;
  g.appendChild(stats);
  g.appendChild(el("p", "muted small", "A compact house (a square block, more storeys) has less outer surface per m² of floor, so it loses less heat. Corners and extensions add wall."));
  body.appendChild(g);
}

// ---------- Step: construction ----------
const ELEMENT_SURFACE = { wall: "wall", roof: "roof", floor: "floor_ground" } as const;

const CONS_STEPS = ["wall", "roof", "floor", "quality"] as const;
const consName = (k: (typeof CONS_STEPS)[number]) =>
  ({ wall: "Walls", roof: house.roof === "gable" ? "Pitched roof" : "Flat roof", floor: "Ground floor", quality: "Airtightness" })[k];
const CONS_HELP = {
  wall: "Choose how the walls are built, then the insulation and how thick it is.",
  roof: "The roof loses the most heat per m², so insulation pays off most here.",
  floor: "The floor touches cool ground instead of cold air, so it loses less heat.",
  quality: "Finish the shell: stop draughts and insulate the joints.",
};
let consVisited = new Set<string>(["wall"]);

function setElement(k: (typeof CONS_STEPS)[number]) {
  element = k;
  consVisited.add(k);
  renderBody();
  scrollPanelTop();
  renderNav();
  update();
}

function renderConstruction(body: HTMLElement) {
  const steps = el("ol", "ministeps");
  steps.innerHTML = CONS_STEPS.map((k, j) => `<li><button data-el="${k}" class="${k === element ? "on" : ""} ${consVisited.has(k) && k !== element ? "done" : ""}">${j + 1} ${consName(k)}</button></li>`).join('<li class="arrow">→</li>');
  steps.querySelectorAll<HTMLButtonElement>("[data-el]").forEach((b) => (b.onclick = () => setElement(b.dataset.el as (typeof CONS_STEPS)[number])));
  body.appendChild(steps);
  body.appendChild(el("p", "step-help", CONS_HELP[element]));
  if (element === "quality") return renderQuality(body);
  const l = element === "wall" ? house.wall : element === "roof" ? house.roofBuild : house.floor;
  body.appendChild(layeredEditor(element, l));
}

/** The element being edited, on a copy of the house. */
const layerOf = (h: House, elem: "wall" | "roof" | "floor") => (elem === "wall" ? h.wall : elem === "roof" ? h.roofBuild : h.floor);

function applyBuildup(l: Layered, k: string) {
  l.construction = k;
  const opts = CONSTRUCTIONS[k].insulation_options;
  if (opts.length && !opts.includes(l.insulation)) l.insulation = opts[0];
}

function layeredEditor(elem: "wall" | "roof" | "floor", l: Layered) {
  const wrap = el("div", "editor");
  const options = Object.entries(CONSTRUCTIONS).filter(([k, c]) => c.element === elem && (elem !== "roof" || (house.roof === "gable" ? k.includes("pitched") : k.includes("flat"))));
  const g1 = group("a · Build-up", options.length < 2 ? "only one option for this roof type" : "▲▼ = change in your score");
  g1.appendChild(
    cards(
      options.map(([k, c]) => ({ key: k, art: sectionSVG({ ...l, construction: k, insulation: c.insulation_options.includes(l.insulation) ? l.insulation : c.insulation_options[0] ?? l.insulation }, elem, true), name: c.name })),
      l.construction,
      (k) => CONSTRUCTION_INFO[k] ?? "",
      (k) => {
        applyBuildup(l, k);
        renderBody();
        update();
      },
      "wide",
      (k) => (h) => applyBuildup(layerOf(h, elem), k),
    ),
  );
  wrap.appendChild(g1);

  const ins = CONSTRUCTIONS[l.construction].insulation_options;
  const g3 = group("b · Insulation");
  if (ins.length) {
    g3.appendChild(
      cards(
        ins.map((k) => ({ key: k, art: insulationSwatch(k), name: MATERIALS[k].name, meta: `λ ${MATERIALS[k].lambda}` })),
        l.insulation,
        (k) => `${MATERIAL_INFO[k] ?? ""} <span class="muted">λ (lambda) is how well a material conducts heat: lower insulates better.</span>`,
        (k) => {
          l.insulation = k;
          update();
        },
        "small",
        (k) => (h) => void (layerOf(h, elem).insulation = k),
      ),
    );
    const steps = INSULATION_STEPS;
    g3.appendChild(slider("c · Thickness", 0, steps.length - 1, 1, Math.max(0, steps.indexOf(l.thickness)), (i) => `${Math.round(steps[i] * 100)} cm`, (i) => {
      l.thickness = steps[i];
      update();
    }));
  } else {
    g3.appendChild(el("p", "muted small", "The blocks insulate by themselves; there is no separate insulation layer. Thicker blocks are already in the build-up."));
  }
  wrap.appendChild(g3);
  return wrap;
}

function renderQuality(body: HTMLElement) {
  const g = group("a · Airtightness", "n50: air changes per hour at 50 Pa");
  g.appendChild(
    cards(
      Object.entries(AIRTIGHTNESS).map(([k, v]) => ({ key: k, art: airSVG(v.n50), name: v.name, meta: `n50 ${v.n50}/h` })),
      house.airtightness,
      () => "Cold air leaking in through gaps around windows, sockets and joints. Builders test it by blowing air into the house (a blower-door test). Fewer leaks, less heat lost.",
      (k) => ((house.airtightness = k), update()),
      "small",
      (k) => (h) => void (h.airtightness = k),
    ),
  );
  body.appendChild(g);
  const t = group("b · Thermal bridges", "extra heat loss at joints");
  t.appendChild(
    cards(
      Object.entries(THERMAL_BRIDGES).map(([k, v]) => ({ key: k, art: bridgeSVG(v.dU), name: v.name, meta: `+${v.dU} W/m²K` })),
      house.thermalBridges,
      () => "Where a wall meets a floor, roof or window frame, the insulation is often interrupted and heat escapes faster. Careful detailing keeps the insulation continuous.",
      (k) => ((house.thermalBridges = k), update()),
      "small",
      (k) => (h) => void (h.thermalBridges = k),
    ),
  );
  body.appendChild(t);
}

/** Cross-section card on the 3D stage, always visible during the construction step. */
function placeXsec() {
  const box = $("#xsec");
  if (XSEC_IN_PANEL.matches) $(".side").insertBefore(box, $("#step-body"));
  else $(".stage").insertBefore(box, $("#hud"));
}
XSEC_IN_PANEL.addEventListener("change", () => {
  placeXsec();
  renderXsec();
});
placeXsec();

function renderXsec() {
  const box = $("#xsec");
  const on = sub === "construction" && house.cells.size >= MIN_CELLS;
  box.classList.toggle("hidden", !on);
  const stage = $(".stage");
  const column = on && !XSEC_IN_PANEL.matches;
  if (stage.classList.contains("with-xsec") !== column) {
    stage.classList.toggle("with-xsec", column);
    view?.resize();
  }
  if (!on) return;
  if (element === "quality") {
    const a = AIRTIGHTNESS[house.airtightness], t = THERMAL_BRIDGES[house.thermalBridges];
    box.innerHTML = `<h3>Airtightness and joints</h3>
      <div class="xsec-pair"><div>${airSVG(a.n50)}<b>${a.name}</b><small>n50 ${a.n50} /h</small></div><div>${bridgeSVG(t.dU)}<b>${t.name}</b><small>+${t.dU} W/m²K</small></div></div>`;
    return;
  }
  const l = layerOf(house, element);
  const surface = element === "floor" && l.construction === "floor_crawlspace" ? "floor_crawl" : ELEMENT_SURFACE[element];
  const r = layerU(l, surface);
  box.innerHTML = `<h3>${consName(element)} · cross-section</h3>
    ${sectionSVG(l, element)}${sectionLegend(l)}
    <div class="uval">U <b>${fmt(r.U, 2)}</b> W/m²K · Rc <b>${fmt(r.R, 1)}</b> m²K/W ${codePill(element, r.U, r.R)}</div>
    <p class="muted xsmall">U: heat leaking through 1 m² per degree of difference. Lower is better.</p>`;
}

function airSVG(n50: number) {
  const arrows = Math.max(0, Math.min(5, Math.round(n50 / 1.5)));
  let s = `<svg viewBox="0 0 60 60" class="icon"><path d="M10 28L30 10L50 28V52H10Z" fill="#fff" stroke="#23262f" stroke-width="2"/>`;
  for (let i = 0; i < arrows; i++) s += `<path d="M${2 + (i % 2) * 4} ${30 + i * 5}h12" stroke="#56b4e9" stroke-width="2"/>`;
  return s + "</svg>";
}

function bridgeSVG(dU: number) {
  const hot = Math.round(Math.min(1, dU / 0.1) * 3);
  let s = `<svg viewBox="0 0 60 60" class="icon"><rect x="6" y="30" width="48" height="8" fill="#a9adb4" stroke="#23262f"/><rect x="24" y="4" width="12" height="${hot ? 26 : 52}" fill="#f3d36b" stroke="#23262f"/>${hot ? "" : ""}`;
  for (let i = 0; i < hot; i++) s += `<path d="M${40 + i * 6} 40q4 6 0 12" stroke="#f37021" fill="none" stroke-width="2.5"/>`;
  return s + "</svg>";
}

function codePill(elem: "wall" | "roof" | "floor", U: number, R: number) {
  const bc = BUILDING_CODE[country];
  if (!bc || bc.kind === "none" || bc.kind === "envelope_average") return "";
  const name = COUNTRIES[country].name.replace(/^Belgium \((.*)\)$/, "$1");
  if (bc.Rc_wall_min !== undefined) {
    const min = { wall: bc.Rc_wall_min, roof: bc.Rc_roof_min, floor: bc.Rc_floor_min }[elem];
    return min === undefined ? "" : R >= min ? `<span class="pill ok">meets ${name} code (Rc ≥ ${min})</span>` : `<span class="pill bad">below ${name} code (Rc ≥ ${min})</span>`;
  }
  const ref = bc.kind !== "element_max";
  const lim = ref ? { wall: bc.U_wall, roof: bc.U_roof, floor: bc.U_floor ?? bc.U_floor_ground }[elem] : { wall: bc.U_wall_max, roof: bc.U_roof_max, floor: bc.U_floor_max ?? bc.U_ground_max }[elem];
  if (lim === undefined) return "";
  if (ref) return `<span class="pill">${name} reference house: U ${lim}</span>`;
  return U <= lim + 1e-9 ? `<span class="pill ok">meets ${name} code (U ≤ ${lim})</span>` : `<span class="pill bad">above ${name} limit (U ≤ ${lim})</span>`;
}

// ---------- Step: windows ----------
function renderWindows(body: HTMLElement) {
  body.appendChild(el("p", "step-help", "<b>A window is a frame with glass in it.</b> Choose both, pick a size, then put windows on the walls. The cards show how your score would change."));
  const fg = group("a · Frame", "the border around the glass");
  fg.appendChild(
    cards(
      Object.entries(FRAMES).map(([k, v]) => ({ key: k, art: frameSVG(k), name: v.name, meta: `U<sub>f</sub> ${v.U_f}` })),
      house.frame,
      (k) => `${FRAME_INFO[k] ?? ""} <span class="muted">U<sub>f</sub>: heat lost through 1 m² of frame per degree.</span>`,
      (k) => ((house.frame = k), update()),
      "small",
      (k) => (h) => void (h.frame = k),
    ),
  );
  body.appendChild(fg);

  const g = group("b · Glass", "the panes inside");
  g.appendChild(
    cards(
      Object.entries(GLAZING).map(([k, v]) => ({ key: k, art: glazingSVG(k), name: v.name, meta: `U<sub>g</sub> ${v.U_g} · g ${v.g}` })),
      house.window,
      (k) => `${GLAZING_INFO[k] ?? ""} <span class="muted">U<sub>g</sub>: heat lost through the glass. g: share of sunshine that comes in as free heat.</span>`,
      (k) => ((house.window = k), update()),
      "small",
      (k) => (h) => void (h.window = k),
    ),
  );
  body.appendChild(g);

  const res = group("= Your window", "frame + glass together");
  res.appendChild(el("div", "", `<div id="win-preview"></div>`));
  body.appendChild(res);

  const p = group("c · Size, then place it", tw("drag onto a wall, or pick and click"));
  const pal = el("div", "palette four");
  const sizes: WindowSize[] = ["small", "standard", "tall", "custom"];
  const custom = el("div", "custom-size");
  const paintPal = () => {
    pal.querySelectorAll<HTMLButtonElement>(".opt").forEach((o) => o.classList.toggle("on", o.dataset.k === windowSize));
    custom.classList.toggle("hidden", windowSize !== "custom");
    syncPlacing();
  };
  for (const s of sizes) {
    const name = s === "custom" ? "Your own size" : WINDOW_SIZES[s].name;
    const dims = windowDims({ size: s, w: customW, h: customH });
    const b = el("button", "opt", `${windowSizeSVG(s, customW, customH)}<span>${name}</span><small class="dims">${fmt(dims.w, 1)} × ${fmt(dims.h, 1)} m</small>`);
    b.dataset.k = s;
    b.draggable = !TOUCH;
    b.onclick = () => ((windowSize = s), paintPal());
    b.ondragstart = (e) => {
      windowSize = s;
      paintPal();
      e.dataTransfer?.setData("text/plain", s);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
    };
    pal.appendChild(b);
  }
  const refreshCustom = () => {
    const b = pal.querySelector<HTMLButtonElement>('[data-k="custom"]')!;
    b.querySelector("svg")!.outerHTML = windowSizeSVG("custom", customW, customH);
    b.querySelector(".dims")!.textContent = `${fmt(customW, 1)} × ${fmt(customH, 1)} m`;
    syncPlacing();
  };
  custom.append(
    slider("Width", CUSTOM_LIMITS.w[0], CUSTOM_LIMITS.w[1], 0.1, customW, (v) => `${fmt(v, 1)} m`, (v) => ((customW = v), refreshCustom())),
    slider("Height", CUSTOM_LIMITS.h[0], CUSTOM_LIMITS.h[1], 0.1, customH, (v) => `${fmt(v, 1)} m`, (v) => ((customH = v), refreshCustom())),
    el("p", "muted xsmall", "Wider than 1 m? The window takes the next wall squares to the right as well."),
  );
  p.append(pal, custom);
  const row = el("div", "row");
  const suggest = el("button", "btn", "Suggest a layout");
  suggest.onclick = () => {
    fillWindows(house, { N: 0.12, E: 0.15, S: 0.3, W: 0.15 }, windowSize === "custom" ? "standard" : windowSize);
    update();
  };
  const clear = el("button", "btn", "Remove all");
  clear.onclick = () => {
    house.windows = [];
    update();
  };
  row.append(suggest, clear);
  p.appendChild(row);
  p.appendChild(el("div", "", `<div id="win-stats"></div>`));
  p.appendChild(el("p", "muted small", "South windows let in winter sun (free heat) but can overheat in summer; north windows mostly lose heat. Turn the house with ↺ ↻ to reach every side."));
  body.appendChild(p);

  const d = group("d · Front door", "in the middle of the front");
  d.appendChild(
    cards(
      Object.entries(DOORS).map(([k, v]) => ({ key: k, art: doorSVG(k === "door_passive"), name: v.name, meta: `U ${v.U}` })),
      house.door,
      () => "Doors lose more heat than an insulated wall. A passive-house door has an insulated core and three seals.",
      (k) => ((house.door = k), update()),
      "small",
      (k) => (h) => void (h.door = k),
    ),
  );
  const std = house.doorW === 0.95 && house.doorH === 2.3;
  const sizeRow = el("div", "pills");
  const doorCustom = el("div", `custom-size ${std ? "hidden" : ""}`);
  for (const [label, isStd] of [["Standard 0.95 × 2.3 m", true], ["Your own size", false]] as const) {
    const b = el("button", isStd === std ? "on" : "", label);
    b.onclick = () => {
      if (isStd) {
        house.doorW = 0.95;
        house.doorH = 2.3;
        update();
      }
      sizeRow.querySelectorAll("button").forEach((o) => o.classList.toggle("on", o === b));
      doorCustom.classList.toggle("hidden", isStd);
    };
    sizeRow.appendChild(b);
  }
  doorCustom.append(
    slider("Door width", 0.8, 1.0, 0.05, house.doorW, (v) => `${fmt(v, 2)} m`, (v) => ((house.doorW = v), update())),
    slider("Door height", 2.0, 2.5, 0.05, house.doorH, (v) => `${fmt(v, 2)} m`, (v) => ((house.doorH = v), update())),
  );
  d.append(sizeRow, doorCustom);
  body.appendChild(d);
  paintPal();
  renderWindowStats();
}

function doorSVG(passive: boolean) {
  return `<svg viewBox="0 0 60 60" class="icon"><rect x="16" y="4" width="28" height="52" rx="2" fill="#5a3a26" stroke="#23262f" stroke-width="2"/>${passive ? `<rect x="21" y="9" width="18" height="42" fill="#f3d36b" stroke="#23262f"/>` : ""}<circle cx="38" cy="32" r="2.5" fill="#f5c542" stroke="#23262f"/></svg>`;
}

/** The chosen frame + glass at the chosen size: its U_w and how much of it is frame. */
function renderWinPreview() {
  const host = document.getElementById("win-preview");
  if (!host) return;
  const d = windowDims(placing());
  const u = windowU(house.frame, house.window, d.w, d.h);
  const fr = FRAMES[house.frame], gl = GLAZING[house.window];
  const n = validWindows(house).length;
  const avg = windowProps(house);
  host.innerHTML = `<div class="win-res">${windowFrontSVG(house.frame, d.w, d.h, fr.width_m)}
    <div class="win-res-txt">
      <div class="uw">U<sub>w</sub> <b>${fmt(u.U, 2)}</b> <span>W/m²K</span></div>
      <div class="small">${fmt(d.w, 2)} × ${fmt(d.h, 2)} m · ${Math.round((u.Ag / u.A) * 100)}% glass · ${Math.round(u.frameFraction * 100)}% frame</div>
      <div class="xsmall muted">glass U<sub>g</sub> ${gl.U_g} · frame U<sub>f</sub> ${fr.U_f} · glass edge ψ ${gl.psi_g}</div>
      ${n ? `<div class="small">All ${n} windows together: U<sub>w</sub> <b>${fmt(avg.U_w, 2)}</b></div>` : ""}
    </div></div>
    <p class="muted xsmall">U<sub>w</sub> mixes glass, frame and the glass edge by area (EN ISO 10077-1). Small windows have relatively more frame, so they lose more per m².</p>`;
}

function renderWindowStats() {
  const host = document.getElementById("win-stats");
  if (!host) return;
  const g = geometry(house);
  const names: Record<Facade, string> = { N: "North", E: "East", S: "South", W: "West" };
  const count: Record<Facade, number> = { N: 0, E: 0, S: 0, W: 0 };
  for (const w of validWindows(house)) count[w.facade]++;
  host.innerHTML = `<table class="wtable"><tr><th></th><th>windows</th><th>glass</th><th>of wall</th></tr>${FACADES.map(
    (f) => `<tr><td>${names[f]}</td><td>${count[f]}</td><td>${fmt(g.windowArea[f], 1)} m²</td><td>${g.wallGross[f] ? Math.round((g.windowArea[f] / g.wallGross[f]) * 100) : 0}%</td></tr>`,
  ).join("")}</table>`;
}

// ---------- Step: installations ----------
function renderInstallations(body: HTMLElement) {
  const sysCards = (title: string, note: string, field: "heating" | "emitter" | "ventilation", entries: [string, { name: string }][], value: string, meta: (k: string) => string, onPick: (k: string) => void) => {
    const g = group(title, note);
    g.appendChild(cards(entries.map(([k, v]) => ({ key: k, art: systemSVG(k), name: v.name, meta: meta(k) })), value, (k) => SYSTEM_INFO[k] ?? "", onPick, "small", (k) => (h) => void ((h as unknown as Record<string, string>)[field] = k)));
    body.appendChild(g);
  };
  sysCards("1 · Heat source", "heating and hot water", "heating", Object.entries(SYSTEMS.heating), house.heating, () => "", (k) => ((house.heating = k), update()));
  sysCards("2 · Heat emitters", "how heat enters the rooms", "emitter", Object.entries(SYSTEMS.emitters), house.emitter, (k) => `${(SYSTEMS.emitters as Record<string, { supply_C: number }>)[k].supply_C} °C`, (k) => ((house.emitter = k), update()));
  sysCards("3 · Ventilation", "fresh air", "ventilation", Object.entries(SYSTEMS.ventilation), house.ventilation, () => "", (k) => ((house.ventilation = k), update()));

  const s = group("4 · Solar", "on the roof");
  const mp = maxPanels(house);
  const pv = el("div", "solar-row", `${systemSVG("pv")}<p class="info">${SYSTEM_INFO.pv}</p>`);
  s.appendChild(pv);
  s.appendChild(slider("Solar panels (PV)", 0, mp, 1, Math.min(house.pvPanels, mp), (v) => `${v} × 400 Wp`, (v) => ((house.pvPanels = v), update())));
  const st = el("div", "solar-row", `${systemSVG("solar_thermal")}<p class="info">${SYSTEM_INFO.solar_thermal}</p>`);
  s.appendChild(st);
  s.appendChild(slider("Solar water heater", 0, 8, 1, house.solarThermal_m2, (v) => `${v} m²`, (v) => ((house.solarThermal_m2 = v), update())));
  body.appendChild(s);
}

// ---------- Results ----------
function update() {
  const idx = SUBSTEPS.indexOf(sub);
  const systemsShown = mode === "ready" || idx >= SUBSTEPS.indexOf("installations");
  view?.render(house, { systems: systemsShown });
  renderXsec();
  if (house.cells.size < MIN_CELLS) {
    baseScore = null;
    shownScore = null;
    $("#label-card").innerHTML = `<div class="empty-label"><b>No house yet</b><span class="muted small">Draw the floor plan on the grass to see its label.</span></div>`;
    $("#hud").innerHTML = `<span>Footprint <b>${house.cells.size} m²</b></span>`;
    if (sub === "result") $("#step-body").innerHTML = "";
    return;
  }
  const r = evaluate(house, country);
  baseScore = r.indicator.value;
  $("#label-card").classList.toggle("on-result", sub === "result");
  $("#hud").classList.toggle("hidden", sub === "result");
  renderLabel(r);
  renderHud(r, systemsShown);
  chipRefreshers.forEach((f) => f());
  if (sub === "windows") {
    renderWinPreview();
    renderWindowStats();
  }
  if (sub === "result") renderDetails(r);
}

function renderHud(r: CountryResult, systemsShown: boolean) {
  const fails = r.code.filter((c) => !c.ok && c.kind === "element_max").length;
  $("#hud").innerHTML = `
    <span title="Floor area as this country measures it (${r.areaCode})">Floor area <b>${fmt(r.area)} m²</b></span>
    <span>Heat need <b>${fmt(r.perM2.heatNeed)}</b> kWh/m²</span>
    <span>CO₂ <b>${fmt(r.co2 / 1000, 1)} t</b>/yr</span>
    <span>${r.cost >= 0 ? `Bills <b>€${fmt(r.cost)}</b>/yr` : `Earns <b>€${fmt(-r.cost)}</b>/yr`}</span>
    ${fails ? `<span class="warn">⚠ ${fails} below code</span>` : ""}
    ${systemsShown ? "" : `<span class="soft">Gas boiler assumed until you choose installations</span>`}`;
}

let shownScore: number | null = null;
let shownCountry = "";
let shownClass = "";
let animToken = 0;

/** Scoreboard: class cube, the rated value (animated), what it measures, and the class ladder. */
function renderLabel(r: CountryResult) {
  const card = $("#label-card");
  const classes = r.label.classes;
  const n = classes.length;
  const col = classColor(r.label.index, n);
  const value = r.indicator.value;
  const dec = Math.abs(value) < 10 ? 1 : 0;
  const plain = plainFor(String((r.country.label as Record<string, unknown>).indicator ?? ""));
  const sameCountry = shownCountry === country;
  const from = sameCountry && shownScore !== null ? shownScore : value;
  const changedClass = sameCountry && shownClass !== "" && shownClass !== r.label.cls;
  const opts = Object.values(COUNTRIES).map((c) => `<option value="${c.id}" ${c.id === country ? "selected" : ""}>${c.name}</option>`).join("");
  const ladder = classes.map((c, i) => {
    const prev = i > 0 ? classes[i - 1].max : null;
    const range = c.max === null ? `above ${fmt(prev ?? 0)}` : `up to ${fmt(c.max, c.max < 10 ? 1 : 0)}`;
    return `<i class="${i === r.label.index ? "me" : ""}" style="background:${classColor(i, n)}" title="${c.class}: ${range}">${fit(c.class)}</i>`;
  }).join("");
  card.innerHTML = `
    <div class="sb-top"><select id="country-sel" aria-label="Country">${opts}</select><span class="prov-tag">provisional label</span></div>
    <div class="sb-main">
      <div class="sb-class ${changedClass ? "pop" : ""}" style="background:${col}">${fit(r.label.cls)}</div>
      <div class="sb-score">
        <div class="sb-num"><b id="sb-num">${fmt(from, dec)}</b><span class="sb-unit">${niceUnit(r.indicator.unit)}</span><span id="sb-delta"></span></div>
        <div class="sb-what">${plain.icon} ${plain.title}</div>
        <div class="sb-scheme">${r.country.scheme}${r.label.note ? ` · ${r.label.note}` : ""}${r.second ? ` · ${r.second.name}: ${r.second.label.cls}` : ""}</div>
      </div>
    </div>
    <div class="ladder" aria-label="Class ${r.label.cls} of ${n}">${ladder}</div>`;
  $<HTMLSelectElement>("#country-sel").onchange = (e) => {
    country = (e.target as HTMLSelectElement).value;
    renderBody();
    update();
  };
  // Count from the old score to the new one, with a ▲/▼ chip for the change.
  if (from !== value) {
    const d = value - from;
    if (Math.abs(d) >= 0.5) $("#sb-delta").innerHTML = `<em class="dchip big ${d < 0 ? "good" : "bad"}">${d < 0 ? "▼" : "▲"} ${fmt(Math.abs(d), dec)}</em>`;
    const token = ++animToken;
    const t0 = performance.now();
    const step = (t: number) => {
      if (token !== animToken) return;
      const k = Math.min(1, (t - t0) / 500);
      const e = 1 - Math.pow(1 - k, 3);
      const elx = document.getElementById("sb-num");
      if (elx) elx.textContent = fmt(from + (value - from) * e, dec);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  shownScore = value;
  shownCountry = country;
  shownClass = r.label.cls;
}

/** The full class scale with ranges, for the Result step. Bars and labels never wrap. */
function fullScale(r: CountryResult) {
  const classes = r.label.classes;
  const n = classes.length;
  const dec = Math.abs(r.indicator.value) < 10 ? 1 : 0;
  const rows = classes.map((c, i) => {
    const width = 34 + (i / Math.max(1, n - 1)) * 60;
    const prev = i > 0 ? classes[i - 1].max : null;
    const range = c.max === null ? `> ${fmt(prev ?? 0)}` : `≤ ${fmt(c.max, c.max < 10 ? 1 : 0)}`;
    const me = i === r.label.index;
    return `<div class="frow ${me ? "me" : ""}"><span class="fbar" style="width:${width}%;background:${classColor(i, n)}"><b>${fit(c.class)}</b>${me ? `<span class="fmark">your house · ${fmt(r.indicator.value, dec)}</span>` : ""}</span><span class="frange">${range}</span></div>`;
  }).join("");
  return `<div class="group"><h3>Where your house lands <small>${niceUnit(r.indicator.unit)}</small></h3><div class="fscale">${rows}</div></div>`;
}

const MONTHS = "JFMAMJJASOND".split("");

function renderDetails(r: CountryResult) {
  const body = $("#step-body");
  const max = Math.max(1, ...r.heatNeedMonthly);
  const d = r.delivered;
  const carriers = Object.entries(d).filter(([, v]) => v > 0.5).map(([k, v]) => `<dt>${k.replace("_", " ")}</dt><dd>${fmt(v)} kWh</dd>`).join("");
  const code = r.code.map((c) => {
    const isLimit = c.kind === "element_max" || c.kind === "envelope_average";
    const higherBetter = /K\/W/.test(c.unit);
    const scale = Math.max(c.value, c.limit) * 1.25 || 1;
    const tag = isLimit ? (c.ok ? "ok" : "not met") : c.ok ? "better" : "worse";
    const cls = c.ok ? "ok" : isLimit ? "bad" : "ref";
    const what = isLimit ? (higherBetter ? "min" : "max") : "ref.";
    return `<div class="crow" title="${c.element}: ${fmt(c.value, 2)} ${c.unit}, ${what} ${fmt(c.limit, 2)}">
      <b>${c.element.replace(/ ?(U|Rc|average)$/i, "")}</b>
      <span class="cbar"><i class="${cls}" style="width:${(c.value / scale) * 100}%"></i><em style="left:${(c.limit / scale) * 100}%"></em></span>
      <span class="ctag ${cls}">${tag}</span>
      <small>${fmt(c.value, 2)} · ${what} ${fmt(c.limit, 2)}</small>
    </div>`;
  }).join("");
  const codeUnit = r.code[0]?.unit ?? "";
  const bc = BUILDING_CODE[country];
  queueMicrotask(() => $("#step-body").appendChild(shareBox()));
  const beng1 = country === "NL" ? `<dt>BENG 1 (heating + cooling need)</dt><dd>${fmt((r.heatNeed + r.coolNeed) / r.area, 1)} kWh/m²</dd>` : "";
  const note = readyMessage ? `<div class="note">${readyMessage}</div>` : "";
  body.innerHTML = `${note}
    ${fullScale(r)}
    <div class="group"><h3>Energy per year <small>${r.climate.station} climate</small></h3>
      <div class="etiles">
        <div class="etile"><span>🔥 Heat need</span><b>${fmt(r.perM2.heatNeed)}</b><small>kWh/m²</small></div>
        <div class="etile"><span>💶 ${r.cost >= 0 ? "Bills" : "Earns"}</span><b>€${fmt(Math.abs(r.cost))}</b><small>per year</small></div>
        <div class="etile"><span>🌫️ CO₂</span><b>${fmt(r.co2 / 1000, 1)} t</b><small>per year</small></div>
        <div class="etile"><span>☀️ Solar</span><b>${fmt(r.pv.generated)}</b><small>kWh made</small></div>
      </div>
      <details class="more"><summary>All numbers</summary>
      <dl class="kv">
        <dt>Heating need</dt><dd>${fmt(r.heatNeed)} kWh · ${fmt(r.perM2.heatNeed)} /m²</dd>
        <dt>Cooling need</dt><dd>${fmt(r.coolNeed)} kWh</dd>
        ${beng1}
        <dt>Hot water need</dt><dd>${fmt(r.dhwNeed)} kWh</dd>
        ${carriers}
        <dt>Solar PV made</dt><dd>${fmt(r.pv.generated)} kWh</dd>
        <dt>… used in the house</dt><dd>${fmt(r.pv.selfUsed)} kWh</dd>
        <dt>Final energy</dt><dd>${fmt(r.perM2.final)} kWh/m²</dd>
        <dt>Primary energy, total</dt><dd>${fmt(r.perM2.peTot)} kWh/m²</dd>
        <dt>Primary energy, non-renewable</dt><dd>${fmt(r.perM2.peNren)} kWh/m²</dd>
        <dt>CO₂</dt><dd>${fmt(r.co2)} kg · ${fmt(r.perM2.co2, 1)} /m²</dd>
        <dt>Energy bills (2026 prices)</dt><dd>${r.cost >= 0 ? "" : "−"}€${fmt(Math.abs(r.cost))}</dd>
      </dl></details>
    </div>
    <div class="group"><h3>Heating need per month</h3>
      <div class="months">${r.heatNeedMonthly.map((v) => `<i style="height:${(v / max) * 100}%" title="${fmt(v)} kWh"></i>`).join("")}</div>
      <div class="months-l">${MONTHS.map((m) => `<span>${m}</span>`).join("")}</div>
    </div>
    <div class="group"><h3>Building code <small>${codeUnit}</small></h3>
      ${code ? `<div class="code-rows">${code}</div><p class="muted xsmall">Bar: your house. Black line: the code ${bc?.kind === "element_max" ? "limit" : "value"}.</p>` : `<p class="muted small" style="margin:0">${bc?.note ?? "No element limits."}</p>`}
      ${bc ? `<p class="muted small" style="margin:0">${bc.note ?? ""} <span class="flag ${bc.status}">${bc.status}</span></p>` : ""}
    </div>
    <details class="group expert"><summary>Expert view</summary>
      <dl class="kv">
        <dt>Floor area used (${r.areaCode})</dt><dd>${fmt(r.area, 1)} m²</dd>
        <dt>Basis</dt><dd>${r.country.floor_area.basis.replace("_", " ")}</dd>
        <dt>H transmission</dt><dd>${fmt(r.Htr, 1)} W/K</dd>
        <dt>H ventilation</dt><dd>${fmt(r.Hve, 1)} W/K</dd>
        <dt>U wall / roof / floor / window</dt><dd>${fmt(r.U.wall, 2)} / ${fmt(r.U.roof, 2)} / ${fmt(r.U.floor, 2)} / ${fmt(r.U.window, 2)}</dd>
        <dt>Thermal mass</dt><dd>${r.massKey.replace("_", " ")}</dd>
      </dl>
      <p class="small"><b>Method:</b> ${r.country.method}</p>
      <p class="small"><b>Values that are not official yet:</b></p>
      <ul>${r.flags.map((f) => `<li>${f.item} <span class="flag ${f.status.split(" ")[0]}">${f.status}</span></li>`).join("") || "<li>none</li>"}</ul>
      <p class="small"><b>App assumptions:</b></p>
      <ul>${Object.entries(ASSUMPTIONS).map(([k, v]) => `<li>${k.replace(/_/g, " ")}: ${typeof v === "object" ? JSON.stringify(v) : v}</li>`).join("")}</ul>
      <p class="small muted">One shared monthly balance (EN ISO 13790 / 52016 style) with each country's climate, usage conventions, floor area, energy factors and class limits. Checked against published NTA 8800 results for a Dutch reference house (heating + cooling need within 1-22%).</p>
    </details>`;
}

// ---------- Compare ----------
function renderCompare() {
  if (house.cells.size < MIN_CELLS) return setStep(2);
  const rel = (r: CountryResult) => (r.label.classes.length <= 1 ? 0 : r.label.index / (r.label.classes.length - 1));
  const all = evaluateAll(house).sort((a, b) => rel(a) - rel(b));
  const medals = ["🥇", "🥈", "🥉"];
  const greens = all.filter((r) => rel(r) <= 0.34).length;
  const others = all.filter((r) => r.country.id !== country);
  const best = others[0], worst = others[others.length - 1];
  const agree = rel(best) === rel(worst);
  const short = shortName;
  $("#compare-hero").innerHTML = `
    <div class="hero-stat"><b>${greens}</b><span>of ${all.length} countries give your house a top-third label</span></div>
    <div class="hero-stat"><span class="badge sm" style="background:${classColor(best.label.index, best.label.classes.length)}">${fit(best.label.cls)}</span><span>${agree ? "Every other judge gives the same step" : `Kindest other judge: <b>${short(best.country.name)}</b>`}</span></div>
    ${agree ? "" : `<div class="hero-stat"><span class="badge sm" style="background:${classColor(worst.label.index, worst.label.classes.length)}">${fit(worst.label.cls)}</span><span>Toughest other judge: <b>${short(worst.country.name)}</b></span></div>`}`;
  $("#compare-grid").innerHTML = all.map((r, i) => {
    const n = r.label.classes.length;
    const p = plainFor(String((r.country.label as Record<string, unknown>).indicator ?? ""));
    const f = COUNTRY_FACTS[r.country.id] ?? { icon: p.icon, title: p.title, text: p.text };
    // One cube per class: the ladder's length is the number of classes; the house's cube pops up.
    const cubes = r.label.classes.map((c, k) => `<i class="${k === r.label.index ? "me" : ""}" style="background:${classColor(k, n)}" title="${c.class}">${k === r.label.index ? fit(c.class) : ""}</i>`).join("");
    return `<button class="ccard ${r.country.id === country ? "me" : ""}" data-country="${r.country.id}" title="${r.indicator.name}: ${fmt(r.indicator.value, r.indicator.value < 10 ? 1 : 0)} ${r.indicator.unit}">
      <span class="badge" style="background:${classColor(r.label.index, n)}">${fit(r.label.cls)}</span>
      <h3>${medals[i] ?? ""} ${short(r.country.name)}${r.country.id === country ? ` <small class="you">you</small>` : ""}</h3>
      <span class="judge">${f.icon} ${f.title}</span>
      <span class="cubes" aria-label="Class ${r.label.cls} on a ladder of ${n}">${cubes}</span>
      <span class="fact">${f.text}</span>
    </button>`;
  }).join("");
  $$<HTMLButtonElement>(".ccard").forEach((b) => (b.onclick = () => ((country = b.dataset.country!), setStep(3))));
  $("#compare-share").replaceChildren(shareBox(true));
  const tiles = [
    ["🎯", "They aim at different things", "Some only judge the walls and windows, some the energy your meters would show, and some trace every kWh back to the power plant."],
    ["⚡", "Electricity weighs differently", "One kWh from the socket counts 1.2 in Finland but 2.5 in Belgium and Slovenia, so a heat pump scores very differently."],
    ["🌦️", "Each has its own weather", `The same house is rated in the weather of ${best.climate.station} for its kindest judge and of ${worst.climate.station} for its toughest. A colder winter means more heating.`],
    ["📐", "They measure the floor differently", "Inside the walls, outside the walls, or (Germany) a share of the heated volume: the same energy is divided by a different number of m²."],
    ["🪜", "The ladders have different steps", `Scales run from 7 to 12 classes, and an "A" can mean under 30 or under 110 kWh per m².`],
  ];
  $("#compare-why").innerHTML = `<h3>Five reasons the judges disagree</h3>
    <div class="tiles">${tiles.map(([icon, t, d]) => `<div class="tile"><span class="tile-icon">${icon}</span><b>${t}</b><p>${d}</p></div>`).join("")}</div>
    <p class="muted small">${tw("Click")} a country to play your house there. Labels are provisional: one simplified shared calculation, not an official certificate. Every value carries a quality flag in Result → Expert view.</p>`;
}

// ---------- Start ----------
if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__lx = { house, get view() { return view; }, evaluate, get sub() { return sub; } };
{
  const sel = $<HTMLSelectElement>("#country-list");
  const list = INDEX.filter((e) => e.available).sort((a, b) => a.name.localeCompare(b.name));
  for (const e of list) sel.add(new Option(e.name, e.id));
  sel.onchange = () => {
    const e = list.find((x) => x.id === sel.value);
    sel.value = "";
    if (e) pickCountry([e]);
  };
}
drawMap($("#map"), $("#map-tip"), pickCountry).catch((e) => ($("#map").textContent = `Map failed to load: ${e}`));

// ---------- Save and share ----------
function shareBox(big = false) {
  const box = el("div", big ? "why share-box" : "group share-box", `
    <h3>Save or share your house</h3>
    <p class="muted small">The link opens this exact house again, on any device. The image shows it with its label in every country.</p>
    <div class="row">
      <button class="btn primary" data-img>Create share image</button>
      <button class="btn" data-link>Copy link</button>
    </div>
    <p class="muted small share-msg" aria-live="polite"></p>
    <div class="share-out hidden">
      <img alt="Share image: your house and its label in every country" />
      <div class="row"><button class="btn primary" data-download>Download image</button><button class="btn hidden" data-native>Share…</button></div>
    </div>`);
  const msg = box.querySelector<HTMLElement>(".share-msg")!;
  const out = box.querySelector<HTMLElement>(".share-out")!;
  let blob: Blob | undefined;
  const fileName = () => `my-house-${country.toLowerCase()}-label-explorer.png`;
  box.querySelector<HTMLButtonElement>("[data-link]")!.onclick = async () => {
    const url = houseLink(house, country);
    history.replaceState(null, "", url);
    try {
      if (TOUCH && navigator.share) await navigator.share({ title: "My house in Label Explorer", url });
      else {
        await navigator.clipboard.writeText(url);
        msg.textContent = "Link copied. Paste it anywhere to open this house again; bookmarking this page works too.";
      }
    } catch {
      msg.textContent = "The link is now in the address bar: bookmark or copy it from there.";
    }
  };
  box.querySelector<HTMLButtonElement>("[data-img]")!.onclick = async () => {
    if (!view) return;
    msg.textContent = "Drawing your image…";
    view.render(house, { roof: true, systems: true });
    const rel = (r: CountryResult) => r.label.index / Math.max(1, r.label.classes.length - 1);
    const all = evaluateAll(house).sort((a, b) => rel(a) - rel(b));
    blob = await shareImage(view.snapshot(), evaluate(house, country), all);
    msg.textContent = "";
    out.querySelector("img")!.src = URL.createObjectURL(blob);
    out.classList.remove("hidden");
    const file = new File([blob], fileName(), { type: "image/png" });
    out.querySelector<HTMLElement>("[data-native]")!.classList.toggle("hidden", !navigator.canShare?.({ files: [file] }));
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  out.querySelector<HTMLButtonElement>("[data-download]")!.onclick = () => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName();
    a.click();
  };
  out.querySelector<HTMLButtonElement>("[data-native]")!.onclick = () => {
    if (!blob) return;
    const file = new File([blob], fileName(), { type: "image/png" });
    navigator.share({ files: [file], title: "My house across Europe", text: `My house gets a different energy label in every country. Build yours: ${location.origin}${location.pathname}` }).catch(() => {});
  };
  return box;
}

// A shared link opens that house on its Result step.
{
  const shared = houseFromLink();
  let ok = false;
  if (shared) {
    try {
      evaluate(shared.house, shared.country);
      ok = shared.house.cells.size >= MIN_CELLS;
    } catch {
      ok = false;
    }
  }
  if (shared && ok) {
    Object.assign(house, shared.house);
    country = shared.country;
    mode = "ready";
    reached = SUBSTEPS.length - 1;
    sub = "result";
    readyMessage = "This is a shared house. Open each step to see how it is built, and change anything.";
    syncShapeButtons();
    setStep(3);
  }
}

// ---------- Country guide ----------
function showGuide(focus?: string) {
  const from = currentScreen;
  const g = $("#guide");
  g.innerHTML = guideHTML();
  ["#pick", "#start", "#build", "#compare"].forEach((s) => $(s).classList.add("hidden"));
  $$("#steps li").forEach((li) => li.classList.remove("active"));
  g.classList.remove("hidden");
  g.scrollTop = 0;
  $<HTMLButtonElement>("[data-guide-back]", g).onclick = () => setStep(from);
  const open = (id: string) => {
    const card = document.getElementById(`guide-${id}`) as HTMLDetailsElement | null;
    if (!card) return;
    card.open = true;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $$<HTMLAnchorElement>("[data-guide-jump]", g).forEach((a) => (a.onclick = (e) => (e.preventDefault(), open(a.dataset.guideJump!))));
  if (focus) requestAnimationFrame(() => open(focus));
}
$("#open-guide").onclick = () => showGuide();
$("#compare-guide").onclick = () => showGuide(country);
