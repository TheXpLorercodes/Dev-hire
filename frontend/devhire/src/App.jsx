import { useState, useEffect } from 'react'
import CandidateList from './CandidateList.jsx'
import CandidateForm from './CandidateForm.jsx'
import CandidateDetail from './CandidateDetail.jsx'
import api from './api.js'

export default function App() {
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await api.get('/candidates')
      setCandidates(res.data)

    } catch (err) {
      console.error(err)
      setError("Failed to load candidates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handleSelect = (candidate) => {
    setSelectedCandidate(candidate)
    setShowForm(false)
  }

  const handleCloseDetail = () => {
    setSelectedCandidate(null)
    fetchCandidates()
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">DevHire AI</h1>
          <p className="text-gray-600">
            AI-powered hiring pipeline • Track • Score • Interview
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true)
            setSelectedCandidate(null)
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          + Add Candidate
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm flex justify-between items-center">
          {error}
          <button onClick={fetchCandidates} className="underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">

        {/* LEFT: Candidate List */}
        <div className="col-span-12 lg:col-span-7">

          {loading ? (
            <div className="bg-white rounded-3xl shadow-sm p-10 text-center text-gray-400">
              Loading candidates...
            </div>
          ) : (
            <CandidateList
              candidates={candidates}
              onSelect={handleSelect}
            />
          )}

        </div>

        {/* RIGHT: Detail / Form */}
        <div className="col-span-12 lg:col-span-5">

          {selectedCandidate ? (
            <CandidateDetail
              candidate={selectedCandidate}
              onClose={handleCloseDetail}
              refresh={fetchCandidates}
            />
          ) : showForm ? (
            <CandidateForm
              onSuccess={() => {
                setShowForm(false)
                fetchCandidates()
              }}
            />
          ) : (
            <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
              <p className="text-gray-400">
                Select a candidate or add a new one to get started
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}