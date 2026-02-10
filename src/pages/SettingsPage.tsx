import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useGroup } from "@/context/GroupContext";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { addMember, updateCategories } from "@/services/group-service";
import { exportExpensesToCSV } from "@/lib/csv-export";
import { generateCategoryId } from "@/lib/group-id";
import {
  ArrowLeft,
  Download,
  Share2,
  UserPlus,
  Plus,
  Trash2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/types";

export function SettingsPage() {
  const { group, expenses, clearMember } = useGroup();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [newMemberName, setNewMemberName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [addingMember, setAddingMember] = useState(false);

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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    const newCat: Category = {
      id: generateCategoryId(),
      name: trimmed,
      icon: "\u{1F4CC}",
      color: "#6B7280",
      isDefault: false,
    };

    await updateCategories(groupId, [...group.categories, newCat]);
    setNewCatName("");
    toast.success("Categoria aggiunta");
  };

  const handleDeleteCategory = async (catId: string) => {
    const cat = group.categories.find((c) => c.id === catId);
    if (!cat) return;
    if (!confirm(`Eliminare la categoria "${cat.name}"?`)) return;
    await updateCategories(
      groupId,
      group.categories.filter((c) => c.id !== catId)
    );
    toast.success("Categoria eliminata");
  };

  const handleLogout = () => {
    clearMember();
    navigate(`/g/${groupId}`);
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
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <MemberAvatar name={m.name} color={m.color} size="sm" />
              <span className="text-sm">{m.name}</span>
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

      {/* Categories */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Categorie
        </h3>
        <div className="space-y-1">
          {group.categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm">
                  {cat.icon} {cat.name}
                </span>
              </div>
              {!cat.isDefault && (
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nuova categoria..."
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!newCatName.trim()}
            className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
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

      {/* Logout */}
      <section>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 transition-colors hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          <span>Cambia membro</span>
        </button>
      </section>
    </div>
  );
}
