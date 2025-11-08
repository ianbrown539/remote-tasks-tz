// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAp5CrpSIbVL3AFl-cfBHBBDE8xpDwvbTA",
  authDomain: "ai-training-tasks.firebaseapp.com",
  projectId: "ai-training-tasks",
  storageBucket: "ai-training-tasks.firebasestorage.app",
  messagingSenderId: "635815062881",
  appId: "1:635815062881:web:3e0463099cda2b712fa920",
  measurementId: "G-Q8QG41159X"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);