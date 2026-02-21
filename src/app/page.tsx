import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginPage from "@/app/login/page";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}
