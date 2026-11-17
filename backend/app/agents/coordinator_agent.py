from typing import Any
from app.agents.common import emit, EventCallback
from app.agents.framework_adapter import refine_with_agent
from app.orchestration.blackboard import AdvisoryBlackboard
from app.tools.board_tools import read_advisory_board, validate_and_compile_report


async def run(board: AdvisoryBlackboard, callback: EventCallback | None = None) -> dict[str, Any]:
    name = "Advisor Coordinator"
    await board.set_agent_status(name, "working")
    await emit(callback, "agent_started", name, "Reviewing specialist findings, checking completeness and assembling the farmer-facing report.")
    snapshot = await board.snapshot()
    await emit(callback, "tool_call", name, "read_advisory_board()", tool="read_advisory_board")
    findings = read_advisory_board(snapshot)
    await emit(callback, "tool_call", name, "validate_and_compile_report()", tool="validate_and_compile_report")
    validation = validate_and_compile_report(snapshot)
    if not validation["ready"]:
        note = f"Some sections are incomplete: {', '.join(validation['missing_sections'])}. Review the source availability before acting."
    else:
        note = "Specialist findings are available for review."

    farmer = findings["farmer"]
    weather = findings.get("weather") or {}
    market = findings.get("market") or {}
    crop = findings.get("crop_advice") or {}
    schemes = findings.get("schemes") or []
    risk = findings.get("risk_alerts") or {"level": "watch", "alerts": []}

    summary_prompt = (
        "Write a concise, cautious agricultural advisory in plain English using only the supplied facts. "
        "Do not invent prices, weather, eligibility or agronomic claims. Clearly distinguish illustrative demo values. "
        f"Farmer: {farmer}. Weather: {weather}. Crop guidance: {crop}. Market: {market}. Schemes: {schemes}. Risk: {risk}."
    )
    ai_summary = await refine_with_agent(
        "KhetSathi Advisor Coordinator",
        "You are an agricultural information assistant, not a substitute for local agricultural experts. Use only provided evidence. If evidence is missing, say so. Never guarantee outcomes or government eligibility.",
        summary_prompt,
        tools=[read_advisory_board, validate_and_compile_report],
    )

    weather_available = weather.get("available", True) and bool(weather.get("current"))
    market_available = market.get("available", True) and bool(market.get("modal") or market.get("modal_price"))
    report = {
        "run_id": board.run_id,
        "farmer": farmer,
        "weather": weather,
        "crop_advice": crop,
        "market": market,
        "schemes": schemes,
        "risk": risk,
        "summary": ai_summary or (
            f"For {farmer['crop']} at the {farmer['stage'].lower()} stage, {crop.get('action', 'review local crop guidance before taking action')} "
            + (f"The latest available market reference shows a modal price of ₹{market.get('modal', market.get('modal_price'))} per quintal, but check the observation date and market before selling. " if market_available else "Current mandi prices are unavailable, so no sell-or-hold signal is provided. ")
            + ("A weather risk has been flagged; review the alert before scheduling field work." if risk.get("level") in {"high", "watch"} else "No immediate weather trigger was detected in the available forecast.")
        ),
        "data_quality": {
            "weather_available": weather_available,
            "market_available": market_available,
            "illustrative_data_present": bool(weather.get("is_demo") or market.get("is_demo")),
            "incomplete_sections": validation["missing_sections"],
        },
        "sources": findings.get("sources", []),
        "created_at": snapshot.get("updated_at"),
    }
    await board.write("final_advisory", report)
    await board.set_agent_status(name, "completed")
    await emit(callback, "agent_completed", name, "Final advisory assembled from the shared board.", result={"summary": report["summary"], "data_quality": report["data_quality"]})
    return report
