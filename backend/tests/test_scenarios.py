from app.tools.crop_tools import load_crop_rules, calculate_crop_action
from app.tools.risk_tools import assess_weather_risk, create_risk_alert
from app.tools.market_tools import calculate_price_trend
from app.agents.intake_agent import validate_farmer_input, normalize_farmer_data


def test_normal_wheat_profile_and_guidance():
    farmer = normalize_farmer_data(validate_farmer_input({"crop": "wheat", "location": "Ludhiana", "stage": "Growing", "land_area": 3}))
    rules = load_crop_rules(farmer["crop"], farmer["stage"])
    action = calculate_crop_action(rules, 15)
    assert farmer["crop"] == "Wheat"
    assert action["stage"] == "Growing"
    assert action["weather_adjusted"] is False


def test_heavy_rain_creates_risk_alert():
    weather = {"available": True, "days": [{"date": "2026-11-18", "rain_probability": 92, "wind_kmh": 18}]}
    alerts = assess_weather_risk(weather)
    result = create_risk_alert(alerts)
    assert result["level"] == "high"
    assert result["count"] >= 1


def test_market_trend_direction():
    trend = calculate_price_trend([{"modal_price": 2200}, {"modal_price": 2250}, {"modal_price": 2300}])
    assert trend["direction"] == "Rising"
    assert trend["change_percent"] > 0
