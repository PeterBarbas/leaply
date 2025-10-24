'use client'

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCw, Activity, Users, TrendingUp, Clock } from "lucide-react";

type ActivityStats = {
  totalUsers: number;
  activeUsers: number;
  totalAttempts: number;
  recentActivity: Array<{
    id: string;
    user_email: string;
    action: string;
    timestamp: string;
    details?: any;
  }>;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    lastCheck: string;
  };
};

export default function ActivityMonitorTab() {
  const [key, setKey] = useState("");
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadActivityStats() {
    try {
      setLoading(true);
      setErr(null);
      const adminKey = sessionStorage.getItem("admin_key");
      if (!adminKey) {
        setErr("Admin key not found");
        return;
      }
      const res = await fetch("/api/admin/activity", {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load activity stats");
      setStats(data);
    } catch (e: any) {
      setErr(e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  // Get admin key from session and load data
  useEffect(() => {
    const k = sessionStorage.getItem("admin_key");
    if (k) {
      setKey(k);
      loadActivityStats(); // Auto-load when component mounts
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (key && stats) {
      const interval = setInterval(loadActivityStats, 30000);
      return () => clearInterval(interval);
    }
  }, [key, stats]);

  return (
    <>
      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={loadActivityStats} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {stats && (
        <>
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.systemHealth.database === 'healthy' ? '✓' : '⚠'}
                    </p>
                    <p className="text-sm text-muted-foreground">System Health</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="border-none">
              <CardHeader>
                <CardTitle className="text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Database</p>
                    <p className="text-sm text-muted-foreground">Connection status</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    stats.systemHealth.database === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : stats.systemHealth.database === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.systemHealth.database}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">API Services</p>
                    <p className="text-sm text-muted-foreground">External service status</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    stats.systemHealth.api === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : stats.systemHealth.api === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.systemHealth.api}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mt-2">
                  Last checked: {new Date(stats.systemHealth.lastCheck).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </>
  );
}
