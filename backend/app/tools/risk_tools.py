from typing import Any


def assess_weather_risk(weather: dict[str, Any]) -> list[dict[str, Any]]:
    if not weather.get("available", True):
        return [{"level": "watch", "title": "Weather data unavailable", "message": "Check a trusted local forecast before making irrigation or field-operation decisions.", "source": "Weather Agent"}]
    alerts = []
    for day in weather.get("days", [])[:3]:
        rain = day.get("rain_probability")
        wind = day.get("wind_kmh")
        if rain is not None and rain >= 80:
            alerts.append({"level": "high", "title": "Heavy rainfall possible", "message": f"Rain probability is {rain}% on {day.get('date')}. Review drainage and postpone irrigation decisions until field conditions are checked.", "date": day.get("date"), "source": weather.get("source")})
        elif rain is not None and rain >= 60:
            alerts.append({"level": "watch", "title": "Rain likely", "message": f"Rain probability is {rain}% on {day.get('date')}. Re-check soil moisture before irrigation.", "date": day.get("date"), "source": weather.get("source")})
        if wind is not None and wind >= 45:
            alerts.append({"level": "high", "title": "Strong winds forecast", "message": f"Wind speed may reach {wind} km/h on {day.get('date')}. Review exposed field operations and local advisories.", "date": day.get("date"), "source": weather.get("source")})
    return alerts


def create_risk_alert(alerts: list[dict[str, Any]]) -> dict[str, Any]:
    highest = "high" if any(alert.get("level") == "high" for alert in alerts) else "watch" if alerts else "clear"
    return {"level": highest, "count": len(alerts), "headline": alerts[0]["title"] if alerts else "No immediate weather trigger detected", "alerts": alerts}
