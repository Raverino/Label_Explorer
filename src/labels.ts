// Maps an indicator value to a class on each country's own (versioned) scale.

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface LabelResult {
  cls: string;
  /** 0 = best class */
  index: number;
  classes: { class: string; max: number | null }[];
  note?: string;
}

/** Colour for a class position on a scale of n classes: green (best) to red (worst). */
export function classColor(index: number, n: number) {
  const ramp = ["#00a651", "#4cb848", "#bfd730", "#fff200", "#fdb913", "#f37021", "#ed1c24", "#b3121a"];
  const t = n <= 1 ? 0 : index / (n - 1);
  return ramp[Math.round(t * (ramp.length - 1))];
}

function fromLimits(classes: { class: string; max: number | null }[], v: number, strict: boolean): LabelResult {
  for (let i = 0; i < classes.length; i++) {
    const m = classes[i].max;
    if (m === null || (strict ? v < m : v <= m + 1e-9)) return { cls: classes[i].class, index: i, classes };
  }
  const i = classes.length - 1;
  return { cls: classes[i].class, index: i, classes };
}

export function classify(label: any, value: number, area: number): LabelResult {
  if (label.scale_type === "area_formula") {
    let formulas = label.formulas;
    let perArea = true; // DK: c + k / A
    if (label.area_bands) {
      // FI: c + k * A, per area band
      const band = label.area_bands.find((b: any) => area < (b.area_max ?? Infinity)) ?? label.area_bands[label.area_bands.length - 1];
      formulas = band.formulas;
      perArea = false;
    }
    const classes = formulas.map((f: any) => ({
      class: f.class,
      max: f.c === null ? null : perArea ? f.c + f.k / area : f.c + f.k * area,
    }));
    return fromLimits(classes, value, perArea);
  }
  if (label.scale_type === "area_bands") {
    const band = label.bands.find((b: any) => b.area_max === null || area <= b.area_max) ?? label.bands[label.bands.length - 1];
    return fromLimits(band.classes, value, !!band.strictly_below);
  }
  return fromLimits(label.scale.classes, value, !!label.scale.strictly_below);
}
