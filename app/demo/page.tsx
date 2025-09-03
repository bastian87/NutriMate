"use client";

import { useMemo, useState } from "react";
import { CalendarView } from "@/components/calendar-view";
import { DayDrawer } from "@/components/day-drawer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Simple demo page to exercise Nutrimate v2 end-to-end:
 *  - Set a goalId (created via POST /api/goals)
 *  - Choose range (week/month) and start date
 *  - Open a DayDrawer with a PlateBuilder for the selected date
 *  - CalendarView fetches /api/calendar to show ✅/❌ per day
 *
 * NOTE: Components make requests with header "x-user-id": "demo-user-id".
 *       Ensure you use the same userId when creating the goal.
 */

export default function DemoPage() {
  const [goalId, setGoalId] = useState<string>("");
  const [range, setRange] = useState<"week" | "month">("week");

  // default "from" = today (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [from, setFrom] = useState<string>(todayStr);
  const [drawerDate, setDrawerDate] = useState<string>(todayStr);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Nutrimate v2 — Demo</h1>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="goalId">Goal ID</Label>
            <Input
              id="goalId"
              placeholder="Paste the goal UUID here"
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Range</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={range === "week" ? "default" : "outline"}
                onClick={() => setRange("week")}
              >
                Week
              </Button>
              <Button
                type="button"
                variant={range === "month" ? "default" : "outline"}
                onClick={() => setRange("month")}
              >
                Month
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="from">Start date</Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="drawerDate">Open Day (YYYY-MM-DD)</Label>
            <Input
              id="drawerDate"
              type="date"
              value={drawerDate}
              onChange={(e) => setDrawerDate(e.target.value)}
            />
          </div>
          <DayDrawer date={drawerDate} goalId={goalId} />
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Calendar</h2>
          <div className="text-sm text-muted-foreground">
            Range: <span className="font-mono">{range}</span> | From:{" "}
            <span className="font-mono">{from}</span>
          </div>
        </div>
        {/* The CalendarView fetches /api/calendar with x-user-id header */}
        <CalendarView range={range} from={from} />
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Quick Tips</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>
            First, create a goal via <code>POST /api/goals</code> and copy the returned{" "}
            <code>goal.id</code> into the Goal ID field above.
          </li>
          <li>
            Use the Day Drawer to add ingredients (PlateBuilder) for a date; it will call{" "}
            <code>POST /api/day-entries</code>.
          </li>
          <li>
            The calendar will mark days as ✅ or ❌ based on the evaluation rules.
          </li>
        </ul>
      </Card>
    </div>
  );
}