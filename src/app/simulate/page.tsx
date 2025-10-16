import Link from "next/link";
import { supabaseAnon } from "@/lib/supabase";
import SimulateClient from "@/components/SimulateClient";

type SimRow = {
  slug: string;
  title: string;
  steps: any[] | null;
  active: boolean;
};

async function getSims(): Promise<SimRow[]> {
  const { data } = await supabaseAnon
    .from("simulations")
    .select("slug,title,steps,active")
    .eq("active", true)
    .order("title", { ascending: true });
  return (data as SimRow[]) ?? [];
}

export default async function SimulatePage() {
  const sims = await getSims();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f9fafb] to-[#eef1f5] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 transition-colors">
      {/* Hand off to a client component for animations / interactivity */}
      <SimulateClient sims={sims} />
    </main>
  );
}
