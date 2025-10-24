'use client'

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Save, AlertTriangle, Globe, Mail, Shield } from "lucide-react";

type AdminSettings = {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowUserRegistration: boolean;
  emailNotifications: boolean;
  maxUsersPerDay: number;
  systemAnnouncement: string;
};

export default function AdminSettingsTab() {
  const [key, setKey] = useState("");
  const [settings, setSettings] = useState<AdminSettings>({
    maintenanceMode: false,
    maintenanceMessage: "We're currently performing maintenance. Please check back later.",
    allowUserRegistration: true,
    emailNotifications: true,
    maxUsersPerDay: 100,
    systemAnnouncement: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadSettings() {
    try {
      setLoading(true);
      setErr(null);
      const adminKey = sessionStorage.getItem("admin_key");
      if (!adminKey) {
        setErr("Admin key not found");
        return;
      }
      const res = await fetch("/api/admin/settings", {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load settings");
      setSettings(data.settings || settings);
    } catch (e: any) {
      setErr(e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setErr(null);
      setSuccess(null);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-key": key,
        },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save settings");
      setSuccess("Settings saved successfully!");
    } catch (e: any) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // Get admin key from session and load data
  useEffect(() => {
    const k = sessionStorage.getItem("admin_key");
    if (k) {
      setKey(k);
      loadSettings(); // Auto-load when component mounts
    }
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* System Status */}
        <Card className="border-none shadow-none">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              System Status
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadSettings} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
          </CardHeader>
          <CardContent className="space-y-4 border-none shadow-none px-3">
            <div className="flex flex-col rounded-lg border-none p-3 ">
              <div className="flex items-center justify-between mb-2"> 
                <p className="text-sm font-medium">Maintenance Mode</p>
                <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(v) => setSettings(s => ({ ...s, maintenanceMode: v }))}
              />
              </div>
                          <div className="grid gap-2">
              <Textarea
                placeholder="Enter maintenance message..."
                value={settings.maintenanceMessage || ""}
                onChange={(e) => setSettings(s => ({ ...s, maintenanceMessage: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            </div>
          </CardContent>
        </Card>

        {/* System Announcement */}
        <Card className="border-none shadow-none pt-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              System Announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Textarea
                placeholder="Announcement Message (leave empty to disable)..."
                value={settings.systemAnnouncement || ""}
                onChange={(e) => setSettings(s => ({ ...s, systemAnnouncement: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end px-4">
          <Button onClick={saveSettings} disabled={!key || saving} className="min-w-[120px]">
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </>
  );
}
