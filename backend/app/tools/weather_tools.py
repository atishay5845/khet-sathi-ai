import httpx
from typing import Any

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


async def geocode_location(location: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=12) as client:
        response = await client.get(GEOCODING_URL, params={"name": location, "count": 1, "language": "en", "format": "json"})
        response.raise_for_status()
        results = response.json().get("results") or []
    if not results:
        raise ValueError(f"Could not find location: {location}")
    item = results[0]
    return {"name": item.get("name"), "admin1": item.get("admin1"), "country": item.get("country"), "latitude": item["latitude"], "longitude": item["longitude"]}


async def fetch_weather_forecast(latitude: float, longitude: float) -> dict[str, Any]:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max",
        "forecast_days": 5,
        "timezone": "auto",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(FORECAST_URL, params=params)
        response.raise_for_status()
        data = response.json()
    current = data.get("current", {})
    daily = data.get("daily", {})
    days = []
    for index, date in enumerate(daily.get("time", [])):
        days.append({
            "date": date,
            "code": daily.get("weather_code", [None] * 5)[index],
            "max": daily.get("temperature_2m_max", [None] * 5)[index],
            "min": daily.get("temperature_2m_min", [None] * 5)[index],
            "rain_probability": daily.get("precipitation_probability_max", [None] * 5)[index],
            "rain_mm": daily.get("precipitation_sum", [None] * 5)[index],
            "wind_kmh": daily.get("wind_speed_10m_max", [None] * 5)[index],
        })
    return {
        "current": {
            "temperature": current.get("temperature_2m"),
            "feels_like": current.get("apparent_temperature"),
            "humidity": current.get("relative_humidity_2m"),
            "precipitation": current.get("precipitation"),
            "wind_kmh": current.get("wind_speed_10m"),
            "weather_code": current.get("weather_code"),
        },
        "days": days,
        "timezone": data.get("timezone"),
        "source": "Open-Meteo",
        "is_demo": False,
    }


# Tools exposed to the agent layer; the actual functions are called directly by the
# specialist module so every data point is auditable.
def describe_weather_tool() -> str:
    return "Open-Meteo provides current and five-day forecast data using coordinates."


def weather_code_label(code: int | None) -> str:
    if code is None:
        return "Unavailable"
    if code == 0:
        return "Clear sky"
    if code in (1, 2, 3):
        return "Partly cloudy"
    if code in (45, 48):
        return "Fog"
    if code in (51, 53, 55, 56, 57):
        return "Drizzle"
    if code in (61, 63, 65, 66, 67):
        return "Rain"
    if code in (71, 73, 75, 77):
        return "Snow"
    if code in (80, 81, 82):
        return "Rain showers"
    if code in (95, 96, 99):
        return "Thunderstorm"
    return "Variable conditions"
