export default function Loading() {
  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-slate-200" />
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 w-20 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-7 w-3/4 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
            <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-200" />
            <div className="flex gap-3 pt-2">
              <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
