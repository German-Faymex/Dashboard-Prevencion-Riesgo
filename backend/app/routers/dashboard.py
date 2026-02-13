import math
from datetime import date, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Incident
from app.schemas import (
    AlertItem,
    BodyMapResponse,
    BodyPartDetail,
    ChartDataItem,
    ChartsResponse,
    IncidentBrief,
    IncidentItem,
    IncidentListResponse,
    KPIResponse,
    MonthlyDataItem,
    TrendsResponse,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _apply_filters(query, filters: dict):
    if filters.get("date_from"):
        try:
            d = datetime.strptime(filters["date_from"], "%Y-%m-%d").date()
            query = query.where(Incident.date >= d)
        except ValueError:
            pass

    if filters.get("date_to"):
        try:
            d = datetime.strptime(filters["date_to"], "%Y-%m-%d").date()
            query = query.where(Incident.date <= d)
        except ValueError:
            pass

    if filters.get("work_center"):
        query = query.where(Incident.work_center == filters["work_center"])

    if filters.get("position"):
        query = query.where(Incident.position == filters["position"])

    if filters.get("incident_type"):
        query = query.where(Incident.incident_type == filters["incident_type"])

    if filters.get("classifier"):
        query = query.where(Incident.classifier == filters["classifier"])

    if filters.get("body_part"):
        query = query.where(Incident.body_part == filters["body_part"])

    if filters.get("final_status"):
        query = query.where(Incident.final_status == filters["final_status"])

    return query


def _get_filter_params(
    date_from: str | None = None,
    date_to: str | None = None,
    work_center: str | None = None,
    position: str | None = None,
    incident_type: str | None = None,
    classifier: str | None = None,
    body_part: str | None = None,
    final_status: str | None = None,
) -> dict:
    return {
        "date_from": date_from,
        "date_to": date_to,
        "work_center": work_center,
        "position": position,
        "incident_type": incident_type,
        "classifier": classifier,
        "body_part": body_part,
        "final_status": final_status,
    }


@router.get("/kpis", response_model=KPIResponse)
async def get_kpis(
    db: AsyncSession = Depends(get_db),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    work_center: str | None = Query(None),
    position: str | None = Query(None),
    incident_type: str | None = Query(None),
    classifier: str | None = Query(None),
    body_part: str | None = Query(None),
    final_status: str | None = Query(None),
):
    filters = _get_filter_params(
        date_from, date_to, work_center, position, incident_type,
        classifier, body_part, final_status,
    )

    base = select(Incident)
    base = _apply_filters(base, filters)

    total_q = select(func.count()).select_from(base.subquery())
    total_result = await db.execute(total_q)
    total_all = total_result.scalar() or 0

    incident_q = select(func.count()).select_from(
        _apply_filters(
            select(Incident).where(Incident.incident_type == "INCIDENTE"), filters
        ).subquery()
    )
    incidents_result = await db.execute(incident_q)
    total_incidents = incidents_result.scalar() or 0

    accident_q = select(func.count()).select_from(
        _apply_filters(
            select(Incident).where(Incident.incident_type == "ACCIDENTE"), filters
        ).subquery()
    )
    accidents_result = await db.execute(accident_q)
    total_accidents = accidents_result.scalar() or 0

    agg_q = select(
        func.coalesce(func.sum(Incident.lost_days), 0),
        func.coalesce(func.sum(Incident.total_cost), 0.0),
        func.coalesce(func.avg(Incident.age), 0.0),
    )
    agg_q = _apply_filters(agg_q, filters)
    agg_result = await db.execute(agg_q)
    agg_row = agg_result.one()
    total_lost_days = int(agg_row[0])
    total_cost = float(agg_row[1])
    avg_age = round(float(agg_row[2]), 1)

    active_q = select(func.count()).select_from(
        _apply_filters(
            select(Incident).where(Incident.final_status == "EN PROCESO"), filters
        ).subquery()
    )
    active_result = await db.execute(active_q)
    active_cases = active_result.scalar() or 0

    today = date.today()
    current_month_start = today.replace(day=1)
    if today.month == 1:
        prev_month_start = today.replace(year=today.year - 1, month=12, day=1)
    else:
        prev_month_start = today.replace(month=today.month - 1, day=1)
    prev_month_end = current_month_start

    current_month_q = select(
        func.count(),
        func.coalesce(func.sum(Incident.total_cost), 0.0),
    )
    current_month_q = _apply_filters(current_month_q, filters)
    current_month_q = current_month_q.where(Incident.date >= current_month_start)
    cm_result = await db.execute(current_month_q)
    cm_row = cm_result.one()
    incidents_this_month = cm_row[0] or 0
    cost_this_month = float(cm_row[1])

    prev_month_q = select(
        func.count(),
        func.coalesce(func.sum(Incident.total_cost), 0.0),
    )
    prev_month_q = _apply_filters(prev_month_q, filters)
    prev_month_q = prev_month_q.where(
        Incident.date >= prev_month_start,
        Incident.date < prev_month_end,
    )
    pm_result = await db.execute(prev_month_q)
    pm_row = pm_result.one()
    incidents_prev_month = pm_row[0] or 0
    cost_prev_month = float(pm_row[1])

    return KPIResponse(
        total_incidents=total_incidents,
        total_accidents=total_accidents,
        total_lost_days=total_lost_days,
        total_cost=total_cost,
        active_cases=active_cases,
        avg_age=avg_age,
        incidents_this_month=incidents_this_month,
        incidents_prev_month=incidents_prev_month,
        cost_this_month=cost_this_month,
        cost_prev_month=cost_prev_month,
    )


@router.get("/charts", response_model=ChartsResponse)
async def get_charts(
    db: AsyncSession = Depends(get_db),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    work_center: str | None = Query(None),
    position: str | None = Query(None),
    incident_type: str | None = Query(None),
    classifier: str | None = Query(None),
    body_part: str | None = Query(None),
    final_status: str | None = Query(None),
):
    filters = _get_filter_params(
        date_from, date_to, work_center, position, incident_type,
        classifier, body_part, final_status,
    )

    async def _group_count(column):
        q = select(column, func.count().label("cnt"))
        q = _apply_filters(q, filters)
        q = q.where(column.isnot(None)).group_by(column).order_by(func.count().desc())
        result = await db.execute(q)
        return [ChartDataItem(name=row[0], count=row[1]) for row in result.all()]

    async def _group_cost(column):
        q = select(
            column,
            func.count().label("cnt"),
            func.coalesce(func.sum(Incident.total_cost), 0.0).label("cost"),
        )
        q = _apply_filters(q, filters)
        q = q.where(column.isnot(None)).group_by(column).order_by(func.sum(Incident.total_cost).desc())
        result = await db.execute(q)
        return [
            ChartDataItem(name=row[0], count=row[1], total_cost=round(float(row[2]), 2))
            for row in result.all()
        ]

    by_type = await _group_count(Incident.incident_type)
    by_classifier = await _group_count(Incident.classifier)
    by_work_center = await _group_count(Incident.work_center)
    by_position = await _group_count(Incident.position)
    by_sex = await _group_count(Incident.sex)
    by_attention = await _group_count(Incident.attention_type)
    cost_by_classifier = await _group_cost(Incident.classifier)

    month_q = select(
        Incident.year,
        extract("month", Incident.date).label("month_num"),
        func.count().label("total"),
        func.sum(case((Incident.incident_type == "INCIDENTE", 1), else_=0)).label("inc"),
        func.sum(case((Incident.incident_type == "ACCIDENTE", 1), else_=0)).label("acc"),
        func.coalesce(func.sum(Incident.total_cost), 0.0).label("cost"),
    )
    month_q = _apply_filters(month_q, filters)
    month_q = month_q.where(Incident.date.isnot(None), Incident.year.isnot(None))
    month_q = month_q.group_by(Incident.year, extract("month", Incident.date))
    month_q = month_q.order_by(Incident.year, extract("month", Incident.date))
    month_result = await db.execute(month_q)

    month_names = [
        "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ]
    by_month = []
    for row in month_result.all():
        month_idx = int(row[1])
        by_month.append(
            MonthlyDataItem(
                month=month_names[month_idx] if 1 <= month_idx <= 12 else str(month_idx),
                year=int(row[0]),
                incidents=int(row[3]),
                accidents=int(row[4]),
                cost=round(float(row[5]), 2),
            )
        )

    return ChartsResponse(
        by_type=by_type,
        by_classifier=by_classifier,
        by_work_center=by_work_center,
        by_position=by_position,
        by_month=by_month,
        by_sex=by_sex,
        by_attention=by_attention,
        cost_by_classifier=cost_by_classifier,
    )


@router.get("/body-map", response_model=BodyMapResponse)
async def get_body_map(
    db: AsyncSession = Depends(get_db),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    work_center: str | None = Query(None),
    position: str | None = Query(None),
    incident_type: str | None = Query(None),
    classifier: str | None = Query(None),
    body_part: str | None = Query(None),
    final_status: str | None = Query(None),
):
    filters = _get_filter_params(
        date_from, date_to, work_center, position, incident_type,
        classifier, body_part, final_status,
    )

    count_q = select(func.count())
    count_q = _apply_filters(count_q, filters)
    count_q = count_q.where(Incident.body_part.isnot(None))
    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0

    group_q = select(Incident.body_part, func.count().label("cnt"))
    group_q = _apply_filters(group_q, filters)
    group_q = group_q.where(Incident.body_part.isnot(None))
    group_q = group_q.group_by(Incident.body_part).order_by(func.count().desc())
    group_result = await db.execute(group_q)

    parts = []
    for row in group_result.all():
        part_name = row[0]
        part_count = row[1]
        percentage = round((part_count / total * 100), 1) if total > 0 else 0.0

        detail_q = select(
            Incident.id, Incident.name, Incident.date,
            Incident.incident_type, Incident.classifier,
        )
        detail_q = _apply_filters(detail_q, filters)
        detail_q = detail_q.where(Incident.body_part == part_name)
        detail_result = await db.execute(detail_q)

        incidents = [
            IncidentBrief(
                id=r[0],
                name=r[1],
                date=r[2],
                incident_type=r[3],
                classifier=r[4],
            )
            for r in detail_result.all()
        ]

        parts.append(
            BodyPartDetail(
                name=part_name,
                count=part_count,
                percentage=percentage,
                incidents=incidents,
            )
        )

    return BodyMapResponse(parts=parts)


@router.get("/trends", response_model=TrendsResponse)
async def get_trends(
    db: AsyncSession = Depends(get_db),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    work_center: str | None = Query(None),
    position: str | None = Query(None),
    incident_type: str | None = Query(None),
    classifier: str | None = Query(None),
    body_part: str | None = Query(None),
    final_status: str | None = Query(None),
):
    filters = _get_filter_params(
        date_from, date_to, work_center, position, incident_type,
        classifier, body_part, final_status,
    )

    today = date.today()
    current_month_start = today.replace(day=1)
    if today.month == 1:
        prev_month_start = today.replace(year=today.year - 1, month=12, day=1)
    else:
        prev_month_start = today.replace(month=today.month - 1, day=1)
    prev_month_end = current_month_start

    cm_q = select(
        func.count(),
        func.coalesce(func.sum(Incident.total_cost), 0.0),
    )
    cm_q = _apply_filters(cm_q, filters)
    cm_q = cm_q.where(Incident.date >= current_month_start)
    cm_result = await db.execute(cm_q)
    cm_row = cm_result.one()
    current_count = cm_row[0] or 0
    current_cost = float(cm_row[1])

    pm_q = select(
        func.count(),
        func.coalesce(func.sum(Incident.total_cost), 0.0),
    )
    pm_q = _apply_filters(pm_q, filters)
    pm_q = pm_q.where(
        Incident.date >= prev_month_start,
        Incident.date < prev_month_end,
    )
    pm_result = await db.execute(pm_q)
    pm_row = pm_result.one()
    prev_count = pm_row[0] or 0
    prev_cost = float(pm_row[1])

    if prev_count > 0:
        month_over_month_change = round(
            ((current_count - prev_count) / prev_count) * 100, 1
        )
    else:
        month_over_month_change = 100.0 if current_count > 0 else 0.0

    if prev_cost > 0:
        cost_trend = round(((current_cost - prev_cost) / prev_cost) * 100, 1)
    else:
        cost_trend = 100.0 if current_cost > 0 else 0.0

    bp_q = select(Incident.body_part, func.count().label("cnt"))
    bp_q = _apply_filters(bp_q, filters)
    bp_q = bp_q.where(Incident.body_part.isnot(None))
    bp_q = bp_q.group_by(Incident.body_part).order_by(func.count().desc()).limit(1)
    bp_result = await db.execute(bp_q)
    bp_row = bp_result.first()
    most_affected_body_part = bp_row[0] if bp_row else None
    most_affected_count = bp_row[1] if bp_row else 0

    cl_q = select(Incident.classifier, func.count().label("cnt"))
    cl_q = _apply_filters(cl_q, filters)
    cl_q = cl_q.where(Incident.classifier.isnot(None))
    cl_q = cl_q.group_by(Incident.classifier).order_by(func.count().desc()).limit(1)
    cl_result = await db.execute(cl_q)
    cl_row = cl_result.first()
    most_common_classifier = cl_row[0] if cl_row else None

    active_q = select(func.count())
    active_q = _apply_filters(active_q, filters)
    active_q = active_q.where(Incident.final_status == "EN PROCESO")
    active_result = await db.execute(active_q)
    active_cases = active_result.scalar() or 0

    alerts: list[AlertItem] = []

    if month_over_month_change > 20:
        alerts.append(
            AlertItem(
                type="incident_increase",
                message=f"Incremento significativo de incidentes: {month_over_month_change}% respecto al mes anterior",
                severity="warning",
            )
        )

    if most_affected_body_part and most_affected_count > 3:
        alerts.append(
            AlertItem(
                type="body_part",
                message=f"Parte del cuerpo más afectada: {most_affected_body_part} con {most_affected_count} registros",
                severity="warning",
            )
        )

    if prev_cost > 0 and current_cost > prev_cost * 1.5:
        alerts.append(
            AlertItem(
                type="cost_increase",
                message=f"Incremento significativo de costos: ${current_cost:,.0f} este mes vs ${prev_cost:,.0f} mes anterior",
                severity="danger",
            )
        )

    if active_cases > 5:
        alerts.append(
            AlertItem(
                type="pending_cases",
                message=f"Hay {active_cases} casos en proceso pendientes de resolución",
                severity="info",
            )
        )

    return TrendsResponse(
        month_over_month_change=month_over_month_change,
        cost_trend=cost_trend,
        most_affected_body_part=most_affected_body_part,
        most_common_classifier=most_common_classifier,
        alerts=alerts,
    )


@router.get("/incidents", response_model=IncidentListResponse)
async def get_incidents(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    sort_by: str | None = Query(None),
    sort_order: str = Query("desc"),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    work_center: str | None = Query(None),
    position: str | None = Query(None),
    incident_type: str | None = Query(None),
    classifier: str | None = Query(None),
    body_part: str | None = Query(None),
    final_status: str | None = Query(None),
):
    filters = _get_filter_params(
        date_from, date_to, work_center, position, incident_type,
        classifier, body_part, final_status,
    )

    base = select(Incident)
    base = _apply_filters(base, filters)

    if search:
        search_pattern = f"%{search}%"
        base = base.where(
            Incident.name.ilike(search_pattern)
            | Incident.rut.ilike(search_pattern)
            | Incident.observation.ilike(search_pattern)
        )

    count_q = select(func.count()).select_from(base.subquery())
    count_result = await db.execute(count_q)
    total = count_result.scalar() or 0

    allowed_sort_fields = {
        "id", "number", "name", "date", "age", "lost_days",
        "total_cost", "work_center", "incident_type", "classifier",
        "body_part", "final_status",
    }
    if sort_by and sort_by in allowed_sort_fields:
        col = getattr(Incident, sort_by)
        base = base.order_by(col.desc() if sort_order == "desc" else col.asc())
    else:
        base = base.order_by(Incident.id.desc())

    offset = (page - 1) * size
    base = base.offset(offset).limit(size)

    result = await db.execute(base)
    items = result.scalars().all()

    pages = math.ceil(total / size) if total > 0 else 1

    return IncidentListResponse(
        items=[IncidentItem.model_validate(item) for item in items],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )
