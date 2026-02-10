import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  </StrictMode>
);

// PWA service worker registration
import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() {
    if (confirm("Nuova versione disponibile. Vuoi aggiornare?")) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log("App pronta per l'uso offline");
  },
});
