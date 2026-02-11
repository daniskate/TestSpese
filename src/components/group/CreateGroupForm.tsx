import { useState } from "react";
import { useNavigate } from "react-router";
import { createGroupWithMembers } from "@/services/group-service";
import { MEMBER_COLORS } from "@/lib/default-categories";
import { Users, Plus, X } from "lucide-react";
import { toast } from "sonner";

const GROUP_EMOJIS = [
  "🏖️", "🏔️", "🏕️", "🎿", "🏝️", "✈️", "🚗", "🎉", "🎊", "🎈",
  "🏠", "🏡", "🏢", "🏨", "🏪", "💼", "🎓", "⚽", "🏀", "🎾",
  "🎮", "🎬", "🎭", "🎨", "📚", "💰", "🍕", "🍔", "☕", "🍺",
  "🎵", "🎸", "🎤", "🎧", "📱", "💻", "🎯", "🎪", "🌍", "🌟",
];

export function CreateGroupForm() {
  const [step, setStep] = useState<"name" | "members">("name");
  const [groupName, setGroupName] = useState("");
  const [groupColor, setGroupColor] = useState(MEMBER_COLORS[0]!);
  const [groupIcon, setGroupIcon] = useState("👥");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
        memberNames,
        groupColor,
        groupIcon
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
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Icona del gruppo
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-input bg-background text-4xl transition-all hover:scale-105 hover:border-primary"
            >
              {groupIcon}
            </button>
            {showEmojiPicker && (
              <div className="absolute left-0 top-20 z-10 max-h-64 w-72 overflow-y-auto rounded-lg border border-border bg-card p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Scegli un'icona</p>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Chiudi
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {GROUP_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setGroupIcon(emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded text-2xl transition-colors hover:bg-accent"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Colore del gruppo
          </label>
          <div className="flex flex-wrap gap-2">
            {MEMBER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setGroupColor(color)}
                className="h-10 w-10 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  border: groupColor === color ? "3px solid #000" : "2px solid #e5e7eb",
                  boxShadow: groupColor === color ? "0 0 0 2px #fff" : "none",
                }}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={!groupName.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
          style={{ backgroundColor: "#FDB913", color: "#1E293B" }}
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
          className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
          style={{ backgroundColor: "#FDB913", color: "#1E293B" }}
        >
          {loading ? "Creazione..." : "Crea Gruppo"}
        </button>
      </div>
    </form>
  );
}
