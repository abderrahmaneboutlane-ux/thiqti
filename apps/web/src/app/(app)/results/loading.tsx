export default function Loading() {
  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="mb-4 flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[4/3] w-full animate-pulse bg-slate-200" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-5 w-14 animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-8 w-16 animate-pulse rounded-lg bg-brand-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
