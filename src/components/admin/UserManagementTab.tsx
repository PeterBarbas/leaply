'use client'

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Shield, ShieldOff, Search, RefreshCw, Mail, Calendar } from "lucide-react";

type User = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  banned?: boolean;
  last_activity?: string;
  total_attempts?: number;
};

export default function UserManagementTab() {
  const [key, setKey] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function loadUsers() {
    try {
      setLoading(true);
      setErr(null);
      const adminKey = sessionStorage.getItem("admin_key");
      if (!adminKey) {
        setErr("Admin key not found");
        return;
      }
      const res = await fetch("/api/admin/users", {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load users");
      setUsers(data.users || []);
    } catch (e: any) {
      setErr(e.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone.`)) return;
    try {
      setErr(null);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "x-admin-key": key },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      await loadUsers();
    } catch (e: any) {
      setErr(e.message || "Delete failed");
    }
  }

  async function toggleBanUser(userId: string, currentBanned: boolean) {
    try {
      setErr(null);
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": key,
        },
        body: JSON.stringify({ banned: !currentBanned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Toggle ban failed");
      await loadUsers();
    } catch (e: any) {
      setErr(e.message || "Toggle ban failed");
    }
  }

  // Get admin key from session and load data
  useEffect(() => {
    const k = sessionStorage.getItem("admin_key");
    if (k) {
      setKey(k);
      loadUsers(); // Auto-load when component mounts
    }
  }, []);

  return (
    <>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-none shadow-none">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Users ({users.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
          </CardHeader>
          <CardContent className="space-y-3">
          <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by email or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {filteredUsers.length === 0 && users.length === 0 && (
              <p className="text-sm text-muted-foreground">No users loaded.</p>
            )}
            {filteredUsers.length === 0 && users.length > 0 && (
              <p className="text-sm text-muted-foreground">No users match your search.</p>
            )}
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-4 bg-card/60"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                    {user.banned && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        Banned
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                    {user.total_attempts !== undefined && (
                      <div>Attempts: {user.total_attempts}</div>
                    )}
                    {user.last_activity && (
                      <div>Last activity: {new Date(user.last_activity).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => toggleBanUser(user.id, user.banned || false)} 
                    title={user.banned ? "Unban user" : "Ban user"}
                    className={user.banned ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                  >
                    {user.banned ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => deleteUser(user.id, user.email)} 
                    title="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
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
