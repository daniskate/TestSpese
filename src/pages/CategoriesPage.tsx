import { useState } from "react";
import { useParams } from "react-router";
import { useGroup } from "@/context/GroupContext";
import { updateCategories } from "@/services/group-service";
import { generateCategoryId } from "@/lib/group-id";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/types";

export function CategoriesPage() {
  const { group } = useGroup();
  const { groupId } = useParams();
  const [newCatName, setNewCatName] = useState("");
  const [editingCategoryColor, setEditingCategoryColor] = useState<string | null>(null);

  if (!group || !groupId) return null;

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

  const handleCategoryColorChange = async (categoryId: string, newColor: string) => {
    try {
      const updatedCategories = group.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, color: newColor } : cat
      );
      await updateCategories(groupId, updatedCategories);
      setEditingCategoryColor(null);
      toast.success("Colore categoria aggiornato");
    } catch (error) {
      console.error("Error updating category color:", error);
      toast.error("Errore nell'aggiornamento del colore");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6">
      <div className="mx-auto max-w-2xl space-y-6 px-4">
        <div>
          <h2 className="text-2xl font-bold">Categorie</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestisci le categorie per organizzare le tue spese
          </p>
        </div>

        {/* Categories List */}
        <section className="space-y-3">
          <div className="space-y-2">
            {group.categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setEditingCategoryColor(cat.id)}
                      className="h-10 w-10 rounded-full border-2 border-border transition-transform hover:scale-110"
                      style={{ backgroundColor: cat.color }}
                      aria-label="Cambia colore"
                    />
                    {editingCategoryColor === cat.id && (
                      <div className="absolute left-0 top-12 z-10 rounded-lg border border-border bg-card p-3 shadow-lg">
                        <input
                          type="color"
                          value={cat.color}
                          onChange={(e) => handleCategoryColorChange(cat.id, e.target.value)}
                          className="h-10 w-32 cursor-pointer rounded border-none"
                        />
                        <button
                          onClick={() => setEditingCategoryColor(null)}
                          className="mt-2 w-full rounded-md bg-muted px-3 py-1 text-xs"
                        >
                          Chiudi
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {cat.icon} {cat.name}
                    </p>
                    {cat.isDefault && (
                      <p className="text-xs text-muted-foreground">Default</p>
                    )}
                  </div>
                </div>
                {!cat.isDefault && (
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nuova categoria..."
              className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={30}
            />
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
