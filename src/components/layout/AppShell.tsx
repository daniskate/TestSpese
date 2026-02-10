import { Outlet } from "react-router";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useGroup } from "@/context/GroupContext";
import { JoinGroupDialog } from "@/components/group/JoinGroupDialog";

export function AppShell() {
  const { group, loading, error, currentMemberId } = useGroup();

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
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
