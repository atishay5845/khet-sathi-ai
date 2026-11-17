from datetime import date, timedelta
from typing import Any
import httpx
from app.core.config import settings

DEMO_PRICES = {
    "Wheat": {"modal": 2425, "min": 2350, "max": 2510, "unit": "₹ / quintal", "market": "Ludhiana APMC", "commodity": "Wheat"},
    "Paddy": {"modal": 2310, "min": 2200, "max": 2420, "unit": "₹ / quintal", "market": "Khanna APMC", "commodity": "Paddy (Common)"},
}


def calculate_price_trend(observations: list[dict[str, Any]]) -> dict[str, Any]:
    clean = [float(item["modal_price"]) for item in observations if item.get("modal_price") is not None]
    if len(clean) < 2:
        return {"direction": "Insufficient data", "change_percent": 0, "series": clean}
    first, last = clean[0], clean[-1]
    change = ((last - first) / first * 100) if first else 0
    return {"direction": "Rising" if change > 1 else "Falling" if change < -1 else "Stable", "change_percent": round(change, 2), "series": clean}


async def fetch_mandi_prices(crop: str, location: str | None = None) -> dict[str, Any]:
    if settings.data_gov_api_key and settings.agmarknet_resource_id:
        params = {
            "api-key": settings.data_gov_api_key,
            "format": "json",
            "limit": 100,
            "filters[commodity]": crop,
        }
        if location:
            params["filters[state]"] = location
        url = f"https://api.data.gov.in/resource/{settings.agmarknet_resource_id}"
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                raw = response.json()
            records = raw.get("records", [])
            normalized = []
            for row in records:
                try:
                    normalized.append({
                        "date": row.get("arrival_date") or row.get("date"),
                        "market": row.get("market"),
                        "commodity": row.get("commodity"),
                        "min_price": float(row.get("min_price") or 0),
                        "max_price": float(row.get("max_price") or 0),
                        "modal_price": float(row.get("modal_price") or 0),
                    })
                except (TypeError, ValueError):
                    continue
            if normalized:
                normalized.sort(key=lambda item: item.get("date") or "")
                trend = calculate_price_trend(normalized[-7:])
                latest = normalized[-1]
                return {**latest, "unit": "₹ / quintal", "trend": trend, "observations": normalized[-14:], "source": "data.gov.in / AGMARKNET", "is_demo": False}
        except Exception as exc:
            if not settings.demo_mode:
                return {"available": False, "message": f"Live mandi source unavailable: {type(exc).__name__}", "source": None, "is_demo": False}
            fallback_error = f"Live mandi source unavailable ({type(exc).__name__}); illustrative values are shown."
        else:
            fallback_error = "The configured mandi resource returned no matching records; illustrative values are shown."
    else:
        fallback_error = "Live mandi credentials are not configured; illustrative values are shown."

    if not settings.demo_mode:
        return {"available": False, "message": "Live mandi data is not configured or returned no records.", "source": None, "is_demo": False}

    item = DEMO_PRICES.get(crop, DEMO_PRICES["Wheat"]).copy()
    observations = []
    base = item["modal"]
    for index in range(7):
        day = date.today() - timedelta(days=6 - index)
        value = base + [-55, -28, -12, 18, 5, 34, 0][index]
        observations.append({"date": day.isoformat(), "modal_price": value, "min_price": value - 70, "max_price": value + 85, "market": item["market"]})
    trend = calculate_price_trend(observations)
    return {**item, "date": date.today().isoformat(), "trend": trend, "observations": observations, "source": "Illustrative demo dataset", "is_demo": True, "fallback_reason": fallback_error}


def summarize_market(data: dict[str, Any]) -> str:
    if not data.get("available", True):
        return "No market observations available. Do not infer a sell-or-hold signal."
    return f"{data.get('commodity')} modal price is ₹{data.get('modal', data.get('modal_price', '—'))} per quintal at {data.get('market', 'the selected market')}. Trend: {data.get('trend', {}).get('direction', 'unknown')}."
