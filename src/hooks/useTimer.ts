import { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase } from '../types/game';

export const useTimer = (gamePhase: GamePhase) => {
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Timer management based on game phase
  useEffect(() => {
    if (gamePhase === 'playing' && !isTimerRunning) {
      // Start timer when game begins
      setIsTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 100);
    } else if (gamePhase === 'won' && isTimerRunning) {
      // Stop timer when game is won
      setIsTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (gamePhase === 'ready') {
      // Reset timer for new game
      setTimer(0);
      setIsTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [gamePhase, isTimerRunning]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const resetTimer = useCallback(() => {
    setTimer(0);
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    timer,
    isTimerRunning,
    resetTimer,
  };
};