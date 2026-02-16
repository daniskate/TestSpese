import { useState } from "react";
import { useParams } from "react-router";
import { useGroup } from "@/context/GroupContext";
import { updateCategories } from "@/services/group-service";
import { generateCategoryId } from "@/lib/group-id";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/types";

// Mapping old emoji icons to new PNG icons
const ICON_MIGRATION_MAP: Record<string, string> = {
  "🍕": "/Icons/icon_alimentari.png",
  "🍔": "/Icons/icon_alimentari.png",
  "🍟": "/Icons/icon_alimentari.png",
  "🌮": "/Icons/icon_alimentari.png",
  "🍜": "/Icons/icon_alimentari.png",
  "🍱": "/Icons/icon_alimentari.png",
  "🍣": "/Icons/icon_alimentari.png",
  "🥗": "/Icons/icon_alimentari.png",
  "🍰": "/Icons/icon_alimentari.png",
  "☕": "/Icons/icon_caffe.png",
  "🚗": "/Icons/icon_trasporti.png",
  "🚕": "/Icons/icon_trasporti.png",
  "🚌": "/Icons/icon_trasporti.png",
  "✈️": "/Icons/icon_viaggi.png",
  "🏠": "/Icons/icon_casa.png",
  "🏥": "/Icons/icon_salute.png",
  "💊": "/Icons/icon_salute.png",
  "🎬": "/Icons/icon_intrattenimento.png",
  "🎮": "/Icons/icon_intrattenimento.png",
  "📚": "/Icons/icon_istruzione.png",
  "👕": "/Icons/icon_vestiti.png",
  "👗": "/Icons/icon_vestiti.png",
  "👠": "/Icons/icon_vestiti.png",
  "💄": "/Icons/icon_vestiti.png",
  "💰": "/Icons/icon_stipendio.png",
  "💳": "/Icons/icon_abbonamenti.png",
  "🎁": "/Icons/icon_regali.png",
  "🛒": "/Icons/icon_alimentari.png",
  "🔧": "/Icons/icon_casa.png",
  "⚡": "/Icons/icon_bollette.png",
  "💡": "/Icons/icon_bollette.png",
  "📱": "/Icons/icon_tecnologia.png",
  "💻": "/Icons/icon_tecnologia.png",
  "🎵": "/Icons/icon_svago.png",
  "🏋️": "/Icons/icon_attivita_fisica.png",
  "⚽": "/Icons/icon_attivita_fisica.png",
  "🎾": "/Icons/icon_attivita_fisica.png",
  "🎨": "/Icons/icon_svago.png",
  "📸": "/Icons/icon_tecnologia.png",
  "🌴": "/Icons/icon_viaggi.png",
  "🎉": "/Icons/icon_svago.png",
  "🐕": "/Icons/icon_animali.png",
  "🐈": "/Icons/icon_animali.png",
  "👨‍👩‍👧‍👦": "/Icons/icon_famiglia.png",
  "👪": "/Icons/icon_famiglia.png",
  "📦": "/Icons/icon_svago.png",
};

const CATEGORY_EMOJIS = [
  "🍕", "🍔", "🍟", "🌮", "🍜", "🍱", "🍣", "🥗", "🍰", "☕",
  "🚗", "🚕", "🚌", "✈️", "🏠", "🏥", "💊", "🎬", "🎮", "📚",
  "👕", "👗", "👠", "💄", "💰", "💳", "🎁", "🛒", "🔧", "⚡",
  "📱", "💻", "🎵", "🏋️", "⚽", "🎾", "🎨", "📸", "🌴", "🎉",
];

export function CategoriesPage() {
  const { group } = useGroup();
  const { groupId } = useParams();
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("📌");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingCategoryColor, setEditingCategoryColor] = useState<string | null>(null);

  if (!group || !groupId) return null;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    const newCat: Category = {
      id: generateCategoryId(),
      name: trimmed,
      icon: newCatEmoji,
      color: "#6B7280",
      isDefault: false,
    };

    await updateCategories(groupId, [...group.categories, newCat]);
    setNewCatName("");
    setNewCatEmoji("📌");
    setShowEmojiPicker(false);
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

  const handleMigrateIcons = async () => {
    if (!confirm("Vuoi migrare tutte le icone emoji alle nuove icone PNG?")) return;

    try {
      const updatedCategories = group.categories.map((cat) => {
        // Check if icon is an emoji and needs migration
        if (cat.icon.length <= 2 && ICON_MIGRATION_MAP[cat.icon]) {
          return { ...cat, icon: ICON_MIGRATION_MAP[cat.icon] };
        }
        return cat;
      });

      await updateCategories(groupId, updatedCategories);
      toast.success("Icone migrate con successo!");
    } catch (error) {
      console.error("Error migrating icons:", error);
      toast.error("Errore nella migrazione delle icone");
    }
  };

  const hasEmojiIcons = group.categories.some(cat => cat.icon.length <= 2);

  return (
    <div className="min-h-screen bg-background pb-24 pt-6">
      <div className="mx-auto max-w-2xl space-y-6 px-4">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Categorie</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gestisci le categorie per organizzare le tue spese
              </p>
            </div>
            {hasEmojiIcons && (
              <button
                onClick={handleMigrateIcons}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Aggiorna icone</span>
              </button>
            )}
          </div>
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
                      className="h-10 w-10 rounded-full border-2 border-border transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
                      style={{ backgroundColor: cat.color }}
                      aria-label="Cambia colore"
                    >
                      {cat.icon.startsWith('/') ? (
                        <img
                          src={cat.icon}
                          alt={cat.name}
                          className="h-6 w-6 object-contain"
                        />
                      ) : (
                        <span className="text-lg">{cat.icon}</span>
                      )}
                    </button>
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
                      {cat.name}
                    </p>
                    {cat.isDefault && (
                      <p className="text-xs text-muted-foreground">Default</p>
                    )}
                  </div>
                </div>
                {!cat.isDefault && (
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-500 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Category Form */}
          <div className="space-y-3">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-input bg-background text-2xl transition-colors hover:bg-accent"
                >
                  {newCatEmoji}
                </button>
                {showEmojiPicker && (
                  <div className="absolute left-0 top-14 z-10 max-h-64 w-64 overflow-y-auto rounded-lg border border-border bg-card p-3 shadow-lg">
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
                      {CATEGORY_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setNewCatEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-accent"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                className="rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
