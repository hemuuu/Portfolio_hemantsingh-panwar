// setup-firebase-user.js
// Run this script to create a Firebase user account
// Usage: node setup-firebase-user.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

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
const auth = getAuth(app);

async function createUser() {
  try {
    const email = 'hemuuuuu11@gmail.com';
    const password = 'Hem9623742747';
    
    console.log('Creating Firebase user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ User account created successfully!');
    console.log('User ID:', user.uid);
    console.log('Email:', user.email);
    console.log('\nYou can now use these credentials to login to your admin panels:');
    console.log('Email: hemuuuuu11@gmail.com');
    console.log('Password: Hem9623742747');
    console.log('\nAdmin Panel URLs:');
    console.log('- http://localhost:5173/admin (Portfolio Admin)');
    console.log('- http://localhost:5173/about-admin (About Page Admin)');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ User account already exists!');
      console.log('You can use these credentials to login:');
      console.log('Email: hemuuuuu11@gmail.com');
      console.log('Password: Hem9623742747');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
  }
}

createUser(); 