import { fetchWithAuth } from './api';

export interface DbProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface DbTypingResult {
  id: string;
  user_id: string;
  wpm: number;
  accuracy: number;
  duration: number;
  difficulty: string;
  mistakes: Record<string, number>;
  created_at: string;
}

export async function saveResultToDb(userId: string, result: {
  wpm: number;
  accuracy: number;
  duration: number;
  difficulty: string;
  mistakes: Record<string, number>;
}) {
  try {
    const res = await fetchWithAuth('/results/', {
      method: 'POST',
      body: JSON.stringify({
        wpm: result.wpm,
        accuracy: result.accuracy,
        duration: result.duration,
        difficulty: result.difficulty,
        mistakes: result.mistakes,
      })
    });
    if (!res.ok) throw new Error("Failed to save result");
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getLeaderboard(limit = 20) {
  try {
    const res = await fetchWithAuth(`/leaderboard/?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  } catch (err) {
    return [];
  }
}

export async function getUserResults(userId: string) {
  try {
    const res = await fetchWithAuth(`/results/?userId=${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function getUserProfile(userId: string) {
  try {
    const res = await fetchWithAuth(`/profile/?userId=${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function updateProfile(userId: string, updates: { display_name?: string; bio?: string }) {
  try {
    const res = await fetchWithAuth(`/profile/?userId=${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function saveLevelCompletion(
  userId: string,
  levelNumber: number,
  difficulty: string,
  wpm: number,
  accuracy: number
) {
  try {
    const res = await fetchWithAuth('/levels/', {
      method: 'POST',
      body: JSON.stringify({
        level_number: levelNumber,
        difficulty,
        wpm,
        accuracy,
      })
    });
    if (!res.ok) throw new Error("Failed to save level completion");
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getLevelCompletions(userId: string) {
  try {
    const res = await fetchWithAuth(`/levels/?userId=${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}
