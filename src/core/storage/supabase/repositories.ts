import type { AppRepositoryBundle } from "@/core/storage/contracts";

function notReady(name: string): never {
  throw new Error(`${name} is not implemented yet. Configure Supabase migration first.`);
}

export const supabaseRepositoryBundle: AppRepositoryBundle = {
  mood: {
    list: async () => notReady("mood.list"),
    getById: async () => notReady("mood.getById"),
    create: async () => notReady("mood.create"),
    update: async () => notReady("mood.update"),
    remove: async () => notReady("mood.remove"),
  },
  journal: {
    list: async () => notReady("journal.list"),
    getById: async () => notReady("journal.getById"),
    create: async () => notReady("journal.create"),
    update: async () => notReady("journal.update"),
    remove: async () => notReady("journal.remove"),
  },
  preferences: {
    get: async () => notReady("preferences.get"),
    save: async () => notReady("preferences.save"),
  },
  backup: {
    exportAll: async () => notReady("backup.exportAll"),
    importAll: async () => notReady("backup.importAll"),
  },
};
