import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

type Params = { params: { id: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const db = getServiceClient();
  const { error } = await db.from("categories").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
