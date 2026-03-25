import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
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

// Initialize Auth specifically for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;

