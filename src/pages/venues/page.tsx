export function VenuesPage() {
  const venues = [
    {
      name: "Alexis Park Resort Hotel",
      city: "Las Vegas",
      capacity: "450",
      shows: 4,
    },
    {
      name: "Modern Showrooms",
      city: "Las Vegas",
      capacity: "320",
      shows: 3,
    },
    {
      name: "V Theatre",
      city: "Las Vegas",
      capacity: "350",
      shows: 2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Venues</h2>
          <p className="text-sm text-muted-foreground">
            Manage locations where TicketKite shows and experiences are hosted.
          </p>
        </div>
        <button className="inline-flex cursor-pointer items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0">
          Add new venue
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Total venues
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">18</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Avg. capacity
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">385</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Shows per venue
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">3.1</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 pb-3">
          <div>
            <p className="text-sm font-medium">Venue directory</p>
            <p className="text-xs text-muted-foreground">
              A compact list of key venues. Extend this into a full CRUD view
              later.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {venues.map((venue) => (
            <div
              key={venue.name}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-xs transition-all duration-150 hover:-translate-y-0.5 hover:bg-muted/60 hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{venue.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {venue.city}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="tabular-nums">{venue.capacity} cap.</span>
                <span className="tabular-nums">{venue.shows} shows</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
