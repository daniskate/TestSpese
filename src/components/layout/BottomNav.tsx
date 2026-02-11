import { NavLink, useParams } from "react-router";
import { LayoutDashboard, Receipt, ArrowLeftRight, BarChart3, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "", icon: LayoutDashboard, label: "Home" },
  { to: "spese", icon: Receipt, label: "Spese" },
  { to: "debiti", icon: ArrowLeftRight, label: "Debiti" },
  { to: "grafici", icon: BarChart3, label: "Grafici" },
  { to: "categorie", icon: Tag, label: "Categorie" },
];

export function BottomNav() {
  const { groupId } = useParams();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={`/g/${groupId}/${item.to}`}
            end={item.to === ""}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
