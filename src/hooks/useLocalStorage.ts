import { useState, useCallback, useRef } from 'react';
import { Score } from '../types/game';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue] as const;
};

// Specialized hook for game scores
export const useGameScores = () => {
  const [scores, setScores] = useLocalStorage<Score[]>('switchGameScores', []);

  const addScore = useCallback((moves: number, time: number) => {
    const newScore: Score = {
      moves,
      time,
      date: new Date().toLocaleDateString(),
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11)
    };

    setScores(currentScores => {
      // Check if this score already exists to prevent duplicates
      const isDuplicate = currentScores.some(score =>
        score.moves === newScore.moves &&
        score.time === newScore.time &&
        score.date === newScore.date
      );

      if (isDuplicate) {
        return currentScores;
      }

      const updatedScores = [...currentScores, newScore]
        .sort((a, b) => a.time - b.time) // Sort by time by default
        .slice(0, 20); // Keep top 20

      return updatedScores;
    });

    return newScore;
  }, [setScores]);

  const clearScores = useCallback(() => {
    setScores([]);
  }, [setScores]);

  return {
    scores,
    addScore,
    clearScores,
  };
};