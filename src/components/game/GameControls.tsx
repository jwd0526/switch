import React from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { GamePhase } from '../../types/game';

interface GameControlsProps {
  gameStarted: boolean;
  gamePhase: GamePhase;
  isPlaying: boolean;
  onRestart: () => void;
  onNewGame: () => void;
  onShowInfo: () => void;
  onShowLeaderboard: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameStarted,
  gamePhase,
  isPlaying,
  onRestart,
  onNewGame,
  onShowInfo,
  onShowLeaderboard
}) => {
  if (!gameStarted) return null;

  return (
    <nav className="nav-controls">
      <Button
        onClick={onShowInfo}
        variant="square"
        aria-label="Show game information"
      >
        ⓘ
      </Button>

      <Button
        onClick={onRestart}
        disabled={isPlaying}
        aria-label="Restart current game"
      >
        <Icon name="restart" size={24} />
      </Button>

      <Button
        onClick={onNewGame}
        disabled={gamePhase !== 'won'}
        aria-label="Start new game"
      >
        <Icon name="new-game" size={24} />
      </Button>

      <Button
        onClick={onShowLeaderboard}
        variant="square"
        aria-label="Show leaderboard"
      >
        🏆
      </Button>
    </nav>
  );
};

export default GameControls;