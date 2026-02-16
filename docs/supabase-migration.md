# Supabase Readiness Notes

## Current State
- Storage access goes through repository contracts in `src/core/storage/contracts.ts`.
- Local provider is implemented in `src/core/storage/indexeddb/repositories.ts`.
- Supabase provider stubs are present in `src/core/storage/supabase/repositories.ts`.
- Provider selection is centralized in `src/core/storage/index.ts`.

## Migration Steps
1. Create Supabase tables mirroring `MoodCheckIn`, `JournalEntry`, and `UserPreferences`.
2. Implement CRUD methods in `supabaseRepositoryBundle`.
3. Set `NEXT_PUBLIC_STORAGE_PROVIDER=supabase`.
4. Add auth and conflict resolution strategy (`updatedAt` + optional merge UI).
