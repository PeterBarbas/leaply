import { supabaseAnon } from "@/lib/supabase";
import SimulationPageClient from "@/components/SimulationPageClient";

type Sim = {
  slug: string;
  title: string;
  steps: any[] | null;
  rubric: string[] | null;
  role_info: any | null;
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
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      <SimulationPageClient sim={sim} />
    </main>
  );
}
