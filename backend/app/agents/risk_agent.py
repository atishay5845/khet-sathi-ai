from typing import Any
from app.agents.common import emit, EventCallback
from app.orchestration.blackboard import AdvisoryBlackboard
from app.tools.risk_tools import assess_weather_risk, create_risk_alert
from app.agents.framework_adapter import refine_with_agent


async def run(board: AdvisoryBlackboard, callback: EventCallback | None = None) -> dict[str, Any]:
    name = "Risk Alert Agent"
    await board.set_agent_status(name, "working")
    await emit(callback, "agent_started", name, "Checking the forecast for weather conditions that could affect field operations.")
    state = await board.snapshot()
    await emit(callback, "tool_call", name, "assess_weather_risk()", tool="assess_weather_risk")
    alerts = assess_weather_risk(state.get("weather") or {"available": False})
    await emit(callback, "tool_call", name, "create_risk_alert()", tool="create_risk_alert")
    result = create_risk_alert(alerts)
    await refine_with_agent(
        "KhetSathi Risk Alert Agent",
        "Classify only the weather risks present in the forecast. Use precautionary language and do not imply certainty.",
        f"Review these detected weather alerts: {result}",
        tools=[assess_weather_risk, create_risk_alert],
    )
    await board.write("risk_alerts", result)
    await board.set_agent_status(name, "completed")
    await emit(callback, "agent_completed", name, result["headline"], result={"level": result["level"], "count": result["count"]})
    return result
