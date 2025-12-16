export function ToursPage() {
  const tours = [
    {
      name: "Grand Canyon Helicopter",
      type: "Heli tour",
      duration: "4h",
      price: "$399",
    },
    {
      name: "Strip Night Tour",
      type: "City tour",
      duration: "2h",
      price: "$129",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Tours</h2>
          <p className="text-sm text-muted-foreground">
            Configure experiences and tours that can be bundled with shows and
            hotels.
          </p>
        </div>
        <button className="inline-flex cursor-pointer items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0">
          Add new tour
        </button>
      </div>

      <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 pb-3">
          <div>
            <p className="text-sm font-medium">Featured tours</p>
            <p className="text-xs text-muted-foreground">
              Highlight experiences that drive strong upsell performance.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {tours.map((tour) => (
            <div
              key={tour.name}
              className="flex cursor-pointer flex-col justify-between rounded-lg border bg-background p-3 text-xs transition-all duration-150 hover:-translate-y-0.5 hover:bg-muted/60 hover:shadow-sm"
            >
              <div>
                <p className="text-sm font-medium">{tour.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {tour.type}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{tour.duration}</span>
                <span className="font-medium text-foreground">
                  {tour.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
