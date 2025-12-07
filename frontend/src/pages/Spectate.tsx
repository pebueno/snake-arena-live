import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameBoard } from '@/components/GameBoard';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { playersApi, ActivePlayer } from '@/lib/api';
import { Eye, Users, Clock, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Spectate = () => {
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // AI-controlled game for spectating
  const { gameState, restart } = useSnakeGame({
    mode: selectedPlayer?.mode || 'walls',
    speed: 150,
    aiControlled: true,
  });

  useEffect(() => {
    const loadPlayers = async () => {
      const players = await playersApi.getActivePlayers();
      setActivePlayers(players);
      setIsLoading(false);
    };

    loadPlayers();
    
    // Refresh player list periodically
    const interval = setInterval(loadPlayers, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPlayer = (player: ActivePlayer) => {
    setSelectedPlayer(player);
    restart(player.mode);
  };

  const handleBack = () => {
    setSelectedPlayer(null);
  };

  if (selectedPlayer) {
    return (
      <main className="min-h-[calc(100vh-80px)] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-pixel text-xl text-primary neon-text">
                Watching: {selectedPlayer.username}
              </h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <span>{selectedPlayer.mode === 'walls' ? '🧱 Walls' : '🌀 Pass-Through'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Live
                </span>
              </p>
            </div>
          </div>

          {/* Game View */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            <div className="relative">
              <div className="absolute -top-2 -right-2 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-pixel rounded animate-pulse">
                LIVE
              </div>
              <GameBoard gameState={gameState} cellSize={16} />
            </div>

            <div className="bg-card border border-border rounded-lg p-6 neon-border">
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Current Score</p>
                  <p className="font-pixel text-3xl text-primary neon-text">{gameState.score}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Snake Length</p>
                  <p className="font-mono text-xl">{gameState.snake.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Playing Since</p>
                  <p className="font-mono text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(selectedPlayer.startedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-muted-foreground text-xs mt-6">
            This is a simulated game for demonstration purposes
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl text-primary neon-text mb-2">SPECTATE</h1>
          <p className="text-muted-foreground">Watch other players live</p>
        </div>

        {/* Active Players Count */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm">
              {activePlayers.length} {activePlayers.length === 1 ? 'player' : 'players'} online
            </span>
          </div>
        </div>

        {/* Player List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden neon-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading active players...</div>
          ) : activePlayers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-2">No active players right now</p>
              <p className="text-xs text-muted-foreground">Check back later or start your own game!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activePlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelectPlayer(player)}
                  className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50"
                >
                  {/* Player Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-pixel text-xs text-primary">
                      {player.username.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{player.username}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{player.mode === 'walls' ? '🧱 Walls' : '🌀 Pass-Through'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(player.startedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Current Score */}
                  <div className="text-right">
                    <p className="font-pixel text-lg text-primary">{player.currentScore}</p>
                    <p className="text-xs text-muted-foreground">score</p>
                  </div>

                  {/* Watch Button */}
                  <div>
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Spectate;
