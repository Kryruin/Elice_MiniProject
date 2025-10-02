from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response
from datetime import timedelta
import uuid

from .routers import sessions, saved, progress, youtube

COOKIE_NAME = "elice_session"
FRONTEND_ORIGIN = "http://localhost:5173"

app = FastAPI(title="Elice Learning Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def ensure_session_cookie(request: Request, call_next):
    user_id = request.cookies.get(COOKIE_NAME)
    set_cookie = False
    if not user_id:
        user_id = uuid.uuid4().hex[:16]
        set_cookie = True
    response: Response = await call_next(request)
    if set_cookie:
        response.set_cookie(
            key=COOKIE_NAME,
            value=user_id,
            max_age=int(timedelta(days=365).total_seconds()),
            httponly=True,
            samesite="lax",
            secure=False,
        )
    # Attach user_id for downstream usage
    response.headers["X-User-Id"] = user_id
    request.state.user_id = user_id
    return response

@app.get("/api/health")
def health():
    return {"status": "ok"}

app.include_router(sessions.router, prefix="/api/session", tags=["session"]) 
app.include_router(saved.router, prefix="/api/saved", tags=["saved"]) 
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(youtube.router, prefix="/api/youtube", tags=["youtube"]) 


