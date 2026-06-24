import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { fetchVideoMeta, extractUrls } from "@/lib/metadata";

// Whapi.cloud sends a POST to this endpoint for every incoming message.
// In your Whapi dashboard → Webhooks, point the URL to:
//   https://your-app.vercel.app/api/webhook
// and set the secret header X-Webhook-Secret.

export async function POST(req: NextRequest) {
  // Verify secret
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Whapi delivers messages as an array under body.messages
  const messages = (body.messages as Array<Record<string, unknown>>) ?? [];
  const db = getServiceClient();
  const saved: string[] = [];

  for (const msg of messages) {
    // Only process text messages (type: "text")
    const msgType = msg.type as string;
    if (msgType !== "text") continue;

    const textObj = msg.text as Record<string, string> | undefined;
    const msgBody = textObj?.body ?? "";

    const urls = extractUrls(msgBody);
    for (const url of urls) {
      // Deduplicate by URL
      const { data: existing } = await db
        .from("reels")
        .select("id")
        .eq("url", url)
        .maybeSingle();

      if (existing) continue;

      const meta = await fetchVideoMeta(url);
      const { data } = await db
        .from("reels")
        .insert({
          url,
          platform: meta.platform,
          title: meta.title,
          thumbnail: meta.thumbnail,
          author: meta.author,
          received_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (data) saved.push(data.id);
    }
  }

  return NextResponse.json({ saved: saved.length });
}
