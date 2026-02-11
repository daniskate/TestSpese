import { Routes, Route } from "react-router";
import { GroupProvider } from "@/context/GroupContext";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { GroupPage } from "@/pages/GroupPage";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { DebtsPage } from "@/pages/DebtsPage";
import { ChartsPage } from "@/pages/ChartsPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/g/:groupId"
        element={
          <GroupProvider>
            <AppShell />
          </GroupProvider>
        }
      >
        <Route index element={<GroupPage />} />
        <Route path="spese" element={<ExpensesPage />} />
        <Route path="debiti" element={<DebtsPage />} />
        <Route path="grafici" element={<ChartsPage />} />
        <Route path="categorie" element={<CategoriesPage />} />
        <Route path="impostazioni" element={<SettingsPage />} />
      </Route>
      <Route
        path="*"
        element={
          <div className="flex h-screen flex-col items-center justify-center gap-4">
            <p className="text-lg font-medium">Pagina non trovata</p>
            <a href="/" className="text-primary underline">
              Torna alla home
            </a>
          </div>
        }
      />
    </Routes>
  );
}
