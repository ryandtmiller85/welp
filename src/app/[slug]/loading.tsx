export default function RegistryLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
        {/* Profile header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="h-8 w-56 bg-slate-200 rounded-lg mx-auto mb-2" />
          <div className="h-4 w-40 bg-slate-100 rounded mx-auto mb-4" />
          <div className="h-4 w-80 bg-slate-50 rounded mx-auto" />
          <div className="h-4 w-64 bg-slate-50 rounded mx-auto mt-1" />
        </div>

        {/* Items section */}
        <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-28" />
          ))}
        </div>

        {/* Funds section */}
        <div className="h-6 w-28 bg-slate-200 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-36" />
          ))}
        </div>
      </div>
    </div>
  )
}
