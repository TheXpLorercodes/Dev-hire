@echo off
echo.
echo  ViralGen AI -- Multi-Modal Ad Content Generator
echo.

IF NOT EXIST backend\.env (
  echo ERROR: backend\.env not found!
  echo Copy backend\.env.example to backend\.env and fill in your API keys.
  pause
  exit /b 1
)

echo [1/3] Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo [2/3] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo [3/3] Starting services...

:: Start API
start "ViralGen API" cmd /k "cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Start Celery Worker
start "ViralGen Worker" cmd /k "cd backend && celery -A workers.celery_worker worker --loglevel=info --concurrency=2 --pool=solo"

:: Start Frontend
start "ViralGen Frontend" cmd /k "cd frontend && set REACT_APP_API_URL=http://localhost:8000 && npm start"

echo.
echo  ViralGen AI is starting up!
echo  Frontend  ->  http://localhost:3000
echo  API Docs  ->  http://localhost:8000/docs
echo.
echo  NOTE: Make sure Redis is running (redis-server) before the worker starts.
echo.
pause
