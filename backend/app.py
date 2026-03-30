import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# ================= CONFIG =================
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

logging.basicConfig(level=logging.INFO)

# ================= MODEL =================
class Candidate(db.Model):
    __tablename__ = 'candidates'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(100), nullable=False)
    resume_content = db.Column(db.Text, nullable=False)

    ai_score = db.Column(db.Float)
    ai_feedback = db.Column(db.Text)
    interview_questions = db.Column(db.Text)

    status = db.Column(db.String(50), default='applied')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "resume_content": self.resume_content[:200] + "...",
            "ai_score": self.ai_score,
            "ai_feedback": self.ai_feedback,
            "interview_questions": json.loads(self.interview_questions) if self.interview_questions else [],
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }

# ================= GEMINI =================
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def get_model():
    return genai.GenerativeModel('gemini-2.5-flash')

# ================= UTIL =================
def extract_json(text):
    """Safely extract JSON from AI response"""
    if not text:
        raise ValueError("Empty AI response")

    start = text.find("{")
    end = text.rfind("}") + 1

    if start == -1 or end == -1:
        raise ValueError("No JSON found")

    return json.loads(text[start:end])

# ================= AI =================

def ai_score_resume(resume_content, role):
    model = get_model()

    prompt = f"""
You are a senior technical recruiter.

Evaluate this resume for a {role} role.

Return ONLY valid JSON.

Format:
{{"score": number (0-100), "feedback": "2-3 lines"}}

Resume:
{resume_content[:4000]}
"""

    try:
        res = model.generate_content(prompt)
        raw = res.text.strip()

        logging.info(f"AI SCORE RAW: {raw}")

        data = extract_json(raw)

        score = float(data["score"])
        if not (0 <= score <= 100):
            raise ValueError("Invalid score")

        return score, data["feedback"]

    except Exception as e:
        logging.error(f"Score error: {e}")
        return 60.0, "Fallback scoring used due to parsing issue."


def ai_generate_questions(resume_content, role):
    model = get_model()

    prompt = f"""
You are a senior technical interviewer.

STEP 1: Extract key info:
- Skills
- Projects
- Tech stack

STEP 2: Generate 5 UNIQUE questions based on it.

Rules:
- Must reference resume
- No generic questions
- 2 technical, 2 problem-solving, 1 behavioral

Return ONLY JSON:
{{
  "questions": [
    {{
      "type": "technical",
      "question": "text"
    }}
  ]
}}

Resume:
{resume_content[:4000]}
"""

    try:
        res = model.generate_content(prompt)
        raw = res.text.strip()

        logging.info(f"AI QUESTIONS RAW: {raw}")

        data = extract_json(raw)
        questions = data.get("questions", [])

        if not isinstance(questions, list) or len(questions) != 5:
            raise ValueError("Invalid format")

        return questions

    except Exception as e:
        logging.error(f"Question error: {e}")
        return [
            {"type": "technical", "question": "Explain your main project."},
            {"type": "technical", "question": "Which technologies are you strongest in?"},
            {"type": "problem-solving", "question": "How do you debug APIs?"},
            {"type": "problem-solving", "question": "How would you scale a system?"},
            {"type": "behavioral", "question": "Describe a challenge you faced."}
        ]

# ================= ROUTES =================

@app.route('/candidates', methods=['GET'])
def get_candidates():
    data = Candidate.query.order_by(Candidate.created_at.desc()).all()
    return jsonify([c.to_dict() for c in data])


@app.route('/candidates', methods=['POST'])
def create_candidate():
    data = request.get_json()

    if not data.get("name") or not data.get("email") or not data.get("resume_content"):
        return jsonify({"error": "Missing required fields"}), 400

    candidate = Candidate(
        name=data["name"],
        email=data["email"],
        role=data["role"],
        resume_content=data["resume_content"]
    )

    db.session.add(candidate)
    db.session.commit()

    return jsonify(candidate.to_dict()), 201


# ================= SCORE =================
@app.route('/candidates/<int:id>/score', methods=['POST'])
def score_candidate(id):
    candidate = Candidate.query.get_or_404(id)
    force = request.args.get("force") == "true"

    if candidate.ai_score is None or force:
        score, feedback = ai_score_resume(candidate.resume_content, candidate.role)
        candidate.ai_score = score
        candidate.ai_feedback = feedback
        db.session.commit()

    return jsonify({
        "score": candidate.ai_score,
        "feedback": candidate.ai_feedback
    })


# ================= QUESTIONS =================
@app.route('/candidates/<int:id>/questions', methods=['POST'])
def generate_questions(id):
    candidate = Candidate.query.get_or_404(id)
    force = request.args.get("force") == "true"

    if not candidate.interview_questions or force:
        questions = ai_generate_questions(candidate.resume_content, candidate.role)
        candidate.interview_questions = json.dumps(questions)
        db.session.commit()

    return jsonify({
        "questions": json.loads(candidate.interview_questions)
    })


# ================= START =================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ Backend Ready (Robust AI Parsing Enabled)")
    app.run(debug=True)