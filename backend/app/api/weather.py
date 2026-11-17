from datetime import date, timedelta
from fastapi import APIRouter, Query
from app.core.config import settings
from app.tools.weather_tools import geocode_location, fetch_weather_forecast, weather_code_label
from app.agents.weather_agent import make_demo_weather

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("")
async def weather(location: str = Query("Ludhiana, Punjab")):
    try:
        geo = await geocode_location(location)
        result = await fetch_weather_forecast(geo["latitude"], geo["longitude"])
        result["location"] = geo
        result["summary"] = weather_code_label(result.get("current", {}).get("weather_code"))
        return result
    except Exception as exc:
        if not settings.demo_mode:
            return {"available": False, "message": f"Weather data unavailable: {type(exc).__name__}", "days": [], "current": {}, "is_demo": False}
        result = make_demo_weather()
        result["location"] = {"name": location, "country": "India"}
        result["summary"] = weather_code_label(result["current"].get("weather_code"))
        result["fallback_reason"] = "Live source unreachable; illustrative values are shown."
        return result
