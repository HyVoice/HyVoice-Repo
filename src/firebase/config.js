import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config (no storage!)
const firebaseConfig = {
  apiKey: "AIzaSyA9VwJDwfTSw8NaVK4jRuCf_i6gBzXZlKg",
  authDomain: "hyvoice-d2cba.firebaseapp.com",
  projectId: "hyvoice-d2cba",
  storageBucket: "hyvoice-d2cba.firebasestorage.app",
  messagingSenderId: "1069007313860",
  appId: "1:1069007313860:web:a823e214436c6161522291",
  measurementId: "G-NJDGC0J8HS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// No storage export from Firebase