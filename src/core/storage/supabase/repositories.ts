import type { AppRepositoryBundle } from "@/core/storage/contracts";

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
