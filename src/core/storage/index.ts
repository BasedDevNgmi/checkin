import type { AppRepositoryBundle } from "@/core/storage/contracts";
import { indexedDbRepositoryBundle } from "@/core/storage/indexeddb/repositories";
import { supabaseRepositoryBundle } from "@/core/storage/supabase/repositories";

export function getRepositoryBundle(): AppRepositoryBundle {
  const useSupabase = process.env.NEXT_PUBLIC_STORAGE_PROVIDER === "supabase";
  return useSupabase ? supabaseRepositoryBundle : indexedDbRepositoryBundle;
}
