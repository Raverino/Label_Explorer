// Plain-language text for what each label scheme measures, keyed by the indicator kind stored in
// data/countries/*.json ("indicator"). Used on the start screen and in the comparison.

export interface Plain {
  icon: string;
  title: string;
  text: string;
  /** what improves this kind of label most */
  tip: string;
}

export const INDICATOR_PLAIN: Record<string, Plain> = {
  heat_need: {
    icon: "🧱",
    title: "Only the shell counts",
    text: "How much heat the house needs to stay warm. Insulation, windows and airtightness decide; the heating system does not change the class.",
    tip: "Power-up: more insulation or better windows.",
  },
  final: {
    icon: "🔌",
    title: "What the meters show",
    text: "The energy delivered to the house (gas, electricity, wood) under standard use. An efficient heater lowers it.",
    tip: "Power-up: a heat pump cuts the delivered energy the most.",
  },
  pe_tot: {
    icon: "🏭",
    title: "Energy at the source",
    text: "Every kWh is traced back to the power plant or gas field. Electricity counts extra, because making it loses energy on the way.",
    tip: "Power-up: insulation first, then solar panels.",
  },
  pe_nren: {
    icon: "🛢️",
    title: "Fossil energy at the source",
    text: "Like energy at the source, but renewable parts (sunshine, wood, the free heat a heat pump takes from the air) count as zero.",
    tip: "Power-up: a heat pump plus solar panels.",
  },
  pe_fossil: {
    icon: "🛢️",
    title: "Fossil energy at the source",
    text: "The fossil energy behind your gas and electricity, minus what your solar panels make over the year.",
    tip: "Power-up: solar panels count in full here.",
  },
  weighted: {
    icon: "⚖️",
    title: "Weighted energy",
    text: "Each kind of energy gets a national weight (electricity heavier, district heat or wood lighter). The class limits can also depend on the size of the home.",
    tip: "Power-up: a heat pump plus solar panels.",
  },
  dual: {
    icon: "🔁",
    title: "Two tests, the worse one wins",
    text: "The heat the house needs and the energy it uses are both rated; the lower of the two classes is the label.",
    tip: "Power-up: improve the shell and the heating together.",
  },
};

export const plainFor = (indicator: string): Plain =>
  INDICATOR_PLAIN[indicator] ?? { icon: "📏", title: "Energy per m²", text: "Energy use per square metre of floor under standard use.", tip: "" };

/** One short, factual quirk per scheme for the compare cards ("judge personality"). */
export const COUNTRY_FACTS: Record<string, { icon: string; title: string; text: string }> = {
  NL: { icon: "☀️", title: "Solar fan", text: "Solar panels count in full. Make more than you use and the score drops to zero or below: A++++." },
  DE: { icon: "🔌", title: "Meter reader", text: "Judges the energy delivered to the house, not the power plant behind it. The ladder runs down to H." },
  AT: { icon: "🔁", title: "Double check", text: "Grades the heat need and the energy use separately. The game shows the worse of the two." },
  IE: { icon: "🏭", title: "Source tracker", text: "Follows every kWh back to the power plant, so electricity weighs more than gas." },
  DK: { icon: "📏", title: "Size-aware", text: "The class limits move with the floor area, and the top class is named after a year: A2020." },
  FI: { icon: "⚖️", title: "Weigh station", text: "Electricity counts 1.2, district heat and wood only 0.5, and the limits depend on the size of the home." },
  EE: { icon: "⚖️", title: "Weigh station", text: "Each energy type gets a national weight, and electricity weighs the most." },
  SI: { icon: "🧱", title: "Shell inspector", text: "Only the heat the house needs counts. A new heat pump does not change the grade; insulation does." },
  HR: { icon: "🧱", title: "Shell inspector", text: "Only the heat need counts, and coast and inland houses are rated in different weather." },
  ES: { icon: "🗺️", title: "Climate-zone judge", text: "The limits change with the climate zone. Here: Madrid, zone D3." },
  "BE-WAL": { icon: "⚡", title: "Tough on electricity", text: "One kWh from the grid counts 2.5. A++ means the house makes as much energy as it uses." },
  "BE-BRU": { icon: "⚡", title: "Tough on electricity", text: "One kWh from the grid counts 2.5, and there is an extra A− step between A and B." },
  SK: { icon: "🔥", title: "Bonus scale", text: "Besides the main grade, the heating need gets a grade of its own." },
  HU: { icon: "🪜", title: "Longest ladder", text: "Twelve classes, from A+++ all the way down to I." },
};
