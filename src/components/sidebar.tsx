const sidebarItems = [
  "Shows",
  "Venues",
  "Tours",
  "Attractions",
  "Hotels",
] as const;
export type SidebarItem = (typeof sidebarItems)[number];

interface SidebarProps {
  active: SidebarItem;
  onChange: (item: SidebarItem) => void;
  items?: readonly SidebarItem[];
}

export function Sidebar({
  active,
  onChange,
  items = sidebarItems,
}: SidebarProps) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar/80 text-sidebar-foreground backdrop-blur">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border/60">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold shadow-sm">
          TK
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight">
            TicketKite
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Admin
          </span>
        </div>
      </div>

      <div className="px-4 pt-4 pb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Navigation
      </div>

      <nav className="flex-1 space-y-1 px-2 pb-4 text-sm">
        {items.map((item) => {
          const isActive = item === active;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={[
                "group flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md translate-x-[2px]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-[2px] hover:shadow-sm",
              ].join(" ")}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-accent/70 text-[11px] font-semibold text-primary transition-colors group-hover:bg-sidebar-accent">
                {item.charAt(0)}
              </span>
              <span>{item}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-sidebar-border/60 px-4 py-3 text-[11px] text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-medium">Admin</span>
            <span className="text-[10px] text-muted-foreground">
              info@ticketkite.com
            </span>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-accent text-[10px] font-semibold">
            MZ
          </span>
        </div>
      </div>
    </aside>
  );
}
