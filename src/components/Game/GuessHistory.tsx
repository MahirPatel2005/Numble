import React from 'react';
import { FeedbackTiles } from './FeedbackTiles';

interface Guess {
  guessNumber: string;
  feedback: string[];
}

interface GuessHistoryProps {
  guesses: Guess[];
  maxLength: number;
}

export const GuessHistory: React.FC<GuessHistoryProps> = ({ guesses, maxLength }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Guess History</h3>
      <div className="space-y-2">
        {guesses.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No guesses yet</p>
        ) : (
          guesses.map((guess, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-600 font-medium w-8">#{index + 1}</span>
              <FeedbackTiles guess={guess.guessNumber} feedback={guess.feedback} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
