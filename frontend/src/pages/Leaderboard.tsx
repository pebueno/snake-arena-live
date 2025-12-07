import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { leaderboardApi, LeaderboardEntry } from '@/lib/api';
import { GameMode } from '@/lib/gameLogic';
import { Trophy, Medal, Award, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      const data = await leaderboardApi.getLeaderboard(
        filterMode === 'all' ? undefined : filterMode,
        20
      );
      setEntries(data);
      setIsLoading(false);
    };

    loadLeaderboard();
  }, [filterMode]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-neon-yellow" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl text-primary neon-text mb-2">LEADERBOARD</h1>
          <p className="text-muted-foreground">Top players from around the world</p>
        </div>

        {/* Filter */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={filterMode === 'all' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => setFilterMode('all')}
          >
            All
          </Button>
          <Button
            variant={filterMode === 'walls' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => setFilterMode('walls')}
          >
            🧱 Walls
          </Button>
          <Button
            variant={filterMode === 'pass-through' ? 'neon-cyan' : 'outline'}
            size="sm"
            onClick={() => setFilterMode('pass-through')}
          >
            🌀 Pass-Through
          </Button>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden neon-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No entries yet</div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 ${
                    index < 3 ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.username}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{entry.mode === 'walls' ? '🧱' : '🌀'}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(entry.playedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className={`font-pixel text-lg ${index < 3 ? 'text-primary neon-text' : 'text-foreground'}`}>
                      {entry.score.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Leaderboard;
