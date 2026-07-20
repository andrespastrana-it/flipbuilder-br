import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADymfKBBqpvwIZGjXaAx7L_MziUd4CreI",
  authDomain: "pcbuilder-a655a.firebaseapp.com",
  projectId: "pcbuilder-a655a",
  storageBucket: "pcbuilder-a655a.firebasestorage.app",
  messagingSenderId: "305721992555",
  appId: "1:305721992555:web:289c74fb2dcd85da6bd82e",
  measurementId: "G-R4M1P5X9ME",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
