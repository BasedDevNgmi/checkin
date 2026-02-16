export function isLocalStorageMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const explicit = process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === "true";
  const noSupabase = !url || url === "https://placeholder.supabase.co";
  return explicit || noSupabase;
}
