import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  type Firestore
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "orcs-vs-humans-mobile.firebaseapp.com",
  projectId: "orcs-vs-humans-mobile",
  storageBucket: "orcs-vs-humans-mobile.firebasestorage.app",
  messagingSenderId: "303878706418",
  appId: "1:303878706418:web:6b96377f9f360e117e6c6b"
};

/**
 * Robust Singleton initialization for Firebase.
 * This pattern prevents 'Service unavailable' errors by ensuring the App 
 * is initialized exactly once and that all services reference that same instance.
 */
function getOrInitializeApp(): FirebaseApp {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }
  return initializeApp(firebaseConfig);
}

const app = getOrInitializeApp();

// Explicitly initialize services using the confirmed app instance
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

export interface PlayerData {
  uid: string;
  gold: number;
  wood: number;
  mission: number;
  faction: string;
  lastUpdated: number;
}

export const initAuth = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user.uid);
      } else {
        signInAnonymously(auth)
          .then(cred => resolve(cred.user.uid))
          .catch((err) => {
            console.error("Firebase Auth: Anonymous login failed.", err);
            resolve(null);
          });
      }
    });
  });
};

export const saveGameState = async (data: PlayerData) => {
  try {
    const userRef = doc(db, "players", data.uid);
    await setDoc(userRef, { ...data, lastUpdated: serverTimestamp() }, { merge: true });
    return true;
  } catch (e) {
    console.error("Firebase Firestore: Error saving state.", e);
    return false;
  }
};

export const loadGameState = async (uid: string): Promise<PlayerData | null> => {
  try {
    const userRef = doc(db, "players", uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as PlayerData) : null;
  } catch (e) {
    console.error("Firebase Firestore: Error loading state.", e);
    return null;
  }
};

export const getLeaderboard = async () => {
  try {
    const playersRef = collection(db, "players");
    const q = query(playersRef, orderBy("mission", "desc"), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as PlayerData);
  } catch (e) {
    console.error("Firebase Firestore: Error fetching leaderboard.", e);
    return [];
  }
};

export default app;