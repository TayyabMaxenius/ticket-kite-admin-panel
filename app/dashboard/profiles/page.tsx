"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Shield, UserCircle2 } from "lucide-react";

type Profile = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  showsManaged: number;
  orders: number;
  lastActive: string;
  avatar?: string;
};

export default function ProfilesPage() {
  const profiles: Profile[] = [
    {
      id: 1,
      name: "Zain",
      email: "zain@maxenius.agency",
      role: "admin",
      showsManaged: 24,
      orders: 320,
      lastActive: "2025-12-21",
    },
    {
      id: 2,
      name: "User One",
      email: "user@maxenius.agency",
      role: "user",
      showsManaged: 4,
      orders: 18,
      lastActive: "2025-12-19",
    },
    {
      id: 3,
      name: "Marketing Manager",
      email: "marketing@example.com",
      role: "user",
      showsManaged: 9,
      orders: 72,
      lastActive: "2025-12-18",
    },
  ];

  const totalProfiles = profiles.length;
  const adminCount = profiles.filter((p) => p.role === "admin").length;
  const userCount = totalProfiles - adminCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profiles</h1>
          <p className="text-muted-foreground">
            View and manage all admin and user profiles
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle2 className="h-4 w-4 text-primary" />
              Total Profiles
            </CardTitle>
            <CardDescription>All users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProfiles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Admins
            </CardTitle>
            <CardDescription>Users with full access</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{adminCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle2 className="h-4 w-4 text-primary" />
              Standard Users
            </CardTitle>
            <CardDescription>Limited access accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search profiles by name or email..."
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Profiles grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className="hover:shadow-xl transition-shadow duration-200"
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarImage src={profile.avatar || ""} alt={profile.name} />
                  <AvatarFallback>
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {profile.name}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                        profile.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {profile.role}
                    </span>
                  </CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Shows managed:
                  </span>
                  <span className="font-medium">
                    {profile.showsManaged}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orders:</span>
                  <span className="font-medium">{profile.orders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last active:</span>
                  <span className="font-medium">{profile.lastActive}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


