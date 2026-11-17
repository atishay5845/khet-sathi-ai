from typing import Any
from app.rag.retriever import retrieve_passages


def retrieve_scheme_documents(query: str, limit: int = 4) -> list[dict[str, Any]]:
    """Retrieve grounded scheme passages from local documents using ChromaDB + embeddings."""
    return retrieve_passages(query, limit=limit)


def check_scheme_eligibility(farmer: dict[str, Any], retrieved: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return cautious matches based only on the collected documents and provided inputs."""
    output = []
    for item in retrieved:
        text = item["text"]
        lowered = text.lower()
        name = "PM-KISAN" if "pm-kisan" in lowered else "PMFBY" if "fasal bima" in lowered or "pmfby" in lowered else "Kisan Credit Card" if "kisan credit card" in lowered or "kcc" in lowered else "PMKSY" if "sinchayee" in lowered or "pmksy" in lowered else "Agricultural scheme"
        output.append({
            "name": name,
            "status": "Potential match — verify conditions",
            "reason": "The retrieved official reference may be relevant to the selected farming context. Personal eligibility cannot be confirmed from the available inputs alone.",
            "evidence": item["text"][:720],
            "source": item.get("source"),
            "page": item.get("page"),
        })
    unique = {}
    for item in output:
        unique.setdefault(item["name"], item)
    return list(unique.values())
