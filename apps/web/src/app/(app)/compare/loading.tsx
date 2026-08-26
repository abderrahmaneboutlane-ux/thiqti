export default function Loading() {
  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-6 w-24 animate-pulse rounded-lg bg-slate-200" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-3 w-full animate-pulse rounded bg-slate-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
