import { supabaseAnon } from "@/lib/supabase";
import SimulationPageClient from "@/components/SimulationPageClient";

type Sim = {
  slug: string;
  title: string;
  steps: any[] | null;
  rubric: string[] | null;
  active: boolean;
};

async function getSimulation(slug: string): Promise<Sim | null> {
  const { data } = await supabaseAnon
    .from("simulations")
    .select("*")
    .eq("slug", slug)
    .single();
  return (data as Sim) ?? null;
}

export default async function Simulation(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params; // Next 15: await params
  const sim = await getSimulation(slug);
  if (!sim) {
    return <div className="p-8">Not found</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f9fafb] to-[#eef1f5] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 transition-colors">
      <SimulationPageClient sim={sim} />
    </main>
  );
}
