from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database.db import Base


class AdvisoryRun(Base):
    __tablename__ = "advisory_runs"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    crop: Mapped[str] = mapped_column(String(40), index=True)
    location: Mapped[str] = mapped_column(String(120), index=True)
    stage: Mapped[str] = mapped_column(String(60))
    land_area: Mapped[float] = mapped_column()
    status: Mapped[str] = mapped_column(String(24), default="completed")
    report_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)


class AgentEvent(Base):
    __tablename__ = "agent_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(String(40), index=True)
    agent: Mapped[str] = mapped_column(String(80))
    event_type: Mapped[str] = mapped_column(String(40))
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
