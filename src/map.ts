// Start screen: a flat, game-like map of Europe. Available schemes are coloured; the rest are grey.

import mapUrl from "../data/map/europe.geojson?url";
import { INDEX, IndexEntry } from "./data";

const R = Math.PI / 180;
const LON0 = 12 * R, LAT0 = 52 * R;

/** Lambert azimuthal equal-area (the EU's LAEA) centred on central Europe, in arbitrary units. */
function project(lon: number, lat: number): [number, number] {
  const l = lon * R, p = lat * R;
  const k = Math.sqrt(2 / (1 + Math.sin(LAT0) * Math.sin(p) + Math.cos(LAT0) * Math.cos(p) * Math.cos(l - LON0)));
  const x = k * Math.cos(p) * Math.sin(l - LON0);
  const y = k * (Math.cos(LAT0) * Math.sin(p) - Math.sin(LAT0) * Math.cos(p) * Math.cos(l - LON0));
  return [x * 1000, -y * 1000];
}

type Ring = number[][];
function ringPath(ring: Ring) {
  return ring.map(([lon, lat], i) => {
    const [x, y] = project(lon, lat);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join("") + "Z";
}

const PALETTE = ["#6cbf3c", "#f5c542", "#56b4e9", "#ff9a5a", "#b48ae0", "#4cc3a8", "#f27a9b"];

export async function drawMap(host: HTMLElement, tip: HTMLElement, onPick: (entries: IndexEntry[]) => void) {
  const gj = await fetch(mapUrl).then((r) => r.json());
  const byMap = new Map<string, IndexEntry[]>();
  for (const e of INDEX) byMap.set(e.map_id, [...(byMap.get(e.map_id) ?? []), e]);

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  // Frame: Portugal to Finland, Crete to northern Finland.
  const [x0] = project(-11, 40), [x1] = project(32, 50), [, y0] = project(10, 70.5), [, y1] = project(25, 34.5);
  svg.setAttribute("viewBox", `${x0} ${y0} ${x1 - x0} ${y1 - y0}`);
  svg.setAttribute("class", "eu-map");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Map of Europe: pick a country");

  let colorI = 0;
  for (const ft of gj.features) {
    const id: string = ft.properties.id;
    const entries = byMap.get(id);
    const polys: Ring[][] = ft.geometry.type === "Polygon" ? [ft.geometry.coordinates] : ft.geometry.coordinates;
    const d = polys.map((p) => p.map(ringPath).join("")).join("");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", d);
    const available = entries?.some((e) => e.available);
    if (!ft.properties.eu27) {
      path.setAttribute("class", "c outside");
    } else if (available) {
      path.setAttribute("class", "c on");
      path.style.setProperty("--fill", PALETTE[colorI++ % PALETTE.length]);
      path.setAttribute("tabindex", "0");
      path.setAttribute("role", "button");
      path.setAttribute("aria-label", entries!.filter((e) => e.available).map((e) => e.name).join(" or "));
      const pick = () => onPick(entries!.filter((e) => e.available));
      path.addEventListener("click", pick);
      path.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pick()));
    } else {
      path.setAttribute("class", "c soon");
    }
    if (ft.properties.eu27) {
      const show = (ev: MouseEvent) => {
        const rect = host.getBoundingClientRect();
        tip.innerHTML = available
          ? entries!.filter((e) => e.available).map((e) => `<b>${e.name}</b><br><span>${e.scheme}</span>`).join("<hr>")
          : `<b>${ft.properties.name}</b><br><span>Coming soon. ${entries?.[0]?.reason ?? ""}</span>`;
        tip.style.left = `${ev.clientX - rect.left}px`;
        tip.style.top = `${ev.clientY - rect.top}px`;
        tip.classList.remove("hidden");
      };
      path.addEventListener("mousemove", show);
      path.addEventListener("mouseleave", () => tip.classList.add("hidden"));
    }
    svg.appendChild(path);
  }
  host.prepend(svg);
}
