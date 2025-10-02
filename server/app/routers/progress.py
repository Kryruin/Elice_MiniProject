from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime

from ..db import get_db
from ..models import Progress

router = APIRouter()

@router.get("")
def list_progress(request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("elice_session")
    rows = db.query(Progress).filter(Progress.session_id == session_id).all()
    return {"progress": {
        row.resource_id: {
            "status": row.status,
            "percent": row.percent,
            "updatedAt": row.updated_at.isoformat(),
        }
        for row in rows
    }}

@router.put("/{resource_id}")
def upsert_progress(resource_id: str, payload: dict, request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("elice_session")
    status = str(payload.get("status") or "in_progress")
    percent = float(payload.get("percent") or 0)
    percent = max(0.0, min(100.0, percent))

    row = db.query(Progress).filter(
        Progress.session_id == session_id,
        Progress.resource_id == resource_id,
    ).first()
    if not row:
        row = Progress(
            session_id=session_id,
            resource_id=resource_id,
            status=status,
            percent=percent,
            updated_at=datetime.utcnow(),
        )
        db.add(row)
    else:
        row.status = status
        row.percent = percent
        row.updated_at = datetime.utcnow()
    db.commit()
    return {"ok": True}
