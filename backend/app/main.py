from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.db import Base, engine
from app.api.advisories import router as advisory_router
from app.api.market import router as market_router
from app.api.schemes import router as schemes_router
from app.api.weather import router as weather_router
from app.agents.framework_adapter import framework_status


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", description="Multi-agent agricultural advisory control room", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(advisory_router)
app.include_router(market_router)
app.include_router(schemes_router)
app.include_router(weather_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "application": settings.app_name, "agent_framework": framework_status(), "demo_mode": settings.demo_mode}


@app.get("/")
def root():
    return {"message": "KhetSathi AI API is running", "docs": "/docs"}
