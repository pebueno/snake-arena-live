import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/lib/gameLogic';
import { Blocks, CircleDot } from 'lucide-react';

interface ModeSelectorProps {
  selectedMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export function ModeSelector({ selectedMode, onModeChange, disabled }: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm uppercase tracking-wider text-center">Game Mode</p>
      <div className="flex gap-2">
        <Button
          variant={selectedMode === 'walls' ? 'neon' : 'outline'}
          onClick={() => onModeChange('walls')}
          disabled={disabled}
          className="flex-1 gap-2"
        >
          <Blocks className="h-4 w-4" />
          Walls
        </Button>
        <Button
          variant={selectedMode === 'pass-through' ? 'neon-cyan' : 'outline'}
          onClick={() => onModeChange('pass-through')}
          disabled={disabled}
          className="flex-1 gap-2"
        >
          <CircleDot className="h-4 w-4" />
          Pass-Through
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {selectedMode === 'walls' 
          ? 'Hit a wall = Game Over' 
          : 'Walls wrap around to the other side'}
      </p>
    </div>
  );
}
