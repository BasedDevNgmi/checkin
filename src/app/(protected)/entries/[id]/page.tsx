import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { EntryDetailView } from "@/components/entries/EntryDetailView";
import { EntryDetailClient } from "@/components/entries/EntryDetailClient";
import { isLocalStorageMode } from "@/lib/storage-mode";

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (isLocalStorageMode()) {
    return <EntryDetailClient id={id} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: checkin, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !checkin) notFound();

  return (
    <div className="space-y-6 py-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar tijdlijn
      </Link>
      <EntryDetailView checkin={checkin} />
    </div>
  );
}
