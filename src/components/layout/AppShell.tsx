import { Outlet, useLocation, useParams } from "react-router";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useGroup } from "@/context/GroupContext";
import { JoinGroupDialog } from "@/components/group/JoinGroupDialog";
import { useExpenseNotifications } from "@/hooks/useExpenseNotifications";
import { useGroupNotifications } from "@/hooks/useGroupNotifications";

export function AppShell() {
  const { group, loading, error, currentMemberId } = useGroup();
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();

  // Listen for new expenses and show notifications
  useExpenseNotifications(groupId, group?.name || "");

  // Listen for group changes (settlements, members, etc.) and show notifications
  useGroupNotifications(groupId, currentMemberId);

  // Don't show header on the main group page (dashboard)
  const isGroupDashboard = location.pathname.match(/^\/g\/[^/]+$/);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-medium text-destructive">
          {error ?? "Gruppo non trovato"}
        </p>
        <a href="/" className="text-primary underline">
          Torna alla home
        </a>
      </div>
    );
  }

  if (!currentMemberId) {
    return <JoinGroupDialog />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isGroupDashboard && <Header />}
      <main className={`mx-auto w-full max-w-lg flex-1 ${!isGroupDashboard ? 'px-4 pb-20 pt-4' : 'pb-20'}`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
