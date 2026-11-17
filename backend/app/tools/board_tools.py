from typing import Any


def read_advisory_board(board: dict[str, Any]) -> dict[str, Any]:
    return {key: board.get(key) for key in ("farmer", "weather", "market", "crop_advice", "schemes", "risk_alerts", "sources")}


def validate_and_compile_report(board: dict[str, Any]) -> dict[str, Any]:
    missing = [key for key in ("weather", "market", "crop_advice") if not board.get(key)]
    return {"ready": not missing, "missing_sections": missing, "sources_count": len(board.get("sources", []))}
