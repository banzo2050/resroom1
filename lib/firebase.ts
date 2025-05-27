import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Debug environment variables
console.log('Environment Variables:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
});

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdO3wj012WXTW8yzYog9fWDS1EqAU6KZ8",
  authDomain: "uneswa-reroom.firebaseapp.com",
  projectId: "uneswa-reroom",
  storageBucket: "uneswa-reroom.firebasestorage.app",
  messagingSenderId: "456118836766",
  appId: "1:456118836766:web:f14cf47fdd60edc233180f"
};

let app;
let auth;
let db;
let storage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');

  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  
  // Set persistence to LOCAL to help with network issues
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Auth persistence set to LOCAL');
    })
    .catch((error) => {
      console.error('Error setting auth persistence:', error);
    });

  // Configure auth settings
  auth.useDeviceLanguage();
  auth.settings.appVerificationDisabledForTesting = true; // Only for development

  console.log('Firebase Auth initialized successfully');

  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  console.log('Firestore initialized successfully');

  // Initialize Firebase Storage and get a reference to the service
  storage = getStorage(app);
  console.log('Storage initialized successfully');

} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { auth, db, storage };
export default app;
