# 🔍 Come Trovare il Service Account Corretto

## Il service account che devi modificare NON è il "Default compute service account"!

### Passo 1: Trova l'Email del Service Account

**Su GitHub:**

1. Vai su: https://github.com/daniskate/TestSpese
2. **Settings** → **Secrets and variables** → **Actions**
3. Trova il secret chiamato `FIREBASE_SERVICE_ACCOUNT`
4. Clicca **Update** (non cambiare nulla, solo per vedere)
5. Nel JSON vedrai un campo `"client_email"`:
   ```json
   {
     "type": "service_account",
     "project_id": "studio-6659628549-fb7cd",
     "private_key_id": "...",
     "private_key": "...",
     "client_email": "github-action-XXXXX@studio-6659628549-fb7cd.iam.gserviceaccount.com"
     ...
   }
   ```

6. **Copia l'email** (il valore di `"client_email"`)

### Passo 2: Cerca QUELL'Email su IAM

1. Vai su: https://console.cloud.google.com/iam-admin/iam?project=studio-6659628549-fb7cd

2. **Cerca nella lista** il service account con l'email copiata
   - Potrebbe essere qualcosa tipo: `github-action-123456@...`
   - NON è il "Default compute service account"!

3. Se NON lo trovi nella lista, devi **aggiungerlo**:
   - Clicca **+ GRANT ACCESS**
   - Incolla l'email nel campo "New principals"
   - Aggiungi i 5 ruoli (vedi sotto)

### Passo 3: Aggiungi i Permessi

Al service account con l'email trovata, aggiungi:

1. ✅ **Service Usage Consumer**
2. ✅ **Cloud Functions Developer**
3. ✅ **Cloud Build Editor**
4. ✅ **Service Account User**
5. ✅ **Editor** (se non c'è già)

### Screenshot della Tua Situazione

Nella tua screenshot vedo:
```
Default compute service account    ← ❌ QUESTO È SBAGLIATO!
Daniele Monari (Proprietario)       ← ✅ Questo va bene
```

Devi trovare il service account di GitHub Actions e dargli i permessi!

---

## 🆘 Alternativa: Creare un Nuovo Service Account

Se non trovi il service account di GitHub Actions, possiamo crearne uno nuovo:

### 1. Crea Service Account

```bash
# Dal terminale locale
gcloud iam service-accounts create github-actions-deploy \
    --display-name="GitHub Actions Deploy" \
    --project=studio-6659628549-fb7cd
```

### 2. Aggiungi i Ruoli

```bash
# Email del nuovo service account
SA_EMAIL="github-actions-deploy@studio-6659628549-fb7cd.iam.gserviceaccount.com"

# Aggiungi tutti i ruoli necessari
gcloud projects add-iam-policy-binding studio-6659628549-fb7cd \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/serviceusage.serviceUsageConsumer"

gcloud projects add-iam-policy-binding studio-6659628549-fb7cd \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudfunctions.developer"

gcloud projects add-iam-policy-binding studio-6659628549-fb7cd \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding studio-6659628549-fb7cd \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding studio-6659628549-fb7cd \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/firebase.admin"
```

### 3. Genera la Chiave JSON

```bash
gcloud iam service-accounts keys create ~/github-actions-key.json \
    --iam-account=$SA_EMAIL
```

### 4. Aggiorna il Secret su GitHub

1. Copia il contenuto di `~/github-actions-key.json`
2. Vai su GitHub → Settings → Secrets → Actions
3. Aggiorna `FIREBASE_SERVICE_ACCOUNT` con il nuovo JSON
4. Ri-trigera il workflow

---

## 📝 Riassunto

**Hai dato i permessi al service account sbagliato!**

Devi:
1. Trovare l'email del service account dal secret GitHub
2. Cercare QUELL'email su IAM Console
3. Aggiungere i 5 ruoli a QUEL service account

Oppure creare un nuovo service account con i comandi sopra.
