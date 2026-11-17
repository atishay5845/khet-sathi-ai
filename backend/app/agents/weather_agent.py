from datetime import date, timedelta
from typing import Any
from app.agents.common import emit, EventCallback
from app.orchestration.blackboard import AdvisoryBlackboard
from app.core.config import settings
from app.tools.weather_tools import geocode_location, fetch_weather_forecast, weather_code_label, describe_weather_tool
from app.agents.framework_adapter import refine_with_agent


def make_demo_weather() -> dict[str, Any]:
    days = []
    forecast = [(29, 18, 10, 0.0), (30, 19, 15, 0.0), (28, 18, 72, 2.4), (27, 17, 35, 0.2), (29, 18, 12, 0.0)]
    for offset, (high, low, rain, mm) in enumerate(forecast):
        days.append({"date": (date.today() + timedelta(days=offset)).isoformat(), "code": 2 if rain > 50 else 1, "max": high, "min": low, "rain_probability": rain, "rain_mm": mm, "wind_kmh": 14 + offset})
    return {"current": {"temperature": 26, "feels_like": 27, "humidity": 58, "precipitation": 0, "wind_kmh": 12, "weather_code": 2}, "days": days, "timezone": "Asia/Kolkata", "source": "Illustrative demo forecast", "is_demo": True}


async def run(board: AdvisoryBlackboard, callback: EventCallback | None = None) -> dict[str, Any]:
    name = "Weather Agent"
    await board.set_agent_status(name, "working")
    await emit(callback, "agent_started", name, "Checking the requested location and retrieving the five-day weather outlook.")
    state = await board.snapshot()
    location = state["farmer"]["location"]
    try:
        await emit(callback, "tool_call", name, "geocode_location()", tool="geocode_location")
        geo = await geocode_location(location)
        await emit(callback, "tool_call", name, "fetch_weather_forecast()", tool="fetch_weather_forecast")
        result = await fetch_weather_forecast(geo["latitude"], geo["longitude"])
        result["location"] = geo
        result["summary"] = weather_code_label(result.get("current", {}).get("weather_code"))
    except Exception as exc:
        if settings.demo_mode:
            result = make_demo_weather()
            result["location"] = {"name": location, "country": "India"}
            result["summary"] = weather_code_label(result["current"].get("weather_code"))
            result["fallback_reason"] = f"Live weather could not be reached ({type(exc).__name__}); illustrative values are shown."
        else:
            result = {"available": False, "message": f"Weather data unavailable: {type(exc).__name__}", "source": None, "is_demo": False, "days": [], "current": {}}
    framework_note = await refine_with_agent(
        "KhetSathi Weather Agent",
        "Summarize only the supplied weather observations and distinguish unavailable or illustrative data.",
        f"Summarize these weather observations without adding a forecast: {result}",
        tools=[geocode_location, fetch_weather_forecast],
    )
    result["agent_note"] = framework_note
    await board.write("weather", result)
    if result.get("source"):
        await board.append("sources", {"name": result["source"], "type": "weather", "demo": result.get("is_demo", False)})
    await board.set_agent_status(name, "completed")
    await emit(callback, "agent_completed", name, result.get("summary", "Weather source checked."), result={"source": result.get("source"), "is_demo": result.get("is_demo")})
    return result
