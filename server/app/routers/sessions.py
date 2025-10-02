from fastapi import APIRouter, Request

router = APIRouter()

@router.get("")
def get_session(request: Request):
    return {"userId": request.cookies.get("elice_session")}


