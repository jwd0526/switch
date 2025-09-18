import { useState, useCallback, useEffect } from 'react';
import Board from './components/Board';
import Leaderboard from './components/game/Leaderboard';
import Info from './components/game/Info';
import GameStatus from './components/game/GameStatus';
import GameControls from './components/game/GameControls';
import { useTimer } from './hooks/useTimer';
import { Level, GamePhase } from './types/game';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const [shouldStartNewGame, setShouldStartNewGame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [levelInfo, setLevelInfo] = useState<{level: number, name: string, moves: number, gamePhase: GamePhase} | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [newScore, setNewScore] = useState<{moves: number, time: number} | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Use the timer hook
  const { timer } = useTimer(levelInfo?.gamePhase || 'ready');

  const handleAnimationStart = useCallback(() => {
    setIsPlaying(true);
    setGameStarted(true);
    setShouldPlay(false);
    setShouldReset(false);
    setShouldStartNewGame(false);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsPlaying(false);
    setShouldPlay(false);
    setShouldReset(false);
    setShouldStartNewGame(false);
  }, []);

  const handleLevelChange = useCallback((level: Level, moves: number, gamePhase: GamePhase) => {
    setLevelInfo({
      level: level.level,
      name: level.name,
      moves,
      gamePhase
    });
  }, []);

  // Track score when game is won
  useEffect(() => {
    if (levelInfo?.gamePhase === 'won' && levelInfo.moves > 0 && timer > 0) {
      setNewScore({
        moves: levelInfo.moves,
        time: timer
      });
    }
  }, [levelInfo?.gamePhase, levelInfo?.moves, timer]);

  const handleRestart = useCallback(() => {
    if (!isPlaying) {
      if (gameStarted && (levelInfo?.gamePhase === 'playing' || levelInfo?.gamePhase === 'won')) {
        setShouldReset(true);
        setTimeout(() => setShouldReset(false), 100);
      } else {
        setShouldPlay(true);
      }
    }
  }, [isPlaying, levelInfo?.gamePhase, gameStarted]);

  const handleNewGame = useCallback(() => {
    setShouldStartNewGame(true);
    setTimeout(() => setShouldStartNewGame(false), 100);
  }, []);

  const handleShowLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
  }, []);

  const handleCloseLeaderboard = useCallback(() => {
    setShowLeaderboard(false);
    setNewScore(null);
  }, []);

  const handleShowInfo = useCallback(() => {
    setShowInfo(true);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setShowInfo(false);
  }, []);

  return (
    <div className="app-container">
      <header className="game-header">
        <h1 className="game-title">SWITCH</h1>
        <GameStatus
          gamePhase={levelInfo?.gamePhase || 'ready'}
          moves={levelInfo?.moves || 0}
          timer={timer}
        />
      </header>

      <main className="game-board">
        <Board
          onAnimationStart={handleAnimationStart}
          onAnimationComplete={handleAnimationComplete}
          onLevelChange={handleLevelChange}
          shouldPlay={shouldPlay}
          shouldReset={shouldReset}
          gameStarted={gameStarted}
          shouldStartNewGame={shouldStartNewGame}
        />
      </main>

      <GameControls
        gameStarted={gameStarted}
        gamePhase={levelInfo?.gamePhase || 'ready'}
        isPlaying={isPlaying}
        onRestart={handleRestart}
        onNewGame={handleNewGame}
        onShowInfo={handleShowInfo}
        onShowLeaderboard={handleShowLeaderboard}
      />

      <Leaderboard
        isOpen={showLeaderboard}
        onClose={handleCloseLeaderboard}
        newScore={newScore}
      />

      <Info
        isOpen={showInfo}
        onClose={handleCloseInfo}
      />
    </div>
  );
}

export default App;