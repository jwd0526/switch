import { Level, PatternType, CellPosition } from '../types/game';
import { PATTERNS, GAME_CONFIG } from '../constants/game';

// Generate a standard game level configuration
export const generateLevel = (): Level => {
  const n = GAME_CONFIG.DEFAULT_GRID_SIZE;
  const scrambleMoves = GAME_CONFIG.DEFAULT_SCRAMBLE_MOVES;
  const pattern = GAME_CONFIG.DEFAULT_PATTERN;

  return {
    level: 1,
    n,
    pattern,
    scrambleMoves,
    name: `${PATTERNS[pattern].name}`
  };
};

// Apply pattern toggle to cells based on clicked cell
export const applyPatternToggle = (
  cells: CellPosition[],
  clickedCellId: string,
  patternType: PatternType,
  gridSize: number
): CellPosition[] => {
  const clickedCell = cells.find(cell => cell.id === clickedCellId);
  if (!clickedCell) return cells;

  const pattern = PATTERNS[patternType];
  const clickedRow = clickedCell.gridRow;
  const clickedCol = clickedCell.gridCol;

  return cells.map(cell => {
    const shouldToggle = pattern.offsets.some(([dr, dc]) => {
      const targetRow = clickedRow + dr;
      const targetCol = clickedCol + dc;

      // Boundary check
      if (targetRow < 0 || targetRow >= gridSize ||
          targetCol < 0 || targetCol >= gridSize) {
        return false;
      }

      return cell.gridRow === targetRow && cell.gridCol === targetCol;
    });

    return shouldToggle ? { ...cell, needTurnOff: !cell.needTurnOff } : cell;
  });
};

// Check if the game is won (all cells are off)
export const checkWinCondition = (cells: CellPosition[]): boolean => {
  return cells.length > 0 && cells.every(cell => !cell.needTurnOff);
};

// Sort cells by position for proper grid indexing
export const sortCellsByPosition = (cells: CellPosition[], gridSize: number): CellPosition[] => {
  const sortedCells = [...cells].sort((a, b) => {
    if (Math.abs(a.y - b.y) < 10) { // Same row (within 10px tolerance)
      return a.x - b.x; // Sort by X position
    }
    return a.y - b.y; // Sort by Y position
  });

  // Assign grid coordinates based on actual positions
  return sortedCells.map((cell, index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return {
      ...cell,
      gridRow: row,
      gridCol: col
    };
  });
};

// Calculate scaled dimensions based on viewport
export const getScaledDimensions = (viewportScale: number) => {
  const CELL_WIDTH = Math.round(100 * viewportScale);
  const CELL_OFFSET = Math.round(CELL_WIDTH * 1.15);

  return { CELL_WIDTH, CELL_OFFSET };
};

// Format time display
export const formatTime = (tenths: number): string => {
  const totalSeconds = Math.floor(tenths / 10);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const remainingTenths = tenths % 10;
  return `${mins}:${secs.toString().padStart(2, '0')}.${remainingTenths}`;
};