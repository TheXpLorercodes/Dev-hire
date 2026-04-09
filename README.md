# ViralGen AI — Multi-Modal Social Media Ad Content Generator
**Project 2: Marketing Tech** | Infotact Solutions — AI R&D Wing

---

## 📋 What This Application Does

ViralGen AI is a production-grade content generation platform that takes a **short marketing brief** (e.g. "red running shoes") and automatically produces:

1. **Refined Image Prompt** — A "Prompt Refinement Agent" (GPT-4) invisibly rewrites your brief into a detailed, high-quality prompt for the image model
2. **Marketing Copy** — GPT-4 generates platform-specific ad copy governed by your chosen Brand Persona (Professional / Witty / Urgent / Inspirational / Casual)
3. **Generated Visual** — Stability AI SDXL generates a 1024×1024 photorealistic image
4. **Job Management** — All generation is async (Celery + Redis), returning a Job ID immediately, with a polling endpoint to check status
5. **History Logging** — All results are persisted to MongoDB for future reference

---

## 🏗️ Architecture Overview

```
┌─────────────┐     POST /api/generate      ┌──────────────────┐
│  React UI   │ ──────────────────────────► │  FastAPI Backend  │
│ (port 3000) │ ◄────────── Job ID ──────── │   (port 8000)    │
│             │                             └────────┬─────────┘
│  Polls      │     GET /api/jobs/{id}               │ enqueue task
│  every 2s   │ ◄────────────────────────────────────┘
└─────────────┘                             ┌──────────────────┐
                                            │  Celery Worker   │
                                            │                  │
                                            │  1. GPT-4        │
                                            │     └─ Refine    │
                                            │     └─ Copy      │
                                            │  2. Stability AI │
                                            │     └─ Image     │
                                            └────────┬─────────┘
                                                     │
                               ┌─────────────────────┴───────────────┐
                               │          Redis (state + queue)       │
                               └─────────────────────────────────────┘
                               ┌─────────────────────────────────────┐
                               │       MongoDB (history/logs)        │
                               └─────────────────────────────────────┘
```

---

## ⚙️ Prerequisites

| Tool | Version | Required? |
|------|---------|-----------|
| Python | 3.10+ | ✅ Yes |
| Node.js | 18+ | ✅ Yes |
| Redis | 7+ | ✅ Yes (for Celery) |
| MongoDB | 6+ | ⚠️ Optional (history) |
| Docker + Docker Compose | Any | 🔵 For Docker method |

### API Keys Required

| Service | Get Key At | Used For |
|---------|-----------|---------|
| OpenAI | https://platform.openai.com/api-keys | GPT-4o text generation |
| Stability AI | https://platform.stability.ai/account/keys | SDXL image generation |

---

## 🚀 Quick Start — Method 1: Docker (Recommended)

### Step 1 — Clone and configure

```bash
# Navigate into the project
cd viralgen-ai

# Copy the env template
cp backend/.env.example backend/.env

# Edit .env with your actual API keys
nano backend/.env   # or use any text editor
```

### Step 2 — Fill in `.env`

```env
OPENAI_API_KEY=sk-proj-your-actual-openai-key
STABILITY_API_KEY=sk-your-actual-stability-key
REDIS_URL=redis://redis:6379/0          # keep as-is for Docker
MONGODB_URL=mongodb://mongodb:27017     # keep as-is for Docker
```

### Step 3 — Launch

```bash
docker-compose up --build
```

### Step 4 — Open the app

- **Frontend UI** → http://localhost:3000
- **API Docs (Swagger)** → http://localhost:8000/docs
- **API Health** → http://localhost:8000/health

### Stop

```bash
docker-compose down
```

---

## 🛠️ Quick Start — Method 2: Local Development

### Step 1 — Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Windows:**
Download from https://github.com/tporadowski/redis/releases or use WSL.

### Step 2 — Install MongoDB (optional, for history)

**macOS:** `brew install mongodb-community && brew services start mongodb-community`
**Ubuntu:** Follow https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
**Windows:** Download installer from mongodb.com

### Step 3 — Configure environment

```bash
cd viralgen-ai/backend
cp .env.example .env
# Edit .env — fill in OPENAI_API_KEY and STABILITY_API_KEY
# For local dev, keep REDIS_URL=redis://localhost:6379/0
```

### Step 4 — Start all services

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```
Double-click start.bat
```

Or manually start each service:

