export function ShowsPage() {
  // Static mock metrics for now
  const metrics = [
    { label: "Active shows", value: "12", helper: "+3 this week" },
    { label: "Tickets sold (7d)", value: "1,284", helper: "Conversion 4.2%" },
    { label: "Avg. fill rate", value: "76%", helper: "Trending up" },
    { label: "Revenue (7d)", value: "$42,930", helper: "Incl. fees" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Shows</h2>
          <p className="text-sm text-muted-foreground">
            Manage TicketKite shows, pricing and availability.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex cursor-pointer items-center  rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0">
            Add new show
          </button>
          <button className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-md active:translate-y-0">
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.16em]">
              {metric.label}
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {metric.helper}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div>
            <p className="text-sm font-medium">Shows</p>
            <p className="text-xs text-muted-foreground">
              High-level list view. Later you can replace this with a real data
              table.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <input
              className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Search shows…"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-background text-xs">
          <div className="grid grid-cols-5 border-b bg-muted/60 px-3 py-2 font-medium text-muted-foreground">
            <span>Show</span>
            <span>Venue</span>
            <span>Category</span>
            <span>Next date</span>
            <span className="text-right">Status</span>
          </div>
          {[
            {
              show: "All Motown",
              venue: "Alexis Park",
              category: "Music",
              date: "Tonight, 8:00 PM",
              status: "On sale",
            },
            {
              show: "All Shook Up",
              venue: "V Theatre",
              category: "Tribute",
              date: "Tonight, 7:00 PM",
              status: "On sale",
            },
            {
              show: "Sinatra Live!",
              venue: "The Modern Showrooms",
              category: "Classic",
              date: "Tomorrow, 9:00 PM",
              status: "Low inventory",
            },
          ].map((row) => (
            <div
              key={row.show}
              className="grid cursor-pointer grid-cols-5 items-center border-b px-3 py-2 last:border-b-0 hover:bg-muted/40"
            >
              <span className="truncate text-sm font-medium">{row.show}</span>
              <span className="truncate">{row.venue}</span>
              <span className="truncate">{row.category}</span>
              <span className="truncate">{row.date}</span>
              <span className="flex justify-end">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  {row.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
