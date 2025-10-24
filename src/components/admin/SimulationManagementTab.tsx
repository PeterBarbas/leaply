'use client'

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Eye, EyeOff, RefreshCw, Check, X } from "lucide-react";

type SimRow = {
  slug: string;
  title: string;
  steps: any[] | null;
  rubric: string[] | null;
  active: boolean;
};

export default function SimulationManagementTab() {
  const [key, setKey] = useState("");
  const [sims, setSims] = useState<SimRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{slug: string, field: 'title' | 'slug' | null}>({slug: '', field: null});
  const [editValue, setEditValue] = useState("");


  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const adminKey = sessionStorage.getItem("admin_key");
      if (!adminKey) {
        setErr("Admin key not found");
        return;
      }
      const res = await fetch("/api/attempt/admin/simulations", {
        headers: { "x-admin-key": adminKey },
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


  async function remove(slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;
    try {
      setErr(null);
      const res = await fetch(`/api/attempt/admin/simulations/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        headers: { "x-admin-key": key },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      await load();
    } catch (e: any) {
      setErr(e.message || "Delete failed");
    }
  }

  async function toggleActive(slug: string, currentActive: boolean) {
    try {
      setErr(null);
      const sim = sims.find(s => s.slug === slug);
      if (!sim) return;
      
      const res = await fetch(`/api/attempt/admin/simulations/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-key": key,
        },
        body: JSON.stringify({
          ...sim,
          active: !currentActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Toggle failed");
      await load();
    } catch (e: any) {
      setErr(e.message || "Toggle failed");
    }
  }

  function startEdit(slug: string, field: 'title' | 'slug', currentValue: string) {
    setEditingField({ slug, field });
    setEditValue(currentValue);
  }

  function cancelEdit() {
    setEditingField({ slug: '', field: null });
    setEditValue("");
  }

  async function saveEdit() {
    if (!editingField.field || !editValue.trim()) return;
    
    try {
      setErr(null);
      const adminKey = sessionStorage.getItem("admin_key");
      if (!adminKey) {
        setErr("Admin key not found");
        return;
      }

      // Find the current simulation data
      const sim = sims.find(s => s.slug === editingField.slug);
      if (!sim) {
        setErr("Simulation not found");
        return;
      }

      // Create update data with the full simulation object
      const updateData = {
        ...sim,
        [editingField.field]: editValue.trim()
      };

      console.log('Updating simulation:', updateData);
      
      const res = await fetch(`/api/attempt/admin/simulations/${encodeURIComponent(editingField.slug)}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await res.json();
      console.log('Update response:', res.status, data);
      
      if (!res.ok) throw new Error(data?.error || "Update failed");
      
      await load();
      cancelEdit();
    } catch (e: any) {
      setErr(e.message || "Update failed");
    }
  }

  // Get admin key from session and load data
  useEffect(() => {
    const k = sessionStorage.getItem("admin_key");
    if (k) {
      setKey(k);
      load(); // Auto-load when component mounts
    }
  }, []);

  return (
    <>
      {/* List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-none shadow-none">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <CardTitle className="text-lg">Simulations</CardTitle>
            <Button variant="outline" size="sm" onClick={load} disabled={loading} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {sims.length === 0 && (
              <p className="text-sm text-muted-foreground">No simulations loaded.</p>
            )}
            {sims.map((s) => (
              <div
                key={s.slug}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 rounded-lg border p-3 sm:p-4 bg-card/60"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {editingField.slug === s.slug && editingField.field === 'title' ? (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-6 sm:h-8 text-xs sm:text-sm min-w-0 flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <Button size="sm" variant="ghost" onClick={saveEdit} className="h-6 w-6 sm:h-8 sm:w-8 p-0 flex-shrink-0">
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-6 w-6 sm:h-8 sm:w-8 p-0 flex-shrink-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <p 
                        className="font-medium cursor-pointer hover:text-primary transition-colors"
                        onClick={() => startEdit(s.slug, 'title', s.title)}
                      >
                        {s.title}
                      </p>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      s.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    slug: {editingField.slug === s.slug && editingField.field === 'slug' ? (
                      <div className="inline-flex items-center gap-1 sm:gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-5 sm:h-6 text-xs w-24 sm:w-32"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <Button size="sm" variant="ghost" onClick={saveEdit} className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0">
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <code 
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => startEdit(s.slug, 'slug', s.slug)}
                      >
                        {s.slug}
                      </code>
                    )} · steps: {Array.isArray(s.steps) ? s.steps.length : 0}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => toggleActive(s.slug, s.active)} 
                    title={s.active ? "Deactivate" : "Activate"}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    {s.active ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => remove(s.slug)} 
                    title="Delete"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
