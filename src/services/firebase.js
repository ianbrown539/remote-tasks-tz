// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your REMOTE - TASKS DB - GERALDJOHN EMAIL
const firebaseConfig = {
  apiKey: "AIzaSyCqaeuoQVMLXPPR5qZOahkQAHM3bp9_eyE",
  authDomain: "remote-tasks-35e05.firebaseapp.com",
  projectId: "remote-tasks-35e05",
  storageBucket: "remote-tasks-35e05.firebasestorage.app",
  messagingSenderId: "474694612140",
  appId: "1:474694612140:web:9b0b96afe242d242295b09",
  measurementId: "G-57NM7HSXY0"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);