import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Compila tutti i campi");
      return;
    }

    if (isSignUp && !displayName) {
      toast.error("Inserisci il tuo nome");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
        toast.success("Account creato con successo!");
      } else {
        await signIn(email, password);
        toast.success("Login effettuato!");
      }

      // Redirect to the intended page or home
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect);
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email già in uso");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Email non valida");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password troppo debole (min 6 caratteri)");
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        toast.error("Email o password errati");
      } else if (error.code === "auth/invalid-credential") {
        toast.error("Credenziali non valide");
      } else {
        toast.error(isSignUp ? "Errore nella registrazione" : "Errore nel login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="text-center">
          <img
            src="/pwa-192x192.png"
            alt="Splitease"
            className="mx-auto mb-4 h-16 w-16 rounded-2xl"
          />
          <h1 className="text-3xl font-bold">SplitEase</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignUp ? "Crea il tuo account" : "Accedi al tuo account"}
          </p>
        </div>

        {/* Auth Form */}
        <div className="rounded-2xl bg-card p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Il tuo nome"
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.com"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
                minLength={6}
              />
              {isSignUp && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimo 6 caratteri
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isSignUp ? "Registrazione..." : "Login..."}
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {isSignUp ? "Registrati" : "Accedi"}
                </>
              )}
            </button>
          </form>

          {/* Toggle between sign in/sign up */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline transition-all duration-200 active:scale-95"
            >
              {isSignUp
                ? "Hai già un account? Accedi"
                : "Non hai un account? Registrati"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
