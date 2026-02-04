import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if environment variables are loaded
const isConfigValid = firebaseConfig.projectId && firebaseConfig.apiKey;

if (!isConfigValid) {
    console.error("Firebase Configuration Error: Some environment variables are missing. Please check your .env file and RESTART the dev server (Ctrl+C and npm run dev).");
}

// Initialize Firebase only if config is valid to prevent fatal crash
const app = isConfigValid ? initializeApp(firebaseConfig) : null;

// Initialize services safely
export const analytics = (app && typeof window !== 'undefined') ? getAnalytics(app) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;

export default app;
