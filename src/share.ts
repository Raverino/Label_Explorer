// Save and share: the house travels in the link (#house=…), and a 4:5 share image shows it with its labels.

import { COUNTRIES } from "./data";
import { CountryResult } from "./engine";
import { House, starterHouse } from "./house";
import { classColor } from "./labels";
import mapUrl from "../data/map/europe.geojson?url";
import { project } from "./map";

/** Where the game lives, printed on the share image so people can find it. */
export const APP_URL = "raverino.github.io/Label_Explorer";

// ---------- Link ----------
const toB64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64 = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)));

/** A link that opens this exact house in this country. */
export function houseLink(h: House, country: string) {
  const data = { v: 1, c: country, h: { ...h, cells: [...h.cells] } };
  return `${location.origin}${location.pathname}#house=${toB64(JSON.stringify(data))}`;
}

/** The house in the page link, if there is one (unknown or broken fields fall back to the starter house). */
export function houseFromLink(): { house: House; country: string } | null {
  const m = location.hash.match(/house=([\w-]+)/);
  if (!m) return null;
  try {
    const d = JSON.parse(fromB64(m[1]));
    if (d?.v !== 1 || !Array.isArray(d.h?.cells)) return null;
    const base = starterHouse();
    const h: House = { ...base };
    for (const k of Object.keys(base) as (keyof House)[]) {
      if (k === "cells" || d.h[k] === undefined || typeof d.h[k] !== typeof base[k]) continue;
      (h as unknown as Record<string, unknown>)[k] = d.h[k];
    }
    h.cells = new Set(d.h.cells.filter((c: unknown) => typeof c === "string" && /^\d+,\d+$/.test(c)));
    if (Array.isArray(d.h.windows))
      h.windows = d.h.windows.filter(
        (w: Record<string, unknown>) =>
          ["x", "z", "storey"].every((k) => Number.isInteger(w?.[k])) &&
          ["N", "E", "S", "W"].includes(w.facade as string) &&
          ["small", "standard", "tall", "custom"].includes(w.size as string),
      );
    return { house: h, country: COUNTRIES[d.c] ? d.c : "NL" };
  } catch {
    return null;
  }
}

// ---------- Image ----------
const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const shortName = (name: string) => name.replace(/^Belgium\s*[-–(]\s*(.*?)\)?$/, "$1 (BE)");

