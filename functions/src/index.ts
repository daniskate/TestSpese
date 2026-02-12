import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin
admin.initializeApp();

// Cloud Functions removed to avoid billing issues
// Cloud Messaging and push notifications have been disabled

logger.info("Firebase Functions initialized without cloud messaging");
