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

/** The look of the bottom half of the share image. */
export type ShareStyle = "tiers" | "shapes" | "wall";
export const SHARE_STYLES: Record<ShareStyle, string> = { tiers: "Tier list", shapes: "Country shapes", wall: "Cube wall" };

/** Country outlines in map units, keyed by map id; loaded once. Far islands (Canaries, Azores) are left out. */
let outlines: Promise<Map<string, number[][][]>> | null = null;
function loadOutlines() {
  outlines ??= fetch(mapUrl)
    .then((res) => res.json())
    .then((gj) => {
      const out = new Map<string, number[][][]>();
      for (const ft of gj.features) {
        const polys: number[][][][] = ft.geometry.type === "Polygon" ? [ft.geometry.coordinates] : ft.geometry.coordinates;
        const rings: number[][][] = [];
        for (const poly of polys) {
          const ring = poly[0];
          const lon = ring.reduce((s, p) => s + p[0], 0) / ring.length, lat = ring.reduce((s, p) => s + p[1], 0) / ring.length;
          if (lon < -11 || lon > 34 || lat < 34.5) continue;
          rings.push(ring.map(([x, y]) => project(x, y)));
        }
        out.set(ft.properties.id, rings);
      }
      return out;
    })
    .catch(() => new Map());
  return outlines;
}

const shortName = (name: string) => name.replace(/^Belgium\s*[-–(]\s*(.*?)\)?$/, "$1 (BE)");
const tileName = (r: CountryResult) => ({ "BE-WAL": "Wallonia", "BE-BRU": "Brussels" })[r.country.id] ?? r.country.name;

