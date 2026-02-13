from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Incident, Upload
from app.schemas import UploadListItem, UploadResponse
from app.services.excel_parser import parse_excel

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No se proporcionó un archivo")

    valid_extensions = (".xlsx", ".xlsm", ".xls")
    if not file.filename.lower().endswith(valid_extensions):
        raise HTTPException(
            status_code=400,
            detail="Formato de archivo no soportado. Use .xlsx o .xlsm",
        )

    content = await file.read()
    try:
        records = parse_excel(content, file.filename)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error al procesar el archivo Excel: {str(e)}",
        )

    if not records:
        raise HTTPException(
            status_code=400,
            detail="No se encontraron registros válidos en el archivo",
        )

    upload = Upload(filename=file.filename, record_count=len(records))
    db.add(upload)
    await db.flush()

    incidents = [Incident(upload_id=upload.id, **record) for record in records]
    db.add_all(incidents)
    await db.commit()

    total_result = await db.execute(select(func.count(Incident.id)))
    total_records = total_result.scalar() or 0

    return UploadResponse(
        upload_id=upload.id,
        filename=file.filename,
        records_added=len(records),
        total_records=total_records,
    )


@router.get("/uploads", response_model=list[UploadListItem])
async def list_uploads(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Upload).order_by(Upload.uploaded_at.desc()))
    uploads = result.scalars().all()
    return uploads


@router.delete("/uploads/{upload_id}")
async def delete_upload(upload_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Upload).where(Upload.id == upload_id))
    upload = result.scalar_one_or_none()

    if not upload:
        raise HTTPException(status_code=404, detail="Upload no encontrado")

    await db.delete(upload)
    await db.commit()

    return {"detail": "Upload y registros asociados eliminados correctamente"}
