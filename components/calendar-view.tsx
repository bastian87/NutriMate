"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/auth/auth-provider";

interface CalendarDay {
  date: string;
  is_success: boolean;
}

interface Props {
  range: "week" | "month";
  from: string; // YYYY-MM-DD
}

export function CalendarView({ range, from }: Props) {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user?.id) return;
    
    fetch(`/api/calendar?range=${range}&from=${from}`, {
      headers: { "x-user-id": user.id },
    })
      .then((r) => r.json())
      .then((d) => setDays(d.days ?? []));
  }, [range, from, user?.id]);

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
        <Card
          key={day.date}
          className={cn(
            "p-2 text-center",
            day.is_success ? "bg-green-100 border-green-400" : "bg-red-100 border-red-400"
          )}
        >
          <div className="font-bold">{day.date.slice(-2)}</div>
          <div>{day.is_success ? "✅" : "❌"}</div>
        </Card>
      ))}
    </div>
  );
}
