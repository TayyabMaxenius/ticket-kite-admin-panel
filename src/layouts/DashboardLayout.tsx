import React from "react";
import { Sidebar, type SidebarItem } from "../components/sidebar";
import { UserMenu } from "../components/ui/UserMenu";
import { useAuth } from "../contexts/AuthContext";

interface DashboardLayoutProps {
  activePage: SidebarItem;
  onPageChange: (page: SidebarItem) => void;
  children: React.ReactNode;
}

export function DashboardLayout({
  activePage,
  onPageChange,
  children,
}: DashboardLayoutProps) {
  const { currentUser } = useAuth();

  const sidebarItems: SidebarItem[] =
    currentUser?.role === "admin"
      ? ["Shows", "Venues", "Tours", "Attractions", "Hotels"]
      : ["Shows"];

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/60 text-foreground">
      <Sidebar
        active={activePage}
        onChange={onPageChange}
        items={sidebarItems}
      />

      <main className="relative flex-1 overflow-auto">
        <header className="flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {activePage}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage {activePage.toLowerCase()} data for TicketKite.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden md:inline-flex items-center rounded-full border bg-background px-3 py-1">
              Environment:{" "}
              <span className="ml-1 font-medium text-foreground">Preview</span>
            </span>
            <UserMenu />
          </div>
        </header>

        <section className="px-6 py-6">
          <div key={activePage} className="page-transition">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
