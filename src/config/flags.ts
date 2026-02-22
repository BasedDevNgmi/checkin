type StorageProvider = "indexeddb" | "supabase";

const TRUE_VALUE = "true";

export const isProduction = process.env.NODE_ENV === "production";
export const isDevPreview = process.env.NEXT_PUBLIC_DEV_PREVIEW === TRUE_VALUE;
export const isServiceWorkerEnabled = process.env.NEXT_PUBLIC_ENABLE_SW === TRUE_VALUE;
export const isPwaExperimentsEnabled =
  process.env.NEXT_PUBLIC_ENABLE_PWA_EXPERIMENTS === TRUE_VALUE;
export const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
export const storageProvider: StorageProvider =
  process.env.NEXT_PUBLIC_STORAGE_PROVIDER === "supabase" ? "supabase" : "indexeddb";
