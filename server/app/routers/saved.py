from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import SavedItem

router = APIRouter()

@router.get("")
def list_saved(request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("elice_session")
    items = db.query(SavedItem).filter(SavedItem.session_id == session_id).all()
    return {"items": [
        {
            "id": item.resource_id,
            "title": item.title,
            "author": item.author,
            "year": item.year,
            "source": item.source,
            "url": item.url,  # Include URL
        } for item in items
    ]}

@router.post("")
def add_saved(payload: dict, request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("elice_session")
    resource_id = payload.get("id")
    title = payload.get("title")
    if not resource_id or not title:
        raise HTTPException(status_code=400, detail="Missing id or title")
    author = payload.get("author")
    year = payload.get("year")
    source = payload.get("source") or "openlibrary"
    url = payload.get("url")  # Get URL from payload

    exists = db.query(SavedItem).filter(
        SavedItem.session_id == session_id,
        SavedItem.resource_id == resource_id
    ).first()
    if not exists:
        db.add(SavedItem(
            session_id=session_id,
            resource_id=resource_id,
            title=title,
            author=author,
            year=str(year) if year is not None else None,
            source=source,
            url=url,  # Save URL
        ))
        db.commit()
    return {"ok": True}

@router.delete("/{resource_id}")
def delete_saved(resource_id: str, request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("elice_session")
    db.query(SavedItem).filter(
        SavedItem.session_id == session_id,
        SavedItem.resource_id == resource_id
    ).delete()
    db.commit()
    return {"ok": True}
