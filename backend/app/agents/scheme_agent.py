from typing import Any
from app.agents.common import emit, EventCallback
from app.orchestration.blackboard import AdvisoryBlackboard
from app.tools.scheme_tools import retrieve_scheme_documents, check_scheme_eligibility
from app.agents.framework_adapter import refine_with_agent


async def run(board: AdvisoryBlackboard, callback: EventCallback | None = None) -> list[dict[str, Any]]:
    name = "Scheme Agent"
    await board.set_agent_status(name, "working")
    await emit(callback, "agent_started", name, "Searching the local scheme knowledge base for relevant official references.")
    state = await board.snapshot()
    farmer = state["farmer"]
    query = f"Agricultural schemes for {farmer['crop']} farmers in India. Farmer location {farmer['location']}. Land size {farmer['land_area']} {farmer.get('unit', 'acres')}. Crop stage {farmer['stage']}."
    await emit(callback, "tool_call", name, "retrieve_scheme_documents()", tool="retrieve_scheme_documents")
    retrieved = retrieve_scheme_documents(query, limit=6)
    await emit(callback, "tool_call", name, "check_scheme_eligibility()", tool="check_scheme_eligibility")
    matches = check_scheme_eligibility(farmer, retrieved)
    await refine_with_agent(
        "KhetSathi Scheme Agent",
        "Summarize retrieved scheme passages only. Do not assert eligibility or invent official requirements.",
        f"Review these retrieved passages and potential matches, preserving source references: {matches}",
        tools=[retrieve_scheme_documents, check_scheme_eligibility],
    )
    await board.write("schemes", matches)
    for item in matches:
        await board.append("sources", {"name": item.get("source"), "type": "scheme_document", "page": item.get("page"), "demo": False})
    await board.set_agent_status(name, "completed")
    await emit(callback, "agent_completed", name, f"Retrieved {len(matches)} potentially relevant scheme reference(s).", result=matches)
    return matches
