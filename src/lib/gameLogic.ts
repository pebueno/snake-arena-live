// Core game logic - separated for testing

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'pass-through' | 'walls';
export type Position = { x: number; y: number };

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  mode: GameMode;
  gridSize: number;
}

export const INITIAL_SNAKE_LENGTH = 3;
export const GRID_SIZE = 20;

export function createInitialState(mode: GameMode = 'walls'): GameState {
  const snake: Position[] = [];
  const startX = Math.floor(GRID_SIZE / 2);
  const startY = Math.floor(GRID_SIZE / 2);
  
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: startX - i, y: startY });
  }

  return {
    snake,
    food: generateFood(snake, GRID_SIZE),
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    isGameOver: false,
    isPaused: false,
    mode,
    gridSize: GRID_SIZE,
  };
}

export function generateFood(snake: Position[], gridSize: number): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
}

export function getNextPosition(head: Position, direction: Direction, gridSize: number, mode: GameMode): Position {
  let newX = head.x;
  let newY = head.y;

  switch (direction) {
    case 'UP':
      newY -= 1;
      break;
    case 'DOWN':
      newY += 1;
      break;
    case 'LEFT':
      newX -= 1;
      break;
    case 'RIGHT':
      newX += 1;
      break;
  }

  if (mode === 'pass-through') {
    newX = (newX + gridSize) % gridSize;
    newY = (newY + gridSize) % gridSize;
  }

  return { x: newX, y: newY };
}

export function checkWallCollision(position: Position, gridSize: number): boolean {
  return position.x < 0 || position.x >= gridSize || position.y < 0 || position.y >= gridSize;
}

export function checkSelfCollision(head: Position, body: Position[]): boolean {
  return body.some(segment => segment.x === head.x && segment.y === head.y);
}

export function isOppositeDirection(dir1: Direction, dir2: Direction): boolean {
  return (
    (dir1 === 'UP' && dir2 === 'DOWN') ||
    (dir1 === 'DOWN' && dir2 === 'UP') ||
    (dir1 === 'LEFT' && dir2 === 'RIGHT') ||
    (dir1 === 'RIGHT' && dir2 === 'LEFT')
  );
}

export function moveSnake(state: GameState): GameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = state.nextDirection;
  const head = state.snake[0];
  const newHead = getNextPosition(head, direction, state.gridSize, state.mode);

  // Check wall collision (only in walls mode)
  if (state.mode === 'walls' && checkWallCollision(newHead, state.gridSize)) {
    return { ...state, isGameOver: true };
  }

  // Check self collision
  if (checkSelfCollision(newHead, state.snake)) {
    return { ...state, isGameOver: true };
  }

  const newSnake = [newHead, ...state.snake];
  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;

  if (!ateFood) {
    newSnake.pop();
  }

  return {
    ...state,
    snake: newSnake,
    direction,
    food: ateFood ? generateFood(newSnake, state.gridSize) : state.food,
    score: ateFood ? state.score + 10 : state.score,
  };
}

export function changeDirection(state: GameState, newDirection: Direction): GameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  if (isOppositeDirection(state.direction, newDirection)) {
    return state;
  }

  return { ...state, nextDirection: newDirection };
}

export function togglePause(state: GameState): GameState {
  if (state.isGameOver) {
    return state;
  }
  return { ...state, isPaused: !state.isPaused };
}

// AI logic for spectator mode
export function getAIDirection(state: GameState): Direction {
  const head = state.snake[0];
  const food = state.food;
  const currentDirection = state.direction;

  const possibleDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(
    dir => !isOppositeDirection(currentDirection, dir as Direction)
  ) as Direction[];

  // Try to move towards food
  const directionScores = possibleDirections.map(dir => {
    const nextPos = getNextPosition(head, dir, state.gridSize, state.mode);
    
    // Check if move is safe
    if (state.mode === 'walls' && checkWallCollision(nextPos, state.gridSize)) {
      return { dir, score: -1000 };
    }
    if (checkSelfCollision(nextPos, state.snake.slice(0, -1))) {
      return { dir, score: -1000 };
    }

    // Calculate distance to food
    const dx = Math.abs(nextPos.x - food.x);
    const dy = Math.abs(nextPos.y - food.y);
    const distance = dx + dy;

    return { dir, score: -distance };
  });

  const validMoves = directionScores.filter(d => d.score > -1000);
  
  if (validMoves.length === 0) {
    return currentDirection;
  }

  validMoves.sort((a, b) => b.score - a.score);
  
  // Add some randomness
  if (Math.random() < 0.1 && validMoves.length > 1) {
    return validMoves[1].dir;
  }

  return validMoves[0].dir;
}
