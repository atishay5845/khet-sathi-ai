import asyncio
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any


class AdvisoryBlackboard:
    """Shared state used by every specialist agent in one advisory run."""

    def __init__(self, run_id: str, farmer: dict[str, Any]):
        self.run_id = run_id
        self._state: dict[str, Any] = {
            "run_id": run_id,
            "farmer": farmer,
            "weather": None,
            "crop_advice": None,
            "market": None,
            "schemes": [],
            "risk_alerts": [],
            "agent_status": {},
            "sources": [],
            "final_advisory": None,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        self._lock = asyncio.Lock()

    async def write(self, section: str, value: Any) -> None:
        async with self._lock:
            self._state[section] = value
            self._state["updated_at"] = datetime.now(timezone.utc).isoformat()

    async def append(self, section: str, value: Any) -> None:
        async with self._lock:
            self._state.setdefault(section, []).append(value)
            self._state["updated_at"] = datetime.now(timezone.utc).isoformat()

    async def set_agent_status(self, agent: str, status: str) -> None:
        async with self._lock:
            self._state["agent_status"][agent] = status
            self._state["updated_at"] = datetime.now(timezone.utc).isoformat()

    async def snapshot(self) -> dict[str, Any]:
        async with self._lock:
            return deepcopy(self._state)
