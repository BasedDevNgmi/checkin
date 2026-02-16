import type { AppRepositoryBundle } from "@/core/storage/contracts";
import { indexedDbRepositoryBundle } from "@/core/storage/indexeddb/repositories";
import { supabaseRepositoryBundle } from "@/core/storage/supabase/repositories";
import { validateBackupPayload } from "@/core/storage/validate-backup";

let cachedBundle: AppRepositoryBundle | null = null;

export function getRepositoryBundle(): AppRepositoryBundle {
  if (cachedBundle === null) {
    const useSupabase = process.env.NEXT_PUBLIC_STORAGE_PROVIDER === "supabase";
    cachedBundle = useSupabase ? supabaseRepositoryBundle : indexedDbRepositoryBundle;
  }
  return cachedBundle;
}

export { validateBackupPayload };
