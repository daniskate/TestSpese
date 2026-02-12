import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useGroup } from "@/context/GroupContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import {
  addMember,
  deleteGroup,
  updateMemberColor,
} from "@/services/group-service";
import { exportExpensesToCSV } from "@/lib/csv-export";
import { migrateGroupsToAuth } from "@/scripts/migrate-groups";
import {
  ArrowLeft,
  Download,
  Share2,
  UserPlus,
  Trash2,
  LogOut,
  Moon,
  Sun,
  User,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export function SettingsPage() {
  const { group, expenses, clearMember } = useGroup();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [newMemberName, setNewMemberName] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [editingMemberColor, setEditingMemberColor] = useState<string | null>(null);

  if (!group || !groupId) return null;

  const handleShare = async () => {
    const url = `${window.location.origin}/g/${groupId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "SpeseDivise",
          text: `Unisciti al gruppo "${group.name}"!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiato!");
      }
    } catch {
      // cancelled
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMemberName.trim();
    if (!trimmed) return;
    setAddingMember(true);
    try {
      await addMember(groupId, trimmed, group.members);
      setNewMemberName("");
      toast.success(`${trimmed} aggiunto al gruppo`);
    } catch {
      toast.error("Errore");
    } finally {
      setAddingMember(false);
    }
  };

  const handleExport = () => {
    exportExpensesToCSV(expenses, group.members, group.categories);
    toast.success("CSV scaricato!");
  };

  const handleLogout = async () => {
    if (!confirm("Vuoi disconnetterti?")) return;
    try {
      await signOut();
      clearMember();
      toast.success("Disconnesso");
      navigate("/auth");
    } catch {
      toast.error("Errore durante il logout");
    }
  };

  const handleMigrateGroups = async () => {
    if (!user) {
      toast.error("Devi essere autenticato");
      return;
    }

    if (!confirm("Vuoi migrare tutti i gruppi esistenti al tuo account? Questo aggiungerà il tuo userId a tutti i gruppi senza proprietario.")) {
      return;
    }

    try {
      toast.info("Migrazione in corso...");
      await migrateGroupsToAuth(user.uid);
      toast.success("Migrazione completata! Ricarica la pagina.");
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Errore durante la migrazione");
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm(`Sei sicuro di voler eliminare il gruppo "${group.name}"? Questa azione è irreversibile e eliminerà tutte le spese.`)) {
      return;
    }

    try {
      await deleteGroup(groupId);
      clearMember();
      toast.success("Gruppo eliminato");
      navigate("/");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Errore nell'eliminazione del gruppo");
    }
  };

  const handleMemberColorChange = async (memberId: string, newColor: string) => {
    try {
      await updateMemberColor(groupId, memberId, newColor, group.members);
      setEditingMemberColor(null);
      toast.success("Colore aggiornato");
    } catch (error) {
      console.error("Error updating member color:", error);
      toast.error("Errore nell'aggiornamento del colore");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/g/${groupId}`)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">Impostazioni</h2>
      </div>

      {/* User Info */}
      {user && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Account
          </h3>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <User className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">{user.displayName || "Utente"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </section>
      )}

      {/* Theme Toggle */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Aspetto
        </h3>
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : (
              <Sun className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm">
              {theme === "dark" ? "Modalità Scura" : "Modalità Chiara"}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative h-7 w-14 flex-shrink-0 overflow-hidden rounded-full transition-colors ${
              theme === "dark" ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                theme === "dark" ? "left-8" : "left-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Share */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Condivisione
        </h3>
        <button
          onClick={handleShare}
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:bg-accent"
        >
          <Share2 className="h-4 w-4 text-primary" />
          <span>Condividi link del gruppo</span>
        </button>
      </section>

      {/* Members */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Membri</h3>
        <div className="space-y-2">
          {group.members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <MemberAvatar name={m.name} color={m.color} size="sm" />
                <span className="text-sm">{m.name}</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setEditingMemberColor(m.id)}
                  className="h-8 w-8 rounded-lg border-2 border-border transition-transform hover:scale-110"
                  style={{ backgroundColor: m.color }}
                  aria-label="Cambia colore"
                />
                {editingMemberColor === m.id && (
                  <div className="absolute right-0 top-10 z-10 rounded-lg border border-border bg-card p-3 shadow-lg">
                    <input
                      type="color"
                      value={m.color}
                      onChange={(e) => handleMemberColorChange(m.id, e.target.value)}
                      className="h-10 w-32 cursor-pointer rounded border-none"
                    />
                    <button
                      onClick={() => setEditingMemberColor(null)}
                      className="mt-2 w-full rounded-md bg-muted px-3 py-1 text-xs"
                    >
                      Chiudi
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddMember} className="flex gap-2">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Nuovo membro..."
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={addingMember}
          />
          <button
            type="submit"
            disabled={!newMemberName.trim() || addingMember}
            className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        </form>
      </section>

      {/* Export */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Esportazione
        </h3>
        <button
          onClick={handleExport}
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:bg-accent"
        >
          <Download className="h-4 w-4 text-primary" />
          <span>Esporta spese in CSV</span>
        </button>
      </section>

      {/* Migration Tool (Debug) */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Strumenti
        </h3>
        <button
          onClick={handleMigrateGroups}
          className="flex w-full items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-600 transition-colors hover:bg-blue-100"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Migra gruppi esistenti</span>
        </button>
        <p className="text-xs text-muted-foreground">
          Usa questo pulsante se non vedi i tuoi gruppi dopo il login. Aggiunge il tuo account ai gruppi esistenti.
        </p>
      </section>

      {/* Delete Group */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Zona Pericolosa
        </h3>
        <button
          onClick={handleDeleteGroup}
          className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 transition-colors hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
          <span>Elimina gruppo</span>
        </button>
      </section>

      {/* Logout */}
      <section>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 transition-colors hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnetti</span>
        </button>
      </section>
    </div>
  );
}