/** Draws a 1080 × 1350 (4:5) card: the house and its label here, three numbers, and a map of Europe coloured by class. */
export async function shareImage(snapshot: string, mine: CountryResult, all: CountryResult[]): Promise<Blob> {
  await document.fonts.ready;
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d")!;
  const ink = "#23262f", muted = "#646a78";
  const head = (size: number) => `600 ${size}px Fredoka, system-ui, sans-serif`;
  const body = (size: number, weight = 500) => `${weight} ${size}px Inter, system-ui, sans-serif`;
  /** A cube: ink outline, darker bottom-right inset, lifted on an ink shadow. */
  const cube = (x: number, y: number, w: number, h: number, r: number, fill: string, lift = 8) => {
    if (lift) {
      g.fillStyle = ink;
      g.beginPath();
      g.roundRect(x, y + lift, w, h, r);
      g.fill();
    }
    g.fillStyle = fill;
    g.beginPath();
    g.roundRect(x, y, w, h, r);
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = "rgba(0,0,0,0.16)";
    g.fillRect(x + w - Math.max(4, w * 0.06), y, w, h);
    g.fillRect(x, y + h - Math.max(5, h * 0.08), w, h);
    g.restore();
    g.strokeStyle = ink;
    g.lineWidth = 4;
    g.beginPath();
    g.roundRect(x, y, w, h, r);
    g.stroke();
  };
  /** Class text that shrinks to fit its box. */
  /** Dark text on light classes (yellow), white on the rest. */
  const light = (hex: string) => {
    const n = parseInt(hex.replace("#", ""), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.72;
  };
  const classText = (cls: string, cx: number, cy: number, maxW: number, size: number, bg = "#000000") => {
    let s = size;
    g.font = head(s);
    while (g.measureText(cls).width > maxW && s > 10) g.font = head(--s);
    g.fillStyle = light(bg) ? ink : "#fff";
    g.shadowColor = light(bg) ? "transparent" : "rgba(0,0,0,0.35)";
    g.shadowOffsetY = 2;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(cls, cx, cy);
    g.shadowColor = "transparent";
    g.textAlign = "left";
    g.textBaseline = "alphabetic";
  };

  g.fillStyle = "#eef5e6";
  g.fillRect(0, 0, W, H);

  // Title
  const n = mine.label.classes.length;
  const bs = 150, bx = W - 60 - bs, by = 44;
  g.fillStyle = ink;
  g.font = head(30);
  g.fillText("LABEL EXPLORER", 60, 88);
  let ts = 68;
  g.font = head(ts);
  while (g.measureText("My house across Europe").width > bx - 90 && ts > 40) g.font = head(--ts);
  g.fillText("My house across Europe", 60, 160);
  const v = mine.indicator.value;
  const unit = mine.indicator.unit.replace(/m2/g, "m²").replace(/[.·]?(a|yr)$/, "·yr");
  g.font = body(28, 600);
  g.fillStyle = muted;
  g.fillText(`${shortName(mine.country.name)}: ${v.toLocaleString("en-GB", { maximumFractionDigits: Math.abs(v) < 10 ? 1 : 0 })} ${unit}`, 60, 206);

  // The label here, as a big cube in the header (never over the house)
  const mineCol = classColor(mine.label.index, n);
  cube(bx, by, bs, bs, 24, mineCol);
  classText(mine.label.cls, bx + bs / 2 - 3, by + bs / 2 - 2, bs - 26, 72, mineCol);

  // The house on a sky card
  const cy = 236, ch = 340;
  const sky = g.createLinearGradient(0, cy, 0, cy + ch);
  sky.addColorStop(0, "#cfe7f7");
  sky.addColorStop(1, "#eaf4fb");
  cube(60, cy, W - 120, ch, 28, "#e3f0f9");
  g.save();
  g.beginPath();
  g.roundRect(62, cy + 2, W - 124, ch - 4, 26);
  g.clip();
  g.fillStyle = sky;
  g.fillRect(60, cy, W - 120, ch);
  const img = await loadImage(snapshot);
  const scale = Math.min((W - 140) / img.width, (ch - 16) / img.height);
  const iw = img.width * scale, ih = img.height * scale;
  g.drawImage(img, (W - iw) / 2, cy + (ch - ih) / 2, iw, ih);
  g.restore();

  // Three numbers, as stat tiles
  const sy = cy + ch + 30, sh = 112, gap = 24, sw = (W - 120 - 2 * gap) / 3;
  const fmt0 = (x: number, d = 0) => x.toLocaleString("en-GB", { maximumFractionDigits: d, minimumFractionDigits: d });
  const stats: [string, string, string][] = [
    ["Heat need", fmt0(mine.perM2.heatNeed), "kWh per m² a year"],
    ["CO₂", `${fmt0(mine.co2 / 1000, 1)} t`, "per year"],
    [mine.cost >= 0 ? "Energy bills" : "Earns", `€${fmt0(Math.abs(mine.cost))}`, "per year, 2026 prices"],
  ];
  stats.forEach(([label, value, sub], k) => {
    const x = 60 + k * (sw + gap);
    cube(x, sy, sw, sh, 16, "#ffffff", 6);
    g.fillStyle = muted;
    g.font = body(22, 600);
    g.fillText(label, x + 22, sy + 34);
    g.fillStyle = ink;
    g.font = head(44);
    g.fillText(value, x + 22, sy + 78);
    g.fillStyle = muted;
    g.font = body(17);
    g.fillText(sub, x + 22, sy + 100);
  });

  // Europe, coloured by the class this house gets in each scheme
  const top = sy + sh + 52;
  g.fillStyle = ink;
  g.font = head(32);
  g.fillText(`The same house in ${all.length} label schemes`, 60, top);
  g.fillStyle = muted;
  g.font = body(19);
  g.fillText("Colour: how high the class sits on that country's own scale, green best.", 60, top + 30);
  const mapTop = top + 48, mapH = H - 120 - mapTop, mapW = 470;
  g.fillStyle = ink;
  g.beginPath();
  g.roundRect(60, mapTop + 6, mapW, mapH, 22);
  g.fill();
  g.fillStyle = "#dcecf7";
  g.beginPath();
  g.roundRect(60, mapTop, mapW, mapH, 22);
  g.fill();
  const byMap = new Map<string, CountryResult>();
  for (const r of all) {
    const id = (r.country as unknown as { map_id?: string }).map_id ?? r.country.id;
    // Belgium has three labels on one shape: show the one you picked, else Wallonia (most of the area)
    const prefer = id === "BE" ? (mine.country.id.startsWith("BE-") ? mine.country.id : "BE-WAL") : r.country.id;
    if (!byMap.has(id) || r.country.id === prefer) byMap.set(id, r);
  }
  try {
    const gj = await fetch(mapUrl).then((res) => res.json());
    const [x0] = project(-11, 40), [x1] = project(32, 50), [, y0] = project(10, 70.5), [, y1] = project(25, 34.5);
    const k = Math.min((mapW - 24) / (x1 - x0), (mapH - 24) / (y1 - y0));
    const ox = 60 + (mapW - (x1 - x0) * k) / 2 - x0 * k, oy = mapTop + (mapH - (y1 - y0) * k) / 2 - y0 * k;
    g.save();
    g.beginPath();
    g.roundRect(62, mapTop + 2, mapW - 4, mapH - 4, 20);
    g.clip();
    g.lineJoin = "round";
    for (const ft of gj.features) {
      const polys: number[][][][] = ft.geometry.type === "Polygon" ? [ft.geometry.coordinates] : ft.geometry.coordinates;
      const path = new Path2D();
      for (const poly of polys) for (const ring of poly) {
        ring.forEach(([lon, lat]: number[], n: number) => {
          const [x, y] = project(lon, lat);
          if (n) path.lineTo(ox + x * k, oy + y * k);
          else path.moveTo(ox + x * k, oy + y * k);
        });
        path.closePath();
      }
      const r = byMap.get(ft.properties.id);
      g.fillStyle = r ? classColor(r.label.index, r.label.classes.length) : ft.properties.eu27 ? "#cfd3c8" : "#e8ece2";
      g.fill(path);
      g.strokeStyle = r ? ink : "#aab0a2";
      g.lineWidth = r ? 2.2 : 1;
      g.stroke(path);
    }
    g.restore();
  } catch {
    /* no map offline: the list still tells the story */
  }
  g.strokeStyle = ink;
  g.lineWidth = 4;
  g.beginPath();
  g.roundRect(60, mapTop, mapW, mapH, 22);
  g.stroke();

  // The list beside the map, best first
  const lx = 60 + mapW + 34, rowH = Math.min(46, mapH / all.length);
  all.forEach((r, n) => {
    const y = mapTop + n * rowH;
    const s = rowH - 10;
    const col = classColor(r.label.index, r.label.classes.length);
    cube(lx, y, s * 1.35, s, 7, col, 3);
    classText(r.label.cls, lx + (s * 1.35) / 2 - 2, y + s / 2, s * 1.35 - 8, 20, col);
    g.fillStyle = ink;
    g.font = body(21, r.country.id === mine.country.id ? 700 : 500);
    g.fillText(shortName(r.country.name), lx + s * 1.35 + 14, y + s / 2 + 7);
  });

  g.fillStyle = muted;
  g.font = body(19);
  g.fillText("Not an official certificate: estimates from one simplified shared calculation.", 60, H - 62);
  g.fillStyle = ink;
  g.font = body(26, 700);
  g.fillText(`Build yours: ${APP_URL}`, 60, H - 26);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}
