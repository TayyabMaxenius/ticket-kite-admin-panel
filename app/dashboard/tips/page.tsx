import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function TipsAndTricksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tips &amp; Tricks
          </h1>
          <p className="text-muted-foreground">
            Best practices, playbooks, and ideas to grow your ticket sales.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Getting Started
          </CardTitle>
          <CardDescription>
            This is a dedicated space for your team to share knowledge, SOPs,
            and marketing tips. We can later power this with content from
            Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Use this page to document how to launch new shows, manage dynamic
            pricing, or share checklists for your team.
          </p>
          <p>
            In the next step, we can add a rich text editor and store tips in
            your database so they can be updated without deploying code.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
