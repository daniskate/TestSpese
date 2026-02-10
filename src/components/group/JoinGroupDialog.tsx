import { useState } from "react";
import { useParams } from "react-router";
import { useGroup } from "@/context/GroupContext";
import { addMember } from "@/services/group-service";
import { UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

export function JoinGroupDialog() {
  const { groupId } = useParams<{ groupId: string }>();
  const { group, selectMember } = useGroup();
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!group || !groupId) return null;

  const handleJoinExisting = (memberId: string) => {
    selectMember(memberId);
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const member = await addMember(groupId, trimmed, group.members);
      selectMember(member.id);
      toast.success(`Benvenuto, ${trimmed}!`);
    } catch {
      toast.error("Errore nella creazione del membro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-xl font-bold">{group.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chi sei? Seleziona il tuo nome o creane uno nuovo.
          </p>
        </div>

        {group.members.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Membri esistenti</span>
            </div>
            <div className="space-y-2">
              {group.members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleJoinExisting(member.id)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <UserPlus className="h-4 w-4" />
            <span>Nuovo membro</span>
          </div>
          <form onSubmit={handleCreateMember} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Il tuo nome..."
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={30}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!newName.trim() || loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Entra
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
