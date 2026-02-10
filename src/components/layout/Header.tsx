import { useNavigate, useParams } from "react-router";
import { Settings, Share2 } from "lucide-react";
import { useGroup } from "@/context/GroupContext";
import { toast } from "sonner";

export function Header() {
  const { group } = useGroup();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const handleShare = async () => {
    const url = `${window.location.origin}/g/${groupId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "SpeseDivise",
          text: `Unisciti al gruppo "${group?.name}" per gestire le spese!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiato negli appunti!");
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <h1 className="truncate text-lg font-semibold">
          {group?.name ?? "SpeseDivise"}
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Condividi"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate(`/g/${groupId}/impostazioni`)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Impostazioni"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
