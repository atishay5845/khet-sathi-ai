from typing import Any, Awaitable, Callable
EventCallback = Callable[[dict[str, Any]], Awaitable[None]]


async def emit(callback: EventCallback | None, event_type: str, agent: str, message: str, **extra: Any) -> None:
    if callback:
        await callback({"type": event_type, "agent": agent, "message": message, **extra})
