export default function ShopCategoryLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
        <div className="h-4 w-32 bg-slate-100 rounded mb-6" />
        <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-slate-100 rounded mb-8" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="aspect-square bg-slate-100" />
              <div className="p-3">
                <div className="h-4 w-full bg-slate-200 rounded mb-2" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
