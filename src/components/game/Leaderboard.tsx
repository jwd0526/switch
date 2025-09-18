import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useGameScores } from '../../hooks/useLocalStorage';
import { formatTime } from '../../utils/gameLogic';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  newScore?: { moves: number; time: number } | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose, newScore }) => {
  const { scores, addScore } = useGameScores();
  const [sortBy, setSortBy] = useState<'moves' | 'time'>('time');

  // Add new score when provided
  React.useEffect(() => {
    if (newScore && newScore.moves > 0 && newScore.time > 0) {
      addScore(newScore.moves, newScore.time);
    }
  }, [newScore?.moves, newScore?.time, addScore]);

  const sortedScores = [...scores]
    .sort((a, b) => sortBy === 'moves' ? a.moves - b.moves : a.time - b.time)
    .slice(0, 20);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Best Scores"
      className="leaderboard-modal"
    >
      <div className="scores-header">
        <div className="rank-header">#</div>
        <div className="score-columns">
          <button
            className={`sort-btn ${sortBy === 'moves' ? 'active' : ''}`}
            onClick={() => setSortBy('moves')}
          >
            Moves
          </button>
          <button
            className={`sort-btn ${sortBy === 'time' ? 'active' : ''}`}
            onClick={() => setSortBy('time')}
          >
            Time
          </button>
        </div>
        <div className="date-header">Date</div>
      </div>

      <div className="divider"></div>

      <div className="scores-list">
        {sortedScores.length === 0 ? (
          <div className="no-scores">No scores yet. Play a game to set your first record!</div>
        ) : (
          sortedScores.map((score, index) => (
            <div key={score.id} className="score-item">
              <div className="rank">#{index + 1}</div>
              <div className="score-details">
                <div className="moves">{score.moves}</div>
                <div className="time">{formatTime(score.time)}</div>
              </div>
              <div className="date">{score.date}</div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default Leaderboard;