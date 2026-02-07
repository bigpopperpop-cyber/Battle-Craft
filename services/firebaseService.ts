
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// Note: In a real app, these would come from environment variables.
// Using placeholders that the user can replace or that works with standard auto-config.
const firebaseConfig = {
  apiKey: "AIzaSy-PLACEHOLDER",
  authDomain: "mobile-origins.firebaseapp.com",
  projectId: "mobile-origins",
  storageBucket: "mobile-origins.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export interface PlayerData {
  uid: string;
  gold: number;
  wood: number;
  mission: number;
  faction: string;
  lastUpdated: number;
}

export const initAuth = (): Promise<string> => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        signInAnonymously(auth).then(cred => resolve(cred.user.uid));
      }
    });
  });
};

export const saveGameState = async (data: PlayerData) => {
  try {
    const userRef = doc(db, "players", data.uid);
    await setDoc(userRef, { ...data, lastUpdated: Date.now() }, { merge: true });
    return true;
  } catch (e) {
    console.warn("Firebase Save Failed (Offline or Config missing):", e);
    return false;
  }
};

export const loadGameState = async (uid: string): Promise<PlayerData | null> => {
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
