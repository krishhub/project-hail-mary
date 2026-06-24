import { createClient } from "@supabase/supabase-js";

export type Category = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Reel = {
  id: string;
  url: string;
  platform: "youtube" | "instagram" | "other";
  title: string | null;
  thumbnail: string | null;
  author: string | null;
  duration: string | null;
  category_id: string | null;
  notes: string | null;
  is_watched: boolean;
  is_favorite: boolean;
  received_at: string;
  created_at: string;
  categories?: Category | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client (service role — only use in API routes/server components)
export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
