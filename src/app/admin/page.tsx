export const dynamic = "force-dynamic"; // always fresh

import AdminClient from "@/components/AdminClient";

export default async function AdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f9fafb] to-[#eef1f5] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 transition-colors">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Admin — Simulations
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add, edit, and remove simulations (modules/jobs).
        </p>

        <div className="mt-8">
          <AdminClient />
        </div>
      </div>
    </main>
  );
}
