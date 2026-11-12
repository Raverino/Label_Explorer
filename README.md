# Label Explorer

Build a small house from cubes, pick a country, and see the **provisional energy label** it would get in 14 European schemes: Netherlands, Germany, Austria, Ireland, Denmark, Finland, Estonia, Slovenia, Croatia, Spain, Wallonia, Brussels, Slovakia and Hungary. Then compare all 14 side by side.

**Play:** https://raverino.github.io/Label_Explorer/

> Indicative only. This is an educational game, not a legal energy certificate. Each country's label uses its own indicator, floor-area rule, factors and scale. The app copies those rules and runs one simplified monthly heat balance (EN ISO 13790 style) for every country.

## How it works

- **Engine** (`src/engine.ts`): a monthly heat balance with heat-pump, boiler, district-heat, PV and solar-thermal models, and per-country factors, floor areas and class scales. It is checked against the RVO NTA 8800 reference house L (`data/validation/NL_reference_L.json`, `tests/`).
- **Database** (`data/`): one JSON file per country plus the building-part catalogue, all built by the scripts in `scripts/`. Every value has a status flag (`official`, `secondary`, `unverified`, `proxy` or `assumption`) and a source link. The app's expert view shows these flags. `data/OPEN_DATA_GAPS.md` lists what is still not official.
- **Climate**: PVGIS 5.3 (JRC) long-term means. **Prices**: Eurostat. **Grid CO₂**: Ember via Our World in Data. **Map**: Eurostat GISCO (© EuroGeographics for the administrative boundaries).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # engine tests
npm run build
```

## License

MIT for the code, see `LICENSE`. Data sources keep their own terms.
