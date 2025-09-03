"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { PlateBuilder } from "./plate-builder";

interface Props {
  date: string;
  goalId: string;
}

export function DayDrawer({ date, goalId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Open {date}</Button>
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <h2 className="font-bold text-lg mb-4">Day {date}</h2>
        <PlateBuilder date={date} goalId={goalId} />
      </DrawerContent>
    </Drawer>
  );
}
