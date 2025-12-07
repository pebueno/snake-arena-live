
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  score: number;
  mode: 'pass-through' | 'walls';
  playedAt: string;
}

export interface ActivePlayer {
  id: string;
  username: string;
  currentScore: number;
  mode: 'pass-through' | 'walls';
  startedAt: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || 'An error occurred';
    throw new Error(errorMessage);
  }
  return response.json();
}

export const authApi = {
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const user = await handleResponse<User>(await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }));
      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },

  async signup(username: string, email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const user = await handleResponse<User>(await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      }));
      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },

  async logout(): Promise<void> {
    await fetch('/auth/logout', { method: 'POST' });
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await handleResponse<User>(await fetch('/auth/me'));
    } catch (error) {
      return null;
    }
  },
};

export const leaderboardApi = {
  async getLeaderboard(mode?: 'pass-through' | 'walls', limit = 10): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams();
    if (mode) params.append('mode', mode);
    params.append('limit', limit.toString());
    
    return handleResponse<LeaderboardEntry[]>(await fetch(`/leaderboard?${params.toString()}`));
  },

  async submitScore(score: number, mode: 'pass-through' | 'walls'): Promise<{ success: boolean; rank: number | null }> {
    try {
      return await handleResponse<{ success: boolean; rank: number | null }>(await fetch('/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, mode }),
      }));
    } catch (error) {
      return { success: false, rank: null };
    }
  },
};

export const playersApi = {
  async getActivePlayers(): Promise<ActivePlayer[]> {
    return handleResponse<ActivePlayer[]>(await fetch('/players'));
  },

  async getPlayerById(playerId: string): Promise<ActivePlayer | null> {
    try {
      return await handleResponse<ActivePlayer>(await fetch(`/players/${playerId}`));
    } catch (error) {
      return null;
    }
  },
};
