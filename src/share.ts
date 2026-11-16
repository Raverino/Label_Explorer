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

/**
 * Draws a 1080 × 1350 (4:5) result screen: the house, its label in the chosen country, and the
 * best and worst label the same house gets elsewhere. The full comparison stays in the app.
 */
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
  /** Dark text on light classes (yellow), white on the rest. */
  const light = (hex: string) => {
    const n = parseInt(hex.replace("#", ""), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.72;
  };
  /** Class text that shrinks to fit its box. */
  const classText = (cls: string, cx: number, cy: number, maxW: number, size: number, bg: string) => {
    let s = size;
    g.font = head(s);
    while (g.measureText(cls).width > maxW && s > 10) g.font = head(--s);
    g.fillStyle = light(bg) ? ink : "#fff";
    g.shadowColor = light(bg) ? "transparent" : "rgba(0,0,0,0.35)";
    g.shadowOffsetY = 3;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(cls, cx, cy);
    g.shadowColor = "transparent";
    g.textAlign = "left";
    g.textBaseline = "alphabetic";
  };
  /** Centred text that shrinks to fit. */
  const centred = (text: string, y: number, size: number, font: (s: number) => string, color: string, maxW = W - 120) => {
    let s = size;
    g.font = font(s);
    while (g.measureText(text).width > maxW && s > 12) g.font = font(--s);
    g.fillStyle = color;
    g.textAlign = "center";
    g.fillText(text, W / 2, y);
    g.textAlign = "left";
  };
  const rel = (r: CountryResult) => r.label.index / Math.max(1, r.label.classes.length - 1);
  // On the image a letter always has the same colour (A green ... G red), as on real EU labels,
  // so an "A" here never looks different from an "A" there.
  const LETTER: Record<string, string> = { A: "#00a651", B: "#50b848", C: "#bfd730", D: "#fff200", E: "#fdb913", F: "#f37021", G: "#ed1c24", H: "#c4161c" };
  const colOf = (r: CountryResult) => LETTER[r.label.cls.trim().charAt(0).toUpperCase()] ?? classColor(r.label.index, r.label.classes.length);
  const fmt0 = (x: number) => x.toLocaleString("en-GB", { maximumFractionDigits: Math.abs(x) < 10 ? 1 : 0 });

  g.fillStyle = "#eef5e6";
  g.fillRect(0, 0, W, H);

  // Header
  const place = mine.country.name === "Netherlands" ? "the Netherlands" : shortName(mine.country.name);
  g.fillStyle = ink;
  g.font = head(28);
  g.fillText("LABEL EXPLORER", 60, 84);
  let ts = 72;
  g.font = head(ts);
  while (g.measureText(`My house in ${place}`).width > W - 120 && ts > 40) g.font = head(--ts);
  g.fillText(`My house in ${place}`, 60, 160);

  // The house on a sky card
  const cy = 196, ch = 450;
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

  // The label here: one big cube, the score, and what it measures
  const bs = 190, bx = (W - bs) / 2, by = cy + ch + 40;
  const mineCol = colOf(mine);
  cube(bx, by, bs, bs, 30, mineCol, 12);
  classText(mine.label.cls, W / 2 - 4, by + bs / 2 - 2, bs - 34, 112, mineCol);
  const unit = mine.indicator.unit.replace(/m2/g, "m²").replace(/[.·]?(a|yr)$/, " a year");
  centred(`${fmt0(mine.indicator.value)} ${unit}`, by + bs + 62, 40, head, ink);
  centred(`${mine.country.scheme}, ${mine.country.name}`, by + bs + 100, 24, (s) => body(s), muted);

  // The surprise: best and worst for the same house elsewhere
  const others = all.filter((r) => r.country.id !== mine.country.id).sort((a, b) => rel(a) - rel(b));
  const dy = by + bs + 136;
  g.strokeStyle = ink;
  g.lineWidth = 3;
  g.setLineDash([12, 10]);
  g.beginPath();
  g.moveTo(60, dy);
  g.lineTo(W - 60, dy);
  g.stroke();
  g.setLineDash([]);
  centred("The same house elsewhere in Europe", dy + 50, 32, head, ink);
  if (others.length) {
    const best = others[0], worst = others[others.length - 1];
    const cw = 104, chh = 90, rowY = dy + 78;
    const side = (r: CountryResult, tag: string, left: boolean) => {
      const col = colOf(r);
      const x = left ? 110 : W - 110 - cw;
      cube(x, rowY, cw, chh, 16, col, 7);
      classText(r.label.cls, x + cw / 2 - 2, rowY + chh / 2, cw - 18, 52, col);
      g.textAlign = left ? "left" : "right";
      const tx = left ? x + cw + 22 : x - 22;
      g.fillStyle = muted;
      g.font = body(22, 600);
      g.fillText(tag, tx, rowY + 36);
      g.fillStyle = ink;
      g.font = head(32);
      g.fillText(shortName(r.country.name), tx, rowY + 74);
      g.textAlign = "left";
    };
    side(best, "best", true);
    side(worst, "worst", false);
    // a dashed arrow from best to worst
    g.strokeStyle = muted;
    g.lineWidth = 4;
    g.setLineDash([10, 8]);
    g.beginPath();
    g.moveTo(W / 2 - 50, rowY + chh / 2);
    g.lineTo(W / 2 + 40, rowY + chh / 2);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = muted;
    g.beginPath();
    g.moveTo(W / 2 + 58, rowY + chh / 2);
    g.lineTo(W / 2 + 38, rowY + chh / 2 - 12);
    g.lineTo(W / 2 + 38, rowY + chh / 2 + 12);
    g.closePath();
    g.fill();
  }

  // Footer
  centred(`${all.length} label schemes compared · not an official certificate`, H - 70, 21, (s) => body(s), muted);
  centred(`Build yours: ${APP_URL}`, H - 30, 28, (s) => body(s, 700), ink);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}
