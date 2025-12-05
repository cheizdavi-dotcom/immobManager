import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// This is a server-side only file.
// It is used to initialize the Firebase Admin SDK.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!serviceAccount) {
    console.error("Firebase service account key is not set in environment variables. Server-side Firebase features will be disabled.");
}

// Initialize Firebase Admin SDK
if (!getApps().length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
}

const adminDb = serviceAccount ? admin.firestore() : null;
const adminAuth = serviceAccount ? admin.auth() : null;

export { adminDb, adminAuth };
