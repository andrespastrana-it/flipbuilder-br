import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdTX99ZaVop1Dk25if_T1_VwrXJCX23so",
  authDomain: "gen-lang-client-0867969722.firebaseapp.com",
  projectId: "gen-lang-client-0867969722",
  storageBucket: "gen-lang-client-0867969722.firebasestorage.app",
  messagingSenderId: "533921602804",
  appId: "1:533921602804:web:91320961ecaa3b44d092a1",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
// Assuming we are not using the default database if firestoreDatabaseId was set, we should check if we need to pass databaseId.
// Yes, we should pass databaseId to getFirestore if it's not default. Wait, let's check firebase applet config:
// "firestoreDatabaseId": "ai-studio-flipbuilderbr-3f597378-9c1d-4d0a-87c4-56b0068b5d0a"
export const db = getFirestore(app, "ai-studio-flipbuilderbr-3f597378-9c1d-4d0a-87c4-56b0068b5d0a");
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
