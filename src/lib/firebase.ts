// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "fintrack-lite-4yuq1",
  "appId": "1:727065405168:web:39ad75ee096301bf9e8435",
  "storageBucket": "fintrack-lite-4yuq1.firebasestorage.app",
  "apiKey": "AIzaSyClEctvM5B39kBcUO41n6_dDDgzb_ErX1o",
  "authDomain": "fintrack-lite-4yuq1.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "727065405168"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
