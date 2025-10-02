# Frontend (Vite + React + TypeScript)

## Prerequisites
- Node.js 18+
- npm 9+

## Install dependencies
```powershell
cd client
npm.cmd install
```

**Note**: If you get a PowerShell execution policy error, use `npm.cmd` instead of `npm`, or run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Start dev server
```powershell
npm run dev -- --host
```

Open m install 

## Production (Docker)
When running with Docker Compose, the frontend is available at http://localhost:3000

Notes:
- Development: Frontend runs on port 5173, backend on port 8000
- Production: Frontend runs on port 3000, backend on port 8000
- Requests to `/api/*` are proxied to the backend
- Keep the backend running for search/saved/progress features
