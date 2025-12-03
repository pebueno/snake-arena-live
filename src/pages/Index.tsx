import React, { useState } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { GameControls } from '@/components/GameControls';
import { ModeSelector } from '@/components/ModeSelector';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { useAuth } from '@/contexts/AuthContext';
import { leaderboardApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { GameMode } from '@/lib/gameLogic';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('walls');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGameOver = async (score: number) => {
    if (user && score > 0) {
      const result = await leaderboardApi.submitScore(score, selectedMode);
      if (result.success && result.rank && result.rank <= 10) {
        toast({
          title: "🏆 New High Score!",
          description: `You ranked #${result.rank} on the leaderboard!`,
        });
      }
    }
  };

  const { gameState, restart, handleDirectionChange, handlePause } = useSnakeGame({
    mode: selectedMode,
    speed: 120,
    onGameOver: handleGameOver,
  });

  const handleModeChange = (mode: GameMode) => {
    setSelectedMode(mode);
    restart(mode);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 md:p-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="font-pixel text-3xl md:text-4xl text-primary neon-text mb-2">
          SNAKE GAME
        </h1>
        <p className="text-muted-foreground">
          {user ? `Playing as ${user.username}` : 'Playing as Guest'}
        </p>
        {!user && (
          <Link to="/auth">
            <Button variant="link" className="text-neon-cyan">
              Login to save your scores!
            </Button>
          </Link>
        )}
      </div>

      {/* Game Area */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        {/* Game Board */}
        <div className="relative">
          <GameBoard gameState={gameState} cellSize={18} />
          
          {/* Start overlay for fresh game */}
          {!gameState.isGameOver && gameState.score === 0 && gameState.snake.length === 3 && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <p className="font-pixel text-sm text-neon-cyan mb-2">READY?</p>
                <p className="text-muted-foreground text-xs">Press any arrow key to start</p>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-6 min-w-[200px]">
          <GameControls
            score={gameState.score}
            isPaused={gameState.isPaused}
            isGameOver={gameState.isGameOver}
            mode={gameState.mode}
            onPause={handlePause}
            onRestart={() => restart(selectedMode)}
            onDirectionChange={handleDirectionChange}
          />

          <div className="border-t border-border pt-4">
            <ModeSelector
              selectedMode={selectedMode}
              onModeChange={handleModeChange}
              disabled={!gameState.isGameOver && gameState.score > 0}
            />
          </div>

          {/* Quick Links */}
          <div className="border-t border-border pt-4 flex flex-col gap-2">
            <Link to="/leaderboard">
              <Button variant="outline" className="w-full text-xs">
                View Leaderboard
              </Button>
            </Link>
            <Link to="/spectate">
              <Button variant="outline" className="w-full text-xs">
                Watch Others Play
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;
