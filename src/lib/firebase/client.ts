// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-1435535566-ba457",
  "appId": "1:132909065584:web:5c539d51fda0a9347f1bb5",
  "apiKey": "AIzaSyAsgQz1fsY7ypgh-q5mbsvnSzo_gKdecAU",
  "authDomain": "studio-1435535566-ba457.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "132909065584"
};


// Initialize Firebase
// To avoid re-initialization on hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
