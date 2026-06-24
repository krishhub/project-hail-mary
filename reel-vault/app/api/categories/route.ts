import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const db = getServiceClient();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { name, color } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const db = getServiceClient();
  const { data, error } = await db
    .from("categories")
    .insert({ name, color: color ?? "#6366f1" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
