import { Pattern, PatternType } from '../types/game';

// Pattern definitions
export const PATTERNS: Record<PatternType, Pattern> = {
  cross: {
    name: "Cross Pattern",
    offsets: [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]
  },
  square2x2: {
    name: "2×2 Square",
    offsets: [[0, 0], [-1, 0], [0, -1], [-1, -1]]
  },
  lshape: {
    name: "L-Shape",
    offsets: [[0, -1], [0, 0], [-1, -1]]
  }
};

// Game configuration constants
export const GAME_CONFIG = {
  DEFAULT_GRID_SIZE: 5,
  DEFAULT_SCRAMBLE_MOVES: 12,
  DEFAULT_PATTERN: 'cross' as PatternType,
  BASELINE_VIEWPORT_WIDTH: 1512,
  ANIMATION_DELAYS: {
    GRID_CREATION_STEP: 50,
    GRID_CREATION_COMPLETION: 400,
    SCRAMBLE_MOVE: 50,
    REVERSAL_CELL_OFF: 200,
    REVERSAL_FADE: 800,
    RESET_COMPLETION: 200,
  },
  SCALING: {
    MIN_SCALE: 0.5,
    BLEND_RATIO: 0.5,
  }
};

// Viewport scaling utility
export const getViewportScale = (): number => {
  const proportionalScale = Math.min(1.0, window.innerWidth / GAME_CONFIG.BASELINE_VIEWPORT_WIDTH);
  const blendedScale = GAME_CONFIG.SCALING.MIN_SCALE + (proportionalScale * GAME_CONFIG.SCALING.BLEND_RATIO);
  return blendedScale;
};