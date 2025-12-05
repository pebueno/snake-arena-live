// Centralized mock API layer - all backend calls go through here

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

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (simulates database)
let currentUser: User | null = null;

const mockUsers: Map<string, User & { password: string }> = new Map([
  ['user1', { id: 'user1', username: 'SnakeMaster', email: 'snake@example.com', password: 'password', createdAt: '2024-01-15' }],
  ['user2', { id: 'user2', username: 'PixelPython', email: 'pixel@example.com', password: 'password', createdAt: '2024-02-20' }],
]);

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', userId: 'user1', username: 'SnakeMaster', score: 2450, mode: 'walls', playedAt: '2024-03-10T14:30:00Z' },
  { id: '2', userId: 'user2', username: 'PixelPython', score: 2100, mode: 'pass-through', playedAt: '2024-03-09T18:45:00Z' },
  { id: '3', userId: 'user3', username: 'NeonNibbler', score: 1890, mode: 'walls', playedAt: '2024-03-08T21:15:00Z' },
  { id: '4', userId: 'user4', username: 'RetroReptile', score: 1750, mode: 'pass-through', playedAt: '2024-03-07T16:20:00Z' },
  { id: '5', userId: 'user5', username: 'ArcadeAce', score: 1600, mode: 'walls', playedAt: '2024-03-06T12:00:00Z' },
  { id: '6', userId: 'user6', username: 'GridGlider', score: 1450, mode: 'walls', playedAt: '2024-03-05T09:30:00Z' },
  { id: '7', userId: 'user7', username: 'ByteBiter', score: 1320, mode: 'pass-through', playedAt: '2024-03-04T20:00:00Z' },
  { id: '8', userId: 'user8', username: 'CoilChamp', score: 1200, mode: 'walls', playedAt: '2024-03-03T11:45:00Z' },
  { id: '9', userId: 'user9', username: 'SlitherStar', score: 1100, mode: 'pass-through', playedAt: '2024-03-02T15:30:00Z' },
  { id: '10', userId: 'user10', username: 'VenomViper', score: 980, mode: 'walls', playedAt: '2024-03-01T08:15:00Z' },
];

const mockActivePlayers: ActivePlayer[] = [
  { id: 'active1', username: 'NeonNibbler', currentScore: 340, mode: 'walls', startedAt: new Date(Date.now() - 180000).toISOString() },
  { id: 'active2', username: 'RetroReptile', currentScore: 520, mode: 'pass-through', startedAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'active3', username: 'GridGlider', currentScore: 180, mode: 'walls', startedAt: new Date(Date.now() - 60000).toISOString() },
];

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    await delay(500);
    
    const user = Array.from(mockUsers.values()).find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      currentUser = userWithoutPassword;
      localStorage.setItem('snake_game_user', JSON.stringify(currentUser));
      return { user: currentUser, error: null };
    }
    
    return { user: null, error: 'Invalid email or password' };
  },

  async signup(username: string, email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    await delay(500);
    
    if (Array.from(mockUsers.values()).some(u => u.email === email)) {
      return { user: null, error: 'Email already registered' };
    }
    
    if (Array.from(mockUsers.values()).some(u => u.username === username)) {
      return { user: null, error: 'Username already taken' };
    }
    
    const newUser: User & { password: string } = {
      id: `user${mockUsers.size + 1}`,
      username,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.set(newUser.id, newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    currentUser = userWithoutPassword;
    localStorage.setItem('snake_game_user', JSON.stringify(currentUser));
    
    return { user: currentUser, error: null };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
    localStorage.removeItem('snake_game_user');
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    if (currentUser) return currentUser;
    
    const stored = localStorage.getItem('snake_game_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    return null;
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: 'pass-through' | 'walls', limit = 10): Promise<LeaderboardEntry[]> {
    await delay(300);
    
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    
    return entries.sort((a, b) => b.score - a.score).slice(0, limit);
  },

  async submitScore(score: number, mode: 'pass-through' | 'walls'): Promise<{ success: boolean; rank: number | null }> {
    await delay(400);
    
    if (!currentUser) {
      return { success: false, rank: null };
    }
    
    const newEntry: LeaderboardEntry = {
      id: `entry${mockLeaderboard.length + 1}`,
      userId: currentUser.id,
      username: currentUser.username,
      score,
      mode,
      playedAt: new Date().toISOString(),
    };
    
    mockLeaderboard.push(newEntry);
    
    const sorted = mockLeaderboard.sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex(e => e.id === newEntry.id) + 1;
    
    return { success: true, rank };
  },
};

// Active Players API (for spectating)
export const playersApi = {
  async getActivePlayers(): Promise<ActivePlayer[]> {
    await delay(200);
    return [...mockActivePlayers];
  },

  async getPlayerById(playerId: string): Promise<ActivePlayer | null> {
    await delay(100);
    return mockActivePlayers.find(p => p.id === playerId) || null;
  },
};
