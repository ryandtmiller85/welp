export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-32 bg-slate-100 rounded mt-2" />
          </div>
          <div className="h-10 w-28 bg-slate-200 rounded-lg" />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="h-4 w-20 bg-slate-100 rounded mb-2" />
              <div className="h-6 w-12 bg-slate-200 rounded" />
            </div>
          ))}
        </div>

        {/* Share section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="h-5 w-40 bg-slate-200 rounded mb-3" />
          <div className="h-10 w-full bg-slate-100 rounded-lg" />
        </div>

        {/* Items grid */}
        <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-24" />
          ))}
        </div>
      </div>
    </div>
  )
}
