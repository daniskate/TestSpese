import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { CreateGroupForm } from "@/components/group/CreateGroupForm";
import { Users, ChevronRight, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
  color?: string;
  icon?: string;
  updatedAt?: Timestamp;
}

export function HomePage() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!confirm("Vuoi disconnetterti?")) return;
    try {
      await signOut();
      toast.success("Disconnesso");
      navigate("/auth");
    } catch {
      toast.error("Errore durante il logout");
    }
  };

  useEffect(() => {
    async function fetchGroups() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Query groups where user has access
        // Note: removed orderBy to avoid needing a composite index
        // We'll sort on the client side instead
        const q = query(
          collection(db, "groups"),
          where("userIds", "array-contains", user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: d.id as string,
            name: d.name as string,
            memberCount: Array.isArray(d.members) ? d.members.length : 0,
            color: d.color as string | undefined,
            icon: d.icon as string | undefined,
            updatedAt: d.updatedAt,
          };
        });

        // Sort by updatedAt on client side (most recent first)
        data.sort((a, b) => {
          if (!a.updatedAt || !b.updatedAt) return 0;
          return b.updatedAt.toMillis() - a.updatedAt.toMillis();
        });

        setGroups(data);
        console.log("Groups loaded:", data.length);
      } catch (err) {
        console.error("Error fetching groups:", err);
        // Log the full error to help debug
        if (err instanceof Error) {
          console.error("Error message:", err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header with Logout */}
        <div className="relative">
          <div className="text-center">
            <img
              src="/pwa-192x192.png"
              alt="Splitease"
              className="mx-auto mb-4 h-16 w-16 rounded-2xl"
            />
            <h1 className="text-2xl font-bold">SplitEase</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Gestisci le spese condivise con il tuo gruppo in modo semplice e
              veloce.
            </p>
          </div>

          {/* Logout button in top right */}
          {user && (
            <button
              onClick={handleLogout}
              className="absolute right-0 top-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Disconnetti"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          groups.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                I tuoi gruppi
              </h2>
              <div className="space-y-2">
                {groups.map((g) => (
                  <Link
                    key={g.id}
                    to={`/g/${g.id}`}
                    className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-md transition-all duration-200 hover:shadow-lg active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                        style={{
                          backgroundColor: g.color || "#2D7A5F",
                          color: "#ffffff"
                        }}
                      >
                        {g.icon ? (
                          <span className="text-xl">{g.icon}</span>
                        ) : (
                          <Users className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.memberCount}{" "}
                          {g.memberCount === 1 ? "membro" : "membri"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          )
        )}

        <div className="rounded-2xl bg-card p-6 shadow-md">
          <CreateGroupForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Hai un link di invito? Aprilo direttamente nel browser.
        </p>
      </div>
    </div>
  );
}
