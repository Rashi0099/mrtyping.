import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Trash2, Edit2, Users, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) checkAdminAndLoad();
  }, [user]);

  async function checkAdminAndLoad() {
    try {
      const res = await fetchWithAuth('/admin/users/');

      if (res.status === 403) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to load users");

      const usersData = await res.json();
      setUsers(usersData);
      setIsAdmin(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const res = await fetchWithAuth('/admin/users/?action=delete', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted");
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to delete user");
    }
  }

  async function handleSaveEdit(userId: string) {
    const res = await fetchWithAuth('/admin/users/?action=update-profile', {
      method: "POST",
      body: JSON.stringify({ userId, display_name: editName, bio: editBio }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, display_name: editName, bio: editBio } : u
        )
      );
      setEditingId(null);
      toast.success("Profile updated");
    } else {
      toast.error("Failed to update profile");
    }
  }

  function startEdit(u: AdminUser) {
    setEditingId(u.id);
    setEditName(u.display_name);
    setEditBio(u.bio || "");
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-14">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-14">
        <Shield className="h-12 w-12 text-destructive" />
        <h1 className="font-mono text-xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-mono text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage {users.length} registered users
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {editingId === u.id ? (
                        <div className="space-y-1">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                            placeholder="Display name"
                          />
                          <input
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            className="w-full rounded border border-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                            placeholder="Bio"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-foreground">{u.display_name}</div>
                          {u.bio && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {u.bio}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === u.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(u.id)}
                              className="rounded p-1.5 text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(u)}
                              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
