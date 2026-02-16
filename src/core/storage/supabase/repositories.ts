import type { AppRepositoryBundle } from "@/core/storage/contracts";

/** Stub when Supabase repository is not wired; configure Supabase migration to use real persistence. */
function notReady(name: string): never {
  throw new Error(
    `${name} is not implemented yet. Configure Supabase migration first.`
  );
}

export const supabaseRepositoryBundle: AppRepositoryBundle = {
  preferences: {
    get: async () => notReady("preferences.get"),
    save: async () => notReady("preferences.save"),
  },
  backup: {
    exportAll: async () => notReady("backup.exportAll"),
    importAll: async () => notReady("backup.importAll"),
  },
};
