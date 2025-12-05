// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsgQz1fsY7ypgh-q5mbsvnSzo_gKdecAU",
  authDomain: "studio-1435535566-ba457.firebaseapp.com",
  projectId: "studio-1435535566-ba457",
  storageBucket: "studio-1435535566-ba457.firebasestorage.app",
  messagingSenderId: "132909065584",
  appId: "1:132909065584:web:ed51bf91eb14b1d87f1bb5"
};


// Initialize Firebase
// To avoid re-initialization on hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
