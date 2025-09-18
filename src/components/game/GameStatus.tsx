import React from 'react';
import { GamePhase } from '../../types/game';
import { formatTime } from '../../utils/gameLogic';

interface GameStatusProps {
  gamePhase: GamePhase;
  moves: number;
  timer: number;
}

const GameStatus: React.FC<GameStatusProps> = ({
  gamePhase,
  moves,
  timer
}) => {
  const getGameStatusText = () => {
    if (gamePhase === 'playing') {
      return (
        <div>
          <div>Moves: {moves}</div>
          <div>Time: {formatTime(timer)}</div>
        </div>
      );
    } else if (gamePhase === 'won') {
      return (
        <div>
          <div>🎉 Won in {moves} moves!</div>
          <div>Time: {formatTime(timer)}</div>
        </div>
      );
    } else if (gamePhase === 'scrambling') {
      return 'Setting up puzzle...';
    } else {
      return 'Ready to play';
    }
  };

  return (
    <div className="game-status">
      {getGameStatusText()}
    </div>
  );
};

export default GameStatus;