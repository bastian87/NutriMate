"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Ingredient {
  id: string;
  name: string;
  group: "carb" | "protein" | "fat" | "vegfruit" | "treat";
}

interface Props {
  date: string; // YYYY-MM-DD
  goalId: string;
}

function SortableItem({ id, name }: { id: string; name: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-2 mb-1">
      {name}
    </Card>
  );
}

export function PlateBuilder({ date, goalId }: Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selected, setSelected] = useState<Ingredient[]>([]);

  useEffect(() => {
    fetch("/api/ingredients") // crea un stub si aún no existe
      .then((r) => r.json())
      .then((d) => setIngredients(d ?? []));
  }, []);

  function handleSubmit() {
    const body = {
      date,
      goalId,
      items: selected.map((i) => ({ ingredientId: i.id, quantityGrams: 100 })),
    };
    fetch("/api/day-entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "demo-user-id",
      },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((res) => alert(`Saved day: ${JSON.stringify(res)}`));
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left: ingredients list */}
      <div>
        <h3 className="font-bold mb-2">Ingredients</h3>
        {ingredients.map((i) => (
          <Card
            key={i.id}
            className="p-2 mb-1 cursor-pointer hover:bg-accent"
            onClick={() => setSelected((s) => [...s, i])}
          >
            {i.name} ({i.group})
          </Card>
        ))}
      </div>

      {/* Right: plate */}
      <div>
        <h3 className="font-bold mb-2">My Plate</h3>
        <DndContext collisionDetection={closestCenter}>
          <SortableContext items={selected.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {selected.map((i) => (
              <SortableItem key={i.id} id={i.id} name={i.name} />
            ))}
          </SortableContext>
        </DndContext>
        <Button className="mt-4 w-full" onClick={handleSubmit}>
          Save Day
        </Button>
      </div>
    </div>
  );
}
