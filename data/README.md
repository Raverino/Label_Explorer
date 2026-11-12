# Label Explorer database

All data the game needs, as JSON. Every file is produced by a script in `../scripts/`, so it can be rebuilt and re-checked.

| Folder | What | Built by | Source |
|---|---|---|---|
| `countries/` | One file per available label scheme (14), plus `index.json` with all EU-27 map entries (15 greyed out "coming soon", with a reason) | `build_countries.py` | Legal texts and agencies, see `source` on each value |
| `climate/` | Monthly temperature, solar radiation (horizontal, four facades, 35° roof) and PV yield per reference station | `fetch_climate.py` | PVGIS 5.3 (JRC), long-term means |
| `catalogue/` | Materials, wall/roof/floor build-ups, windows, airtightness, thermal bridges, ventilation, heating systems, PV and solar thermal | `build_catalogue.py` | Typical design values (EN ISO 10456, 6946, 10077, EN 14825) |
| `economics/` | Household energy prices (2026-S1) and grid CO₂ intensity | `fetch_context.py` | Eurostat `nrg_pc_204`/`nrg_pc_202`; Ember via Our World in Data |
| `map/` | EU and neighbouring country outlines | `fetch_context.py` | Eurostat GISCO (© EuroGeographics) |

## Quality flags

Each value carries a `status`:

- `official`: read from the legal text, the standard, or the issuing agency.
- `secondary`: from a certifier, trade site, research paper or news item.
- `unverified`: from memory, a search snippet or a garbled extraction. Must be checked before it's shown as fact.
- `proxy`: a stand-in chosen by us, e.g. PVGIS instead of the national reference year, or the Ember grid CO₂ where no national factor exists.
- `assumption`: a modelling choice of the app, documented.

The app should show these flags in the expert view.

## Key conventions

- Label limits are **upper limits**: a value at or below `max` gets the class. `strictly_below: true` means `<` (Spain, Denmark). `max: null` is the last class.
- Indicators: `pe_fossil` (NL EP2), `pe_tot`, `pe_nren`, `final`, `heat_need`, `weighted` (DK/FI/EE national weighting), `dual` (AT).
- Floor-area `basis`: `internal` (net, inside the walls), `gross_external` (outside dimensions), `volume` (DE: A_N = 0.32 × heated volume). The engine computes kWh once and divides by each country's own area.
- Factors are per kWh delivered. `co2` is in kg/kWh. Where a country gives no CO₂ factor, the engine falls back to `economics/grid_co2.json` (electricity) or 0.202 kg/kWh (natural gas, net calorific value, IPCC default), flagged `proxy`.
- Every label scale is versioned (`version`, `valid_from`, `valid_to`, `next_change`), because most scales change by 2030.

## Rebuild

```bash
python scripts/fetch_climate.py
python scripts/build_countries.py
python scripts/build_catalogue.py
python scripts/fetch_context.py
```
