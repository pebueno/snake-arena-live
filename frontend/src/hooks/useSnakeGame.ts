import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  GameMode,
  Direction,
  createInitialState,
  moveSnake,
  changeDirection,
  togglePause,
  getAIDirection,
} from '@/lib/gameLogic';

interface UseSnakeGameOptions {
  mode?: GameMode;
  speed?: number;
  aiControlled?: boolean;
  onGameOver?: (score: number) => void;
}

export function useSnakeGame(options: UseSnakeGameOptions = {}) {
  const { mode = 'walls', speed = 150, aiControlled = false, onGameOver } = options;
  
  const [gameState, setGameState] = useState<GameState>(() => ({
    ...createInitialState(mode),
    isPaused: !aiControlled, // Start paused for player-controlled games
  }));
  const [hasStarted, setHasStarted] = useState(aiControlled);
  const gameLoopRef = useRef<number | null>(null);
  const lastMoveRef = useRef<number>(0);

  const restart = useCallback((newMode?: GameMode) => {
    setGameState({
      ...createInitialState(newMode ?? mode),
      isPaused: !aiControlled,
    });
    setHasStarted(aiControlled);
  }, [mode, aiControlled]);

  const handleDirectionChange = useCallback((direction: Direction) => {
    setHasStarted(true);
    setGameState(state => {
      // If game hasn't started yet, unpause it on first direction input
      const unpausedState = state.isPaused && !state.isGameOver ? { ...state, isPaused: false } : state;
      return changeDirection(unpausedState, direction);
    });
  }, []);

  const handlePause = useCallback(() => {
    setGameState(state => togglePause(state));
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (timestamp - lastMoveRef.current >= speed) {
        setGameState(state => {
          if (state.isGameOver) {
            return state;
          }

          // AI control
          if (aiControlled && !state.isPaused) {
            const aiDirection = getAIDirection(state);
            state = changeDirection(state, aiDirection);
          }

          const newState = moveSnake(state);
          
          if (newState.isGameOver && !state.isGameOver && onGameOver) {
            onGameOver(newState.score);
          }
          
          return newState;
        });
        lastMoveRef.current = timestamp;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [speed, aiControlled, onGameOver]);

  // Keyboard controls
  useEffect(() => {
    if (aiControlled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleDirectionChange('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleDirectionChange('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleDirectionChange('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleDirectionChange('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          handlePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiControlled, handleDirectionChange, handlePause]);

  return {
    gameState,
    hasStarted,
    restart,
    handleDirectionChange,
    handlePause,
  };
}