/** Draws a 1080 × 1350 (4:5) card: the house and its label here, then the same house in every scheme. */
export async function shareImage(snapshot: string, mine: CountryResult, all: CountryResult[], style: ShareStyle = "tiers"): Promise<Blob> {
  await document.fonts.ready;
  const shapes = await loadOutlines();
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
  /** Dark text on light classes (yellow), white on the rest. */
  const light = (hex: string) => {
    const n = parseInt(hex.replace("#", ""), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.72;
  };
  /** Class text that shrinks to fit its box. */
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
  const centred = (text: string, cx: number, y: number, font: string, color: string, maxW: number) => {
    g.font = font;
    let t = text;
    while (g.measureText(t).width > maxW && t.length > 3) t = t.slice(0, -2) + "…";
    g.fillStyle = color;
    g.textAlign = "center";
    g.fillText(t, cx, y);
    g.textAlign = "left";
  };
  /** A country's outline filled with its class colour, fitted into a box. */
  const silhouette = (r: CountryResult, x: number, y: number, w: number, h: number, col: string) => {
    const id = (r.country as unknown as { map_id?: string }).map_id ?? r.country.id;
    const rings = shapes.get(id);
    if (!rings?.length) return false;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const ring of rings) for (const [px, py] of ring) (x0 = Math.min(x0, px)), (y0 = Math.min(y0, py)), (x1 = Math.max(x1, px)), (y1 = Math.max(y1, py));
    const k = Math.min(w / (x1 - x0), h / (y1 - y0));
    const ox = x + (w - (x1 - x0) * k) / 2 - x0 * k, oy = y + (h - (y1 - y0) * k) / 2 - y0 * k;
    const path = new Path2D();
    for (const ring of rings) {
      ring.forEach(([px, py], i) => (i ? path.lineTo(ox + px * k, oy + py * k) : path.moveTo(ox + px * k, oy + py * k)));
      path.closePath();
    }
    g.save();
    g.translate(0, 4);
    g.fillStyle = ink;
    g.fill(path);
    g.restore();
    g.fillStyle = col;
    g.fill(path);
    g.lineJoin = "round";
    g.strokeStyle = ink;
    g.lineWidth = 3;
    g.stroke(path);
    return true;
  };
  const rel = (r: CountryResult) => r.label.index / Math.max(1, r.label.classes.length - 1);
  const colOf = (r: CountryResult) => classColor(r.label.index, r.label.classes.length);
  const fmt0 = (x: number, d = 0) => x.toLocaleString("en-GB", { maximumFractionDigits: d, minimumFractionDigits: d });

  g.fillStyle = "#eef5e6";
  g.fillRect(0, 0, W, H);

  // Header: title, the score here and three numbers on one line, the class as a big cube
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
  g.font = body(26, 600);
  g.fillStyle = muted;
  g.fillText(`${shortName(mine.country.name)}: ${fmt0(v, Math.abs(v) < 10 ? 1 : 0)} ${unit}  ·  ${fmt0(mine.co2 / 1000, 1)} t CO₂  ·  €${fmt0(Math.abs(mine.cost))} ${mine.cost >= 0 ? "bills" : "earned"} a year`, 60, 204);
  const mineCol = classColor(mine.label.index, n);
  cube(bx, by, bs, bs, 24, mineCol);
  classText(mine.label.cls, bx + bs / 2 - 3, by + bs / 2 - 2, bs - 26, 72, mineCol);

  // The house on a sky card
  const cy = 236, ch = 420;
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

  // The same house in every scheme
  const top = cy + ch + 64;
  g.fillStyle = ink;
  g.font = head(34);
  g.fillText(`The same house in ${all.length} label schemes`, 60, top);
  const areaTop = top + 26, areaBottom = H - 104;
  const sorted = [...all].sort((a, b) => rel(a) - rel(b));
  const isMine = (r: CountryResult) => r.country.id === mine.country.id;

  if (style === "wall") {
    // 7 x 2 grid of cubes, best first; each cube holds the country shape and its class
    const cols = Math.ceil(sorted.length / 2), gap = 14;
    const tw = (W - 120 - gap * (cols - 1)) / cols, th = (areaBottom - areaTop - 30 - gap) / 2 - 26;
    sorted.forEach((r, i) => {
      const x = 60 + (i % cols) * (tw + gap), y = areaTop + 8 + Math.floor(i / cols) * (th + 26 + gap);
      const col = colOf(r);
      cube(x, y, tw, th, 14, col, isMine(r) ? 8 : 5);
      g.save();
      g.globalAlpha = 0.35;
      silhouette(r, x + 10, y + 10, tw - 20, th - 20, "#ffffff");
      g.restore();
      classText(r.label.cls, x + tw / 2 - 2, y + th / 2, tw - 16, 40, col);
      centred(tileName(r), x + tw / 2, y + th + 24, body(17, isMine(r) ? 700 : 500), ink, tw + gap - 2);
    });
    g.fillStyle = muted;
    g.font = body(18);
    g.fillText("Best class on its own scale  →  worst", 60, areaBottom + 8);
  } else {
    // Tier list: five rows, from the top of each country's scale to the bottom
    const tiers = [
      ["TOP", "#00a651", 0.2],
      ["GOOD", "#8cc63f", 0.4],
      ["MID", "#fff200", 0.6],
      ["LOW", "#f7941d", 0.8],
      ["BOTTOM", "#ed1c24", 1.01],
    ] as const;
    const all5 = tiers.map(([name, col, maxRel], t) => ({ name, col, list: sorted.filter((r) => rel(r) <= maxRel && (t === 0 || rel(r) > tiers[t - 1][2])) }));
    const rows = all5.filter((t) => t.list.length); // empty tiers take no room
    const rowGap = 12, rowH = Math.min(176, (areaBottom - areaTop - rowGap * (rows.length - 1)) / rows.length);
    const labelW = 150, tileGap = 12;
    const most = Math.max(1, ...rows.map((t) => t.list.length));
    const tile = Math.min(rowH - 34, 130, (W - 120 - labelW - 24 - tileGap * (most - 1)) / most);
    const used = rows.length * rowH + rowGap * (rows.length - 1);
    rows.forEach(({ name, col, list }, t) => {
      const y = areaTop + (areaBottom - areaTop - used) / 2 + t * (rowH + rowGap);
      cube(60, y, labelW, rowH - 6, 12, col, 5);
      classText(name, 60 + labelW / 2 - 2, y + (rowH - 6) / 2, labelW - 20, 30, col);
      g.fillStyle = "rgba(35,38,47,0.06)";
      g.beginPath();
      g.roundRect(60 + labelW + 8, y, W - 120 - labelW - 8, rowH - 6, 12);
      g.fill();
      list.forEach((r, i) => {
        const x = 60 + labelW + 20 + i * (tile + tileGap), ty = y + (rowH - 6 - tile - 22) / 2 + 2;
        const c = colOf(r);
        if (style === "shapes") {
          if (!silhouette(r, x + 2, ty + 2, tile - 16, tile - 18, c)) cube(x, ty, tile - 14, tile - 16, 10, c, 4);
          const bw = 34, bh = 26;
          cube(x + tile - bw, ty + tile - bh - 6, bw, bh, 7, c, 3);
          classText(r.label.cls, x + tile - bw / 2 - 1, ty + tile - bh / 2 - 6, bw - 8, 18, c);
        } else {
          cube(x, ty, tile, tile - 6, 12, c, isMine(r) ? 6 : 4);
          classText(r.label.cls, x + tile / 2 - 2, ty + (tile - 6) / 2, tile - 14, 34, c);
        }
        centred(tileName(r), x + tile / 2, ty + tile + 18, body(15, isMine(r) ? 700 : 500), ink, tile + tileGap - 2);
      });
    });
  }

  g.fillStyle = muted;
  g.font = body(19);
  g.fillText("Not an official certificate: estimates from one simplified shared calculation.", 60, H - 62);
  g.fillStyle = ink;
  g.font = body(26, 700);
  g.fillText(`Build yours: ${APP_URL}`, 60, H - 26);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}
