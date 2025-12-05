import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  generateFood,
  getNextPosition,
  checkWallCollision,
  checkSelfCollision,
  isOppositeDirection,
  moveSnake,
  changeDirection,
  togglePause,
  GRID_SIZE,
  INITIAL_SNAKE_LENGTH,
  GameState,
  Position,
} from '../../lib/gameLogic';

describe('createInitialState', () => {
  it('creates state with correct initial snake length', () => {
    const state = createInitialState('walls');
    expect(state.snake.length).toBe(INITIAL_SNAKE_LENGTH);
  });

  it('creates state with correct mode', () => {
    const wallsState = createInitialState('walls');
    expect(wallsState.mode).toBe('walls');

    const passThroughState = createInitialState('pass-through');
    expect(passThroughState.mode).toBe('pass-through');
  });

  it('starts with direction RIGHT', () => {
    const state = createInitialState('walls');
    expect(state.direction).toBe('RIGHT');
    expect(state.nextDirection).toBe('RIGHT');
  });

  it('starts with score 0', () => {
    const state = createInitialState('walls');
    expect(state.score).toBe(0);
  });

  it('starts not paused and not game over', () => {
    const state = createInitialState('walls');
    expect(state.isPaused).toBe(false);
    expect(state.isGameOver).toBe(false);
  });
});

describe('generateFood', () => {
  it('generates food within grid bounds', () => {
    const snake: Position[] = [{ x: 5, y: 5 }];
    const food = generateFood(snake, GRID_SIZE);
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(GRID_SIZE);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(GRID_SIZE);
  });

  it('does not generate food on snake', () => {
    const snake: Position[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 1; j++) {
        snake.push({ x: i, y: j });
      }
    }
    const food = generateFood(snake, GRID_SIZE);
    const isOnSnake = snake.some(s => s.x === food.x && s.y === food.y);
    expect(isOnSnake).toBe(false);
  });
});

describe('getNextPosition', () => {
  const head: Position = { x: 5, y: 5 };

  it('moves up correctly', () => {
    const next = getNextPosition(head, 'UP', GRID_SIZE, 'walls');
    expect(next).toEqual({ x: 5, y: 4 });
  });

  it('moves down correctly', () => {
    const next = getNextPosition(head, 'DOWN', GRID_SIZE, 'walls');
    expect(next).toEqual({ x: 5, y: 6 });
  });

  it('moves left correctly', () => {
    const next = getNextPosition(head, 'LEFT', GRID_SIZE, 'walls');
    expect(next).toEqual({ x: 4, y: 5 });
  });

  it('moves right correctly', () => {
    const next = getNextPosition(head, 'RIGHT', GRID_SIZE, 'walls');
    expect(next).toEqual({ x: 6, y: 5 });
  });

  it('wraps around in pass-through mode', () => {
    const topLeft: Position = { x: 0, y: 0 };
    
    const upWrap = getNextPosition(topLeft, 'UP', GRID_SIZE, 'pass-through');
    expect(upWrap.y).toBe(GRID_SIZE - 1);

    const leftWrap = getNextPosition(topLeft, 'LEFT', GRID_SIZE, 'pass-through');
    expect(leftWrap.x).toBe(GRID_SIZE - 1);
  });

  it('does not wrap in walls mode', () => {
    const topLeft: Position = { x: 0, y: 0 };
    
    const up = getNextPosition(topLeft, 'UP', GRID_SIZE, 'walls');
    expect(up.y).toBe(-1);

    const left = getNextPosition(topLeft, 'LEFT', GRID_SIZE, 'walls');
    expect(left.x).toBe(-1);
  });
});

describe('checkWallCollision', () => {
  it('detects collision with left wall', () => {
    expect(checkWallCollision({ x: -1, y: 5 }, GRID_SIZE)).toBe(true);
  });

  it('detects collision with right wall', () => {
    expect(checkWallCollision({ x: GRID_SIZE, y: 5 }, GRID_SIZE)).toBe(true);
  });

  it('detects collision with top wall', () => {
    expect(checkWallCollision({ x: 5, y: -1 }, GRID_SIZE)).toBe(true);
  });

  it('detects collision with bottom wall', () => {
    expect(checkWallCollision({ x: 5, y: GRID_SIZE }, GRID_SIZE)).toBe(true);
  });

  it('returns false for valid position', () => {
    expect(checkWallCollision({ x: 5, y: 5 }, GRID_SIZE)).toBe(false);
  });
});

