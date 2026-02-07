
import { initializeApp, FirebaseApp } from "firebase/app";
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
  Firestore, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from "firebase/auth";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "orcs-vs-humans-mobile.firebaseapp.com",
  projectId: "orcs-vs-humans-mobile",
  storageBucket: "orcs-vs-humans-mobile.firebasestorage.app",
  messagingSenderId: "303878706418",
  appId: "1:303878706418:web:6b96377f9f360e117e6c6b",
  measurementId: "G-ZFKRW5M9V2"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  // Ensure we have a key and it looks valid before initializing
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    console.warn("Firebase: Valid API Key missing from process.env.API_KEY. Cloud features disabled.");
  }
} catch (e) {
  console.error("Firebase Initialization Error:", e);
}

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
    if (!auth) {
      console.warn("Auth not initialized. Proceeding in offline mode.");
      return resolve(null);
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        signInAnonymously(auth!)
          .then(cred => resolve(cred.user.uid))
          .catch((err) => {
            console.error("Anonymous Auth failed:", err);
            resolve(null);
          });
      }
    });
  });
};

export const saveGameState = async (data: PlayerData) => {
  if (!db) return false;
  try {
    const userRef = doc(db, "players", data.uid);
    await setDoc(userRef, { ...data, lastUpdated: serverTimestamp() }, { merge: true });
    return true;
  } catch (e) {
    // If the API is disabled or connection fails, this will catch permission-denied errors
    console.warn("Firebase Save Failed (Verify Firestore is enabled in console):", e);
    return false;
  }
};

export const loadGameState = async (uid: string): Promise<PlayerData | null> => {
  if (!db) return null;
  try {
    const userRef = doc(db, "players", uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as PlayerData) : null;
  } catch (e) {
    console.warn("Firebase Load Failed:", e);
    return null;
  }
};

export const getLeaderboard = async () => {
  if (!db) return [];
  try {
    const playersRef = collection(db, "players");
    const q = query(playersRef, orderBy("mission", "desc"), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as PlayerData);
  } catch (e) {
    console.warn("Firebase Leaderboard Failed:", e);
    return [];
  }
};

export const saveGameProgress = async (playerData: PlayerData) => {
  if (!db) return;
  try {
    await addDoc(collection(db, "leaderboard"), {
      ...playerData,
      timestamp: serverTimestamp(),
    });
    console.log("Victory saved to the Leaderboard!");
  } catch (e) {
    console.error("Error saving score: ", e);
  }
};
