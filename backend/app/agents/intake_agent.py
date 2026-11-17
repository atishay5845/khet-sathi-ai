from typing import Any
from app.agents.common import emit, EventCallback
from app.orchestration.blackboard import AdvisoryBlackboard
from app.agents.framework_adapter import refine_with_agent


def validate_farmer_input(farmer: dict[str, Any]) -> dict[str, Any]:
    required = ["crop", "location", "stage", "land_area"]
    missing = [key for key in required if farmer.get(key) in (None, "")]
    if missing:
        raise ValueError(f"Missing farmer information: {', '.join(missing)}")
    return {**farmer, "crop": str(farmer["crop"]).strip().title(), "location": str(farmer["location"]).strip(), "stage": str(farmer["stage"]).strip().title(), "land_area": float(farmer["land_area"])}


def normalize_farmer_data(farmer: dict[str, Any]) -> dict[str, Any]:
    crop = "Paddy" if farmer["crop"].lower() in {"paddy", "rice"} else "Wheat" if farmer["crop"].lower() in {"wheat"} else farmer["crop"].title()
    stage_map = {"vegetative": "Growing", "tillering": "Growing", "reproductive": "Flowering", "maturity": "Harvesting"}
    stage = stage_map.get(farmer["stage"].lower(), farmer["stage"])
    return {**farmer, "crop": crop, "stage": stage, "unit": farmer.get("unit", "acres"), "language": farmer.get("language", "English")}


async def run(board: AdvisoryBlackboard, callback: EventCallback | None = None) -> dict[str, Any]:
    name = "Intake Agent"
    await board.set_agent_status(name, "working")
    await emit(callback, "agent_started", name, "Validating the farmer profile and preparing the shared advisory record.")
    await emit(callback, "tool_call", name, "validate_farmer_input()", tool="validate_farmer_input")
    raw = await board.snapshot()
    validated = validate_farmer_input(raw["farmer"])
    await emit(callback, "tool_call", name, "normalize_farmer_data()", tool="normalize_farmer_data")
    farmer = normalize_farmer_data(validated)
    framework_note = await refine_with_agent(
        "KhetSathi Intake Agent",
        "You validate and normalize farmer intake fields. Do not infer missing facts.",
        f"Confirm this normalized farmer record is internally consistent: {farmer}",
        tools=[validate_farmer_input, normalize_farmer_data],
    )
    farmer["intake_note"] = framework_note or "Farmer profile validated by deterministic input checks."
    await board.write("farmer", farmer)
    await board.set_agent_status(name, "completed")
    await emit(callback, "agent_completed", name, f"Profile ready for {farmer['crop']} in {farmer['location']}.", result=farmer)
    return farmer
