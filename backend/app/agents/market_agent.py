from typing import Any
from app.agents.common import emit, EventCallback
from app.orchestration.blackboard import AdvisoryBlackboard
from app.tools.market_tools import fetch_mandi_prices, calculate_price_trend, summarize_market
from app.agents.framework_adapter import refine_with_agent


async def run(board: AdvisoryBlackboard, callback: EventCallback | None = None) -> dict[str, Any]:
    name = "Market Agent"
    await board.set_agent_status(name, "working")
    await emit(callback, "agent_started", name, "Collecting mandi observations and calculating the recent price direction.")
    state = await board.snapshot()
    crop = state["farmer"]["crop"]
    location = state["farmer"]["location"]
    await emit(callback, "tool_call", name, "fetch_mandi_prices()", tool="fetch_mandi_prices")
    result = await fetch_mandi_prices(crop, location)
    await emit(callback, "tool_call", name, "calculate_price_trend()", tool="calculate_price_trend")
    result["trend"] = calculate_price_trend(result.get("observations", []))
    result["summary"] = summarize_market(result)
    framework_note = await refine_with_agent(
        "KhetSathi Market Agent",
        "Interpret market observations cautiously. Never predict future prices or create a sell/hold recommendation without evidence.",
        f"Summarize this price observation and its calculated trend. If demo data, state that clearly: {result}",
        tools=[fetch_mandi_prices, calculate_price_trend],
    )
    result["agent_note"] = framework_note
    await board.write("market", result)
    if result.get("source"):
        await board.append("sources", {"name": result["source"], "type": "market", "demo": result.get("is_demo", False)})
    await board.set_agent_status(name, "completed")
    await emit(callback, "agent_completed", name, result.get("summary", "Market data checked."), result={"source": result.get("source"), "trend": result.get("trend"), "is_demo": result.get("is_demo")})
    return result
