import { CreateGroupForm } from "@/components/group/CreateGroupForm";
import { Receipt } from "lucide-react";

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Receipt className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">SpeseDivise</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestisci le spese condivise con il tuo gruppo in modo semplice e
            veloce.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <CreateGroupForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Hai un link di invito? Aprilo direttamente nel browser.
        </p>
      </div>
    </div>
  );
}
