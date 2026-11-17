import asyncio
import json
from datetime import timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import AdvisoryRun, AgentEvent
from app.schemas.advisory import AdvisoryRequest
from app.orchestration.workflow import run_advisory

router = APIRouter(prefix="/api", tags=["advisories"])


@router.post("/advisories")
async def create_advisory(payload: AdvisoryRequest):
    try:
        return await run_advisory(payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Advisory workflow failed: {type(exc).__name__}") from exc


@router.post("/advisories/stream")
async def create_advisory_stream(payload: AdvisoryRequest):
    queue: asyncio.Queue = asyncio.Queue()

    async def on_event(event: dict):
        await queue.put(event)

    async def execute():
        try:
            await run_advisory(payload.model_dump(), on_event)
        except Exception as exc:
            await queue.put({"type": "workflow_error", "agent": "Control Room", "message": f"Workflow error: {type(exc).__name__}: {exc}"})
        finally:
            await queue.put(None)

    async def stream():
        task = asyncio.create_task(execute())
        try:
            while True:
                item = await queue.get()
                if item is None:
                    break
                yield f"data: {json.dumps(item, ensure_ascii=False, default=str)}\n\n"
        finally:
            if not task.done():
                task.cancel()

    return StreamingResponse(stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.get("/history")
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    items = db.query(AdvisoryRun).order_by(AdvisoryRun.created_at.desc()).limit(min(limit, 100)).all()
    return [{"id": item.id, "crop": item.crop, "location": item.location, "stage": item.stage, "land_area": item.land_area, "created_at": item.created_at.isoformat(), "status": item.status} for item in items]


@router.get("/advisories/{run_id}")
def get_advisory(run_id: str, db: Session = Depends(get_db)):
    item = db.query(AdvisoryRun).filter(AdvisoryRun.id == run_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Advisory not found")
    events = db.query(AgentEvent).filter(AgentEvent.run_id == run_id).order_by(AgentEvent.id.asc()).all()
    return {"report": json.loads(item.report_json), "events": [{"agent": e.agent, "type": e.event_type, "message": e.message, "timestamp": e.created_at.isoformat()} for e in events]}
