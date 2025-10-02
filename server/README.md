# Backend (FastAPI)

FastAPI backend with SQLite.

## Prerequisites
- Python 3.10+
- Windows PowerShell

## Setup
```powershell
# From repo root
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
cd server
python -m pip install -r requirements.txt
```

## YouTube API Setup (Optional)
1. Get a YouTube API key from [Google Cloud Console](https://console.developers.google.com/)
2. Enable the YouTube Data API v3
3. Set the API key as an environment variable:
   ```powershell
   $env:YOUTUBE_API_KEY="your_api_key_here"
   ```
   Or insert your API KEY in the  `.env` file in the server directory with:
   ```
   YOUTUBE_API_KEY=<Insert Api Key here>
   ```

If uvicorn is missing:
```powershell
python -m pip install uvicorn[standard]
```

## Initialize DB
```powershell
python -c "from app.init_db import init_db; init_db(); print('DB initialized')"
```

## Start server
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Health check: http://127.0.0.1:8000/api/health

Notes: CORS allows http://localhost:5173 and session uses `elice_session` cookie.
