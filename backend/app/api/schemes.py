from fastapi import APIRouter, Query
from app.tools.scheme_tools import retrieve_scheme_documents

router = APIRouter(prefix="/api/schemes", tags=["schemes"])


@router.get("")
def search_schemes(q: str = Query("farmer agricultural support")):
    return {"query": q, "results": retrieve_scheme_documents(q, limit=10)}
