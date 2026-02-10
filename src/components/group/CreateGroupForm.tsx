import { useState } from "react";
import { useNavigate } from "react-router";
import { createGroupWithMembers } from "@/services/group-service";
import { Users, Plus, X } from "lucide-react";
import { toast } from "sonner";

export function CreateGroupForm() {
  const [step, setStep] = useState<"name" | "members">("name");
  const [groupName, setGroupName] = useState("");
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [newMemberInput, setNewMemberInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = groupName.trim();
    if (!trimmed) return;
    setStep("members");
  };

  const handleAddMember = () => {
    const trimmed = newMemberInput.trim();
    if (!trimmed) return;
    if (memberNames.includes(trimmed)) {
      toast.error("Questo membro è già stato aggiunto");
      return;
    }
    setMemberNames([...memberNames, trimmed]);
    setNewMemberInput("");
  };

  const handleRemoveMember = (index: number) => {
    setMemberNames(memberNames.filter((_, i) => i !== index));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    if (memberNames.length === 0) {
      toast.error("Aggiungi almeno un membro");
      return;
    }

    setLoading(true);
    try {
      const groupId = await createGroupWithMembers(
        groupName.trim(),
        memberNames
      );
      toast.success("Gruppo creato!");
      navigate(`/g/${groupId}`);
    } catch (error) {
      console.error("Errore creazione gruppo:", error);
      const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
      toast.error(`Errore: ${errorMessage}`);
      setLoading(false);
    }
  };

  if (step === "name") {
    return (
      <form onSubmit={handleNameSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="group-name" className="text-sm font-medium">
            Nome del gruppo
          </label>
          <input
            id="group-name"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="es. Vacanza Sardegna 2026"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={50}
          />
        </div>
        <button
          type="submit"
          disabled={!groupName.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Users className="h-4 w-4" />
          Continua
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCreateGroup} className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Aggiungi i membri</h3>
        <p className="text-sm text-muted-foreground">
          Gruppo: <strong>{groupName}</strong>
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMemberInput}
            onChange={(e) => setNewMemberInput(e.target.value)}
            placeholder="Nome membro..."
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={30}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddMember();
              }
            }}
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleAddMember}
            disabled={!newMemberInput.trim() || loading}
            className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {memberNames.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Membri ({memberNames.length})
          </p>
          <div className="space-y-2">
            {memberNames.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-2"
              >
                <span className="text-sm">{name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => setStep("name")}
          disabled={loading}
          className="flex-1 rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          Indietro
        </button>
        <button
          type="submit"
          disabled={memberNames.length === 0 || loading}
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Creazione..." : "Crea Gruppo"}
        </button>
      </div>
    </form>
  );
}
