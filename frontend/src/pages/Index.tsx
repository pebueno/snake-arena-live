import React, { useState } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { GameControls } from '@/components/GameControls';
import { ModeSelector } from '@/components/ModeSelector';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { useAuth } from '@/contexts/AuthContext';
import { leaderboardApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { GameMode } from '@/lib/gameLogic';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Keyboard, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

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

  const { gameState, hasStarted, restart, handleDirectionChange, handlePause } = useSnakeGame({
    mode: selectedMode,
    speed: 120,
    onGameOver: handleGameOver,
  });

  const handleModeChange = (mode: GameMode) => {
    setSelectedMode(mode);
    restart(mode);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 md:p-10">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="font-pixel text-4xl md:text-5xl text-primary neon-text mb-3">
          SNAKE GAME
        </h1>
        <p className="text-muted-foreground text-lg">
          {user ? `Playing as ${user.username}` : 'Playing as Guest'}
        </p>
        {!user && (
          <Link to="/auth">
            <Button variant="link" className="text-neon-cyan text-base">
              Login to save your scores!
            </Button>
          </Link>
        )}
      </div>

      {/* Game Area */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
        {/* Game Board */}
        <div className="relative panel-block p-2">
          <GameBoard gameState={gameState} cellSize={24} />
          
          {/* Start overlay for fresh game */}
          {!hasStarted && !gameState.isGameOver && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <p className="font-pixel text-lg text-neon-cyan mb-3">READY?</p>
                <p className="text-muted-foreground text-base">Press any arrow key to start</p>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-6 min-w-[280px]">
          <div className="panel-block">
            <GameControls
              score={gameState.score}
              isPaused={gameState.isPaused}
              isGameOver={gameState.isGameOver}
              mode={gameState.mode}
              onPause={handlePause}
              onRestart={() => restart(selectedMode)}
              onDirectionChange={handleDirectionChange}
            />
          </div>

          <div className="panel-block">
            <ModeSelector
              selectedMode={selectedMode}
              onModeChange={handleModeChange}
              disabled={!gameState.isGameOver && gameState.score > 0}
            />
          </div>

          {/* How to Play */}
          <div className="panel-block">
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-2">
              <Keyboard className="h-4 w-4" />
              How to Play
            </p>
            <div className="space-y-3 text-base">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <ArrowUp className="h-5 w-5 text-primary" />
                  <ArrowDown className="h-5 w-5 text-primary" />
                  <ArrowLeft className="h-5 w-5 text-primary" />
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                <span className="text-foreground">Arrow keys to move</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary font-bold px-2 py-0.5 bg-muted rounded text-sm">SPACE</span>
                <span className="text-foreground">Pause game</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary font-bold px-2 py-0.5 bg-muted rounded text-sm">W A S D</span>
                <span className="text-foreground">Alternative controls</span>
              </div>
              <p className="text-muted-foreground text-sm pt-2 border-t border-border">
                Eat food to grow and score points. Avoid hitting walls or yourself!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;
