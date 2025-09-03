import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supa = createServerClient();
  const { data, error } = await supa.from("ingredients").select("id,name,group");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}
