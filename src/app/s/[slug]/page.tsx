import { supabaseAnon } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import SimulationPageClient from "@/components/SimulationPageClient";

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

async function createAttempt(simulationId: string, userId?: string): Promise<string> {
  // If user is logged in, check for existing attempt first
  if (userId) {
    const { data: existingAttempt } = await supabaseAdmin
      .from("attempts")
      .select("id")
      .eq("simulation_id", simulationId)
      .eq("user_id", userId)
      .single();

    if (existingAttempt) {
      // Return existing attempt ID
      return existingAttempt.id;
    }
  }

  // Create new attempt if no existing one found
  const { data: attempt, error } = await supabaseAdmin
    .from("attempts")
    .insert({ 
      simulation_id: simulationId, 
      user_id: userId || null,
      status: "started" 
    })
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

  return completedSteps?.map((step: any) => step.step_index) || [];
}

export default async function Simulation(props: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ attemptId?: string }>
}) {
  const { slug } = await props.params;
  const { attemptId } = await props.searchParams;
  const sim = await getSimulation(slug);
  
  if (!sim) {
    return <div className="p-8">Simulation not found</div>;
  }

  // Get current user session
  let currentUserId: string | undefined;
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    currentUserId = session?.user?.id;
  } catch (error) {
    console.log('No authenticated user found');
  }

  // If no attemptId provided, create one on the server
  let finalAttemptId = attemptId;
  if (!finalAttemptId) {
    try {
      finalAttemptId = await createAttempt(sim.id, currentUserId);
    } catch (error) {
      return <div className="p-8">Failed to start attempt</div>;
    }
  }

  // Get completed tasks for this attempt
  const completedTasks = await getCompletedTasks(finalAttemptId);

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      <SimulationPageClient 
        sim={sim} 
        attemptId={finalAttemptId} 
        completedTasks={completedTasks}
        userId={currentUserId}
      />
    </main>
  );
}
