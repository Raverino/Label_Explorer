"""Fetch monthly reference climate per country from PVGIS (JRC) and save as JSON.

For each reference station we store, per month:
  - average air temperature (degC)
  - global irradiation on the horizontal plane (kWh/m2/month)
  - global irradiation on vertical facades S/E/W/N and on a 35deg south roof (kWh/m2/month)
  - PV yield for 1 kWp at 35deg south, 14% system loss (kWh/kWp/month)

PVGIS MRcalc gives long-term monthly values per year; we average all years (2005-2023 for SARAH3/ERA5).
Usage: python scripts/fetch_climate.py
"""
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://re.jrc.ec.europa.eu/api/v5_3/"
OUT = Path(__file__).resolve().parent.parent / "data" / "climate"

# Reference stations. "national_reference" says what the national method itself uses;
# PVGIS is a free, EU-wide proxy for that climate (flagged in the data as a proxy).
STATIONS = {
    "NL": ("De Bilt", 52.101, 5.177, "NTA 8800 uses De Bilt reference year (NEN 5060) [U]"),
    "DE": ("Potsdam", 52.381, 13.062, "DIN V 18599-10 reference climate Potsdam [S]"),
    "AT": ("Vienna", 48.208, 16.373, "OIB RL 6 label uses site climate (ONORM B 8110-5); Vienna as default site"),
    "IE": ("Dublin Airport", 53.428, -6.241, "DEAP uses Dublin Airport long-term averages"),
    "DK": ("Copenhagen", 55.676, 12.568, "SBi 213 uses the Danish Design Reference Year (DRY)"),
    "FI": ("Helsinki-Vantaa", 60.317, 24.963, "Decree 1048/2017: zone I Helsinki-Vantaa for all buildings"),
    "EE": ("Tallinn", 59.437, 24.754, "Estonian test reference year [U]"),
    "SI": ("Ljubljana", 46.056, 14.508, "National climate source not verified [U]"),
    "HR_cont": ("Zagreb-Maksimir", 45.822, 16.034, "NN 88/2017 reference station, continental Croatia"),
    "HR_coast": ("Split-Marjan", 43.508, 16.426, "NN 88/2017 reference station, littoral Croatia"),
    "ES": ("Madrid (zone D3)", 40.417, -3.704, "CTE DB-HE climate zone D3 representative city"),
    "BE": ("Uccle", 50.799, 4.358, "Belgian EPB methods use Uccle [U]; shared by Wallonia and Brussels"),
    "SK": ("Bratislava", 48.149, 17.107, "STN 73 0540 climate not verified [U]"),
    "HU": ("Budapest", 47.498, 19.040, "Hungarian national reference year [U]"),
}

PLANES = {  # name: (angle from horizontal, aspect: 0=S, 90=W, -90=E, 180=N)
    "S90": (90, 0),
    "E90": (90, -90),
    "W90": (90, 90),
    "N90": (90, 180),
    "S35": (35, 0),
}


def get(endpoint, **params):
    params["outputformat"] = "json"
    url = API + endpoint + "?" + urllib.parse.urlencode(params)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return json.load(r)
        except Exception as e:  # PVGIS rate-limits at ~30 calls/s; back off and retry
            if attempt == 3:
                raise
            time.sleep(2 + attempt * 3)


def monthly_mean(rows, key):
    acc = {}
    for r in rows:
        if key in r:
            acc.setdefault(r["month"], []).append(r[key])
    return [round(sum(acc[m]) / len(acc[m]), 2) for m in range(1, 13)]


def fetch_station(code, name, lat, lon, note):
    base = get("MRcalc", lat=lat, lon=lon, horirrad=1, avtemp=1)
    rows = base["outputs"]["monthly"]
    years = sorted({r["year"] for r in rows})
    data = {
        "temp_C": monthly_mean(rows, "T2m"),
        "irr_kWh_m2": {"H": monthly_mean(rows, "H(h)_m")},
    }
    for plane, (angle, aspect) in PLANES.items():
        res = get("MRcalc", lat=lat, lon=lon, selectrad=1, angle=angle, aspect=aspect)
        data["irr_kWh_m2"][plane] = monthly_mean(res["outputs"]["monthly"], "H(i)_m")
        time.sleep(0.3)
    pv = get("PVcalc", lat=lat, lon=lon, peakpower=1, loss=14, angle=35, aspect=0)
    data["pv_kWh_per_kWp"] = [round(m["E_m"], 1) for m in pv["outputs"]["monthly"]["fixed"]]
    data["pv_kWh_per_kWp_year"] = round(pv["outputs"]["totals"]["fixed"]["E_y"], 0)
    return {
        "id": code,
        "station": name,
        "lat": lat,
        "lon": lon,
        "national_reference": note,
        "source": {
            "name": "PVGIS 5.3 (JRC), MRcalc + PVcalc",
            "url": "https://re.jrc.ec.europa.eu/pvg_tools/en/",
            "radiation_db": base["inputs"]["meteo_data"].get("radiation_db"),
            "years": [years[0], years[-1]],
            "status": "proxy",
            "note": "Long-term monthly means from PVGIS; a free EU-wide proxy, not the national reference year itself.",
        },
        "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        **data,
    }


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for code, (name, lat, lon, note) in STATIONS.items():
        rec = fetch_station(code, name, lat, lon, note)
        (OUT / f"{code}.json").write_text(json.dumps(rec, indent=1), encoding="utf-8")
        t = rec["temp_C"]
        print(f"{code:9s} {name:18s} Tjan {t[0]:5.1f} Tjul {t[6]:5.1f} "
              f"H {sum(rec['irr_kWh_m2']['H']):6.0f} S90 {sum(rec['irr_kWh_m2']['S90']):5.0f} "
              f"PV {rec['pv_kWh_per_kWp_year']:5.0f}")


if __name__ == "__main__":
    main()
