"""Optional Microsoft Agent Framework + Gemini adapter.

The project keeps its specialist tools deterministic and auditable. When a Google API
key is configured, each specialist can also use a Microsoft Agent Framework ChatAgent
for language refinement. This keeps the workflow usable in offline/demo mode too.
"""
from functools import lru_cache
from typing import Any
import asyncio
from app.core.config import settings


_framework_run_lock = asyncio.Lock()

@lru_cache(maxsize=1)
def _client_and_framework():
    if not settings.google_api_key:
        return None, "GOOGLE_API_KEY is not configured; using deterministic agent mode."
    try:
        from agent_framework import ChatAgent
        from agent_framework.gemini import GeminiChatClient
        client = GeminiChatClient()
        return (ChatAgent, client), None
    except Exception as exc:  # graceful startup if optional prerelease connector changes
        return None, f"Microsoft Agent Framework connector unavailable: {type(exc).__name__}: {exc}"


async def refine_with_agent(name: str, instructions: str, prompt: str, tools: list[Any] | None = None) -> str | None:
    framework, error = _client_and_framework()
    if framework is None:
        return None
    ChatAgent, client = framework
    try:
        agent = ChatAgent(
            chat_client=client,
            name=name,
            instructions=instructions,
            tools=tools or [],
        )
        async with _framework_run_lock:
            result = await agent.run(prompt)
        return getattr(result, "text", str(result)).strip()
    except Exception:
        # A provider quota/network issue must not break the deterministic workflow.
        return None


def framework_status() -> dict[str, Any]:
    framework, error = _client_and_framework()
    return {
        "enabled": framework is not None,
        "provider": "Microsoft Agent Framework + Gemini" if framework else "Deterministic demo mode",
        "model": settings.google_model if framework else None,
        "message": "Gemini-backed agent reasoning is enabled." if framework else error,
    }
