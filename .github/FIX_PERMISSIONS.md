# 🔧 Fix Permessi Service Account per Cloud Functions

## Problema
Il service account di GitHub Actions non ha i permessi per deployare Cloud Functions.

## Soluzione Rapida

### 1️⃣ Trova il Service Account

1. Vai su GitHub: **Settings** → **Secrets and variables** → **Actions**
2. Trova `FIREBASE_SERVICE_ACCOUNT`
3. Nel JSON c'è il campo `"client_email"`, qualcosa tipo:
   ```
   github-actions-xxxxx@studio-6659628549-fb7cd.iam.gserviceaccount.com
   ```

### 2️⃣ Aggiungi i Permessi

Vai su: [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam?project=studio-6659628549-fb7cd)

**Trova il service account** con l'email copiata sopra.

**Aggiungi questi ruoli:**

1. **Service Usage Consumer** ✅
   - Ruolo: `roles/serviceusage.serviceUsageConsumer`
   - Serve per: Abilitare API necessarie

2. **Cloud Functions Developer** ✅
   - Ruolo: `roles/cloudfunctions.developer`
   - Serve per: Deployare e aggiornare functions

3. **Cloud Build Editor** ✅
   - Ruolo: `roles/cloudbuild.builds.editor`
   - Serve per: Buildare le functions

4. **Service Account User** ✅
   - Ruolo: `roles/iam.serviceAccountUser`
   - Serve per: Eseguire le functions

### 3️⃣ Passo per Passo

1. **Apri IAM**:
   https://console.cloud.google.com/iam-admin/iam?project=studio-6659628549-fb7cd

2. **Trova il service account** nella lista (cerca `github-actions`)

3. **Clicca sulla matita** (✏️ Edit) a destra

4. **+ ADD ANOTHER ROLE** per ogni ruolo:
   - Service Usage Consumer
   - Cloud Functions Developer
   - Cloud Build Editor
   - Service Account User

5. **Salva**

6. **Aspetta 2-3 minuti** per la propagazione dei permessi

7. **Ri-trigera il workflow** su GitHub Actions

## 🎯 Verifica

Dopo aver aggiunto i permessi, il deploy dovrebbe funzionare:

```bash
# Fai un piccolo commit per ri-triggerare il workflow
git commit --allow-empty -m "Test deploy with new permissions"
git push origin main
```

## 📋 Checklist Permessi

- [ ] Service Usage Consumer
- [ ] Cloud Functions Developer
- [ ] Cloud Build Editor
- [ ] Service Account User
- [ ] Firebase Admin (dovrebbe già esserci per l'hosting)

## 🔍 Troubleshooting

### Errore: "403 Forbidden"
→ Aspetta 2-3 minuti dopo aver aggiunto i permessi

### Errore: "API not enabled"
→ Service Usage Consumer mancante

### Errore: "Cannot deploy functions"
→ Cloud Functions Developer mancante

### Errore: "Build failed"
→ Cloud Build Editor mancante

## 📚 Documentazione Google

- [IAM Roles for Cloud Functions](https://cloud.google.com/functions/docs/reference/iam/roles)
- [Service Accounts](https://cloud.google.com/iam/docs/service-accounts)

## 🎉 Dopo la Fix

Una volta aggiunti i permessi:
- ✅ Deploy automatico funzionerà
- ✅ Cloud Functions si aggiorneranno ad ogni push su main
- ✅ Notifiche push attive per tutti gli utenti
- ✅ Zero configurazione locale necessaria

---

**Nota**: Se non hai accesso alla Google Cloud Console, chiedi al proprietario del progetto Firebase di aggiungere questi permessi al service account.
