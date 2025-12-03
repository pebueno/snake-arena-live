import { describe, it, expect, beforeEach } from 'vitest';
import { authApi, leaderboardApi, playersApi } from './mockApi';

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('returns user on valid credentials', async () => {
      const result = await authApi.login('snake@example.com', 'password');
      expect(result.user).not.toBeNull();
      expect(result.user?.username).toBe('SnakeMaster');
      expect(result.error).toBeNull();
    });

    it('returns error on invalid credentials', async () => {
      const result = await authApi.login('wrong@example.com', 'wrong');
      expect(result.user).toBeNull();
      expect(result.error).toBe('Invalid email or password');
    });
  });

  describe('signup', () => {
    it('creates new user successfully', async () => {
      const result = await authApi.signup('NewPlayer', 'new@example.com', 'password123');
      expect(result.user).not.toBeNull();
      expect(result.user?.username).toBe('NewPlayer');
      expect(result.error).toBeNull();
    });

    it('returns error for duplicate email', async () => {
      const result = await authApi.signup('AnotherSnake', 'snake@example.com', 'password');
      expect(result.user).toBeNull();
      expect(result.error).toBe('Email already registered');
    });

    it('returns error for duplicate username', async () => {
      const result = await authApi.signup('SnakeMaster', 'another@example.com', 'password');
      expect(result.user).toBeNull();
      expect(result.error).toBe('Username already taken');
    });
  });

  describe('logout', () => {
    it('clears current user', async () => {
      await authApi.login('snake@example.com', 'password');
      await authApi.logout();
      const user = await authApi.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when not logged in', async () => {
      const user = await authApi.getCurrentUser();
      expect(user).toBeNull();
    });

    it('returns user after login', async () => {
      await authApi.login('snake@example.com', 'password');
      const user = await authApi.getCurrentUser();
      expect(user?.username).toBe('SnakeMaster');
    });
  });
});

describe('leaderboardApi', () => {
  describe('getLeaderboard', () => {
    it('returns entries sorted by score', async () => {
      const entries = await leaderboardApi.getLeaderboard();
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i - 1].score).toBeGreaterThanOrEqual(entries[i].score);
      }
    });

    it('filters by mode', async () => {
      const wallsEntries = await leaderboardApi.getLeaderboard('walls');
      wallsEntries.forEach(entry => {
        expect(entry.mode).toBe('walls');
      });

      const passThroughEntries = await leaderboardApi.getLeaderboard('pass-through');
      passThroughEntries.forEach(entry => {
        expect(entry.mode).toBe('pass-through');
      });
    });

    it('respects limit parameter', async () => {
      const entries = await leaderboardApi.getLeaderboard(undefined, 5);
      expect(entries.length).toBeLessThanOrEqual(5);
    });
  });
});

describe('playersApi', () => {
  describe('getActivePlayers', () => {
    it('returns list of active players', async () => {
      const players = await playersApi.getActivePlayers();
      expect(players.length).toBeGreaterThan(0);
      players.forEach(player => {
        expect(player).toHaveProperty('id');
        expect(player).toHaveProperty('username');
        expect(player).toHaveProperty('currentScore');
        expect(player).toHaveProperty('mode');
      });
    });
  });

  describe('getPlayerById', () => {
    it('returns player when found', async () => {
      const player = await playersApi.getPlayerById('active1');
      expect(player).not.toBeNull();
      expect(player?.id).toBe('active1');
    });

    it('returns null when not found', async () => {
      const player = await playersApi.getPlayerById('nonexistent');
      expect(player).toBeNull();
    });
  });
});
