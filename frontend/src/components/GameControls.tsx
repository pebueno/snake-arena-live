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
    <div className="flex flex-col gap-5">
      {/* Score Display */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Score</p>
        <p className="font-pixel text-4xl text-primary neon-text">{score}</p>
      </div>

      {/* Mode Display */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Mode</p>
        <p className="text-neon-cyan text-lg">
          {mode === 'walls' ? '🧱 Walls' : '🌀 Pass-Through'}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          variant="neon"
          size="lg"
          onClick={onPause}
          disabled={isGameOver}
        >
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </Button>
        <Button
          variant="neon-pink"
          size="lg"
          onClick={onRestart}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile D-Pad */}
      <div className="flex flex-col items-center gap-2 md:hidden">
        <Button
          variant="outline"
          size="lg"
          onClick={() => onDirectionChange('UP')}
          className="touch-manipulation"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onDirectionChange('LEFT')}
            className="touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onDirectionChange('DOWN')}
            className="touch-manipulation"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onDirectionChange('RIGHT')}
            className="touch-manipulation"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
