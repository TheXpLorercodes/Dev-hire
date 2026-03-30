# Dev-hire
# DevHire AI — Smart Hiring Pipeline

## 🚀 Overview

DevHire AI is a lightweight hiring pipeline that allows recruiters to:

* Track candidates
* Automatically score resumes using AI
* Generate personalized interview questions

The system emphasizes **controlled AI usage**, **data validation**, and **clean architecture**.

---

## 🧠 Key Technical Decisions

### 1. Backend: Flask

* Chosen for simplicity and clarity
* Easy to structure APIs and demonstrate logic

### 2. Database: PostgreSQL

* Strong schema enforcement
* Prevents invalid states
* Supports structured + JSON fields

### 3. Frontend: React

* Simple component-based UI
* Clear separation of concerns

---

## 🤖 AI Usage (Controlled Integration)

AI is used ONLY for:

* Resume scoring
* Interview question generation

### Safeguards:

* Strict JSON output enforced
* Response validation before storing
* Fallback logic for failures
* No critical logic depends on AI

---

## 🧱 Architecture

Frontend (React)
↓
Backend API (Flask)
↓
Database (PostgreSQL)
↓
AI Layer (Gemini)

---

## 🔐 Interface Safety

* Input validation on backend
* Controlled schema for AI responses
* Prevents invalid states
* Explicit re-evaluation using `force=true`

---

## 🔄 Change Resilience

* AI isolated in service layer
* Frontend uses API abstraction
* Schema changes won’t break UI

---

## 🧪 Verification

* Input validation prevents bad data
* AI responses validated before DB storage
* Fallback ensures system stability

---

## 👀 Observability

* Logging for AI responses
* Error handling in frontend and backend
* Clear UI feedback

---

## ⚠️ Risks & Tradeoffs

* AI responses may still vary
* Resume quality affects output quality
* Gemini model availability may change

---

## 🚀 Future Improvements

* Candidate ranking system
* AI explanation for scores
* Resume parsing (structured)
* Interview feedback loop

---

## ▶️ How to Run

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost/db
GEMINI_API_KEY=your_api_key
```
