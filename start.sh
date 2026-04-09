#!/bin/bash
# ViralGen AI — Local Development Startup Script
# Starts all services without Docker

set -e
BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"

echo -e "${BOLD}${CYAN}"
echo "  ██╗   ██╗██╗██████╗  █████╗ ██╗      ██████╗ ███████╗███╗   ██╗"
echo "  ██║   ██║██║██╔══██╗██╔══██╗██║     ██╔════╝ ██╔════╝████╗  ██║"
echo "  ██║   ██║██║██████╔╝███████║██║     ██║  ███╗█████╗  ██╔██╗ ██║"
echo "  ╚██╗ ██╔╝██║██╔══██╗██╔══██║██║     ██║   ██║██╔══╝  ██║╚██╗██║"
echo "   ╚████╔╝ ██║██║  ██║██║  ██║███████╗╚██████╔╝███████╗██║ ╚████║"
echo "    ╚═══╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝"
echo -e "${NC}"
echo -e "${BOLD}ViralGen AI — Multi-Modal Ad Content Generator${NC}"
echo -e "by Infotact Solutions\n"

# Check .env
if [ ! -f backend/.env ]; then
  echo -e "${RED}❌ backend/.env not found!${NC}"
  echo -e "   Copy backend/.env.example to backend/.env and fill in your API keys."
  exit 1
fi

echo -e "${GREEN}✓ .env found${NC}"

# Check redis
if ! command -v redis-cli &> /dev/null; then
  echo -e "${YELLOW}⚠ Redis not found. Install: brew install redis  OR  sudo apt install redis-server${NC}"
  echo -e "  Then run: redis-server"
else
  echo -e "${GREEN}✓ Redis available${NC}"
  if ! redis-cli ping &> /dev/null; then
    echo -e "${YELLOW}  Starting Redis...${NC}"
    redis-server --daemonize yes
  fi
fi

# Check MongoDB
if ! command -v mongod &> /dev/null; then
  echo -e "${YELLOW}⚠ MongoDB not found. History persistence will be skipped gracefully.${NC}"
else
  echo -e "${GREEN}✓ MongoDB available${NC}"
fi

# Backend
echo -e "\n${CYAN}→ Installing backend dependencies...${NC}"
cd backend
pip install -r requirements.txt -q
cd ..

# Frontend
echo -e "${CYAN}→ Installing frontend dependencies...${NC}"
cd frontend
npm install --silent
cd ..

# Launch
echo -e "\n${BOLD}Launching services...${NC}\n"

# FastAPI
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!
echo -e "${GREEN}✓ API server started (PID $API_PID) → http://localhost:8000${NC}"

# Celery Worker
celery -A workers.celery_worker worker --loglevel=warning --concurrency=2 &
WORKER_PID=$!
echo -e "${GREEN}✓ Celery worker started (PID $WORKER_PID)${NC}"
cd ..

# Frontend
cd frontend
REACT_APP_API_URL=http://localhost:8000 npm start &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID $FRONTEND_PID) → http://localhost:3000${NC}"
cd ..

echo -e "\n${BOLD}${GREEN}🚀 ViralGen AI is running!${NC}"
echo -e "   Frontend → ${CYAN}http://localhost:3000${NC}"
echo -e "   API Docs → ${CYAN}http://localhost:8000/docs${NC}"
echo -e "\nPress Ctrl+C to stop all services.\n"

# Cleanup on exit
trap "echo 'Stopping...'; kill $API_PID $WORKER_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
