from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Upload(Base):
    __tablename__ = "uploads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    record_count: Mapped[int] = mapped_column(Integer, default=0)

    incidents: Mapped[list["Incident"]] = relationship(
        "Incident", back_populates="upload", cascade="all, delete-orphan"
    )


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    rut: Mapped[str | None] = mapped_column(String, nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    position: Mapped[str | None] = mapped_column(String, nullable=True)
    work_center: Mapped[str | None] = mapped_column(String, nullable=True)
    attention_type: Mapped[str | None] = mapped_column(String, nullable=True)
    time_type: Mapped[str | None] = mapped_column(String, nullable=True)
    lost_days: Mapped[int] = mapped_column(Integer, default=0)
    sex: Mapped[str | None] = mapped_column(String, nullable=True)
    incident_type: Mapped[str | None] = mapped_column(String, nullable=True)
    classifier: Mapped[str | None] = mapped_column(String, nullable=True)
    body_part: Mapped[str | None] = mapped_column(String, nullable=True)
    observation: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[date | None] = mapped_column(Date, nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    attention_cost: Mapped[float] = mapped_column(Float, default=0.0)
    medicine_cost: Mapped[float] = mapped_column(Float, default=0.0)
    days_not_worked: Mapped[float] = mapped_column(Float, default=0.0)
    cost_per_day_not_worked: Mapped[float] = mapped_column(Float, default=0.0)
    total_cost: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    final_status: Mapped[str | None] = mapped_column(String, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    upload_id: Mapped[int] = mapped_column(Integer, ForeignKey("uploads.id"), nullable=False)

    upload: Mapped["Upload"] = relationship("Upload", back_populates="incidents")
