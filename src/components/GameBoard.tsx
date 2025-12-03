import React from 'react';
import { GameState } from '@/lib/gameLogic';

interface GameBoardProps {
  gameState: GameState;
  cellSize?: number;
}

export function GameBoard({ gameState, cellSize = 20 }: GameBoardProps) {
  const { snake, food, gridSize } = gameState;
  const boardSize = gridSize * cellSize;

  return (
    <div 
      className="relative game-grid bg-grid border-2 border-primary neon-border rounded-lg overflow-hidden"
      style={{ 
        width: boardSize, 
        height: boardSize,
        backgroundSize: `${cellSize}px ${cellSize}px`
      }}
    >
      {/* Snake segments */}
      {snake.map((segment, index) => (
        <div
          key={index}
          className={`absolute snake-segment transition-all duration-75 ${index === 0 ? 'z-10' : ''}`}
          style={{
            left: segment.x * cellSize + 1,
            top: segment.y * cellSize + 1,
            width: cellSize - 2,
            height: cellSize - 2,
            opacity: 1 - (index * 0.02),
          }}
        >
          {index === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
            </div>
          )}
        </div>
      ))}

      {/* Food */}
      <div
        className="absolute food-item"
        style={{
          left: food.x * cellSize + 2,
          top: food.y * cellSize + 2,
          width: cellSize - 4,
          height: cellSize - 4,
        }}
      />

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <h2 className="font-pixel text-2xl text-destructive neon-text-pink mb-2">GAME OVER</h2>
            <p className="text-primary font-mono">Score: {gameState.score}</p>
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {gameState.isPaused && !gameState.isGameOver && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
          <h2 className="font-pixel text-xl text-neon-cyan neon-text-cyan">PAUSED</h2>
        </div>
      )}
    </div>
  );
}
