// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your AI-TRAINING-TASKS DB
const firebaseConfig = {
  apiKey: "AIzaSyAp5CrpSIbVL3AFl-cfBHBBDE8xpDwvbTA",
  authDomain: "ai-training-tasks.firebaseapp.com",
  projectId: "ai-training-tasks",
  storageBucket: "ai-training-tasks.firebasestorage.app",
  messagingSenderId: "635815062881",
  appId: "1:635815062881:web:3e0463099cda2b712fa920",
  measurementId: "G-Q8QG41159X"
};

// Your OUTLIER DB
// const firebaseConfig = {
//   apiKey: "AIzaSyA0uNerHR8ydHhkA6rrq1gUJXZ9Dd_uSVs",
//   authDomain: "outlier-tasks-a3b50.firebaseapp.com",
//   projectId: "outlier-tasks-a3b50",
//   storageBucket: "outlier-tasks-a3b50.firebasestorage.app",
//   messagingSenderId: "423623709538",
//   appId: "1:423623709538:web:2db34260f843dad5a6923b",
//   measurementId: "G-9RK5Q61P1B"
// };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);