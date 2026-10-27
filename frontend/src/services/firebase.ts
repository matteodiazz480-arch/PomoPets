import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type QuerySnapshot,
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

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export type TournamentPlayer = {
  id: string;
  name: string;
  petName: string;
  level: number;
  totalXp: number;
  minutesStudied: number;
  streak: number;
  photoUrl?: string;
  updatedAt?: any;
};

function parseAndSortLeaderboard(snapshot: QuerySnapshot, criteria: 'xp' | 'hours'): TournamentPlayer[] {
  const players: TournamentPlayer[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    players.push({
      id: docSnap.id,
      name: data.name ?? 'Jugador',
      petName: data.petName ?? 'Mascota',
      level: Number(data.level ?? 1),
      totalXp: Number(data.totalXp ?? 0),
      minutesStudied: Number(data.minutesStudied ?? 0),
      streak: Number(data.streak ?? 0),
      photoUrl: data.photoUrl || '',
    });
  });

  players.sort((a, b) =>
    criteria === 'xp' ? b.totalXp - a.totalXp : b.minutesStudied - a.minutesStudied
  );

  return players;
}

export async function syncPlayerScore(player: TournamentPlayer): Promise<boolean> {
  try {
    if (!player.id) return false;
    const playerRef = doc(db, 'leaderboard', player.id);
    await setDoc(
      playerRef,
      {
        name: player.name?.trim() || 'Jugador',
        petName: player.petName || 'Cornolín',
        level: Number(player.level || 1),
        totalXp: Number(player.totalXp || 0),
        minutesStudied: Number(player.minutesStudied || 0),
        streak: Number(player.streak || 0),
        photoUrl: player.photoUrl || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch {
    return false;
  }
}

export async function fetchLeaderboard(
  criteria: 'xp' | 'hours' = 'xp'
): Promise<TournamentPlayer[]> {
  try {
    const snapshot = await getDocs(collection(db, 'leaderboard'));
    return parseAndSortLeaderboard(snapshot, criteria);
  } catch {
    return [];
  }
}

export function subscribeToLeaderboard(
  criteria: 'xp' | 'hours',
  callback: (players: TournamentPlayer[]) => void
): () => void {
  try {
    const colRef = collection(db, 'leaderboard');
    return onSnapshot(
      colRef,
      (snapshot) => {
        callback(parseAndSortLeaderboard(snapshot, criteria));
      },
      () => {}
    );
  } catch {
    return () => {};
  }
}
