# 💰 SplitEase 

**SplitEase** è un'app web moderna per la gestione collaborativa delle spese di gruppo. Perfetta per coinquilini, viaggi, eventi e qualsiasi situazione in cui più persone condividono le spese.

![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## ✨ Funzionalità

- 📊 **Gestione Spese di Gruppo** - Traccia spese condivise con amici, famiglia o colleghi
- 👥 **Membri Multipli** - Aggiungi membri ai gruppi e assegna quote personalizzate
- 💳 **Calcolo Automatico Debiti** - L'app calcola automaticamente chi deve cosa a chi
- 📈 **Statistiche e Grafici** - Visualizza i tuoi dati con grafici a torta e barre interattivi
- 🏷️ **Categorie Personalizzate** - Organizza le spese con categorie ed emoji
- 💰 **Supporto Entrate** - Traccia anche le entrate oltre alle spese
- 🌓 **Dark Mode** - Tema scuro completo per ridurre l'affaticamento degli occhi
- 🔔 **Notifiche Push** - Ricevi notifiche per nuove spese e modifiche ai gruppi
- 📱 **PWA** - Installabile come app nativa su mobile e desktop
- 🔐 **Autenticazione Firebase** - Login sicuro con Google
- ☁️ **Sincronizzazione Cloud** - Dati sincronizzati in tempo reale su tutti i dispositivi

---

## 🚀 Quick Start

### Prerequisiti

- Node.js 18+ e npm
- Account Firebase con progetto configurato
- Git

### Installazione

```bash
# 1. Clona il repository
git clone https://github.com/daniskate/TestSpese.git
cd TestSpese

# 2. Installa le dipendenze
npm install

# 3. Configura le variabili d'ambiente
cp .env.example .env
# Modifica .env con le tue credenziali Firebase

# 4. Avvia il server di sviluppo
npm run dev

L'app sarà disponibile su http://localhost:5173

🔧 Configurazione Firebase
1. Crea un progetto Firebase
Vai su Firebase Console
Crea un nuovo progetto
Abilita Authentication (Google Sign-In)
Abilita Firestore Database
Abilita Cloud Messaging (per le notifiche push)
Abilita Hosting
2. Configura le variabili d'ambiente
Copia .env.example in .env e compila i valori:

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here

Dove trovare questi valori:

Vai su Firebase Console → Project Settings → General
Scroll in basso e copia i valori dalla tua app web
Per il VAPID Key: vai su Cloud Messaging → Web Push certificates
3. Configura Firestore Rules
Carica le regole di sicurezza per Firestore:

firebase deploy --only firestore:rules

📦 Build e Deploy
Build Locale
# Build per produzione
npm run build

# Preview del build
npm run preview

Deploy Automatico su Firebase
Il progetto include GitHub Actions per il deploy automatico su Firebase quando viene fatto push su main.

Setup:

Vai su Repository Settings → Secrets → Actions

Aggiungi questi secrets:

VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_VAPID_KEY
FIREBASE_SERVICE_ACCOUNT (JSON completo del service account)
Ogni push su main triggera automaticamente il deploy!

Deploy Manuale:

# Deploy hosting + functions
firebase deploy

# Solo hosting
firebase deploy --only hosting

# Solo functions
firebase deploy --only functions

Per maggiori dettagli sul deploy, vedi .github/DEPLOY.md

🏗️ Struttura del Progetto
TestSpese/
├── src/
│   ├── components/       # Componenti React riutilizzabili
│   │   ├── expenses/    # Componenti per le spese
│   │   ├── group/       # Componenti per i gruppi
│   │   ├── layout/      # Layout e navigazione
│   │   └── notifications/ # Gestione notifiche
│   ├── pages/           # Pagine principali dell'app
│   ├── context/         # React Context (tema, auth, ecc.)
│   ├── hooks/           # Custom React Hooks
│   ├── lib/             # Utility e helper functions
│   ├── services/        # Servizi Firebase (Firestore, Auth)
│   ├── types/           # TypeScript types e interfaces
│   └── config/          # Configurazione Firebase
├── functions/           # Firebase Cloud Functions
│   └── src/
│       ├── index.ts     # Entry point functions
│       ├── notifications.ts # Logica notifiche push
│       └── types.ts     # Types per functions
├── public/              # Asset statici
├── scripts/             # Script di build e utility
├── .github/
│   ├── workflows/       # GitHub Actions CI/CD
│   ├── DEPLOY.md       # Guida al deployment
│   └── FIX_PERMISSIONS.md # Guida permessi service account
└── firebase.json        # Configurazione Firebase


🛠️ Tecnologie Utilizzate
Frontend
React 18 - UI library
TypeScript - Type safety
Vite - Build tool e dev server ultra-veloce
Tailwind CSS - Utility-first CSS framework
Recharts - Grafici e visualizzazioni
React Router - Routing
Lucide React - Icone moderne
Backend
Firebase Authentication - Gestione utenti
Cloud Firestore - Database NoSQL real-time
Cloud Functions - Serverless backend
Cloud Messaging - Notifiche push
Firebase Hosting - Hosting web
DevOps
GitHub Actions - CI/CD automatico
ESLint - Linting del codice
TypeScript Compiler - Type checking
📱 Progressive Web App (PWA)
SplitEase è una PWA completa:

✅ Installabile su mobile e desktop
✅ Funziona offline (service worker)
✅ Notifiche push
✅ Icone adaptive per Android/iOS
✅ Splash screen personalizzato
🤝 Contribuire
Contributi, issues e feature requests sono benvenuti!

Fork il progetto
Crea un branch per la feature (git checkout -b feature/AmazingFeature)
Commit le modifiche (git commit -m 'Add some AmazingFeature')
Push sul branch (git push origin feature/AmazingFeature)
Apri una Pull Request
📄 Licenza
Questo progetto è privato. Tutti i diritti riservati.

👨‍💻 Autore
Daniele Monari

GitHub: @daniskate
🙏 Credits
Sviluppato con ❤️ usando:

React
Firebase
Vite
Tailwind CSS
Recharts
📚 Documentazione Aggiuntiva
Guida al Deployment
Configurazione Service Account
Fix Permessi Cloud Functions
Cloud Functions README
Buon splitting! 💰✨
