import { supabaseAnon, supabaseAdmin } from "@/lib/supabase";
import SimulationOverviewClient from "@/components/SimulationOverviewClient";

type Sim = {
  id: string;
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

async function createAttempt(simulationId: string): Promise<string> {
  const { data: attempt, error } = await supabaseAdmin
    .from("attempts")
    .insert({ simulation_id: simulationId, status: "started" })
    .select("id")
    .single();

  if (error || !attempt) {
    throw new Error("Failed to create attempt");
  }

  return attempt.id;
}

async function getCompletedTasks(attemptId: string): Promise<number[]> {
  const { data: completedSteps, error } = await supabaseAdmin
    .from("attempt_steps")
    .select("step_index")
    .eq("attempt_id", attemptId);

  if (error) {
    return [];
  }

  return completedSteps?.map(step => step.step_index) || [];
}

export default async function SimulationOverview(props: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ attemptId?: string }>
}) {
  const { slug } = await props.params;
  const { attemptId } = await props.searchParams;
  const sim = await getSimulation(slug);
  
  if (!sim) {
    return <div className="p-8">Simulation not found</div>;
  }

  // If no attemptId provided, create one on the server
  let finalAttemptId = attemptId;
  if (!finalAttemptId) {
    try {
      finalAttemptId = await createAttempt(sim.id);
    } catch (error) {
      return <div className="p-8">Failed to start attempt</div>;
    }
  }

  // Get completed tasks for this attempt
  const completedTasks = await getCompletedTasks(finalAttemptId);

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      <SimulationOverviewClient sim={sim} attemptId={finalAttemptId} completedTasks={completedTasks} />
    </main>
  );
}
