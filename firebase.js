import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// Replace these values with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyAvyhBJSsqkCsN0eyz8cWQS6HUwTcCr1mA",
  authDomain: "bike-showroom-18d4f.firebaseapp.com",
  projectId: "bike-showroom-18d4f",
  storageBucket: "bike-showroom-18d4f.firebasestorage.app",
  messagingSenderId: "988459189676",
  appId: "1:988459189676:web:10fc1fa00a735abbe3e609",
  measurementId: "G-M30TSVXDDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
