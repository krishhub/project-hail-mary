import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

type Params = { params: { id: string } };

// PATCH /api/reels/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json();
  const db = getServiceClient();

  const { data, error } = await db
    .from("reels")
    .update(body)
    .eq("id", params.id)
    .select("*, categories(id, name, color)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/reels/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const db = getServiceClient();
  const { error } = await db.from("reels").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
