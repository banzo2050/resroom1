import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createDefaultAdmin } from './scripts/createDefaultAdmin.ts';
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdO3wj012WXTW8yzYog9fWDS1EqAU6KZ8",
  authDomain: "uneswa-reroom.firebaseapp.com",
  projectId: "uneswa-reroom",
  storageBucket: "uneswa-reroom.firebasestorage.app",
  messagingSenderId: "456118836766",
  appId: "1:456118836766:web:f14cf47fdd60edc233180f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence for Firestore
if (import.meta.env.DEV) {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
}

// Set auth persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

// Loading component
const LoadingScreen = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Loading ResRoom...</h1>
      <p>Please wait while we initialize the application.</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong</h1>
          <p style={{ marginBottom: '16px' }}>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#991b1b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Execute this only during development to ensure we have an admin user
if (import.meta.env.DEV) {
  createDefaultAdmin()
    .then(result => {
      if (result.success) {
        console.log('Admin setup:', result.message);
        if (result.credentials) {
          console.log('Admin credentials:', result.credentials);
          console.log('Be sure to change the password after first login!');
        }
      } else {
        console.warn('Admin setup warning:', result.message);
      }
    })
    .catch(error => {
      console.warn('Warning during setup:', error);
    });
}

// Export Firebase instances for use in other files
export { auth, db, storage };

// Wrap the app in error boundary and suspense
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
);
