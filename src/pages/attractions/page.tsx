export function AttractionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Attractions</h2>
          <p className="text-sm text-muted-foreground">
            Curate attractions that complement shows, tours and hotel packages.
          </p>
        </div>
        <button className="inline-flex cursor-pointer items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0">
          Add new attraction
        </button>
      </div>

      <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
        <p className="text-sm font-medium">Attraction pipeline</p>
        <p className="text-xs text-muted-foreground">
          Use this space to track which partners and attractions you want to
          onboard next.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3 text-xs">
          <div className="cursor-pointer rounded-lg border bg-background p-3 transition-all duration-150 hover:-translate-y-0.5 hover:bg-muted/60 hover:shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Ideas
            </p>
            <ul className="mt-2 space-y-1">
              <li>High roller observation wheel</li>
              <li>Desert ATV experience</li>
            </ul>
          </div>
          <div className="cursor-pointer rounded-lg border bg-background p-3 transition-all duration-150 hover:-translate-y-0.5 hover:bg-muted/60 hover:shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              In outreach
            </p>
            <ul className="mt-2 space-y-1">
              <li>Zipline over Fremont Street</li>
            </ul>
          </div>
          <div className="cursor-pointer rounded-lg border bg-background p-3 transition-all duration-150 hover:-translate-y-0.5 hover:bg-muted/60 hover:shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Live
            </p>
            <ul className="mt-2 space-y-1">
              <li>Helicopter night flight add‑on</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
