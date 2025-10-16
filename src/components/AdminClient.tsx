"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Pencil, Plus, RefreshCw } from "lucide-react";

type SimRow = {
  slug: string;
  title: string;
  steps: any[] | null;
  rubric: string[] | null;
  active: boolean;
};

export default function AdminClient() {
  const [key, setKey] = useState("");
  const [sims, setSims] = useState<SimRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<SimRow>({
    slug: "",
    title: "",
    steps: [],
    rubric: [],
    active: true,
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const isValid = useMemo(() => form.slug.trim() && form.title.trim(), [form]);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch("/api/admin/simulations", {
        headers: { "x-admin-key": key },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setSims(data.sims);
    } catch (e: any) {
      setErr(e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ slug: "", title: "", steps: [], rubric: [], active: true });
    setEditingSlug(null);
  }

  async function save() {
    try {
      setErr(null);
      if (!isValid) throw new Error("Please fill slug and title.");
      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        steps: form.steps ?? [],
        rubric: form.rubric ?? [],
        active: !!form.active,
      };
      const method = editingSlug ? "PUT" : "POST";
      const url = editingSlug
        ? `/api/admin/simulations/${encodeURIComponent(editingSlug)}`
        : "/api/admin/simulations";
      const res = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
          "x-admin-key": key,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      await load();
      resetForm();
    } catch (e: any) {
      setErr(e.message || "Save failed");
    }
  }

  async function remove(slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;
    try {
      setErr(null);
      const res = await fetch(`/api/admin/simulations/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        headers: { "x-admin-key": key },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      if (editingSlug === slug) resetForm();
      await load();
    } catch (e: any) {
      setErr(e.message || "Delete failed");
    }
  }

  function startEdit(s: SimRow) {
    setEditingSlug(s.slug);
    setForm({
      slug: s.slug,
      title: s.title,
      steps: s.steps ?? [],
      rubric: s.rubric ?? [],
      active: s.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Optional: remember key in session
  useEffect(() => {
    const k = sessionStorage.getItem("admin_key");
    if (k) setKey(k);
  }, []);
  useEffect(() => {
    if (key) {
      sessionStorage.setItem("admin_key", key);
    }
  }, [key]);

  return (
    <>
      {/* Auth & Actions */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Admin Access
            <Button variant="outline" size="sm" onClick={load} disabled={!key || loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            type="password"
            placeholder="Enter admin password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <Button onClick={load} disabled={!key || loading}>
            {loading ? "Loading…" : "Load simulations"}
          </Button>
          {err && <p className="text-sm text-red-600 sm:col-span-2">{err}</p>}
        </CardContent>
      </Card>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 grid gap-6 lg:grid-cols-2"
      >
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingSlug ? "Edit Simulation" : "Create Simulation"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">Slug</label>
              <Input
                placeholder="e.g. project-management-101"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                disabled={!!editingSlug}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">Title</label>
              <Input
                placeholder="e.g. Project Management 101 — Ship an MVP"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">Steps (JSON)</label>
              <Textarea
                className="min-h-[140px]"
                placeholder='[{"index":0,"kind":"prompt","label":"…"}]'
                value={JSON.stringify(form.steps ?? [], null, 2)}
                onChange={(e) => {
                  try {
                    const val = JSON.parse(e.target.value);
                    setForm((f) => ({ ...f, steps: val }));
                    setErr(null);
                  } catch {
                    setErr("Steps: invalid JSON");
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">Rubric (JSON)</label>
              <Textarea
                className="min-h-[120px]"
                placeholder='["Clarity","Prioritization","Risk handling"]'
                value={JSON.stringify(form.rubric ?? [], null, 2)}
                onChange={(e) => {
                  try {
                    const val = JSON.parse(e.target.value);
                    setForm((f) => ({ ...f, rubric: val }));
                    setErr(null);
                  } catch {
                    setErr("Rubric: invalid JSON");
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Visible on /simulate</p>
              </div>
              <Switch
                checked={!!form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: !!v }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={save} disabled={!isValid}>
                {editingSlug ? "Save Changes" : "Create"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Existing Simulations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sims.length === 0 && (
              <p className="text-sm text-muted-foreground">No simulations loaded.</p>
            )}
            {sims.map((s) => (
              <div
                key={s.slug}
                className="flex items-start justify-between rounded-lg border p-4 bg-card/60"
              >
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    slug: <code>{s.slug}</code> · steps:{" "}
                    {Array.isArray(s.steps) ? s.steps.length : 0} ·{" "}
                    {s.active ? "active" : "inactive"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => startEdit(s)} title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => remove(s.slug)} title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button className="mt-2" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New simulation
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
