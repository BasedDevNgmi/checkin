import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isLocalStorageMode } from "@/lib/storage-mode";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function HomePage() {
  if (isLocalStorageMode()) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
