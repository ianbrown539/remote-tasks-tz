// src/services/firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration - REMOTE TASK TZ
const firebaseConfig = {
  apiKey: "AIzaSyDRJETg4am6t_4k0K_SurKbg3ShSFDAAb0",
  authDomain: "remote-task-tz.firebaseapp.com",
  projectId: "remote-task-tz",
  storageBucket: "remote-task-tz.firebasestorage.app",
  messagingSenderId: "1031492506838",
  appId: "1:1031492506838:web:ff53c17cba32514d3ca577",
  measurementId: "G-PE02J1V24D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize analytics (only in browser)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Export the initialized services
export { auth, db, analytics, storage };

// Default export
export default app;