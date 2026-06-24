import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { fetchVideoMeta } from "@/lib/metadata";

// GET /api/reels?category=&platform=&watched=&favorite=&q=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const platform = searchParams.get("platform");
  const watched = searchParams.get("watched");
  const favorite = searchParams.get("favorite");
  const q = searchParams.get("q");

  const db = getServiceClient();
  let query = db
    .from("reels")
    .select("*, categories(id, name, color)")
    .order("received_at", { ascending: false });

  if (category === "uncategorized") {
    query = query.is("category_id", null);
  } else if (category) {
    query = query.eq("category_id", category);
  }
  if (platform) query = query.eq("platform", platform);
  if (watched === "true") query = query.eq("is_watched", true);
  if (watched === "false") query = query.eq("is_watched", false);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/reels — manually add a reel by URL
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url, category_id, notes } = body as {
    url: string;
    category_id?: string;
    notes?: string;
  };

  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const db = getServiceClient();

  // Deduplicate
  const { data: existing } = await db
    .from("reels")
    .select("id")
    .eq("url", url)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: "Already saved" }, { status: 409 });

  const meta = await fetchVideoMeta(url);
  const { data, error } = await db
    .from("reels")
    .insert({
      url,
      platform: meta.platform,
      title: meta.title,
      thumbnail: meta.thumbnail,
      author: meta.author,
      category_id: category_id ?? null,
      notes: notes ?? null,
    })
    .select("*, categories(id, name, color)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
