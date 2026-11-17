from fastapi import APIRouter, Query
from app.tools.market_tools import fetch_mandi_prices

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/prices")
async def market_prices(crop: str = Query("Wheat"), location: str = Query("Punjab")):
    return await fetch_mandi_prices(crop, location)


@router.get("/trends")
async def market_trends(crop: str = Query("Wheat"), location: str = Query("Punjab")):
    data = await fetch_mandi_prices(crop, location)
    return {"crop": crop, "location": location, "trend": data.get("trend"), "observations": data.get("observations", []), "source": data.get("source"), "is_demo": data.get("is_demo", False)}