```bash
# Terminal 1 — API server
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Celery worker
cd backend
celery -A workers.celery_worker worker --loglevel=info --concurrency=2

# Terminal 3 — Frontend
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

---

## 📖 Using the Application

### Generate Tab

1. **Enter a brief** — Short description of your product/campaign (e.g. "luxury perfume for summer")
2. **Pick a Brand Persona** — Controls the tone of your marketing copy:
   - 💼 **Professional** — Formal, data-driven, authoritative
   - 🎭 **Witty** — Clever, punchy, uses humor and wordplay
   - 🔥 **Urgent** — High-pressure, FOMO-driven, strong CTA
   - ✨ **Inspirational** — Emotional, aspirational, storytelling
   - 😎 **Casual** — Friendly, conversational, relatable
3. **Choose Platform** — LinkedIn / Instagram / Twitter / Facebook (adapts copy length + style)
4. **Toggle Image** — ON generates both copy + visual, OFF generates text only
5. **Click Generate** — A Job ID is returned immediately; progress updates every 2 seconds
6. **View Results** — Marketing copy + generated image appear in the right panel
7. **Download Image** — Hover over image and click Download
8. **Copy Text** — Click the Copy button on the marketing copy

### History Tab

- Shows all past generation jobs from MongoDB
- Click any job to view details
- Refreshes with the ↻ button

---

## 🔌 API Reference

### POST `/api/generate`
Submit a generation job.

**Request:**
```json
{
  "brief": "red running shoes for marathon athletes",
  "persona": "Professional",
  "platform": "Instagram",
  "include_image": true
}
```

**Response (202):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Job queued — poll /api/jobs/{job_id} for status"
}
```

### GET `/api/jobs/{job_id}`
Poll for job status.

**Response when completed:**
```json
{
  "job_id": "550e8400-...",
  "status": "completed",
  "brief": "red running shoes...",
  "persona": "Professional",
  "platform": "Instagram",
  "refined_prompt": "Photorealistic image of sleek red running shoes...",
  "marketing_copy": "Every stride counts. These precision-engineered...",
  "image_url": "/static/generated/550e8400-....png",
  "completed_at": "2025-01-01T12:00:05Z"
}
```

### GET `/api/history?limit=20&skip=0`
Retrieve paginated generation history.

### GET `/api/personas`
List available personas and platforms.

### GET `/health`
Health check.

---

## 📁 Project Structure

```
viralgen-ai/
├── backend/
│   ├── main.py                    ← FastAPI app + all routes
│   ├── config.py                  ← Settings (reads .env)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example               ← Copy to .env
│   ├── models/
│   │   └── schemas.py             ← Pydantic request/response models
│   ├── services/
│   │   ├── gpt_service.py         ← GPT-4 text gen + prompt refinement
│   │   ├── stability_service.py   ← Stability AI image generation
│   │   └── mongo_service.py       ← MongoDB async persistence
│   ├── templates/
│   │   └── brand_personas.py      ← Brand Voice system prompts
│   ├── workers/
│   │   └── celery_worker.py       ← Celery task + Redis state
│   └── static/generated/          ← Generated images saved here
├── frontend/
│   ├── src/
│   │   ├── App.jsx                ← Main layout + tab navigation
│   │   ├── index.js
│   │   ├── index.css              ← Global design tokens + styles
│   │   ├── components/
│   │   │   ├── GenerateForm.jsx   ← Brief input + persona/platform pickers
│   │   │   ├── JobStatusBar.jsx   ← Live progress steps
│   │   │   ├── ResultCard.jsx     ← Shows copy + image + download
│   │   │   └── HistoryPanel.jsx   ← Past jobs browser
│   │   ├── hooks/
│   │   │   └── useGenerate.js     ← Submit + polling hook
│   │   └── utils/
│   │       └── api.js             ← Axios API client
│   ├── public/index.html
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml             ← Orchestrates all 5 services
├── start.sh                       ← macOS/Linux quick start
├── start.bat                      ← Windows quick start
└── README.md
```

---

## 🗓️ Implementation Plan Audit (from Spec)

| Week | Goal | Status |
|------|------|--------|
| Week 1 | Text Generation & Brand Personas | ✅ Complete — `gpt_service.py` + `brand_personas.py` with all 5 personas × 4 platforms |
| Week 2 | Image Generation Pipeline + Prompt Enhancer | ✅ Complete — `stability_service.py` + `refine_prompt()` agent |
| Week 3 | Async Queue System (Celery + Redis + Polling) | ✅ Complete — `celery_worker.py` with full job state machine |
| Week 4 | Integration & Persistence (MongoDB + unified JSON) | ✅ Complete — `mongo_service.py` + unified `JobResult` schema |

---

## 🐛 Troubleshooting

**"Job stuck at queued"**
→ Celery worker is not running. Check Terminal 2 or the `worker` Docker container.

**"Stability AI error 401"**
→ Your `STABILITY_API_KEY` is invalid or not set in `.env`.

**"OpenAI error 401"**
→ Your `OPENAI_API_KEY` is invalid or not set in `.env`.

**"Connection refused" on API calls**
→ Backend not running on port 8000. Check Terminal 1 / `api` Docker container.

**History is empty**
→ MongoDB is not running or not reachable. The app degrades gracefully — generation still works, history just won't persist.

**Image not loading in UI**
→ Check that `backend/static/generated/` directory exists and is writable. The app creates it automatically on first run.

**Windows Celery issues**
→ Add `--pool=solo` flag: `celery -A workers.celery_worker worker --pool=solo --loglevel=info`

---

## 🔐 Security Notes

- Never commit `.env` to git — it's in `.gitignore`
- Rotate API keys immediately if exposed
- The `/static/generated/` directory serves images publicly — consider adding auth in production
- Set `DEBUG=false` in production

---

## 📞 Support

Built by Infotact Solutions — AI R&D Wing  
This is a confidential internal document.
