import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBLmlQd2-6-9NkdR6EcW2RGpuc6NgHxDoI',
  authDomain: 'work-from-home-b02f2.firebaseapp.com',
  projectId: 'work-from-home-b02f2',
  storageBucket: 'work-from-home-b02f2.firebasestorage.app',
  messagingSenderId: '55979273116',
  appId: '1:55979273116:web:d5fe6426ed4bb8b1c3f659',
  measurementId: 'G-JFWG39L8P3',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);