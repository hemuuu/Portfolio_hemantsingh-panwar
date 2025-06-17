// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// In a production environment, consider storing these in environment variables (e.g., .env file)
const firebaseConfig = {
  apiKey: "AIzaSyCRnFUBY7mupHoRT6RRXk9qtmK58eXGoQY",
  authDomain: "hemantportfolio-f20c8.firebaseapp.com",
  projectId: "hemantportfolio-f20c8",
  storageBucket: "hemantportfolio-f20c8.firebasestorage.app",
  messagingSenderId: "143700992225",
  appId: "1:143700992225:web:109f8a181534181c9a97a0",
  measurementId: "G-L9HE4Y272Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, app, analytics, auth }; 