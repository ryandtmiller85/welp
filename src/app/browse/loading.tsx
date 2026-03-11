export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="h-8 w-64 bg-slate-200 rounded-lg mx-auto mb-3" />
          <div className="h-4 w-96 bg-slate-100 rounded mx-auto" />
        </div>

        {/* Registry cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="h-32 bg-slate-100" />
              <div className="p-4">
                <div className="h-5 w-36 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-24 bg-slate-100 rounded mb-3" />
                <div className="h-4 w-full bg-slate-50 rounded" />
                <div className="h-4 w-3/4 bg-slate-50 rounded mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
