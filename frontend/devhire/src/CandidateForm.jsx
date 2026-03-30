import { useState } from 'react'
import api from './api.js'

export default function CandidateForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Software Engineer',
    resume_content: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ✅ Basic validation
    if (!form.name || !form.email || !form.resume_content) {
      setError("All fields are required")
      return
    }

    if (form.resume_content.length < 50) {
      setError("Resume content is too short")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await api.post('/candidates', form)

      // Reset form
      setForm({
        name: '',
        email: '',
        role: 'Software Engineer',
        resume_content: ''
      })

      onSuccess()

    } catch (err) {
      console.error(err)

      if (err.response?.status === 400) {
        setError(err.response.data.error || "Invalid input")
      } else if (err.response?.status === 409) {
        setError("Candidate with this email already exists")
      } else {
        setError("Something went wrong. Try again.")
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8">
      <h2 className="text-2xl font-semibold mb-6">Add New Candidate</h2>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-2xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-2xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role Applied</label>
          <input
            type="text"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="w-full border rounded-2xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Resume Content (paste text)
          </label>
          <textarea
            rows={8}
            value={form.resume_content}
            onChange={e => setForm({ ...form, resume_content: e.target.value })}
            className="w-full border rounded-3xl px-4 py-3"
            placeholder="Paste resume text here..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-3xl font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add to Pipeline"}
        </button>

      </form>
    </div>
  )
}