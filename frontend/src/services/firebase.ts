import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyCH27pnPaLohmkEc0-2kgW_KZ4ftFtHJC4',
  authDomain: 'pomopets-ede86.firebaseapp.com',
  projectId: 'pomopets-ede86',
  storageBucket: 'pomopets-ede86.firebasestorage.app',
  messagingSenderId: '1022096395110',
  appId: '1:1022096395110:web:b54b4ef5a579d6d7add6a7',
  measurementId: 'G-ZC69ZPG3F5',
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore
export const db = getFirestore(app);

export type TournamentPlayer = {
  id: string;
  name: string;
  petName: string;
  level: number;
  totalXp: number;
  minutesStudied: number;
  streak: number;
  updatedAt?: any;
};

/**
 * Publishes or updates the player's score to the global Firestore leaderboard
 */
export async function syncPlayerScore(player: TournamentPlayer): Promise<boolean> {
  try {
    if (!player.id) return false;
    const playerRef = doc(db, 'leaderboard', player.id);
    await setDoc(
      playerRef,
      {
        name: player.name || 'Estudiante PomoPet',
        petName: player.petName || 'Cornolín',
        level: player.level || 1,
        totalXp: player.totalXp || 0,
        minutesStudied: player.minutesStudied || 0,
        streak: player.streak || 0,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('[Firebase] Could not sync player score to Firestore:', error);
    return false;
  }
}

/**
 * Fetches the global tournament leaderboard ordered by XP or study hours
 */
export async function fetchLeaderboard(
  criteria: 'xp' | 'hours' = 'xp',
  maxResults: number = 50
): Promise<TournamentPlayer[]> {
  try {
    const field = criteria === 'xp' ? 'totalXp' : 'minutesStudied';
    const q = query(collection(db, 'leaderboard'), orderBy(field, 'desc'), limit(maxResults));
    const snapshot = await getDocs(q);

    const players: TournamentPlayer[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      players.push({
        id: docSnap.id,
        name: data.name ?? 'Estudiante',
        petName: data.petName ?? 'Mascota',
        level: Number(data.level ?? 1),
        totalXp: Number(data.totalXp ?? 0),
        minutesStudied: Number(data.minutesStudied ?? 0),
        streak: Number(data.streak ?? 0),
      });
    });

    return players;
  } catch (error) {
    console.warn('[Firebase] Could not fetch leaderboard:', error);
    return [];
  }
}
