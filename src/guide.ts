// Country guide: one page that explains every label scheme in plain words — who runs it, what it
// measures, how it measures, and how the game models it. Facts that are not in the scheme data files
// (who runs it, register, assessor, validity, official weather) live here, each with a source and a
// status flag like every other value in the app.

import { CLIMATES, COUNTRIES, Country, INDEX } from "./data";
import { COUNTRY_FACTS, plainFor } from "./explain";
import { classColor } from "./labels";

interface Who {
  /** who sets the rules and runs the scheme */
  regulator: string;
  /** where certificates are registered */
  register: string;
  /** who may issue one */
  assessor: string;
  /** how long a certificate stays valid */
  valid: string;
  /** weather used by the official method, where we know it */
  weather?: string;
  /** anything a buyer should know */
  note?: string;
  source: string;
  status: "official" | "secondary";
}

/** Checked 2026-11-16. "secondary" = national agency pages, guidance or press; not the legal text itself. */
export const WHO: Record<string, Who> = {
  NL: {
    regulator: "Ministry of the Interior (BZK); run by RVO, the Netherlands Enterprise Agency",
    register: "EP-Online, the national label register",
    assessor: "A certified EP adviser (BRL 9500)",
    valid: "10 years",
    weather: "NEN 5060:2018 reference year (De Bilt)",
    source: "https://www.rvo.nl/onderwerpen/energielabel-woningen",
    status: "secondary",
  },
  DE: {
    regulator: "Federal government (GModG, formerly the GEG); registration numbers from DIBt, the German Institute for Building Technology",
    register: "DIBt registration office",
    assessor: "A qualified issuer: architect, engineer or certified energy adviser",
    valid: "10 years",
    weather: "Reference climate Potsdam (DIN V 18599-10)",
    note: "There are two kinds: a calculated one (Bedarfsausweis) and one from past bills (Verbrauchsausweis). The game shows the calculated one.",
    source: "https://www.gesetze-im-internet.de/geg/",
    status: "secondary",
  },
  AT: {
    regulator: "Federal law (EAVG 2012); the method is OIB Guideline 6, adopted by each of the nine Länder",
    register: "Regional databases run by the Länder",
    assessor: "An authorised professional (engineer, architect, master builder)",
    valid: "10 years",
    weather: "A reference climate for the class, plus the climate of the site",
    source: "https://www.oib.or.at/de/oib-richtlinien/richtlinien/2023/oib-richtlinie-6",
    status: "secondary",
  },
  "BE-WAL": {
    regulator: "Walloon Region (SPW Énergie)",
    register: "The Walloon PEB database",
    assessor: "A certified PEB assessor (certificateur PEB)",
    valid: "10 years",
    source: "https://energie.wallonie.be/fr/certification-peb-des-batiments-residentiels-existants.html",
    status: "secondary",
  },
  "BE-BRU": {
    regulator: "Brussels Environment (Bruxelles Environnement / Leefmilieu Brussel)",
    register: "The Brussels PEB database",
    assessor: "A certified PEB assessor",
    valid: "10 years",
    source: "https://environnement.brussels/citoyen/reglementation-et-inspection/obligations-et-autorisations/certificat-peb-vendre-ou-louer",
    status: "secondary",
  },
  IE: {
    regulator: "SEAI, the Sustainable Energy Authority of Ireland, for the Department of the Environment",
    register: "The national BER register (SEAI)",
    assessor: "An SEAI-registered BER assessor, using the DEAP software",
    valid: "10 years",
    source: "https://www.seai.ie/home-energy/building-energy-rating-ber",
    status: "secondary",
  },
  DK: {
    regulator: "Danish Energy Agency (Energistyrelsen)",
    register: "The national energy label database",
    assessor: "A certified energy consultant",
    valid: "10 years",
    weather: "Danish design reference year",
    source: "https://ens.dk/ansvarsomraader/energimaerkning-af-bygninger",
    status: "secondary",
  },
  FI: {
    regulator: "Ministry of the Environment; supervised by ARA, the Housing Finance and Development Centre",
    register: "ARA's energy certificate register",
    assessor: "A qualified certificate issuer",
    valid: "10 years",
    weather: "One reference year (Helsinki-Vantaa) for the whole country",
    source: "https://www.ara.fi/en-US/Materials/Energy_certificates",
    status: "secondary",
  },
  EE: {
    regulator: "Ministry of Climate (regulation 63); checked by TTJA, the Consumer Protection and Technical Regulatory Authority",
    register: "The building register (ehitisregister)",
    assessor: "A certified energy auditor (level 6 or 7)",
    valid: "10 years; a design-stage label 2 years after the use permit",
    weather: "Estonian test reference year",
    source: "https://ttja.ee/sites/default/files/documents/2025-12/Arvutuslike%20energiam%C3%A4rgiste%20kontrolli%20juhend.pdf",
    status: "secondary",
  },
  ES: {
    regulator: "National rules (RD 390/2021); each autonomous region runs its own register",
    register: "Regional registers",
    assessor: "A competent technician (técnico competente), with recognised software such as CE3X or HULC",
    valid: "10 years",
    weather: "The climate zone of the municipality (the game uses Madrid, D3)",
    source: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-9176",
    status: "secondary",
  },
  HR: {
    regulator: "Ministry of Physical Planning, Construction and State Assets (MPGI)",
    register: "IEC, the energy certificate information system",
    assessor: "A person authorised by the Ministry",
    valid: "10 years",
    weather: "Two reference stations: continental and coastal",
    source: "https://www.gov.hr/hr/energetski-certifikat/1258",
    status: "secondary",
  },
  HU: {
    regulator: "Government (decree 176/2008 and 9/2023 ÉKM); register run by the Lechner Knowledge Centre",
    register: "e-tanúsítás, part of the national building register",
    assessor: "A registered energy certifier",
    valid: "5 years for certificates issued since late 2023 (older ones: 10)",
    source: "https://bank360.hu/energetikai-tanusitvany",
    status: "secondary",
  },
  SI: {
    regulator: "Energy Act and the rules on energy certificates (Uradni list RS 4/2023)",
    register: "Register of energy certificates, viewable on the GURS property portal",
    assessor: "A licensed independent expert",
    valid: "10 years",
    source: "https://www.gov.si/teme/inovativnost-in-kakovost-v-javni-upravi/inovacije-in-dobre-prakse-javne-uprave/register-energetskih-izkaznic/",
    status: "secondary",
  },
  SK: {
    regulator: "Act 555/2005 on energy performance; the ministry in charge of construction numbers each certificate",
    register: "Central record of the ministry",
    assessor: "A qualified person (odborne spôsobilá osoba)",
    valid: "Up to 10 years",
    source: "https://static.slov-lex.sk/pdf/prilohy/SK/ZZ/2020/35/20200310_5228103-2.pdf",
    status: "secondary",
  },
};

