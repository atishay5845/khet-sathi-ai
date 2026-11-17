from typing import Any

CROP_GUIDES = {
    "Wheat": {
        "Sowing": {"action": "Prepare a fine, level seedbed and use certified seed suited to the local sowing window.", "why": "Uniform establishment supports an even crop stand.", "watch": "Avoid sowing into waterlogged soil; follow local extension guidance for seed rate and variety."},
        "Growing": {"action": "Check soil moisture before irrigation and avoid applying water immediately before forecast heavy rain.", "why": "Scheduling irrigation around rainfall can reduce avoidable water use and lodging risk.", "watch": "Inspect for weeds and locally prevalent pests; use integrated pest management guidance."},
        "Flowering": {"action": "Monitor soil moisture closely and keep irrigation decisions aligned with field conditions.", "why": "Water stress around reproductive growth can affect grain formation.", "watch": "Avoid blanket pesticide use; confirm pest identification with an agricultural extension officer."},
        "Harvesting": {"action": "Monitor grain maturity and harvest when the crop reaches the locally recommended stage.", "why": "Timely harvest can reduce weather-related quality losses.", "watch": "Check the short-range forecast before harvesting and drying."},
    },
    "Paddy": {
        "Sowing": {"action": "Use healthy seed and prepare the nursery or direct-seeded field according to the locally recommended method.", "why": "Good establishment supports uniform crop growth.", "watch": "Choose a variety and sowing window recommended by the local agriculture department."},
        "Growing": {"action": "Check field water depth and soil condition before irrigation; avoid unnecessary standing water where alternate wetting practices are recommended.", "why": "Water management can improve efficiency while maintaining crop needs.", "watch": "Scout regularly for weeds and pests; use local integrated pest management advice."},
        "Flowering": {"action": "Maintain field water according to local crop guidance and monitor for heat or storm stress.", "why": "Reproductive stages can be sensitive to environmental stress.", "watch": "Seek local extension advice before applying crop-protection chemicals."},
        "Harvesting": {"action": "Check grain maturity and field moisture before planning harvest and drying.", "why": "Appropriate timing helps protect grain quality.", "watch": "Review the rainfall outlook and arrange a dry storage area."},
    },
}


def load_crop_rules(crop: str, stage: str) -> dict[str, Any]:
    crop_name = "Paddy" if crop.lower() in {"paddy", "rice"} else "Wheat"
    stage_key = next((key for key in CROP_GUIDES[crop_name] if key.lower() == stage.lower()), "Growing")
    return {"crop": crop_name, "stage": stage_key, **CROP_GUIDES[crop_name][stage_key], "reference": "Illustrative crop-stage guide; verify decisions with local agricultural extension recommendations."}


def calculate_crop_action(rules: dict[str, Any], rainfall_probability: float | None) -> dict[str, Any]:
    action = rules["action"]
    if rainfall_probability is not None and rainfall_probability >= 70 and rules["stage"] in {"Growing", "Flowering"}:
        action = "Rain is likely. Re-check soil moisture and the field condition before scheduling irrigation; avoid adding water without checking drainage."
    return {**rules, "action": action, "weather_adjusted": rainfall_probability is not None and rainfall_probability >= 70}
