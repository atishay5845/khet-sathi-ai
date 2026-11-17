from typing import Any
from app.agents.common import emit, EventCallback
from app.orchestration.blackboard import AdvisoryBlackboard
from app.tools.crop_tools import load_crop_rules, calculate_crop_action
from app.agents.framework_adapter import refine_with_agent


async def run(board: AdvisoryBlackboard, callback: EventCallback | None = None) -> dict[str, Any]:
    name = "Crop Agent"
    await board.set_agent_status(name, "working")
    await emit(callback, "agent_started", name, "Matching crop-stage guidance with the forecast information.")
    state = await board.snapshot()
    farmer = state["farmer"]
    weather = state.get("weather") or {}
    await emit(callback, "tool_call", name, "load_crop_rules()", tool="load_crop_rules")
    rules = load_crop_rules(farmer["crop"], farmer["stage"])
    await emit(callback, "tool_call", name, "calculate_crop_action()", tool="calculate_crop_action")
    days = weather.get("days") or []
    rain_probability = max([float(day.get("rain_probability") or 0) for day in days[:3]] or [0]) if weather.get("available", True) else None
    result = calculate_crop_action(rules, rain_probability)
    framework_note = await refine_with_agent(
        "KhetSathi Crop Agent",
        "Explain crop-stage guidance conservatively. Do not introduce ungrounded chemical or dosage recommendations.",
        f"Review this crop-stage guidance and weather context: {result}. Weather: {weather}",
        tools=[load_crop_rules, calculate_crop_action],
    )
    result["confidence_note"] = "General crop-stage guidance only; confirm field decisions with local agricultural extension advice."
    result["agent_note"] = framework_note
    await board.write("crop_advice", result)
    await board.append("sources", {"name": "Local crop-stage guidance", "type": "crop_guide", "demo": True})
    await board.set_agent_status(name, "completed")
    await emit(callback, "agent_completed", name, f"Prepared {farmer['crop']} guidance for the {farmer['stage'].lower()} stage.", result={"stage": result["stage"], "weather_adjusted": result["weather_adjusted"]})
    return result
