// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaq2hZHqMVaZrQs8w0ivBoHzy4HTQNeQ8",
  authDomain: "fieldx-app-387c7.firebaseapp.com",
  projectId: "fieldx-app-387c7",
  storageBucket: "fieldx-app-387c7.appspot.com",
  messagingSenderId: "440379492066",
  appId: "1:440379492066:web:20f68926af47350d00c0bb",
  measurementId: "G-M69C5SZS5E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use the new approach with cache settings instead of enableIndexedDbPersistence
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true, // This may help with connection issues
});

// Initialize analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  // Dynamic import to avoid SSR issues
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  }).catch(error => {
    console.error('Analytics could not be loaded:', error);
  });
}

export { app, auth, db };