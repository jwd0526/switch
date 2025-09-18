import React from 'react';
import Modal from '../ui/Modal';

interface InfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const Info: React.FC<InfoProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How to Play"
      className="info-modal"
    >
      <div className="info-content">
        <div className="info-section">
          <h3>Objective</h3>
          <p>Turn off all the lights to solve the puzzle.</p>
        </div>

        <div className="info-section">
          <h3>How to Play</h3>
          <p>Click any cell to toggle it and its neighbors in a <strong>cross pattern</strong>:</p>
          <div className="pattern-demo">
            <div className="pattern-grid">
              <div className="pattern-cell"></div>
              <div className="pattern-cell affected"></div>
              <div className="pattern-cell"></div>
              <div className="pattern-cell affected"></div>
              <div className="pattern-cell affected clicked"></div>
              <div className="pattern-cell affected"></div>
              <div className="pattern-cell"></div>
              <div className="pattern-cell affected"></div>
              <div className="pattern-cell"></div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Goal</h3>
          <p>Use the minimum number of moves to turn off all lights. Your score is based on both moves and time!</p>
        </div>
      </div>
    </Modal>
  );
};

export default Info;