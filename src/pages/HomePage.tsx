import { useState, useEffect } from "react";
import { Link } from "react-router";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import { CreateGroupForm } from "@/components/group/CreateGroupForm";
import { Receipt, Users, ChevronRight, Loader2 } from "lucide-react";

interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
}

export function HomePage() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const q = query(
          collection(db, "groups"),
          orderBy("updatedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: d.id as string,
            name: d.name as string,
            memberCount: Array.isArray(d.members) ? d.members.length : 0,
          };
        });
        setGroups(data);
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Receipt className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">SpeseDivise</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestisci le spese condivise con il tuo gruppo in modo semplice e
            veloce.
          </p>
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
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
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

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <CreateGroupForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Hai un link di invito? Aprilo direttamente nel browser.
        </p>
      </div>
    </div>
  );
}
