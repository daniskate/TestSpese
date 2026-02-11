#!/usr/bin/env node

/**
 * Genera il file di configurazione Firebase per il Service Worker
 * Legge le variabili d'ambiente e crea public/firebase-sw-config.js
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica variabili d'ambiente
dotenv.config({ path: join(__dirname, '..', '.env') });

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || ''
};

// Verifica che tutte le variabili siano presenti
const missingVars = Object.entries(config)
  .filter(([_, value]) => !value)
  .map(([key]) => `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

if (missingVars.length > 0) {
  console.error('❌ Variabili d\'ambiente mancanti:', missingVars.join(', '));
  console.error('💡 Copia .env.example in .env e inserisci i valori corretti');
  process.exit(1);
}

// Genera il file
const content = `// ⚠️ QUESTO FILE È GENERATO AUTOMATICAMENTE - NON MODIFICARE
// Viene creato da scripts/generate-sw-config.js durante il build

self.firebaseConfig = ${JSON.stringify(config, null, 2)};
`;

const outputPath = join(__dirname, '..', 'public', 'firebase-sw-config.js');
writeFileSync(outputPath, content, 'utf8');

console.log('✅ File firebase-sw-config.js generato con successo');
