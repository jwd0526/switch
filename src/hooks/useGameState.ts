import { useState, useCallback, useEffect } from 'react';
import { GameState, CellPosition, GamePhase } from '../types/game';
import { generateLevel, applyPatternToggle, checkWinCondition } from '../utils/gameLogic';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    gamePhase: 'ready',
    moves: 0,
    cells: [],
    isPlaying: false,
    gameStarted: false,
    hasEverStarted: false,
  });

  const [initialScrambledState, setInitialScrambledState] = useState<CellPosition[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  // Initialize game level
  useEffect(() => {
    if (!gameState.currentLevel) {
      const level = generateLevel();
      setGameState(prev => ({ ...prev, currentLevel: level }));
    }
  }, [gameState.currentLevel]);

  // Check win condition when cells change
  useEffect(() => {
    if (gameState.gamePhase === 'playing' && gameState.currentLevel) {
      const isWon = checkWinCondition(gameState.cells);
      if (isWon) {
        setGameState(prev => ({ ...prev, gamePhase: 'won' }));
      }
    }
  }, [gameState.cells, gameState.gamePhase, gameState.currentLevel]);

  const updateGamePhase = useCallback((phase: GamePhase) => {
    setGameState(prev => ({ ...prev, gamePhase: phase }));
  }, []);

  const updateCells = useCallback((cells: CellPosition[]) => {
    setGameState(prev => ({ ...prev, cells }));
  }, []);

  const incrementMoves = useCallback(() => {
    setGameState(prev => ({ ...prev, moves: prev.moves + 1 }));
  }, []);

  const resetMoves = useCallback(() => {
    setGameState(prev => ({ ...prev, moves: 0 }));
  }, []);

  const handleCellClick = useCallback((cellId: string) => {
    if (!gameState.currentLevel || gameState.gamePhase !== 'playing') {
      return;
    }

    const newCells = applyPatternToggle(
      gameState.cells,
      cellId,
      gameState.currentLevel.pattern,
      gameState.currentLevel.n
    );

    updateCells(newCells);
    incrementMoves();
  }, [gameState.currentLevel, gameState.gamePhase, gameState.cells, updateCells, incrementMoves]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      gameStarted: true,
      hasEverStarted: true,
      gamePhase: 'animation'
    }));
  }, []);

  const resetGame = useCallback(() => {
    if (initialScrambledState.length > 0) {
      setIsResetting(true);
      updateCells([...initialScrambledState]);
      resetMoves();
      updateGamePhase('playing');
      setTimeout(() => setIsResetting(false), 200);
    }
  }, [initialScrambledState, updateCells, resetMoves, updateGamePhase]);

  const newGame = useCallback(() => {
    setGameState({
      gamePhase: 'ready',
      moves: 0,
      cells: [],
      isPlaying: false,
      gameStarted: false,
      hasEverStarted: false,
      currentLevel: generateLevel(),
    });
    setInitialScrambledState([]);
    setIsResetting(false);
  }, []);

  return {
    gameState,
    initialScrambledState,
    setInitialScrambledState,
    isResetting,
    updateGamePhase,
    updateCells,
    incrementMoves,
    resetMoves,
    handleCellClick,
    startGame,
    resetGame,
    newGame,
  };
};