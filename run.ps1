# Launch University Timetable Optimizer (Backend + Frontend)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   University Timetable Optimizer - Optimization Techniques" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

# Start Backend (FastAPI on port 8000)
Write-Host "[1/2] Starting FastAPI backend on http://localhost:8000..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\.venv\Scripts\activate; uvicorn backend.main:app --reload --port 8000" -PassThru

# Start Frontend (Next.js on port 3000)
Write-Host "[2/2] Starting Next.js frontend on http://localhost:3000..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -PassThru

Write-Host "`nBoth services are starting!" -ForegroundColor Green
Write-Host "• Frontend Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "• Backend API Docs:   http://localhost:8000/docs" -ForegroundColor White