const AREA_PLAIN: Record<string, string> = {
  internal: "Floor inside the walls (usable area)",
  gross_external: "Floor measured to the outside of the walls (gross area)",
  volume: "Worked out from the heated volume (0.32 × volume)",
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fit = (c: string) => `<span class="fit" data-len="${Math.min(6, c.length)}">${c}</span>`;
const unitNice = (u: string) => u.replace(/m2/g, "m²").replace(/[.·]?(a|yr)$/, "·yr");

/** One kWh of grid electricity counts as… (for the indicator this scheme uses). */
function electricityWeight(c: Country): string {
  const ind = String((c.label as Record<string, unknown>).indicator ?? "");
  if (ind === "heat_need") return "Not used: only the heat the house needs counts.";
  if (ind === "final" || ind === "dual") return "1 kWh is 1 kWh: no weighting of energy sources.";
  const e = c.factors.electricity as Record<string, unknown> | undefined;
  const key = ind === "weighted" ? "weight" : ind;
  const v = e?.[key] ?? e?.pe_nren ?? e?.pe_tot ?? e?.weight;
  return typeof v === "number" ? `1 kWh from the grid counts as <b>${v}</b>.` : "No national factor found.";
}

/** Class names of a scheme, whatever shape its scale has (list, area formula, area bands, dual). */
function classNames(L: Record<string, any>): { class: string }[] {
  return L.scale?.classes ?? L.dual_scale?.EEB_SK ?? L.formulas ?? L.area_bands?.[0]?.formulas ?? L.bands?.[0]?.classes ?? [];
}

function scaleStrip(c: Country) {
  const L = c.label as Record<string, any>;
  const classes = classNames(L);
  const n = classes.length;
  return `<div class="strip">${classes.map((k, i) => `<i style="background:${classColor(i, n)}">${fit(esc(k.class))}</i>`).join("")}</div>`;
}

function card(c: Country) {
  const L = c.label as Record<string, any>;
  const who = WHO[c.id];
  const p = plainFor(String(L.indicator ?? ""));
  const fact = COUNTRY_FACTS[c.id];
  const classes = classNames(L);
  const sized = L.scale_type === "area_formula" || L.scale_type === "area_bands";
  const station = CLIMATES[c.climate[0]]?.station ?? c.climate[0];
  const row = (icon: string, title: string, body: string) => `<div class="g-row"><span class="g-ic" aria-hidden="true">${icon}</span><div><b>${title}</b><p>${body}</p></div></div>`;
  return `<details class="g-card" id="guide-${c.id}">
    <summary>
      <span class="g-name"><b>${esc(c.name)}</b><small>${esc(c.scheme)}</small></span>
      <span class="g-tag">${p.icon} ${esc(p.title)}</span>
    </summary>
    <div class="g-body">
      ${scaleStrip(c)}
      ${fact ? `<p class="g-fact">${fact.icon} <b>${esc(fact.title)}.</b> ${esc(fact.text)}</p>` : ""}
      <div class="g-grid">
        <section>
          <h4>Who is in charge</h4>
          ${who ? row("🏛️", "Rules and scheme", esc(who.regulator)) + row("🗂️", "Register", esc(who.register)) + row("🧑‍🔧", "Issued by", esc(who.assessor)) + row("⏳", "Valid for", esc(who.valid)) : row("🏛️", "Legal basis", esc(c.legal_basis ?? "—"))}
          ${who?.note ? `<p class="note small">${esc(who.note)}</p>` : ""}
        </section>
        <section>
          <h4>What it measures</h4>
          ${row(p.icon, p.title, `${esc(p.text)} <span class="muted">Official name: ${esc(L.indicator_name ?? L.indicator)}, in ${unitNice(L.unit ?? "kWh/m²·yr")}.</span>`)}
          ${row("⚡", "Electricity", electricityWeight(c))}
          ${row("📐", "Per m² of", `${AREA_PLAIN[c.floor_area.basis] ?? ""} <span class="muted">(${esc(c.floor_area.code)}: ${esc(c.floor_area.name)})</span>`)}
          ${row("🪜", "Classes", `${classes.length} steps, from <b>${esc(classes[0]?.class ?? "")}</b> to <b>${esc(classes[classes.length - 1]?.class ?? "")}</b>.${sized ? " The limits move with the size of the home: small homes get more room." : ""}${L.dual_scale ? " Two ladders: one for the heat need, one for the energy use." : ""}${L.scale?.strictly_below ? " A limit value itself falls in the next class down." : ""}`)}
        </section>
        <section>
          <h4>How it is calculated</h4>
          ${row("🧮", "Method", esc(c.method))}
          ${row("🌦️", "Weather", `${who?.weather ? `Official: ${esc(who.weather)}. ` : ""}In the game: ${esc(station)}, long-term PVGIS averages.`)}
          ${c.pv_rule ? row("☀️", "Solar panels", esc(c.pv_rule)) : ""}
          ${row("📜", "Law", esc(c.legal_basis ?? "—"))}
        </section>
      </div>
      <p class="g-src small">Sources: <a href="${esc(L.source ?? "#")}" target="_blank" rel="noopener">class scale</a>${who ? ` · <a href="${esc(who.source)}" target="_blank" rel="noopener">who runs it</a> <span class="flag ${who.status}">${who.status}</span>` : ""}</p>
    </div>
  </details>`;
}

/** The whole guide page. */
export function guideHTML() {
  const list = Object.values(COUNTRIES).sort((a, b) => a.name.localeCompare(b.name));
  const soon = INDEX.filter((e) => !e.available).sort((a, b) => a.name.localeCompare(b.name));
  const kinds = [
    ["heat_need", "Some only judge the shell"],
    ["final", "Some read the meters"],
    ["pe_tot", "Some trace energy to the source"],
    ["pe_nren", "Some count only fossil energy"],
    ["weighted", "Some use national weights"],
    ["dual", "One gives two grades"],
  ] as const;
  return `
    <div class="g-head">
      <div>
        <h1>Country guide</h1>
        <p class="muted">Who makes the rules, what each label measures and how. One card per scheme; open the ones you are curious about.</p>
      </div>
      <button class="btn" data-guide-back>← Back</button>
    </div>

    <div class="g-intro">
      <div class="tile"><span class="tile-icon">🇪🇺</span><b>One EU rule, many labels</b><p>The EU's buildings directive (EPBD) makes every country rate homes, but each country picks its own method, numbers and scale.</p></div>
      <div class="tile"><span class="tile-icon">🏷️</span><b>When you need one</b><p>When a home is built, sold or rented. The class must be in the advert.</p></div>
      <div class="tile"><span class="tile-icon">🧑‍🔧</span><b>Who makes it</b><p>An independent, certified expert visits or checks the plans and enters the home in the national register.</p></div>
      <div class="tile"><span class="tile-icon">🧾</span><b>Standard use, not your bills</b><p>Standard weather, a standard household, standard room temperature. That is what makes homes comparable.</p></div>
      <div class="tile"><span class="tile-icon">🔜</span><b>What is changing</b><p>The 2024 directive moves everyone towards one A–G scale, with A for zero-emission buildings. Countries are switching over the next years.</p></div>
    </div>

    <h2 class="g-h2">Six ways to judge a home</h2>
    <div class="g-kinds">${kinds.map(([k, t]) => {
      const p = plainFor(k);
      const who = Object.values(COUNTRIES).filter((c) => (c.label as Record<string, unknown>).indicator === k || (k === "pe_nren" && (c.label as Record<string, unknown>).indicator === "pe_fossil")).map((c) => `<a href="#guide-${c.id}" data-guide-jump="${c.id}">${esc(c.name.replace(/^Belgium\s*[-–(]\s*(.*?)\)?$/, "$1"))}</a>`);
      return `<div class="g-kind"><span class="tile-icon">${p.icon}</span><b>${t}</b><p>${esc(p.text)}</p><p class="small">${who.join(" · ") || "—"}</p></div>`;
    }).join("")}</div>

    <h2 class="g-h2">The ${list.length} schemes in the game</h2>
    <div class="g-list">${list.map(card).join("")}</div>

    <h2 class="g-h2">Coming soon</h2>
    <div class="g-soon">${soon.map((e) => `<div><b>${esc(e.name)}</b><span class="muted small">${esc(e.reason ?? "")}</span></div>`).join("")}</div>
    <p class="muted small">Every number in the game carries a quality flag: <span class="flag official">official</span> from the legal text, <span class="flag secondary">secondary</span> from agency pages or guidance, <span class="flag proxy">proxy</span> a stand-in. The details are in Result → Expert view.</p>`;
}
