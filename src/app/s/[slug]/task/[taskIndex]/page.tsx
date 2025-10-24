import { supabaseAnon } from "@/lib/supabase";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import TaskPageClient from "@/components/TaskPageClient";

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

export default async function TaskPage(props: { 
  params: Promise<{ slug: string; taskIndex: string }>,
  searchParams: Promise<{ attemptId?: string }>
}) {
  const { slug, taskIndex } = await props.params;
  const { attemptId } = await props.searchParams;
  const sim = await getSimulation(slug);
  
  if (!sim) {
    return <div className="p-8">Simulation not found</div>;
  }

  const taskIndexNum = parseInt(taskIndex);
  const tasks = sim.steps || [];
  
  if (taskIndexNum < 0 || taskIndexNum >= tasks.length) {
    return <div className="p-8">Task not found</div>;
  }

  if (!attemptId) {
    return <div className="p-8">Attempt ID required</div>;
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

  const task = tasks[taskIndexNum];

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      <TaskPageClient 
        sim={sim}
        task={task}
        taskIndex={taskIndexNum}
        attemptId={attemptId}
        userId={currentUserId}
      />
    </main>
  );
}
