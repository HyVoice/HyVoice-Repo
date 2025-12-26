// test-firebase.js
import { auth, db } from './firebase/config.js';
import { collection, addDoc } from 'firebase/firestore';

// Test if Firebase is connected
console.log("Firebase Auth:", auth);
console.log("Firestore DB:", db);

// Test write (optional)
try {
  const testRef = await addDoc(collection(db, "test"), {
    message: "Firebase is working!",
    timestamp: new Date()
  });
  console.log("✅ Firebase connection successful! Document ID:", testRef.id);
} catch (error) {
  console.log("❌ Firebase connection failed:", error.message);
}