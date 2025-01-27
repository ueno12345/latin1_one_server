import * as admin from 'firebase-admin';
import * as path from 'path';
import { readFile } from 'fs/promises';

// Firebaseを初期化する非同期関数
async function initializeFirebase() {
  try {
    if (!admin.apps.length) {
      const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
      const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf-8'));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase initialized successfully.");
    }
  } catch (error) {
    throw new Error(`Firebase initialization error: ${error.message}`);
  }
}

// Firebaseを即時初期化
initializeFirebase().catch((error) => {
  console.error(error);
});

export { admin };
