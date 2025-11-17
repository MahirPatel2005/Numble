import React from 'react';

interface FeedbackTilesProps {
  guess: string;
  feedback: string[];
}

const getColor = (feedback: string): string => {
  switch (feedback) {
    case 'green':
      return 'bg-green-500';
    case 'yellow':
      return 'bg-yellow-400';
    case 'gray':
      return 'bg-gray-400';
    default:
      return 'bg-gray-200';
  }
};

export const FeedbackTiles: React.FC<FeedbackTilesProps> = ({ guess, feedback }) => {
  return (
    <div className="flex gap-2">
      {guess.split('').map((digit, index) => (
        <div
          key={index}
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${getColor(
            feedback[index]
          )} transition`}
        >
          {digit}
        </div>
      ))}
    </div>
  );
};
