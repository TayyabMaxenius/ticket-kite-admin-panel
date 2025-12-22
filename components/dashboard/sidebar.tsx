"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser, type User } from "@/lib/auth";
import {
  LayoutDashboard,
  Ticket,
  Building2,
  ShoppingCart,
  Users,
  Settings,
  Calendar,
  BarChart3,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "./logout-button";

type Role = "admin" | "user";

type MenuItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
};

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "user"],
  },
  {
    title: "Shows",
    href: "/dashboard/shows",
    icon: Ticket,
    roles: ["admin", "user"],
  },
  {
    title: "Tours",
    href: "/dashboard/tours",
    icon: Ticket,
    roles: ["admin", "user"],
  },
  {
    title: "Attractions",
    href: "/dashboard/attractions",
    icon: Ticket,
    roles: ["admin", "user"],
  },
  {
    title: "Hotels",
    href: "/dashboard/hotels",
    icon: Building2,
    roles: ["admin", "user"],
  },
  {
    title: "Venues",
    href: "/dashboard/venues",
    icon: Building2,
    roles: ["admin"],
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    roles: ["admin", "user"],
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    roles: ["admin", "user"],
  },
  {
    title: "Profiles",
    href: "/dashboard/profiles",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    roles: ["admin", "user"],
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    title: "Tips & Tricks",
    href: "/dashboard/tips",
    icon: Sparkles,
    roles: ["admin", "user"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [otherShowsOpen, setOtherShowsOpen] = useState(false);

  // Load current user only on the client to avoid hydration mismatches.
  useEffect(() => {
    const current = getUser();
    // Defer state update to next tick to satisfy React hooks lint rule
    const timeout = setTimeout(() => {
      setUser(current);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ticket className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Ticket Kite</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems
          .filter((item) => {
            const role: Role = (user?.role as Role) ?? "user";
            return !item.roles || item.roles.includes(role);
          })
          .map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");

            // Group Tours/Attractions/Hotels under an "Other Shows" dropdown under Shows
            if (item.title === "Shows") {
              const role: Role = (user?.role as Role) ?? "user";
              const otherShowItems = menuItems.filter(
                (m) =>
                  ["Tours", "Attractions", "Hotels"].includes(m.title) &&
                  (!m.roles || m.roles.includes(role))
              );

              return (
                <div key={item.href} className="space-y-1">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                  {otherShowItems.length > 0 && (
                    <DropdownMenu
                      open={otherShowsOpen}
                      onOpenChange={setOtherShowsOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          id="other-shows-menu"
                          variant="ghost"
                          className="w-full justify-between px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Other Shows
                          </span>
                          {otherShowsOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {otherShowItems.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <DropdownMenuItem asChild key={sub.href}>
                              <Link
                                href={sub.href}
                                className="flex items-center gap-2"
                              >
                                <SubIcon className="h-4 w-4" />
                                <span>{sub.title}</span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            }

            // Skip Tours/Attractions/Hotels as top-level items (they are inside Other Shows)
            if (
              item.title === "Tours" ||
              item.title === "Attractions" ||
              item.title === "Hotels"
            ) {
              return null;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              id="user-menu-trigger"
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage
                  src={user?.avatar || ""}
                  alt={user?.name || "Admin"}
                />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "Admin"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{user?.name || "Zain"}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email || "zain@maxenius.agency"}
                </span>
                {user?.role && (
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {user.role === "admin" ? "Admin" : "User"}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Profile</Link>
            </DropdownMenuItem>
            {user?.role === "admin" && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <div className="w-full">
                <LogoutButton />
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