describe('checkSelfCollision', () => {
  it('detects collision with body', () => {
    const head: Position = { x: 5, y: 5 };
    const body: Position[] = [
      { x: 4, y: 5 },
      { x: 5, y: 5 }, // collision here
      { x: 6, y: 5 },
    ];
    expect(checkSelfCollision(head, body)).toBe(true);
  });

  it('returns false when no collision', () => {
    const head: Position = { x: 5, y: 5 };
    const body: Position[] = [
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    expect(checkSelfCollision(head, body)).toBe(false);
  });
});

describe('isOppositeDirection', () => {
  it('UP and DOWN are opposite', () => {
    expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
    expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
  });

  it('LEFT and RIGHT are opposite', () => {
    expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
    expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
  });

  it('non-opposite directions return false', () => {
    expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
    expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
    expect(isOppositeDirection('DOWN', 'LEFT')).toBe(false);
  });
});

describe('moveSnake', () => {
  it('moves snake in current direction', () => {
    const state = createInitialState('walls');
    const newState = moveSnake(state);
    expect(newState.snake[0].x).toBe(state.snake[0].x + 1);
    expect(newState.snake.length).toBe(state.snake.length);
  });

  it('does not move when paused', () => {
    const state = createInitialState('walls');
    state.isPaused = true;
    const newState = moveSnake(state);
    expect(newState.snake).toEqual(state.snake);
  });

  it('does not move when game over', () => {
    const state = createInitialState('walls');
    state.isGameOver = true;
    const newState = moveSnake(state);
    expect(newState.snake).toEqual(state.snake);
  });

  it('ends game on wall collision in walls mode', () => {
    const state = createInitialState('walls');
    state.snake = [{ x: GRID_SIZE - 1, y: 5 }, { x: GRID_SIZE - 2, y: 5 }];
    state.direction = 'RIGHT';
    state.nextDirection = 'RIGHT';
    const newState = moveSnake(state);
    expect(newState.isGameOver).toBe(true);
  });

  it('wraps around in pass-through mode', () => {
    const state = createInitialState('pass-through');
    state.snake = [{ x: GRID_SIZE - 1, y: 5 }, { x: GRID_SIZE - 2, y: 5 }];
    state.direction = 'RIGHT';
    state.nextDirection = 'RIGHT';
    const newState = moveSnake(state);
    expect(newState.isGameOver).toBe(false);
    expect(newState.snake[0].x).toBe(0);
  });

  it('grows snake and increases score when eating food', () => {
    const state = createInitialState('walls');
    state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
    const newState = moveSnake(state);
    expect(newState.snake.length).toBe(state.snake.length + 1);
    expect(newState.score).toBe(state.score + 10);
  });
});

describe('changeDirection', () => {
  it('changes direction', () => {
    const state = createInitialState('walls');
    const newState = changeDirection(state, 'UP');
    expect(newState.nextDirection).toBe('UP');
  });

  it('does not change to opposite direction', () => {
    const state = createInitialState('walls');
    state.direction = 'RIGHT';
    const newState = changeDirection(state, 'LEFT');
    expect(newState.nextDirection).toBe('RIGHT');
  });

  it('does not change when paused', () => {
    const state = createInitialState('walls');
    state.isPaused = true;
    const newState = changeDirection(state, 'UP');
    expect(newState.nextDirection).toBe(state.nextDirection);
  });

  it('does not change when game over', () => {
    const state = createInitialState('walls');
    state.isGameOver = true;
    const newState = changeDirection(state, 'UP');
    expect(newState.nextDirection).toBe(state.nextDirection);
  });
});

describe('togglePause', () => {
  it('toggles pause state', () => {
    const state = createInitialState('walls');
    const paused = togglePause(state);
    expect(paused.isPaused).toBe(true);
    const unpaused = togglePause(paused);
    expect(unpaused.isPaused).toBe(false);
  });

  it('does not toggle when game over', () => {
    const state = createInitialState('walls');
    state.isGameOver = true;
    const newState = togglePause(state);
    expect(newState.isPaused).toBe(false);
  });
});
