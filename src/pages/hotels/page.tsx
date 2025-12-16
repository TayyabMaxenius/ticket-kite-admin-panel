export function HotelsPage() {
  const segments = [
    { name: "Strip hotels", share: "64%" },
    { name: "Downtown", share: "21%" },
    { name: "Off-strip", share: "15%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Hotels</h2>
          <p className="text-sm text-muted-foreground">
            Control hotel partners, room types and bundled offers.
          </p>
        </div>
        <button className="inline-flex cursor-pointer items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0">
          Add new hotel
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Partner hotels
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">34</p>
        </div>
        <div className="cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Avg. nightly rate
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">$169</p>
        </div>
        <div className="cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Attachment to shows
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">31%</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card/80 p-4 shadow-sm text-xs">
        <p className="text-sm font-medium">Inventory mix</p>
        <p className="text-xs text-muted-foreground">
          High-level breakdown of where your hotel inventory is concentrated.
        </p>

        <div className="mt-4 space-y-2">
          {segments.map((segment) => (
            <div key={segment.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span>{segment.name}</span>
                <span className="tabular-nums font-medium">
                  {segment.share}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-3/4 rounded-full bg-primary/80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
