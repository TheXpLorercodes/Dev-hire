export default function CandidateList({ candidates, onSelect }) {

  // ✅ Sort by score (highest first)
  const sortedCandidates = [...candidates].sort((a, b) => {
    const scoreA = a.ai_score ?? -1
    const scoreB = b.ai_score ?? -1
    return scoreB - scoreA
  })

  const getScoreStyle = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Candidates</h2>
        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
          {candidates.length} total
        </span>
      </div>

      {/* List */}
      <div className="divide-y max-h-[600px] overflow-auto">

        {sortedCandidates.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c)}
            className="px-6 py-5 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition"
          >
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-500">{c.role}</div>
            </div>

            <div className="text-right">

              {(c.ai_score !== null && c.ai_score !== undefined) ? (
                <div className={`inline-flex items-center px-3 py-1 rounded-2xl text-sm font-medium ${getScoreStyle(c.ai_score)}`}>
                  {c.ai_score} / 100
                </div>
              ) : (
                <div className="text-xs text-gray-400">
                  Not scored yet
                </div>
              )}

              <div className="text-xs text-gray-400 mt-1">
                {c.status}
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {candidates.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            No candidates added yet. Start by adding one.
          </div>
        )}

      </div>
    </div>
  )
}