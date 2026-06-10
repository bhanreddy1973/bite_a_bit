import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Next.js requires static string access for process.env to be inlined on the client.
// Dynamic access like process.env[variable] will always be undefined client-side.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Validate that env vars are present (uses the already-resolved static values)
const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value || value.trim() === '')
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(
    `Firebase initialization failed: missing config for: ${missing.join(', ')}. ` +
      'Ensure NEXT_PUBLIC_FIREBASE_* variables are defined in your .env.local file.',
  );
}

const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

export { app, db };
