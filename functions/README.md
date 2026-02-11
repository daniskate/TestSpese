# SpeseDivise - Cloud Functions

Cloud Functions per l'invio di notifiche push Firebase Cloud Messaging.

## Funzioni Implementate

### 1. `onExpenseCreated`
Trigger: Quando viene creata una nuova spesa/entrata in un gruppo.

**Percorso**: `groups/{groupId}/expenses/{expenseId}`

**Notifiche inviate**:
- 📝 Nuova spesa: Notifica tutti i membri quando viene aggiunta una spesa
- 💰 Nuova entrata: Notifica tutti i membri quando viene aggiunta un'entrata

### 2. `onGroupUpdated`
Trigger: Quando il documento del gruppo viene aggiornato.

**Percorso**: `groups/{groupId}`

**Notifiche inviate**:
- 💰 Debito saldato: Quando un membro salda un debito
- 👥 Nuovo membro: Quando un membro entra nel gruppo
- 👥 Membro rimosso: Quando un membro lascia il gruppo
- 📝 Gruppo aggiornato: Quando il nome del gruppo cambia

## Gestione Token FCM

Le Cloud Functions:
- Inviano notifiche a tutti i token FCM registrati nel gruppo
- Rimuovono automaticamente i token non validi
- Gestiscono gli errori di invio

## Deploy

```bash
# Build
npm run build

# Deploy
npm run deploy

# Logs
npm run logs
```

## Struttura

- `src/index.ts` - Entry point con tutte le Cloud Functions
- `src/notifications.ts` - Logica per inviare notifiche FCM
- `src/types.ts` - TypeScript types condivisi

## Configurazione Firebase

Le notifiche sono configurate per:
- **Web**: Notifiche push con service worker
- **Android**: Priorità alta con suono e vibrazione
- **iOS**: Badge e suono

## Note

- Le notifiche rispettano le preferenze utente salvate in localStorage (lato client)
- I token FCM vengono salvati nel campo `fcmTokens` del documento gruppo
- Le notifiche includono link diretti al gruppo per aprire l'app
