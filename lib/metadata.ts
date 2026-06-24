export type VideoMeta = {
  title: string | null;
  thumbnail: string | null;
  author: string | null;
  platform: "youtube" | "instagram" | "other";
};

function detectPlatform(url: string): "youtube" | "instagram" | "other" {
  if (/youtu\.be|youtube\.com/i.test(url)) return "youtube";
  if (/instagram\.com/i.test(url)) return "instagram";
  return "other";
}

async function fetchYoutubeMeta(url: string): Promise<VideoMeta> {
  try {
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembed, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error("oEmbed failed");
    const data = await res.json();

    // Get the highest-res thumbnail from the video ID
    const videoId = extractYouTubeId(url);
    const thumbnail = videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : data.thumbnail_url;

    return {
      title: data.title ?? null,
      thumbnail,
      author: data.author_name ?? null,
      platform: "youtube",
    };
  } catch {
    return { title: null, thumbnail: null, author: null, platform: "youtube" };
  }
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchInstagramMeta(url: string): Promise<VideoMeta> {
  // Instagram blocked server-side scraping in 2020.
  // We store the URL and show a placeholder; the user can add details manually.
  return {
    title: null,
    thumbnail: null,
    author: null,
    platform: "instagram",
  };
}

export async function fetchVideoMeta(url: string): Promise<VideoMeta> {
  const platform = detectPlatform(url);
  if (platform === "youtube") return fetchYoutubeMeta(url);
  if (platform === "instagram") return fetchInstagramMeta(url);
  return { title: null, thumbnail: null, author: null, platform: "other" };
}

/** Pull all URLs from a WhatsApp message text */
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"]+/g;
  const matches = text.match(urlRegex) ?? [];
  return matches.filter(
    (u) => /youtu\.be|youtube\.com|instagram\.com/i.test(u)
  );
}
