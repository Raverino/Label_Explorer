"""Fetch EU-wide context data for Label Explorer:
  data/economics/energy_prices.json  - household electricity and gas prices (Eurostat nrg_pc_204 / nrg_pc_202)
  data/economics/grid_co2.json       - CO2 intensity of electricity per country (Ember via Our World in Data),
                                       used ONLY as a fallback where the national method gives no CO2 factor
  data/map/europe.geojson            - country outlines (Eurostat GISCO, 1:60M, EPSG:4326)
Usage: python scripts/fetch_context.py
"""
import csv
import io
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "data"
EU27 = ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES", "FI", "FR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT",
        "NL", "PL", "PT", "RO", "SE", "SI", "SK"]
ISO3 = {"AT": "AUT", "BE": "BEL", "BG": "BGR", "CY": "CYP", "CZ": "CZE", "DE": "DEU", "DK": "DNK", "EE": "EST", "EL": "GRC", "ES": "ESP",
        "FI": "FIN", "FR": "FRA", "HR": "HRV", "HU": "HUN", "IE": "IRL", "IT": "ITA", "LT": "LTU", "LU": "LUX", "LV": "LVA", "MT": "MLT",
        "NL": "NLD", "PL": "POL", "PT": "PRT", "RO": "ROU", "SE": "SWE", "SI": "SVN", "SK": "SVK"}


def get(url, raw=False):
    req = urllib.request.Request(url, headers={"User-Agent": "LabelExplorer-data-script"})
    with urllib.request.urlopen(req, timeout=120) as r:
        b = r.read()
    return b if raw else json.loads(b)


def eurostat(dataset, **flt):
    q = "&".join(f"{k}={v}" for k, v in flt.items())
    d = get(f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset}?format=JSON&lang=EN&{q}")
    geo = d["dimension"]["geo"]["category"]["index"]
    times = d["dimension"]["time"]["category"]["index"]
    ntime = len(times)
    out = {}
    for g, gi in geo.items():
        # latest available period per country
        for t, ti in sorted(times.items(), key=lambda kv: kv[1], reverse=True):
            v = d["value"].get(str(gi * ntime + ti))
            if v is not None:
                out[g] = {"value": v, "period": t}
                break
    return out


def prices():
    common = dict(unit="KWH", currency="EUR", tax="I_TAX", sinceTimePeriod="2024-S1")
    el = eurostat("nrg_pc_204", siec="E7000", nrg_cons="KWH2500-4999", **common)
    gas = eurostat("nrg_pc_202", siec="G3000", nrg_cons="GJ20-199", **common)
    data = {
        "meta": {"generated": "2026-11-10", "unit": "EUR/kWh incl. all taxes", "status": "official",
                 "electricity": "Eurostat nrg_pc_204, households 2500-4999 kWh/yr (band DC)",
                 "gas": "Eurostat nrg_pc_202, households 20-199 GJ/yr (band D2)",
                 "url": "https://ec.europa.eu/eurostat/databrowser/view/nrg_pc_204/default/table"},
        "electricity": {g: v for g, v in el.items() if g in EU27},
        "gas": {g: v for g, v in gas.items() if g in EU27},
    }
    (ROOT / "economics").mkdir(parents=True, exist_ok=True)
    (ROOT / "economics" / "energy_prices.json").write_text(json.dumps(data, indent=1), encoding="utf-8")
    print("prices:", len(data["electricity"]), "electricity,", len(data["gas"]), "gas")
    for g in ["NL", "DE", "AT", "IE", "ES", "HU"]:
        print(f"  {g} el {data['electricity'].get(g)} gas {data['gas'].get(g)}")


def grid_co2():
    raw = get("https://ourworldindata.org/grapher/carbon-intensity-electricity.csv?v=1&csvType=full&useColumnShortNames=true", raw=True)
    rows = list(csv.DictReader(io.StringIO(raw.decode("utf-8"))))
    col = [c for c in rows[0].keys() if c.lower() not in ("entity", "code", "year")][0]
    latest = {}
    for r in rows:
        code = r.get("Code") or r.get("code")
        if r[col] and (code not in latest or int(r.get("Year") or r["year"]) > latest[code]["year"]):
            latest[code] = {"year": int(r.get("Year") or r["year"]), "g_per_kWh": float(r[col])}
    data = {"meta": {"generated": "2026-11-10", "status": "proxy",
                     "source": "Ember (via Our World in Data), carbon intensity of electricity generation, gCO2e/kWh",
                     "url": "https://ourworldindata.org/grapher/carbon-intensity-electricity",
                     "use": "Fallback only where the national method gives no electricity CO2 factor. Generation-based (not consumption, no imports)."},
            "countries": {g: latest.get(ISO3[g]) for g in EU27}}
    (ROOT / "economics" / "grid_co2.json").write_text(json.dumps(data, indent=1), encoding="utf-8")
    print("grid co2:", {g: v["g_per_kWh"] for g, v in data["countries"].items() if v and g in ("NL", "DE", "FR", "PL", "SE", "IE")})


def europe_map():
    gj = get("https://gisco-services.ec.europa.eu/distribution/v2/countries/geojson/CNTR_RG_60M_2020_4326.geojson")
    keep = set(EU27) | {"NO", "CH", "UK", "IS", "RS", "BA", "ME", "AL", "MK", "XK", "UA", "BY", "MD", "TR"}
    feats = []
    for ft in gj["features"]:
        cid = ft["properties"].get("CNTR_ID")
        if cid in keep:
            feats.append({"type": "Feature", "properties": {"id": cid, "name": ft["properties"].get("NAME_ENGL"), "eu27": cid in EU27},
                          "geometry": ft["geometry"]})
    out = {"type": "FeatureCollection", "features": feats,
           "meta": {"source": "© EuroGeographics for the administrative boundaries (Eurostat GISCO CNTR 2020, 1:60M)",
                    "url": "https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/countries",
                    "note": "Greece is 'EL' in Eurostat codes"}}
    (ROOT / "map").mkdir(parents=True, exist_ok=True)
    (ROOT / "map" / "europe.geojson").write_text(json.dumps(out), encoding="utf-8")
    print("map:", len(feats), "countries")


if __name__ == "__main__":
    for step in (prices, grid_co2, europe_map):
        try:
            step()
        except Exception as e:
            print(step.__name__, "FAILED:", e)
