// Save and share: the house travels in the link (#house=…), and a 4:5 share image shows it with its labels.

import { COUNTRIES } from "./data";
import { CountryResult } from "./engine";
import { House, starterHouse } from "./house";
import { classColor } from "./labels";

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

/** Draws a 1080 × 1350 (4:5) image: the house, its label here, and its class in every country. */
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
  g.fillStyle = ink;
  g.font = head(30);
  g.fillText("LABEL EXPLORER", 60, 88);
  g.font = head(68);
  g.fillText("My house across Europe", 60, 160);

  // The house on a sky card, with its label here in the corner
  const cy = 196, ch = 520;
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
  const scale = Math.min((W - 140) / img.width, (ch - 20) / img.height);
  const iw = img.width * scale, ih = img.height * scale;
  g.drawImage(img, (W - iw) / 2, cy + (ch - ih) / 2, iw, ih);
  g.restore();

  const n = mine.label.classes.length;
  const bx = 90, by = cy + 26, bs = 130;
  const mineCol = classColor(mine.label.index, n);
  cube(bx, by, bs, bs, 22, mineCol);
  classText(mine.label.cls, bx + bs / 2 - 3, by + bs / 2 - 2, bs - 24, 64, mineCol);
  g.fillStyle = "rgba(255,255,255,0.92)";
  g.beginPath();
  g.roundRect(bx + bs + 18, by + 18, 430, 96, 16);
  g.fill();
  g.fillStyle = ink;
  g.font = head(36);
  g.fillText(shortName(mine.country.name), bx + bs + 36, by + 60);
  const v = mine.indicator.value;
  g.font = body(24, 600);
  g.fillStyle = muted;
  const unit = mine.indicator.unit.replace(/m2/g, "m²").replace(/[.·]?(a|yr)$/, "·yr");
  g.fillText(`${v.toLocaleString("en-GB", { maximumFractionDigits: Math.abs(v) < 10 ? 1 : 0 })} ${unit}`, bx + bs + 36, by + 96);

  // Every country: a cube with the class, best first
  g.fillStyle = ink;
  g.font = head(34);
  g.fillText(`The same house, judged by ${all.length} label schemes`, 60, cy + ch + 70);
  const cols = 2, rows = Math.ceil(all.length / cols);
  const top = cy + ch + 96, colW = (W - 120 - 30) / cols, rowH = Math.min(62, (H - 130 - top) / rows);
  all.forEach((r, i) => {
    const x = 60 + Math.floor(i / rows) * (colW + 30), y = top + (i % rows) * rowH;
    const s = rowH - 12;
    const col = classColor(r.label.index, r.label.classes.length);
    cube(x, y, s * 1.3, s, 9, col, 4);
    classText(r.label.cls, x + (s * 1.3) / 2 - 2, y + s / 2, s * 1.3 - 10, 24, col);
    g.fillStyle = ink;
    g.font = body(24, r.country.id === mine.country.id ? 700 : 500);
    g.fillText(shortName(r.country.name), x + s * 1.3 + 16, y + s / 2 + 9);
  });

  g.fillStyle = muted;
  g.font = body(19);
  g.fillText("Provisional labels: one simplified shared calculation, not an official certificate.", 60, H - 62);
  g.fillStyle = ink;
  g.font = body(26, 700);
  g.fillText(`Build yours: ${APP_URL}`, 60, H - 26);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}
