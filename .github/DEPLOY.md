# Deploy Automatico con GitHub Actions

Questo progetto utilizza GitHub Actions per il deploy automatico su Firebase quando viene fatto push sul branch `main`.

## 🚀 Cosa Viene Deployato

Quando fai push su `main`, il workflow automaticamente:

1. ✅ **Build Frontend** - Compila l'applicazione React/Vite
2. ✅ **Deploy Hosting** - Pubblica su Firebase Hosting
3. ✅ **Build Cloud Functions** - Compila le TypeScript functions
4. ✅ **Deploy Cloud Functions** - Pubblica le notifiche push functions

## 🔑 Configurazione Secrets

Il workflow richiede che questi secrets siano configurati nel repository GitHub:

### `FIREBASE_SERVICE_ACCOUNT`
Il JSON del service account Firebase. Viene già usato per l'hosting.

**Come verificare:**
1. Vai su GitHub → Settings → Secrets and variables → Actions
2. Verifica che `FIREBASE_SERVICE_ACCOUNT` esista
3. Se esiste, è già configurato correttamente! ✅

### `GITHUB_TOKEN`
Token automatico fornito da GitHub Actions (non serve configurarlo).

## 📋 Workflow

File: `.github/workflows/firebase-deploy.yml`

### Trigger
```yaml
on:
  push:
    branches:
      - main
```

Il deploy parte automaticamente quando:
- Fai push direttamente su `main`
- Mergei una PR su `main`

### Steps
1. **Checkout** - Scarica il codice
2. **Setup Node** - Installa Node.js 20
3. **Install Dependencies** - Installa dipendenze frontend
4. **Build Frontend** - Compila React app
5. **Install Functions Dependencies** - Installa dipendenze Cloud Functions
6. **Build Functions** - Compila TypeScript → JavaScript
7. **Deploy Hosting** - Pubblica sito web
8. **Deploy Functions** - Pubblica Cloud Functions

## 🎯 Come Usare

### Per deployare:
```bash
# 1. Fai le tue modifiche
git add .
git commit -m "Le tue modifiche"

# 2. Pusha sul tuo branch
git push origin claude/group-deletion-charts-NEDTr

# 3. Quando sei pronto, mergia su main
# Il deploy partirà automaticamente!
```

### Monitorare il Deploy

1. Vai su GitHub → Actions
2. Vedrai il workflow "Deploy to Firebase" in esecuzione
3. Clicca per vedere i log in tempo reale
4. Quando diventa verde ✅ il deploy è completato!

## 🔍 Troubleshooting

### Deploy fallisce per Cloud Functions

**Possibili cause:**
- Service account non ha permessi per Cloud Functions
- Errori di sintassi nel codice TypeScript
- Dipendenze mancanti

**Soluzione:**
Controlla i log del workflow su GitHub Actions per vedere l'errore specifico.

### Service Account Permissions

Il service account deve avere questi ruoli:
- Firebase Admin
- Cloud Functions Developer
- Service Account User

Questi dovrebbero già essere configurati se l'hosting funziona.

## 📱 Notifiche Push

Dopo il primo deploy delle Cloud Functions:
1. Le notifiche push saranno attive
2. Funzioneranno anche con app chiusa
3. Gli utenti vedranno notifiche per:
   - Nuove spese
   - Nuove entrate
   - Debiti saldati
   - Membri aggiunti/rimossi
   - Modifiche al gruppo

## 🧪 Testing Locale

Per testare le functions localmente prima del deploy:

```bash
cd functions
npm run build
firebase emulators:start --only functions
```

## 📚 Risorse

- [Firebase CI/CD](https://firebase.google.com/docs/hosting/github-integration)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Firebase Functions](https://firebase.google.com/docs/functions)
