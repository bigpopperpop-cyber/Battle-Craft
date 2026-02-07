
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from "firebase/auth";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "mobile-origins.firebaseapp.com",
  projectId: "mobile-origins",
  storageBucket: "mobile-origins.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  // Only attempt to initialize if the API key looks like a valid format (AIzaSy...)
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza')) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    console.warn("Firebase: Invalid or missing API Key. Cloud features disabled.");
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
    if (!auth) return resolve(null);

    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        signInAnonymously(auth!)
          .then(cred => resolve(cred.user.uid))
          .catch(() => resolve(null));
      }
    });
  });
};

export const saveGameState = async (data: PlayerData) => {
  if (!db) return false;
  try {
    const userRef = doc(db, "players", data.uid);
    await setDoc(userRef, { ...data, lastUpdated: Date.now() }, { merge: true });
    return true;
  } catch (e) {
    console.warn("Firebase Save Failed:", e);
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
