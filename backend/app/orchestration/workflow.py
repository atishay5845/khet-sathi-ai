import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable
from app.agents import intake_agent, weather_agent, market_agent, scheme_agent, crop_agent, risk_agent, coordinator_agent
from app.database.db import SessionLocal
from app.database.models import AdvisoryRun, AgentEvent
from app.orchestration.blackboard import AdvisoryBlackboard

EventCallback = Callable[[dict[str, Any]], Awaitable[None]]


async def run_advisory(farmer_input: dict[str, Any], callback: EventCallback | None = None) -> dict[str, Any]:
    run_id = f"KS-{uuid.uuid4().hex[:10].upper()}"
    initial_farmer = {
        "crop": farmer_input["crop"],
        "location": farmer_input["location"],
        "stage": farmer_input["stage"],
        "land_area": farmer_input["land_area"],
        "unit": farmer_input.get("unit", "acres"),
        "language": farmer_input.get("language", "English"),
    }
    board = AdvisoryBlackboard(run_id, initial_farmer)
    captured_events: list[dict[str, Any]] = []

    async def forward(event: dict[str, Any]) -> None:
        event = {**event, "run_id": run_id, "timestamp": datetime.now(timezone.utc).isoformat()}
        captured_events.append(event)
        if callback:
            await callback(event)

    await forward({"type": "workflow_started", "agent": "Control Room", "message": "New advisory run created. Initialising the shared blackboard."})
    await intake_agent.run(board, forward)

    # Weather, market and scheme discovery are independent blackboard workers.
    await asyncio.gather(
        weather_agent.run(board, forward),
        market_agent.run(board, forward),
        scheme_agent.run(board, forward),
    )

    # Crop and risk workers consume the weather result posted to shared state.
    await asyncio.gather(
        crop_agent.run(board, forward),
        risk_agent.run(board, forward),
    )

    report = await coordinator_agent.run(board, forward)
    report["run_id"] = run_id
    final_state = await board.snapshot()

    with SessionLocal() as db:
        db.add(AdvisoryRun(
            id=run_id,
            crop=final_state["farmer"]["crop"],
            location=final_state["farmer"]["location"],
            stage=final_state["farmer"]["stage"],
            land_area=final_state["farmer"]["land_area"],
            status="completed",
            report_json=json.dumps(report, ensure_ascii=False, default=str),
        ))
        for event in captured_events:
            db.add(AgentEvent(
                run_id=run_id,
                agent=event.get("agent", "Control Room"),
                event_type=event.get("type", "event"),
                message=event.get("message", ""),
            ))
        db.commit()

    await forward({"type": "workflow_completed", "agent": "Control Room", "message": "Advisory saved. All agent findings are available in the report.", "report": report})
    return report
