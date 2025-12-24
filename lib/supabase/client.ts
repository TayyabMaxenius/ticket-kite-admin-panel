import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing");
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Set" : "✗ Missing");
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables. Please check your .env.local file."
  );
}

// Log for debugging (remove in production if needed)
if (typeof window !== "undefined") {
  console.log("Supabase URL:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


