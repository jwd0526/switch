// Game Types and Interfaces

export type PatternType = 'cross' | 'square2x2' | 'lshape';
export type GamePhase = 'animation' | 'scrambling' | 'playing' | 'won' | 'ready' | 'reversing' | 'fadingOut';

export interface Pattern {
  name: string;
  offsets: Array<[number, number]>;
}

export interface Level {
  level: number;
  n: number;
  pattern: PatternType;
  scrambleMoves: number;
  name: string;
}

export interface CellPosition {
  id: string;
  x: number;
  y: number;
  animate: boolean;
  needTurnOff: boolean;
  gridRow: number;
  gridCol: number;
  shouldFadeOut?: boolean;
}

export interface Score {
  moves: number;
  time: number;
  date: string;
  id: string;
}

export interface GameState {
  currentLevel?: Level;
  gamePhase: GamePhase;
  moves: number;
  cells: CellPosition[];
  isPlaying: boolean;
  gameStarted: boolean;
  hasEverStarted: boolean;
}

export interface TimerState {
  timer: number;
  isTimerRunning: boolean;
}

export interface GameConfig {
  gridSize: number;
  scrambleMoves: number;
  defaultPattern: PatternType;
}