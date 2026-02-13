import datetime
from typing import Optional

from pydantic import BaseModel


class UploadResponse(BaseModel):
    upload_id: int
    filename: str
    records_added: int
    total_records: int


class UploadListItem(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime.datetime
    record_count: int

    model_config = {"from_attributes": True}


class KPIResponse(BaseModel):
    total_incidents: int = 0
    total_accidents: int = 0
    total_lost_days: int = 0
    total_cost: float = 0.0
    active_cases: int = 0
    avg_age: float = 0.0
    incidents_this_month: int = 0
    incidents_prev_month: int = 0
    cost_this_month: float = 0.0
    cost_prev_month: float = 0.0


class ChartDataItem(BaseModel):
    name: str
    count: Optional[int] = None
    total_cost: Optional[float] = None


class MonthlyDataItem(BaseModel):
    month: str
    year: int
    incidents: int = 0
    accidents: int = 0
    cost: float = 0.0


class ChartsResponse(BaseModel):
    by_type: list[ChartDataItem] = []
    by_classifier: list[ChartDataItem] = []
    by_work_center: list[ChartDataItem] = []
    by_position: list[ChartDataItem] = []
    by_month: list[MonthlyDataItem] = []
    by_sex: list[ChartDataItem] = []
    by_attention: list[ChartDataItem] = []
    cost_by_classifier: list[ChartDataItem] = []


class IncidentBrief(BaseModel):
    id: int
    name: Optional[str] = None
    date: Optional[datetime.date] = None
    incident_type: Optional[str] = None
    classifier: Optional[str] = None


class BodyPartDetail(BaseModel):
    name: str
    count: int
    percentage: float
    incidents: list[IncidentBrief] = []


class BodyMapResponse(BaseModel):
    parts: list[BodyPartDetail] = []


class AlertItem(BaseModel):
    type: str
    message: str
    severity: str


class TrendsResponse(BaseModel):
    month_over_month_change: float = 0.0
    cost_trend: float = 0.0
    most_affected_body_part: Optional[str] = None
    most_common_classifier: Optional[str] = None
    alerts: list[AlertItem] = []


class IncidentItem(BaseModel):
    id: int
    number: Optional[int] = None
    name: Optional[str] = None
    rut: Optional[str] = None
    age: Optional[int] = None
    position: Optional[str] = None
    work_center: Optional[str] = None
    attention_type: Optional[str] = None
    time_type: Optional[str] = None
    lost_days: int = 0
    sex: Optional[str] = None
    incident_type: Optional[str] = None
    classifier: Optional[str] = None
    body_part: Optional[str] = None
    observation: Optional[str] = None
    date: Optional[datetime.date] = None
    year: Optional[int] = None
    attention_cost: float = 0.0
    medicine_cost: float = 0.0
    days_not_worked: float = 0.0
    cost_per_day_not_worked: float = 0.0
    total_cost: float = 0.0
    status: Optional[str] = None
    final_status: Optional[str] = None
    image_url: Optional[str] = None
    upload_id: int

    model_config = {"from_attributes": True}


class IncidentListResponse(BaseModel):
    items: list[IncidentItem]
    total: int
    page: int
    size: int
    pages: int
