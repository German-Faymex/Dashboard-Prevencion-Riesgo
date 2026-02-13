from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Incident

router = APIRouter(prefix="/api", tags=["export"])


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


EXPORT_COLUMNS = [
    ("N°", "number"),
    ("Nombre", "name"),
    ("Rut", "rut"),
    ("Edad", "age"),
    ("Cargo", "position"),
    ("Centro de Trabajo", "work_center"),
    ("Atención", "attention_type"),
    ("Tiempo", "time_type"),
    ("Días Perdidos", "lost_days"),
    ("Sexo", "sex"),
    ("Tipo", "incident_type"),
    ("Tipificador", "classifier"),
    ("Parte del Cuerpo", "body_part"),
    ("Observación", "observation"),
    ("Fecha", "date"),
    ("Año", "year"),
    ("Gasto Atención", "attention_cost"),
    ("Gasto Remedios", "medicine_cost"),
    ("Días No Trabajados", "days_not_worked"),
    ("Gasto Día No Trabajado", "cost_per_day_not_worked"),
    ("Gasto Total", "total_cost"),
    ("Estado", "status"),
    ("Estado Final", "final_status"),
]


@router.get("/export/excel")
async def export_excel(
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
    import xlsxwriter

    filters = {
        "date_from": date_from,
        "date_to": date_to,
        "work_center": work_center,
        "position": position,
        "incident_type": incident_type,
        "classifier": classifier,
        "body_part": body_part,
        "final_status": final_status,
    }

    query = select(Incident)
    query = _apply_filters(query, filters)
    query = query.order_by(Incident.id)
    result = await db.execute(query)
    incidents = result.scalars().all()

    output = BytesIO()
    workbook = xlsxwriter.Workbook(output, {"in_memory": True})
    worksheet = workbook.add_worksheet("Incidentes")

    header_format = workbook.add_format({
        "bold": True,
        "bg_color": "#1F4E79",
        "font_color": "#FFFFFF",
        "border": 1,
        "text_wrap": True,
        "valign": "vcenter",
    })
    date_format = workbook.add_format({"num_format": "dd/mm/yyyy"})
    money_format = workbook.add_format({"num_format": "$#,##0.00"})

    for col_idx, (header, _) in enumerate(EXPORT_COLUMNS):
        worksheet.write(0, col_idx, header, header_format)

    for row_idx, incident in enumerate(incidents, start=1):
        for col_idx, (_, field) in enumerate(EXPORT_COLUMNS):
            value = getattr(incident, field, None)

            if field == "date" and value is not None:
                worksheet.write_datetime(row_idx, col_idx, datetime.combine(value, datetime.min.time()), date_format)
            elif field in ("attention_cost", "medicine_cost", "cost_per_day_not_worked", "total_cost"):
                worksheet.write_number(row_idx, col_idx, float(value or 0), money_format)
            elif isinstance(value, (int, float)):
                worksheet.write_number(row_idx, col_idx, value)
            else:
                worksheet.write(row_idx, col_idx, str(value) if value is not None else "")

    for col_idx, (header, _) in enumerate(EXPORT_COLUMNS):
        worksheet.set_column(col_idx, col_idx, max(len(header) + 2, 12))

    workbook.close()
    output.seek(0)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"incidentes_{timestamp}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
