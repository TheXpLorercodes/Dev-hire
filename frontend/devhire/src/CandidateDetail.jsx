import { useState } from 'react'
import api from './api.js'

export default function CandidateDetail({ candidate, onClose, refresh }) {
  const [score, setScore] = useState(candidate.ai_score ?? null)
  const [questions, setQuestions] = useState(candidate.interview_questions || [])
  const [loadingScore, setLoadingScore] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [error, setError] = useState(null)

  // ================= SCORE =================
  const handleScore = async () => {
    try {
      setLoadingScore(true)
      setError(null)

      const res = await api.post(`/candidates/${candidate.id}/score?force=true`)
      setScore(res.data.score)

    } catch (err) {
      console.error(err)
      setError("Failed to score candidate")
    } finally {
      setLoadingScore(false)
      refresh()
    }
  }

  // ================= QUESTIONS =================
  const handleQuestions = async () => {
    try {
      setLoadingQuestions(true)
      setError(null)

      const res = await api.post(`/candidates/${candidate.id}/questions?force=true`)
      setQuestions(res.data.questions)

    } catch (err) {
      console.error(err)
      setError("Failed to generate questions")
    } finally {
      setLoadingQuestions(false)
      refresh()
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8">

      {/* Back */}
      <button 
        onClick={onClose} 
        className="text-gray-400 hover:text-gray-600 mb-4"
      >
        ← Back
      </button>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">{candidate.name}</h2>
          <p className="text-indigo-600">{candidate.role}</p>
          <p className="text-sm text-gray-500 mt-1">{candidate.email}</p>
        </div>

        {score !== null && score !== undefined && (
          <div className="text-right">
            <div className="text-5xl font-bold text-indigo-600">
              {score}
            </div>
            <div className="text-xs uppercase tracking-widest">
              AI Score
            </div>
          </div>
        )}
      </div>

      {/* Resume */}
      <div className="my-8 border-t border-b py-8">
        <h3 className="font-medium mb-2">Resume Preview</h3>
        <p className="text-sm text-gray-600 leading-relaxed break-words">
          {candidate.resume_content}
        </p>
      </div>

      {/* Score Button */}
      <button
        onClick={handleScore}
        disabled={loadingScore}
        className="w-full mb-4 bg-emerald-600 text-white py-4 rounded-3xl font-medium disabled:opacity-50"
      >
        {loadingScore
          ? 'Scoring...'
          : score === null
          ? 'Score Resume'
          : 'Re-score Candidate'}
      </button>

      {/* Feedback */}
      {score !== null && candidate.ai_feedback && (
        <div className="bg-emerald-50 p-5 rounded-3xl mb-6">
          <h4 className="font-medium text-emerald-800 mb-2">AI Feedback</h4>
          <p className="text-emerald-700 text-sm">
            {candidate.ai_feedback}
          </p>
        </div>
      )}

      {/* Questions Button */}
      <button
        onClick={handleQuestions}
        disabled={loadingQuestions}
        className="w-full mb-6 bg-violet-600 text-white py-4 rounded-3xl font-medium disabled:opacity-50"
      >
        {loadingQuestions
          ? 'Generating...'
          : questions.length === 0
          ? 'Generate Interview Questions'
          : 'Regenerate Questions'}
      </button>

      {/* Questions */}
      {questions.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Tailored Interview Questions</h4>
          <ol className="space-y-3">
            {questions.map((q, i) => (
              <li
                key={i}
                className="bg-gray-50 p-4 rounded-2xl text-sm"
              >
                <div className="text-xs text-indigo-500 uppercase mb-1">
                  {q.type}
                </div>
                {i + 1}. {q.question}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-xs text-gray-400 flex justify-between">
        <div>
          Status: <span className="font-medium text-gray-600">{candidate.status}</span>
        </div>
        <div>
          Added {new Date(candidate.created_at).toLocaleDateString()}
        </div>
      </div>

    </div>
  )
}