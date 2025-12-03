import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/lib/gameLogic';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  score: number;
  isPaused: boolean;
  isGameOver: boolean;
  mode: GameMode;
  onPause: () => void;
  onRestart: () => void;
  onDirectionChange: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
}

export function GameControls({
  score,
  isPaused,
  isGameOver,
  mode,
  onPause,
  onRestart,
  onDirectionChange,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Score Display */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Score</p>
        <p className="font-pixel text-3xl text-primary neon-text">{score}</p>
      </div>

      {/* Mode Display */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Mode</p>
        <p className="font-mono text-neon-cyan">
          {mode === 'walls' ? '🧱 Walls' : '🌀 Pass-Through'}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="neon"
          size="icon"
          onClick={onPause}
          disabled={isGameOver}
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
        <Button
          variant="neon-pink"
          size="icon"
          onClick={onRestart}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile D-Pad */}
      <div className="flex flex-col items-center gap-1 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDirectionChange('UP')}
          className="touch-manipulation"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('LEFT')}
            className="touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('DOWN')}
            className="touch-manipulation"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('RIGHT')}
            className="touch-manipulation"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard Instructions */}
      <div className="hidden md:block text-center text-xs text-muted-foreground">
        <p>Arrow keys or WASD to move</p>
        <p>Space to pause</p>
      </div>
    </div>
  );
}
